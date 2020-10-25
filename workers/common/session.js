const { ObjectId } = require("mongodb"),
  {
    code,
    clog,
    validType,
    stringIsValid,
  } = require("../../public/script/codes"),
  jwt = require("../../node_modules/jsonwebtoken"),
  bcrypt = require("../../node_modules/bcryptjs"),
  Institute = require("../../config/db").getInstitute(),
  Admin = require("../../config/db").getAdmin(),
  adminworker = require("../adminworker"),
  teacherworker = require("../teacherworker"),
  studentworker = require("../studentworker"),
  share = require("./sharedata");

class Session {
  constructor() {
    this.adminsessionsecret = "adminschemesterSecret2001";
    this.teachersessionsecret = "teacherschemesterSecret2001";
    this.studentsessionsecret = "studentschemesterSecret2001";
    this.sessionID = "id";
    this.sessionUID = "uid";
    this.sessionKey = "bailment"; //bailment ~ amaanat
    this.expiresIn = 365 * 86400; //days*seconds/day
  }
  verify = async (request, secret) => {
    const token = request.signedCookies[this.sessionKey];
    try {
      if (!token) return code.event(code.auth.SESSION_INVALID);
      return jwt.verify(token, secret);
    } catch (e) {
      return code.eventmsg(code.auth.SESSION_INVALID, e);
    }
  };
  createSession(response, userID, userUIID, secret, studentclass = null) {
    const payload = studentclass
      ? {
          user: {
            id: userID,
            uiid: userUIID,
            classname: studentclass,
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
  finish = async (response) => {
    await response.clearCookie(this.sessionKey);
    return code.event(code.auth.LOGGED_OUT);
  };

  login = async (request, response, secret) => {
    const body = request.body;
    switch (secret) {
      case this.adminsessionsecret: {
        //admin login
        const { email, password, uiid, target } = body;
        const admin = await Admin.findOne({ email: email });
        if (!admin) return code.event(code.auth.USER_NOT_EXIST);
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) return code.event(code.auth.WRONG_PASSWORD);
        if (uiid != admin.uiid) return code.event(code.auth.WRONG_UIID);
        this.createSession(response, admin._id, admin.uiid, secret);
        return {
          event: code.auth.AUTH_SUCCESS,
          user: share.getAdminShareData(admin),
          target: target,
          section:body.section
        };
      }
      case this.teachersessionsecret:
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
              const userdoc = await Institute.findOne(
                {
                  uiid: body.uiid,
                  "users.teachers": { $elemMatch: { teacherID: body.email } },
                },
                { projection: { "users.teachers.$": 1 } }
              );
              const pseudouserdoc = await Institute.findOne(
                {
                  uiid: body.uiid,
                  "pseudousers.teachers": {
                    $elemMatch: { teacherID: body.email },
                  },
                },
                { projection: { "pseudousers.teachers.$": 1 } }
              );
              switch (body.type) {
                case "email":
                  return userdoc || pseudouserdoc
                    ? code.event(code.auth.USER_EXIST)
                    : code.event(code.auth.USER_NOT_EXIST);
                case "password": {
                  const { password, uiid, target } = body;
                  if (!userdoc && !pseudouserdoc)
                    return code.event(code.auth.USER_NOT_EXIST);
                  const teacher = userdoc
                    ? userdoc.users.teachers[0]
                    : pseudouserdoc.pseudousers.teachers[0];
                  const isMatch = await bcrypt.compare(
                    password,
                    teacher.password
                  );
                  if (!isMatch) return code.event(code.auth.WRONG_PASSWORD);
                  this.createSession(response, teacher._id, uiid, secret);
                  return {
                    event: code.auth.AUTH_SUCCESS,
                    user: userdoc
                      ? share.getTeacherShareData(teacher)
                      : share.getPseudoTeacherShareData(teacher),
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
      case this.studentsessionsecret:
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
                    secret,
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

  authenticate = async (req, res, body, secret) => {
    const resp = await this.verify(req, secret);
    if (!this.valid(resp)) return code.event(code.auth.SESSION_INVALID);
    switch (secret) {
      case this.adminsessionsecret: {
        const admin = await Admin.findOne({ _id: ObjectId(resp.user.id) });
        if (!admin) return code.event(code.auth.USER_NOT_EXIST);
        if (body.email != admin.email)
          return code.event(code.auth.EMAIL_INVALID);
        const isMatch = await bcrypt.compare(body.password, admin.password);
        if (!isMatch) return code.event(code.auth.WRONG_PASSWORD);
        this.createSession(res, admin._id, admin.uiid, secret);
        return code.event(code.auth.AUTH_SUCCESS);
      }
      case this.teachersessionsecret: {
        const teacher = await teacherworker.self.account.getAccount(resp.user,true);
        if (!teacher) return code.event(code.auth.USER_NOT_EXIST);
        if (body.email != teacher.teacherID) return code.event(code.auth.EMAIL_INVALID);
        const isMatch = await bcrypt.compare(body.password, teacher.password);
        if (!isMatch) return code.event(code.auth.WRONG_PASSWORD);
        this.createSession(res, teacher._id, resp.user.uiid, secret);
        return code.event(code.auth.AUTH_SUCCESS);
      }
      case this.studentsessionsecret: {
        const student = await studentworker.self.account.getAccount(resp.user,true);
        if (!student) return code.event(code.auth.USER_NOT_EXIST);
        if (body.email != student.studentID) return code.event(code.auth.EMAIL_INVALID);
        const isMatch = await bcrypt.compare(body.password, student.password);
        if (!isMatch) return code.event(code.auth.WRONG_PASSWORD);
        this.createSession(res, student._id, resp.user.uiid, secret,resp.user.classname);
        return code.event(code.auth.AUTH_SUCCESS);
      }
    }
  };

  signup = async (request, response, secret, pseudo = false) => {
    switch (secret) {
      case this.adminsessionsecret: {
        const { username, email, password, uiid } = request.body;
        if (!stringIsValid(email, validType.email))
          return code.event(code.auth.EMAIL_INVALID);
        if (!stringIsValid(password, validType.password))
          return code.event(code.auth.PASSWORD_INVALID);
        const admin = await Admin.findOne({ email: email });
        if (admin) return code.event(code.auth.USER_EXIST);
        const inst = await Admin.findOne({ uiid: uiid });
        if (inst) return code.event(code.server.UIID_TAKEN);
        const salt = await bcrypt.genSalt(10);
        const epassword = await bcrypt.hash(password, salt);
        const result = await adminworker.self.account.createAccount({
          username: username,
          email: email,
          password: epassword,
          uiid: uiid,
          createdAt: Date.now(),
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
        this.createSession(response, result._id, result.uiid, secret);
        return {
          event: code.auth.ACCOUNT_CREATED,
          user: share.getAdminShareData(result),
        };
      }
      case this.teachersessionsecret:
        {
          const { username, email, password, uiid } = request.body;
          if (!stringIsValid(email, validType.email))
            return code.event(code.auth.EMAIL_INVALID);
          if (!stringIsValid(password, validType.password))
            return code.event(code.auth.PASSWORD_INVALID);
          const inst = await Institute.findOne({ uiid: uiid });
          if (!inst) return code.event(code.inst.INSTITUTION_NOT_EXISTS);
          const userdoc = await Institute.findOne({
            uiid: uiid,
            "users.teachers": { $elemMatch: { teacherID: email } },
          });
          const pseudouserdoc = await Institute.findOne({
            uiid: uiid,
            "pseudousers.teachers": { $elemMatch: { teacherID: email } },
          });
          if (userdoc || pseudouserdoc) return code.event(code.auth.USER_EXIST);
          const salt = await bcrypt.genSalt(10);
          const epassword = await bcrypt.hash(password, salt);
          const newteacher = {
            _id: new ObjectId(),
            username: username,
            teacherID: email,
            password: epassword,
            createdAt: Date.now(),
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
          const teacherdoc = pseudo
            ? await Institute.findOne(
                {
                  uiid: uiid,
                  "pseudousers.teachers": { $elemMatch: { teacherID: email } },
                },
                {
                  projection: { _id: 0, "pseudousers.teachers.$": 1 },
                }
              )
            : await Institute.findOne(
                {
                  uiid: uiid,
                  "users.teachers": { $elemMatch: { teacherID: email } },
                },
                {
                  projection: { _id: 0, "users.teachers.$": 1 },
                }
              );

          if (!teacherdoc) return code.event(code.auth.USER_NOT_EXIST);
          const teacher = pseudo
            ? teacherdoc.pseudousers.teachers[0]
            : teacherdoc.users.teachers[0];
          this.createSession(response, teacher._id, uiid, secret);
          return {
            event: code.auth.ACCOUNT_CREATED,
            user: pseudo
              ? share.getPseudoTeacherShareData(teacher)
              : share.getTeacherShareData(teacher),
          };
        }
        break;
      case this.studentsessionsecret: {
        const { username, email, password, uiid, classname } = request.body;
        if (!stringIsValid(email, validType.email))
          return code.event(code.auth.EMAIL_INVALID);
        if (!stringIsValid(password, validType.password))
          return code.event(code.auth.PASSWORD_INVALID);
        const inst = await Institute.findOne({ uiid: uiid });
        if (!inst) return code.event(code.inst.INSTITUTION_NOT_EXISTS);
        let classdoc = await Institute.findOne(
          {
            uiid: uiid,
            "users.classes": { $elemMatch: { classname: classname } },
          },
          { projection: { "users.classes.$": 1 } }
        );
        if (!classdoc) return code.event(code.auth.CLASS_NOT_EXIST);  //if classroom not in users
        if (classdoc.users.classes[0].students.find((stud) => stud.studentID == email)) return code.event(code.auth.USER_EXIST);  //if student in the classroom
        let pclassdoc = await Institute.findOne({
          uiid: uiid,
          "pseudousers.classes": { $elemMatch: { classname: classname } },
        },
          { projection: { "pseudousers.classes.$": 1 } }
        );
        if (!pclassdoc) return code.event(code.auth.CLASS_NOT_EXIST); //if classroom not in pseudo
        if (pclassdoc.pseudousers.classes[0].students.find((stud) => stud.studentID == email)) return code.event(code.auth.USER_EXIST); //if student in pseudo classroom 
        let student = await Institute.findOne({
          uiid:uiid,
          "users.students":{$elemMatch:{studentID:email}},
        },{
          projection:{"users.students.$":1}
        });
        if(student){  //if student account exists in institute, add student to the classroom (according to pseudo)
          return await studentworker.self.account.addStudentToClass(uiid,classname,{username :student.username,studentID:student.studentID},pseudo)
        }
        let pstudent = await Institute.findOne({
          uiid:uiid,
          "pseudousers.students":{$elemMatch:{studentID:email}},
        },{
          projection:{"pseudousers.students.$":1}
        });
        if(pstudent){  //if pseudo student account exists in institute, add student to the pseudo classroom
          return await studentworker.self.account.addStudentToClass(uiid,classname,{username :pstudent.username,studentID:pstudent.studentID})
        }
        //creating new student account in institution according to pseudo
        const salt = await bcrypt.genSalt(10);
        const epassword = await bcrypt.hash(password, salt);
        const newstudent = {
          _id: new ObjectId(),
          username: username,
          studentID: email,
          password: epassword,
          className: classname,
          createdAt: Date.now(),
          verified: false,
          prefs: {},
        }
        let result = await studentworker.self.account.createAccount(uiid, newstudent,pseudo); //new student account creation
        if (result.event == code.NO)
          return code.event(code.auth.ACCOUNT_CREATION_FAILED);
        //adding student to classroom
        result =  await studentworker.self.account.addStudentToClass(uiid,classname,{username :newstudent.username,studentID:newstudent.studentID},pseudo)
        if(result.event == code.NO) return code.event(code.inst.CLASS_JOIN_FAILED);
        this.createSession(response, newstudent._id, uiid, secret, classname);
        return {
          event: code.auth.ACCOUNT_CREATED,
          user: pseudo?share.getPseudoStudentShareData(newstudent):share.getStudentShareData(newstudent),
        };
      }
      default:
        return code.event(code.server.SERVER_ERROR);
    }
  };

  userdata = async (request, secret) => {
    this.verify(request, secret)
      .catch((e) => {
        return code.event(code.auth.AUTH_REQ_FAILED);
      })
      .then(async (response) => {
        if (!this.valid(response)) return code.event(code.auth.SESSION_INVALID);
        switch (secret) {
          case this.adminsessionsecret:
            return await adminworker.self.account.getAccount(response.user);
          case this.teachersessionsecret:
            return await teacherworker.self.account.getAccount(response.user);
          case this.studentsessionsecret: 
            return await studentworker.self.account.getAccount(response.user);
          default:
            return code.event(code.auth.AUTH_REQ_FAILED);
        }
      });
  };
  valid = (response) => response.event != code.auth.SESSION_INVALID;
}

module.exports = new Session();
