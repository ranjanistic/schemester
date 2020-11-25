const { ObjectId } = require("mongodb"),
  cookieParser = require("cookie-parser"),
  jwt = require("jsonwebtoken"),
  bcrypt = require("bcryptjs"),
  inspect = require("./inspector"),
  time = require("./timer"),
  share = require("./sharedata"),
  {code,clog,client} = require("../../public/script/codes"),
  {session,ssh,db} = require("../../config/config.json"),
  Institute = require("../../config/db").getInstitute(db.cpass),
  Admin = require("../../config/db").getAdmin(db.cpass),
  adminworker = require("../adminworker"),
  teacherworker = require("../teacherworker"),
  studentworker = require("../studentworker");

class Session {
  constructor() {
    this.sessionKey = "bailment"; //bailment ~ amaanat
    this.expiresIn = 365 * 86400; //days*seconds/day
  }

  verify (request, clientType){
    const token = request.signedCookies[this.sessionKey];
    try {
      if (!token) return code.event(code.auth.SESSION_INVALID);
      return jwt.verify(token, getSecretByClient(clientType));
    } catch (e) {
      return code.eventmsg(code.auth.SESSION_INVALID, e);
    }
  };

  createSession(response, userID, userUIID, secret, classname = null) {
    const payload = classname
      ? {
          user: {
            id: userID,
            uiid: userUIID,
            classname: classname,
          },
        }
      : {
          user: {
            id: userID,
            uiid: userUIID,
          },
        };
    const token = jwt.sign(payload, secret, { expiresIn: this.expiresIn });
    try{
      return response.cookie(this.sessionKey, token, { signed: true,expires: new Date(Date.now() + (this.expiresIn*1000)), httpOnly: true,secure:true,sameSite:'Lax'});
    }catch(e){
      clog(e)
    }
  }

  async finish (response){
    await response.clearCookie(this.sessionKey);
    return code.event(code.auth.LOGGED_OUT);
  };

  use(route,clientType){
    route.use(cookieParser(getSecretByClient(clientType)));
  }

  async login (request, response, clientType){
    const body = request.body;
    switch (clientType) {
      case client.admin: {
        //admin login
        const { email, password, uiid } = body;
        const admin = await Admin.findOne({ email: email });
        if (!admin) return code.event(code.auth.USER_NOT_EXIST);
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) return code.event(code.auth.WRONG_PASSWORD);
        if (!admin.uiid.includes(uiid)) return code.event(code.auth.WRONG_UIID);
        const inst = await Institute.findOne({uiid:uiid});
        if(inst){
          const isAdmin = await adminworker.inst.isAdminOfInstitute(uiid,email);
          if(!isAdmin){ //not in institute
            await Admin.findOneAndUpdate({email:email},{
              $pull:{
                "uiid":uiid
              }
            });
            return code.event(code.auth.WRONG_UIID);
          }
        }
        this.createSession(response, admin._id, uiid, getSecretByClient(clientType));
        return {
          event: code.auth.AUTH_SUCCESS,
          user: share.getAdminShareData(admin,uiid),
          target: body.target,
          section:body.section
        };
      }
      case client.teacher:
        {
          //teacher login
          const inst = await Institute.findOne({ uiid: body.uiid });
          switch (body.type) {
            case "uiid": {
              return inst
                ? code.event(code.inst.INSTITUTION_EXISTS)
                : code.event(code.inst.INSTITUTION_NOT_EXISTS);
            }
            default: {
              if (!inst) return code.event(code.inst.INSTITUTION_NOT_EXISTS);
              let teacher = await teacherworker.self.account.getTeacherByEmail(body.uiid,body.email);
              const pteacher = await teacherworker.self.account.getTeacherByEmail(body.uiid,body.email,true);
              switch (body.type) {
                case "email":
                  return teacher || pteacher
                    ? code.event(code.auth.USER_EXIST)
                    : code.event(code.auth.USER_NOT_EXIST);
                case "password": {
                  const { password, uiid, target } = body;
                  if (!teacher && !pteacher)
                    return code.event(code.auth.USER_NOT_EXIST);
                  teacher = teacher
                    ? teacher
                    : pteacher;
                  const isMatch = await bcrypt.compare(
                    password,
                    teacher.password
                  );
                  if (!isMatch) return code.event(code.auth.WRONG_PASSWORD);
                  this.createSession(response, teacher._id, uiid, getSecretByClient(clientType));
                  return {
                    event: code.auth.AUTH_SUCCESS,
                    user: pteacher
                    ? share.getPseudoTeacherShareData(teacher)
                    : share.getTeacherShareData(teacher),
                    target: target,
                  };
                }
                default:
                  return code.event(code.auth.AUTH_REQ_FAILED);
              }
            }
          }
        }
        break;
      case client.student:
        {
          const inst = await Institute.findOne({ uiid: body.uiid });
          switch (body.type) {
            case "uiid":
              return code.event(
                inst
                  ? code.inst.INSTITUTION_EXISTS
                  : code.inst.INSTITUTION_NOT_EXISTS
              );
            default: {
              if (!inst) return code.event(code.inst.INSTITUTION_NOT_EXISTS);
              const classdoc = await Institute.findOne(
                {
                  uiid: body.uiid,
                  "users.classes": {
                    $elemMatch: { classname: body.classname },
                  },
                },
                { projection: { _id: 0, "users.classes.$": 1 } }
              );
              const pseudoclassdoc = await Institute.findOne(
                {
                  uiid: body.uiid,
                  "pseudousers.classes": {
                    $elemMatch: { classname: body.classname },
                  },
                },
                { projection: { _id: 0, "pseudousers.classes.$": 1 } }
              );
              switch (body.type) {
                case "classname":
                  return code.event(
                    classdoc || pseudoclassdoc
                      ? code.auth.CLASS_EXISTS
                      : code.auth.CLASS_NOT_EXIST
                  );
                case "email": {
                  if (!classdoc && !pseudoclassdoc)
                    return code.event(code.auth.CLASS_NOT_EXIST);
                  const pseudo = pseudoclassdoc.pseudousers.classes[0].students.find((stud)=>stud.studentID == body.email)?true:false;
                  const isintheclass = classdoc.users.classes[0].students.find((stud) =>stud.studentID == body.email)?true:false||pseudo;
                  const isinanyclass = await studentworker.classes.getClassesByStudentID(body.uiid,body.email);
                  try{
                    if(!isinanyclass){  //then delete the student's account
                      let account = await studentworker.self.account.getStudentByEmail(body.uiid,body.email,false);
                      account = account?account:await studentworker.self.account.getStudentByEmail(body.uiid,body.email,true);
                      if(account){
                        const del = await studentworker.self.account.deleteAccount({
                          id:account._id,
                          uiid:body.uiid,
                          classname:body.classname
                        });
                      }
                    }
                  }catch(e){
                    clog(e);
                  }
                  return code.event(
                    isintheclass
                      ? code.auth.USER_EXIST
                      : code.auth.USER_NOT_EXIST
                  );
                }
                case "password": {
                  const { email, password, uiid, classname, target } = body;
                  if (!classdoc && !pseudoclassdoc)
                    return code.event(code.auth.CLASS_NOT_EXIST);
                  const pseudo = pseudoclassdoc.pseudousers.classes[0].students.find((stud)=>stud.studentID == body.email)?true:false;
                  const student = await studentworker.self.account.getStudentByEmail(uiid,email,pseudo);
                  const isMatch = await bcrypt.compare(
                    password,
                    student.password
                  );
                  if (!isMatch) return code.event(code.auth.WRONG_PASSWORD);
                  this.createSession(
                    response,
                    student._id,
                    uiid,
                    getSecretByClient(clientType),
                    classname
                  );
                  return {
                    event: code.auth.AUTH_SUCCESS,
                    user: pseudo
                      ? share.getPseudoStudentShareData(student,uiid)
                      : share.getStudentShareData(student,uiid),
                    target: target,
                  };
                }break;
                default:
                  return code.event(code.auth.AUTH_REQ_FAILED);
              }
            }
          }
        }
        break;
      default:
        return code.event(code.auth.AUTH_REQ_FAILED);
    }
  };

  async authenticate(req, res, body, clientType){
    const resp = this.verify(req, clientType);
    if (!this.valid(resp)) return code.event(code.auth.SESSION_INVALID);
    switch (clientType) {
      case client.admin: {
        const admin = await Admin.findOne({ _id: ObjectId(resp.user.id) });
        if (!admin) return code.event(code.auth.USER_NOT_EXIST);
        if (body.email != admin.email)
          return code.event(code.auth.EMAIL_INVALID);
        const isMatch = await bcrypt.compare(body.password, admin.password);
        if (!isMatch) return code.event(code.auth.WRONG_PASSWORD);
        if(!admin.uiid.includes(resp.user.uiid)) return code.event(code.auth.WRONG_UIID);
        this.createSession(res, admin._id, resp.user.uiid, getSecretByClient(clientType));
        return code.event(code.auth.AUTH_SUCCESS);
      }
      case client.teacher: {
        const teacher = await teacherworker.self.account.getAccount(resp.user,true);
        if (!teacher) return code.event(code.auth.USER_NOT_EXIST);
        if (body.email != teacher.teacherID) return code.event(code.auth.EMAIL_INVALID);
        const isMatch = await bcrypt.compare(body.password, teacher.password);
        if (!isMatch) return code.event(code.auth.WRONG_PASSWORD);
        this.createSession(res, teacher._id, resp.user.uiid, getSecretByClient(clientType));
        return code.event(code.auth.AUTH_SUCCESS);
      }
      case client.student: {
        const student = await studentworker.self.account.getAccount(resp.user,true);
        if (!student) return code.event(code.auth.USER_NOT_EXIST);
        if (body.email != student.studentID) return code.event(code.auth.EMAIL_INVALID);
        const isMatch = await bcrypt.compare(body.password, student.password);
        if (!isMatch) return code.event(code.auth.WRONG_PASSWORD);
        this.createSession(res, student._id, resp.user.uiid, getSecretByClient(clientType),resp.user.classname);
        return code.event(code.auth.AUTH_SUCCESS);
      }
    }
  };
  async getHashed(password){
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }
  async signup (request, response, clientType, pseudo = false){
    switch (clientType) {
      case client.admin: {
        const { username, email, password, uiid } = request.body;
        if(!inspect.emailValid(email))
          return code.event(code.auth.EMAIL_INVALID);
        if (!inspect.passValid(password))
          return code.event(code.auth.PASSWORD_INVALID);
        const admin = await Admin.findOne({ email: email });
        if (admin){
          if(request.body.isinvite){ //accepting invitation join
            const inst = await Institute.findOne({uiid:uiid});
            if(!inst) return code.event(code.inst.INSTITUTION_NOT_EXISTS);
            if(!inst.invite.admin.active) return code.event(code.invite.LINK_INVALID);
            if(inst.default.admin.find((ad)=>ad.email==email)) return code.event(code.auth.USER_EXIST);
            const ismatch =  await bcrypt.compare(password,admin.password);
            if(!ismatch) return code.event(code.auth.WRONG_PASSWORD);
            const joined = await adminworker.inst.joinInstituteAsAdmin(inst._id,admin);
            if(!joined) code.event(code.NO);
            const doc = await Admin.findOneAndUpdate({_id:ObjectId(admin._id)},{
              $push:{'uiid':uiid}
            });
            if(!doc.value) code.event(code.NO);
            this.createSession(response, admin._id, uiid, getSecretByClient(clientType));
            return {
              event: code.auth.ACCOUNT_CREATED,
              user: share.getAdminShareData(admin),
            };
          } else {
            return code.event(code.auth.USER_EXIST);
          }
        }
        if(!request.body.isinvite){
          const inst = await Admin.findOne({ uiid:uiid });
          if (inst) return code.event(code.server.UIID_TAKEN);
        }
        const epassword = await this.getHashed(password);
        const result = await adminworker.self.account.createAccount({
          username: username,
          email: email,
          password: epassword,
          uiid: [uiid],
          createdAt: time.getTheMoment(false),
          verified: false,
          prefs: {
            showemailtoteacher: false,
            showphonetoteacher: false,
            showemailtostudent: false,
            showphonetostudent: false,
          },
        });
        if (result.event == code.NO)
          return code.event(code.auth.ACCOUNT_CREATION_FAILED);
        //account created
        this.createSession(response, result._id, result.uiid, getSecretByClient(clientType));
        return {
          event: code.auth.ACCOUNT_CREATED,
          user: share.getAdminShareData(result),
        };
      }
      case client.teacher:
        {
          const { username, email, password, uiid } = request.body;
          if(!inspect.emailValid(email))
            return code.event(code.auth.EMAIL_INVALID);
          if (!inspect.passValid(password))
            return code.event(code.auth.PASSWORD_INVALID);
          const inst = await Institute.findOne({ uiid: uiid });
          if (!inst) return code.event(code.inst.INSTITUTION_NOT_EXISTS);
          let teacher = await teacherworker.self.account.getTeacherByEmail(uiid,email);
          const pteacher = await teacherworker.self.account.getTeacherByEmail(uiid,email,true);
          if (teacher || pteacher) return code.event(code.auth.USER_EXIST);
          const epassword = await this.getHashed(password);
          const newteacher = {
            _id: new ObjectId(),
            username: username,
            teacherID: email,
            password: epassword,
            createdAt: time.getTheMoment(false),
            verified: false,
            vacations: [],
            prefs: {
              showemailtostudent: false,
            },
          };
          let result = pseudo
            ? await teacherworker.self.account.createPseudoAccount(
              uiid,
              newteacher
            )
            : await teacherworker.self.account.createAccount(uiid, newteacher);
          if (result.event == code.NO)
            return code.event(code.auth.ACCOUNT_CREATION_FAILED);
          teacher = await teacherworker.self.account.getTeacherByEmail(uiid,email,pseudo)
          if (!teacher) return code.event(code.auth.USER_NOT_EXIST);
          this.createSession(response, teacher._id, uiid, getSecretByClient(clientType));
          return {
            event: code.auth.ACCOUNT_CREATED,
            user: pseudo
              ? share.getPseudoTeacherShareData(teacher)
              : share.getTeacherShareData(teacher),
          };
        }
        break;
      case client.student: {
        const { username, email, password, uiid, classname } = request.body;
        if(!inspect.emailValid(email))
          return code.event(code.auth.EMAIL_INVALID);
        if (!inspect.passValid(password))
          return code.event(code.auth.PASSWORD_INVALID);
        const inst = await Institute.findOne({ uiid: uiid });
        if (!inst) return code.event(code.inst.INSTITUTION_NOT_EXISTS);
        const classroom = await studentworker.classes.getClassByClassname(uiid,classname);
        if (!classroom) return code.event(code.auth.CLASS_NOT_EXIST);  //if classroom not in users
        if (classroom.students.find((stud) => stud.studentID == email)) return code.event(code.auth.USER_EXIST);  //if student in the classroom
        const pclassroom = await studentworker.classes.getClassByClassname(uiid,classname,true);
        if (!pclassroom) return code.event(code.auth.CLASS_NOT_EXIST); //if classroom not in pseudo
        if (pclassroom.students.find((stud) => stud.studentID == email)) return code.event(code.auth.USER_EXIST); //if student in pseudo classroom 
        let student = await studentworker.self.account.getStudentByEmail(uiid,email);
        if(student){  //if student account exists in institute, add student to the classroom (according to pseudo)
          const isMatch = await bcrypt.compare(password, student.password);
          if (!isMatch) return code.event(code.auth.WRONG_PASSWORD);
          return await studentworker.self.account.addStudentToClass(uiid,classname,{username :student.username,studentID:student.studentID},pseudo)
        }
        let pstudent = await studentworker.self.account.getStudentByEmail(uiid,email,true);
        if(pstudent){  //if pseudo student account exists in institute, add student to the pseudo classroom
          const isMatch = await bcrypt.compare(password, student.password);
          if (!isMatch) return code.event(code.auth.WRONG_PASSWORD);
          return await studentworker.self.account.addStudentToClass(uiid,classname,{username :pstudent.username,studentID:pstudent.studentID})
        }
        //creating new student account in institution according to pseudo
        const epassword = await this.getHashed(password);
        const newstudent = {
          _id: new ObjectId(),
          username: username,
          studentID: email,
          password: epassword,
          className: classname,
          createdAt: time.getTheMoment(false),
          verified: false,
          prefs: {},
        }
        let result = await studentworker.self.account.createAccount(uiid, newstudent,pseudo); //new student account creation
        if (result.event == code.NO)
          return code.event(code.auth.ACCOUNT_CREATION_FAILED);
        //adding student to classroom
        result = await studentworker.self.account.addStudentToClass(uiid,classname,{username :newstudent.username,studentID:newstudent.studentID},pseudo)
        if(result.event == code.NO) return code.event(code.inst.CLASS_JOIN_FAILED);
        this.createSession(response, newstudent._id, uiid, getSecretByClient(clientType), classname);
        return {
          event: code.auth.ACCOUNT_CREATED,
          user: pseudo?share.getPseudoStudentShareData(newstudent):share.getStudentShareData(newstudent),
        };
      }
      default:
        return code.event(code.server.SERVER_ERROR);
    }
  };

  userdata = async (request, clientType) => {
    this.verify(request, clientType)
      .catch((e) => {
        return code.event(code.auth.AUTH_REQ_FAILED);
      })
      .then(async (response) => {
        if (!this.valid(response)) return code.event(code.auth.SESSION_INVALID);
        switch (clientType) {
          case client.admin:
            return await adminworker.self.account.getAccount(response.user);
          case client.teacher:
            return await teacherworker.self.account.getAccount(response.user);
          case client.student:
            return await studentworker.self.account.getAccount(response.user);
          default:
            return code.event(code.auth.AUTH_REQ_FAILED);
        }
      });
  };
  valid = (response,clientType) => response.event != code.auth.SESSION_INVALID && inspect.tokenValid(response.user,clientType);
}

const getSecretByClient=(clientType)=>{
  switch(clientType){
    case client.admin:return jwt.verify(session.adminkey,ssh);
    case client.teacher:return jwt.verify(session.teacherkey,ssh);
    case client.student:return jwt.verify(session.studentkey,ssh);
  }
}

module.exports = new Session();
