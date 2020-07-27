const code = require("../hardcodes/events.js"),
  jwt = require("jsonwebtoken"),
  bcrypt = require("bcryptjs"),
  Admin = require("../modelschema/Admins"),
  Institute = require("../modelschema/Institutions"),
  sessionID = "id",
  sessionUID = "uid";

class Session {
  constructor() {
    this.adminsessionsecret = "adminschemesterSecret2001";
    this.teachersessionsecret = "teacherschemesterSecret2001";
    this.studentsessionsecret = "studentschemesterSecret2001";
    this.sessionKey = "bailment"; //bailment ~ amaanat
    this.expiresIn = 7 * 86400;
  }

  verify = async (request, secret) => {
    let token = request.signedCookies[this.sessionKey];
    console.log("token:" + token);
    if (token == null) {
      console.log("nul token");
      return code.event(code.auth.SESSION_INVALID);
    }
    let result = code.event(code.auth.SESSION_INVALID);
    try {
      result = jwt.verify(token, secret);
    } catch (e) {
      result = false;
    }
    console.log("result:" + result);
    if (result == false) {
      return code.event(code.auth.SESSION_INVALID);
    } else {
      return result;
    }
  };

  finish = async (response) => {
    await response.clearCookie(this.sessionKey);
    return code.event(code.auth.LOGGED_OUT);
  };

  login = async (request, response, secret) => {
    switch (secret) {
      case this.adminsessionsecret: {
        //admin login
        const { email, password, uiid, target } = request.body;
        let user = await Admin.findOne({ email });
        if (!user) return code.event(code.auth.USER_NOT_EXIST);
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return code.event(code.auth.WRONG_PASSWORD);
        if (uiid != user.uiid) return code.event(code.auth.WRONG_UIID);
        const payload = {
          user: {
            id: user.id,
            uiid: user.uiid,
          },
        };

        let token = jwt.sign(payload, secret, {
          expiresIn: this.expiresIn, //days*seconds/day
        });
        response.cookie(this.sessionKey, token, { signed: true });
        return {
          event: code.auth.AUTH_SUCCESS,
          user: getAdminShareData(user),
          target: target,
        };
      }
      case this.teachersessionsecret:
        {
          //teacher login
          switch (request.body.type) {
            case "uiid": {
              clog("case uiid");
              const { uiid } = request.body;
              clog(uiid);
              let inst = await Institute.findOne({ uiid });
              return inst
                ? code.event(code.inst.INSTITUTION_EXISTS)
                : code.event(code.inst.INSTITUTION_NOT_EXISTS);
            }
            case "email": {
              let result;
              const { uiid, teacherID } = request.body;
              clog(uiid);
              clog(teacherID);
              let inst = await Institute.findOne({ uiid });
              inst.users.teachers.forEach((teacher) => {
                clog(teacher.teacherID);
                if (teacher.teacherID == teacherID) {
                  result = code.event(code.auth.USER_EXIST);
                }
              });
              return result;
            }
            case "password": {
              const { email, password, uiid, target } = request.body;
              clog(uiid + email + password + target);
              let user;
              let result = code.event(code.auth.USER_NOT_EXIST);
              //todo:login teacher by matching password
              let inst = await Institute.findOne({ uiid });
              if (!inst) return code.event(code.inst.INSTITUTION_NOT_EXISTS);
              if (!inst.users)
                return code.event(code.inst.INSTITUTION_DEFAULTS_UNSET);

              inst.users.teachers.forEach((teacher) => {
                if (teacher.teacherID == email) {
                  user = teacher;
                  clog(user);
                }
              });
              const isMatch = await bcrypt.compare(password, user.password);
              if (!isMatch) return code.event(code.auth.WRONG_PASSWORD);
              const payload = {
                user: {
                  id: user.id,
                  uiid: uiid,
                },
              };
              let token = jwt.sign(payload, secret, {
                expiresIn: this.expiresIn, //days*seconds/day
              });
              response.cookie(this.sessionKey, token, { signed: true });
              return {
                event: code.auth.AUTH_SUCCESS,
                user: getTeacherShareData(user),
                target: target,
              };
            }
            default: {
              return code.event(code.auth.AUTH_REQ_FAILED);
            }
          }
          //generating token;
        }
        break;
      case this.studentsessionsecret:
        {
          //student login
        }
        break;
      default:
        return code.event(code.auth.AUTH_REQ_FAILED);
    }
  };

  signup = async (request, response, secret) => {
    switch (secret) {
      case this.adminsessionsecret:
        {
          const { username, email, password, uiid } = request.body;
          let user = await Admin.findOne({ email });
          if (user) return code.event(code.auth.USER_EXIST);
          let inst = await Admin.findOne({ uiid });
          if (inst) return code.event(code.server.UIID_TAKEN);
          clog("checks cleared");
          user = new Admin({ username, email, password, uiid });
          clog("got new user model");
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(password, salt);
          await user.save(); //account created
          clog("account created");
          const payload = {
            user: {
              id: user.id,
              uiid: user.uiid,
            },
          };

          let token = jwt.sign(payload, secret, { expiresIn: this.expiresIn }); //days*sec/day
          clog("token:" + token);
          response.cookie(this.sessionKey, token, { signed: true });
          clog("cookie created");
          return {
            event: code.auth.ACCOUNT_CREATED,
            user: getAdminShareData(user),
          };
        }
        break;
      case this.teachersessionsecret:
        {
          const { username, email, password, uiid } = request.body;
          let inst = await Institute.findOne({ uiid });
          if (!inst) return code.event(code.inst.INSTITUTION_NOT_EXISTS);

          let result;

          const salt = await bcrypt.genSalt(10);
          let epassword = await bcrypt.hash(password, salt);

          let doc = await Institute.updateOne(
            { uiid: uiid },
            {
              $push: {
                "users.teachers": {
                  username: username,
                  teacherID: email,
                  password: epassword,
                },
              },
            }
          );
          if (doc) {
            clog(doc);
            clog("created?");
            inst = await Institute.findOne({ uiid });
            clog("in then");
            let found = inst.users.teachers.some((teacher, index) => {
              if (teacher.teacherID == email) {
                user = teacher;
                return true;
              }
            });
            clog(found);
            //get this new user from array
            const payload = {
              user: {
                id: user.id, //use _id
                uiid: uiid,
              },
            };
            clog("payload");
            clog(payload);
            let token = jwt.sign(payload, secret, {
              expiresIn: this.expiresIn,
            }); //days*sec/day
            clog("token:" + token);
            clog("setting cookie");
            response.cookie(this.sessionKey, token, { signed: true });
            clog("cookie set, setting result");
            result = {
              event: code.auth.ACCOUNT_CREATED,
              user: getTeacherShareData(user),
            };
            clog("doc result");
            clog(result);
            return result;
          } else {
            clog("not created");
            clog(err);
            return code.eventmsg(code.auth.ACCOUNT_CREATION_FAILED, err);
          }
        }break;
      default:
        return code.event(code.server.DATABASE_ERROR);
    }
  };
  userdata = async (request, model, secret) => {
    let token = request.signedCookies[this.sessionKey];
    if (token == null) {
      console.log("tokennull");
      return code.event(code.auth.SESSION_INVALID);
    } else {
      let decode = code.event(code.auth.SESSION_INVALID);
      try {
        decode = jwt.verify(token, secret);
      } catch (e) {
        decode = false;
      }
      if (decode == false) {
        console.log("decodefalse");
        return code.event(code.auth.SESSION_INVALID);
      } else {
        let _id = decode.user.id;
        switch (secret) {
          case this.adminsessionsecret: {
            let user = await model.findOne({ _id });
            if (user) {
              console.log("session_Id");
              console.log(_id);
              return getAdminShareData(user);
            } else {
              return code.event(code.auth.SESSION_INVALID);
            }
          }
          case this.teachersessionsecret: {
          }
          default:
            return code.event(code.auth.AUTH_REQ_FAILED);
        }
      }
    }
  };

  valid = (response) => {
    return response.event != code.auth.SESSION_INVALID;
  };
}

module.exports = new Session();

let getAdminShareData = (data = {}) => {
  return {
    [sessionUID]: data.id,
    username: data.username,
    [sessionID]: data.email,
    uiid: data.uiid,
    createdAt: data.createdAt,
    verified: data.verified,
  };
};

let getTeacherShareData = (data = {}) => {
  return {
    [sessionUID]: data.id,
    username: data.username,
    [sessionID]: data.teacherID,
    createdAt: data.createdAt,
    verified: data.verified,
  };
};

let clog = (msg) => console.log(msg);
