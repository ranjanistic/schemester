const oauthworker = require("../oauthworker");

const { ObjectId } = require("mongodb"),
  cookieParser = require("cookie-parser"),
  jwt = require("jsonwebtoken"),
  bcrypt = require("bcryptjs"),
  inspect = require("./inspector"),
  time = require("./timer"),
  share = require("./sharedata"),
  {code,clog,client} = require("../../public/script/codes"),
  {session,db} = require("../../config/config.js"),
  Institute = require("../../config/db").getInstitute(db.cpass),
  Admin = require("../../config/db").getAdmin(db.cpass),
  adminworker = require("../adminworker"),
  teacherworker = require("../teacherworker"),
  studentworker = require("../studentworker");

class Session {
  constructor() {
    this.uiid = "uiid";
    this.email = "email";
    this.password = "password";
    this.classname = " classname";
    this.classpath = "users.classes";
    this.pclasspath = "pseudousers.classes";
    this.sessionKey = session.publickey;
    this.expiresIn = 365 * 24 * 60 * 60;
    this.expiresInTemp = 25 * 60;
  }

  verify (request, clientType){
    const token = request.signedCookies[this.sessionKey];
    try {
      if(request._body){
        if(!inspect.token.verify(request.body.acsrf)){
          throw code.client.INVALID_ACSRF
        }
      }
      if (!token) return code.event(code.auth.SESSION_INVALID);
      return jwt.verify(token, getSecretByClient(clientType));
    } catch (e) {
      return code.eventmsg(code.auth.SESSION_INVALID, e);
    }
  };

  createTempSession(response,userID,userUIID,clientType){
    const payload = {
      user:{
        id:userID,
        uiid:userUIID,
        client:clientType,
        temp:true
      }
    }
    const token = jwt.sign(payload,getSecretByClient(clientType),{expiresIn:this.expiresInTemp})
    try{
      return response.cookie(this.sessionKey, token, { signed: true,expires: new Date(Date.now() + (this.expiresInTemp*1000)), httpOnly: true,secure:true,sameSite:'Lax'});
    }catch(e){
      clog(e)
    }
  }

  createSession(response, userID, userUIID, clientType, classname = null) {
    const payload = classname
      ? {
          user: {
            id: userID,
            uiid: userUIID,
            client:clientType,
            classname: classname,
          },
        }
      : {
          user: {
            id: userID,
            uiid: userUIID,
            client:clientType
          },
        };
    const token = jwt.sign(payload, getSecretByClient(clientType), { expiresIn: this.expiresIn });
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

  async verify2fa(response,code2fa,user, clientType){
    switch (clientType) {
      case client.admin: {
        const admin = await Admin.findOne({_id:ObjectId(user.id)});
        if(admin.twofactorcode !== code2fa) return code.event(code.NO);
        await Admin.findOneAndUpdate({_id:ObjectId(user.id)},{$set:{twofactorcode:0}});
        this.createSession(response,user.id,user.uiid,clientType);
        return code.event(code.OK);
      }
    }    
  }

  async getOauthToken(user,domain){
    switch(user.client){
      case client.admin:{
        let account = await adminworker.self.account.getAccount(user);
        if(!account) return code.event(code.auth.USER_EXIST);
        const added = await oauthworker.addUserAuthDomain(user,domain)
        if(!added) return code.event(code.NO);
        const oauthtoken = jwt.sign({
          id:account.uid,
          username:account.username,
          email:account.id
        },getSecretByClient(user.client),{expiresIn:"30d"});
        return {
          event:code.OK,
          token:oauthtoken
        }
      }
    }
  }

  async deauthorizeOauthDomain(user,domain){
    switch(user.client){
      case client.admin:{
        let account = await adminworker.self.account.getAccount(user);
        if(!account) return code.event(code.auth.USER_EXIST);
        const removed = await oauthworker.removeUserAuthDomain(user,domain)
        return code.event(removed?code.OK:code.NO);
      }
    }
  }

  async login (request, response, clientType,with2fa = true){
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
        const inst = await Institute.findOne({[this.uiid]:uiid});
        if(inst){
          const isAdmin = await adminworker.inst.isAdminOfInstitute(uiid,email);
          if(!isAdmin){ //not in institute
            await Admin.findOneAndUpdate({email:email},{
              $pull:{
                [this.uiid]:uiid
              }
            });
            return code.event(code.auth.WRONG_UIID);
          }
        }
        admin.twofactor&&with2fa
          ?this.createTempSession(response, admin._id, uiid, clientType)
          :this.createSession(response, admin._id, uiid, clientType);
        return {
          event: code.auth.AUTH_SUCCESS,
          user: share.getAdminShareData(admin,uiid),
          nexturl:body.nexturl,
          target: body.target,
          section:body.section
        };
      }
      case client.teacher:
        {
          //teacher login
          const inst = await Institute.findOne({ [this.uiid]: body.uiid });
          switch (body.type) {
            case this.uiid: {
              return inst
                ? code.event(code.inst.INSTITUTION_EXISTS)
                : code.event(code.inst.INSTITUTION_NOT_EXISTS);
            }
            default: {
              if (!inst) return code.event(code.inst.INSTITUTION_NOT_EXISTS);
              let teacher = await teacherworker.self.account.getTeacherByEmail(body.uiid,body.email);
              const pteacher = await teacherworker.self.account.getTeacherByEmail(body.uiid,body.email,true);
              switch (body.type) {
                case this.email:
                  return teacher || pteacher
                    ? code.event(code.auth.USER_EXIST)
                    : code.event(code.auth.USER_NOT_EXIST);
                case this.password: {
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
                  this.createSession(response, teacher._id, uiid, clientType);
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
          const inst = await Institute.findOne({ [this.uiid]: body.uiid });
          switch (body.type) {
            case this.uiid:
              return code.event(
                inst
                  ? code.inst.INSTITUTION_EXISTS
                  : code.inst.INSTITUTION_NOT_EXISTS
              );
            default: {
              if (!inst) return code.event(code.inst.INSTITUTION_NOT_EXISTS);
              const classdoc = await Institute.findOne(
                {
                  [this.uiid]: body.uiid,
                  [this.classpath]: {
                    $elemMatch: { classname: body.classname },
                  },
                },
                { projection: { _id: 0, [`${this.classpath}.$`]: 1 } }
              );
              const pseudoclassdoc = await Institute.findOne(
                {
                  [this.uiid]: body.uiid,
                  [this.pclasspath]: {
                    $elemMatch: { classname: body.classname },
                  },
                },
                { projection: { _id: 0, [`${this.pclasspath}.$`]: 1 } }
              );
              switch (body.type) {
                case this.classname:
                  return code.event(
                    classdoc || pseudoclassdoc
                      ? code.auth.CLASS_EXISTS
                      : code.auth.CLASS_NOT_EXIST
                  );
                case this.email: {
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
                case this.password: {
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
                    clientType,
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
        this.createSession(res, admin._id, resp.user.uiid, clientType);
        return code.event(code.auth.AUTH_SUCCESS);
      }
      case client.teacher: {
        const teacher = await teacherworker.self.account.getAccount(resp.user,true);
        if (!teacher) return code.event(code.auth.USER_NOT_EXIST);
        if (body.email != teacher.teacherID) return code.event(code.auth.EMAIL_INVALID);
        const isMatch = await bcrypt.compare(body.password, teacher.password);
        if (!isMatch) return code.event(code.auth.WRONG_PASSWORD);
        this.createSession(res, teacher._id, resp.user.uiid, clientType);
        return code.event(code.auth.AUTH_SUCCESS);
      }
      case client.student: {
        const student = await studentworker.self.account.getAccount(resp.user,true);
        if (!student) return code.event(code.auth.USER_NOT_EXIST);
        if (body.email != student.studentID) return code.event(code.auth.EMAIL_INVALID);
        const isMatch = await bcrypt.compare(body.password, student.password);
        if (!isMatch) return code.event(code.auth.WRONG_PASSWORD);
        this.createSession(res, student._id, resp.user.uiid,clientType,resp.user.classname);
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
            const inst = await Institute.findOne({[this.uiid]:uiid});
            if(!inst) return code.event(code.inst.INSTITUTION_NOT_EXISTS);
            if(!inst.invite.admin.active) return code.event(code.invite.LINK_INVALID);
            if(inst.default.admin.find((ad)=>ad.email==email)) return code.event(code.auth.USER_EXIST);
            const ismatch =  await bcrypt.compare(password,admin.password);
            if(!ismatch) return code.event(code.auth.WRONG_PASSWORD);
            const joined = await adminworker.inst.joinInstituteAsAdmin(inst._id,admin);
            if(!joined) code.event(code.NO);
            const doc = await Admin.findOneAndUpdate({_id:ObjectId(admin._id)},{
              $push:{[this.uiid]:uiid}
            });
            if(!doc.value) code.event(code.NO);
            this.createSession(response, admin._id, uiid, clientType);
            return {
              event: code.auth.ACCOUNT_CREATED,
              user: share.getAdminShareData(admin),
            };
          } else {
            return code.event(code.auth.USER_EXIST);
          }
        }
        if(!request.body.isinvite){
          const inst = await Admin.findOne({ [this.uiid]:uiid });
          if (inst) return code.event(code.server.UIID_TAKEN);
        }
        const epassword = await this.getHashed(password);
        const result = await adminworker.self.account.createAccount({
          username: username,
          email: email,
          password: epassword,
          uiid: [uiid],
          createdAt: time.getMoment(),
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
        this.createSession(response, result._id, result.uiid, clientType);
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
          const inst = await Institute.findOne({ [this.uiid]: uiid });
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
            createdAt: time.getMoment(),
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
          this.createSession(response, teacher._id, uiid, clientType);
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
        const inst = await Institute.findOne({ [this.uiid]: uiid });
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
          createdAt: time.getMoment(),
          verified: false,
          prefs: {},
        }
        let result = await studentworker.self.account.createAccount(uiid, newstudent,pseudo); //new student account creation
        if (result.event == code.NO)
          return code.event(code.auth.ACCOUNT_CREATION_FAILED);
        //adding student to classroom
        result = await studentworker.self.account.addStudentToClass(uiid,classname,{username :newstudent.username,studentID:newstudent.studentID},pseudo)
        if(result.event == code.NO) return code.event(code.inst.CLASS_JOIN_FAILED);
        this.createSession(response, newstudent._id, uiid, clientType, classname);
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
  valid = (response,clientType) => response.event != code.auth.SESSION_INVALID && inspect.sessionTokenValid(response.user,clientType);
}

const getSecretByClient=(clientType)=>{
  switch(clientType){
    case client.admin:return inspect.token.verify(session.adminkey);
    case client.teacher:return inspect.token.verify(session.teacherkey);
    case client.student:return inspect.token.verify(session.studentkey);
  }
}

module.exports = new Session();
