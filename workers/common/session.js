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
    (this.sessionID = "id"), (this.sessionUID = "uid");
    this.sessionKey = "bailment"; //bailment ~ amaanat
    this.expiresIn = 7 * 86400; //days*seconds/day
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
    clog(payload);
    const token = jwt.sign(payload, secret, { expiresIn: this.expiresIn });
    return response.cookie(this.sessionKey, token, { signed: true });
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
                  clog(teacher);
                  const isMatch = await bcrypt.compare(
                    password,
                    teacher.password
                  );
                  if (!isMatch) return code.event(code.auth.WRONG_PASSWORD);
                  this.createSession(response, teacher._id, uiid, secret);
                  clog(body);
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
              clog(body);
              clog(classdoc);
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
                  const found = classdoc.users.classes[0].students.some(
                    (student, _) => {
                      return student.studentID == body.email;
                    }
                  );
                  const pfound = pseudoclassdoc.pseudousers.classes[0].students.some(
                    (student, _) => {
                      return student.studentID == body.email;
                    }
                  );
                  return code.event(
                    found || pfound
                      ? code.auth.USER_EXIST
                      : code.auth.USER_NOT_EXIST
                  );
                }
                case "password": {
                  const { email, password, uiid, classname, target } = body;
                  if (!classdoc && !pseudoclassdoc)
                    return code.event(code.auth.CLASS_NOT_EXIST);
                  let student;
                  const found = classdoc.users.classes[0].students.some(
                    (stud, _) => {
                      student = stud;
                      return stud.studentID == email;
                    }
                  );
                  let pstudent;
                  const pfound = pseudoclassdoc.pseudousers.classes[0].students.some(
                    (stud, _) => {
                      pstudent = stud;
                      return stud.studentID == body.email;
                    }
                  );
                  if (!found && !pfound)
                    return code.event(code.auth.USER_NOT_EXIST);
                  student = found ? student : pstudent;
                  const isMatch = await bcrypt.compare(
                    password,
                    student.password
                  );
                  if (!isMatch) return code.event(code.auth.WRONG_PASSWORD);
                  clog(student);
                  this.createSession(
                    response,
                    student._id,
                    uiid,
                    secret,
                    classname
                  );
                  return {
                    event: code.auth.AUTH_SUCCESS,
                    user: found
                      ? share.getStudentShareData(student)
                      : share.getPseudoStudentShareData(student),
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
      default:
        return code.event(code.auth.AUTH_REQ_FAILED);
    }
  };

  authenticate = async (req, res, body, secret) => {
    const resp = await this.verify(req, secret);
    clog(resp);
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
        clog(body);
        clog(resp);
        let teacherdoc = await Institute.findOne(
          {
            uiid: resp.user.uiid,
            "users.teachers": { $elemMatch: { _id: ObjectId(resp.user.id) } },
          },
          { projection: { _id: 0, "users.teachers.$": 1 } }
        );
        const pseudoteacherdoc = await Institute.findOne(
          {
            uiid: resp.user.uiid,
            "pseudousers.teachers": {
              $elemMatch: { _id: ObjectId(resp.user.id) },
            },
          },
          { projection: { _id: 0, "pseudousers.teachers.$": 1 } }
        );
        if (!teacherdoc && !pseudoteacherdoc)
          return code.event(code.auth.USER_NOT_EXIST);
        const teacher = teacherdoc
          ? teacherdoc.users.teachers[0]
          : pseudoteacherdoc.pseudousers.teachers[0];
        if (body.email != teacher.teacherID)
          return code.event(code.auth.EMAIL_INVALID);
        const isMatch = await bcrypt.compare(body.password, teacher.password);
        if (!isMatch) return code.event(code.auth.WRONG_PASSWORD);
        this.createSession(res, teacher._id, resp.user.uiid, secret);
        return code.event(code.auth.AUTH_SUCCESS);
      }
      case this.studentsessionsecret: {
        clog(resp.user);
        const classdoc = await Institute.findOne(
          {
            uiid: resp.user.uiid,
            "users.classes": { $elemMatch: { classname: resp.user.classname } },
          },
          { projection: { "users.classes.$": 1 } }
        );
        clog(classdoc);
        if (!classdoc) return code.event(code.auth.CLASS_NOT_EXIST);
        let student;
        const found = classdoc.users.classes[0].students.some((stud) => {
          if (String(stud._id) == String(resp.user.id)) {
            student = stud;
            return true;
          }
        });
        const pseudoclassdoc = await Institute.findOne(
          {
            uiid: resp.user.uiid,
            "pseudousers.classes": {
              $elemMatch: { classname: resp.user.classname },
            },
          },
          { projection: { _id: 0, "pseudousers.classes.$": 1 } }
        );
        let pstudent;
        const pfound = pseudoclassdoc.pseudousers.classes[0].students.some(
          (stud) => {
            if (String(stud._id) == String(resp.user.id)) {
              pstudent = stud;
              return true;
            }
          }
        );
        if (!found && !pfound) return code.event(code.auth.USER_NOT_EXIST);
        student = found ? student : pstudent;
        if (body.email != student.studentID)
          return code.event(code.auth.EMAIL_INVALID);
        const isMatch = await bcrypt.compare(body.password, student.password);
        if (!isMatch) return code.event(code.auth.WRONG_PASSWORD);
        this.createSession(
          res,
          student._id,
          resp.user.uiid,
          secret,
          found
            ? classdoc.users.classes[0].classname
            : pseudoclassdoc.pseudousers.classes[0].classname
        );
        return code.event(code.auth.AUTH_SUCCESS);
      }
    }
  };

  signup = async (request, response, secret, pseudo = false) => {
    switch (secret) {
      case this.adminsessionsecret: {
        clog("sessionsignup");
        const { username, email, password, uiid } = request.body;
        if (!stringIsValid(email, validType.email))
          return code.event(code.auth.EMAIL_INVALID);
        if (!stringIsValid(password, validType.password))
          return code.event(code.auth.PASSWORD_INVALID);
        const admin = await Admin.findOne({ email: email });
        if (admin) return code.event(code.auth.USER_EXIST);
        const inst = await Admin.findOne({ uiid: uiid });
        if (inst) return code.event(code.server.UIID_TAKEN);
        clog("checks cleared");
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
        clog(result);
        if (result.event == code.NO)
          return code.event(code.auth.ACCOUNT_CREATION_FAILED);
        //account created
        this.createSession(response, result._id, result.uiid, secret);
        clog("session created?");
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
          clog("checks cleared");
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
          clog("created?");
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
        if (!classdoc) return code.event(code.auth.CLASS_NOT_EXIST);
        if (classdoc.users.classes[0].students.find((stud) => stud.studentID == email)) return code.event(code.auth.USER_EXIST);
        let pclassdoc = await Institute.findOne({
            uiid: uiid,
            "pseudousers.classes": { $elemMatch: { classname: classname } },
        },
          { projection: { "pseudousers.classes.$": 1 } }
        );
        if (!pclassdoc) return code.event(code.auth.CLASS_NOT_EXIST);
        if (pclassdoc.pseudousers.classes[0].students.find((stud) => stud.studentID == email)) return code.event(code.auth.USER_EXIST);
        clog("checks cleared student");
        const salt = await bcrypt.genSalt(10);
        const epassword = await bcrypt.hash(password, salt);
        const result = pseudo
          ? await studentworker.self.account.createPseudoAccount(
              uiid,
              classname,
              {
                _id: new ObjectId(),
                username: username,
                studentID: email,
                password: epassword,
                className: classname,
                createdAt: Date.now(),
                verified: false,
                prefs: {},
              }
            )
          : await studentworker.self.account.createAccount(uiid, classname, {
              _id: new ObjectId(),
              username: username,
              studentID: email,
              password: epassword,
              className: classname,
              createdAt: Date.now(),
              verified: false,
              prefs: {},
            }); //new student push
        if (result.event == code.NO)
          return code.event(code.auth.ACCOUNT_CREATION_FAILED);
        clog("new student appended?");
        classdoc = pseudo
          ? await Institute.findOne(
              {
                uiid: uiid,
                "pseudousers.classes": { $elemMatch: { classname: classname } },
              },
              {
                projection: { _id: 0, "pseudousers.classes.$": 1 },
              }
            )
          : await Institute.findOne(
              {
                uiid: uiid,
                "users.classes": { $elemMatch: { classname: classname } },
              },
              {
                projection: { _id: 0, "users.classes.$": 1 },
              }
            );
        if (!classdoc) return code.event(code.schedule.BATCH_NOT_FOUND);
        clog(classdoc);
        const student = pseudo
          ? classdoc.pseudousers.classes[0].students.find((stud) => stud.studentID == email)
          : classdoc.users.classes[0].students.find((stud) => stud.studentID == email);
        if (!student) return code.event(code.auth.USER_NOT_EXIST);
        this.createSession(response, student._id, uiid, secret, classname);
        return {
          event: code.auth.ACCOUNT_CREATED,
          user: pseudo?share.getPseudoStudentShareData(student):share.getStudentShareData(student),
        };
      }
      default:
        return code.event(code.server.DATABASE_ERROR);
    }
  };

  userdata = async (request, secret) => {
    this.verify(request, secret)
      .catch((e) => {
        return code.event(code.auth.AUTH_REQ_FAILED);
      })
      .then(async (response) => {
        clog(response);
        if (!this.valid(response)) return code.event(code.auth.SESSION_INVALID);
        switch (secret) {
          case this.adminsessionsecret: {
            const admin = await Admin.findOne({
              _id: ObjectId(response.user.id),
            });
            return admin
              ? share.getAdminShareData(admin)
              : code.event(code.auth.USER_NOT_EXIST);
          }
          case this.teachersessionsecret: {
            let teacherdoc = await Institute.findOne(
              {
                uiid: response.user.uiid,
                "users.teachers": {
                  $elemMatch: { _id: ObjectId(response.user.id) },
                },
              },
              {
                projection: {
                  _id: 0,
                  "users.teachers.$": 1,
                },
              }
            );
            if (!teacherdoc) {
              teacherdoc = await Institute.findOne(
                {
                  uiid: response.user.uiid,
                  "pseudousers.teachers": {
                    $elemMatch: { _id: ObjectId(response.user.id) },
                  },
                },
                {
                  projection: {
                    _id: 0,
                    "pseudousers.teachers.$": 1,
                  },
                }
              );
              clog(
                share.getPseudoTeacherShareData(
                  teacherdoc.pseudousers.teachers[0],
                  response.user.uiid
                )
              );
              return teacherdoc
                ? share.getPseudoTeacherShareData(
                    teacherdoc.pseudousers.teachers[0],
                    response.user.uiid
                  )
                : code.event(code.auth.USER_NOT_EXIST);
            }
            return teacherdoc
              ? share.getTeacherShareData(
                  teacherdoc.users.teachers[0],
                  response.user.uiid
                )
              : code.event(code.auth.USER_NOT_EXIST);
          }
          case this.studentsessionsecret: {
            let studentdoc = await Institute.findOne(
              {
                uiid: response.user.uiid,
                "users.classes": {
                  $elemMatch: { classname: response.user.classname },
                },
              },
              {
                projection: {
                  _id: 0,
                  "users.classes.$": 1,
                },
              }
            );
            let student;
            if (studentdoc) {
              student = share.getStudentShareData(
                studentdoc.users.classes[0].students.find(
                  (stud) => String(stud._id) == String(response.user.id)
                ),
                response.user.uiid
              );
            }
            if (!student) {
              studentdoc = await Institute.findOne(
                {
                  uiid: response.user.uiid,
                  "pseudousers.classes": {
                    $elemMatch: { classname: response.user.classname },
                  },
                },
                {
                  projection: {
                    _id: 0,
                    "pseudousers.classes.$": 1,
                  },
                }
              );
              if (studentdoc) {
                student = share.getPseudoStudentShareData(
                  studentdoc.users.classes[0].students.find(
                    (stud) => String(stud._id) == String(response.user.id)
                  ),
                  response.user.uiid
                );
              }
              return studentdoc
                ? student
                : code.event(code.auth.USER_NOT_EXIST); //if no class then obiviously no student.
            }
            return studentdoc ? student : code.event(code.auth.USER_NOT_EXIST);
          }
          default:
            return code.event(code.auth.AUTH_REQ_FAILED);
        }
      });
  };
  valid = (response) => response.event != code.auth.SESSION_INVALID;
}

module.exports = new Session();
