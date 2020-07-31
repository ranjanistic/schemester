const { ObjectId } = require("mongodb");

const code = require("../hardcodes/events.js"),
  jwt = require("jsonwebtoken"),
  bcrypt = require("bcryptjs"),
  Admin = require("../collections/Admins"),
  Institute = require("../collections/Institutions"),
  sessionID = "id",
  sessionUID = "uid";

class Session {
  constructor() {
    this.adminsessionsecret = "adminschemesterSecret2001";
    this.teachersessionsecret = "teacherschemesterSecret2001";
    this.studentsessionsecret = "studentschemesterSecret2001";
    this.sessionID = "id",
    this.sessionUID = "uid";
    this.sessionKey = "bailment"; //bailment ~ amaanat
    this.expiresIn = 7 * 86400;//days*seconds/day
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
        const query = {email:email};
        //clog(Admin.collectionName);
        const admin = await Admin.findOne(query);
        if (!admin) return code.event(code.auth.USER_NOT_EXIST)
        clog(admin._id);
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) return code.event(code.auth.WRONG_PASSWORD);
        if (uiid != admin.uiid) return code.event(code.auth.WRONG_UIID);
        const payload = {
          user: {
            id: admin._id,
            uiid: admin.uiid,
          },
        };

        let token = jwt.sign(payload, secret, {
          expiresIn: this.expiresIn, //days*seconds/day
        });
        response.cookie(this.sessionKey, token, { signed: true });
        return {
          event: code.auth.AUTH_SUCCESS,
          user: getAdminShareData(admin),
          target: target,
        };
      }
      case this.teachersessionsecret:{
        //teacher login
        clog(request.body);
        const inst = await Institute.findOne({uiid:request.body.uiid});
        switch (request.body.type) {
          case "uiid": {
            return inst
              ? code.event(code.inst.INSTITUTION_EXISTS)
              : code.event(code.inst.INSTITUTION_NOT_EXISTS);
          }
          default:{
            if (!inst) return code.event(code.inst.INSTITUTION_NOT_EXISTS);
            const userInst = await Institute.findOne({uiid:request.body.uiid,"users.teachers":{$elemMatch:{"teacherID":request.body.email}}},
              {projection:{_id:0,"users.teachers.$":1}}
            );
            switch(request.body.type){
              case "email": {
                return userInst?code.event(code.auth.USER_EXIST):code.event(code.auth.USER_NOT_EXIST);
              }
              case "password": {
                const { password, uiid, target } = request.body;
                if(!userInst) return code.event(code.auth.USER_NOT_EXIST);
                clog("user teacher");
                const teacher = userInst.users.teachers[0];
                clog(teacher);
                const isMatch = await bcrypt.compare(password, teacher.password);
                if (!isMatch) return code.event(code.auth.WRONG_PASSWORD);
                const payload = {user: {id: teacher._id,uiid: uiid}};
                const token = jwt.sign(payload, secret, {
                  expiresIn: this.expiresIn,
                });
                response.cookie(this.sessionKey, token, { signed: true });
                return {
                  event: code.auth.AUTH_SUCCESS,
                  user: getTeacherShareData(teacher),
                  target: target,
                };
              }
              default:return code.event(code.auth.AUTH_REQ_FAILED);
            }
          }
        }
      }break;
      case this.studentsessionsecret:{
          //todo:student login
          return;
      }
      default:
        return code.event(code.auth.AUTH_REQ_FAILED);
    }
  };

  signup = async (request, response, secret) => {
    switch (secret) {
      case this.adminsessionsecret:
        {
          const { username, email, password, uiid } = request.body;
          let user = await Admin.findOne({ email:email });
          if (user) return code.event(code.auth.USER_EXIST);
          let inst = await Admin.findOne({ uiid:uiid });
          if (inst) return code.event(code.server.UIID_TAKEN);
          clog("checks cleared");
          //user = new Admin({ username, email, password, uiid });
          //clog("got new user model");
          const salt = await bcrypt.genSalt(10);
          const epassword = await bcrypt.hash(password, salt);
          const newAdmin = {
            username:username,
            email:email,
            password:epassword,
            uiid:uiid,
            createAt:Date.now(),
            verified:false,
            vlinkexp:0,
            prefs:{}
          }
          const result = await Admin.insertOne(newAdmin);
          if(result.insertedCount==0) return code.event(code.auth.ACCOUNT_CREATION_FAILED);
          //account created
          clog("result");
          const admin = result.ops[0];
          const payload = {
            user: {
              id: admin._id,
              uiid: admin.uiid,
            },
          };
          const token = jwt.sign(payload, secret, { expiresIn: this.expiresIn }); //days*sec/day
          clog("token:" + token);
          response.cookie(this.sessionKey, token, { signed: true });
          clog("cookie created");
          return {
            event: code.auth.ACCOUNT_CREATED,
            user: getAdminShareData(admin),
          };
        }
      case this.teachersessionsecret:{
          const { username, email, password, uiid } = request.body;
          const inst = await Institute.findOne({ uiid: uiid });
          if (!inst) return code.event(code.inst.INSTITUTION_NOT_EXISTS);
          const userinst = await Institute.findOne({uiid:uiid, "users.teachers":{$elemMatch:{"teacherID":email}}});
          if(userinst) return code.event(code.auth.USER_EXIST);
          clog("checks cleared");
          let result;
          const salt = await bcrypt.genSalt(10);
          const epassword = await bcrypt.hash(password, salt);
          const doc = await Institute.findOneAndUpdate(
            { uiid: uiid },
            {
              $push: {
                "users.teachers": {
                  _id: new ObjectId(),
                  username: username,
                  teacherID: email,
                  password: epassword,
                  createdAt: Date.now(),
                  verified:false,
                  vlinkexp:0
                },
              },
            }
          );
          if (doc) {
            clog("created?");
            const userInst = await Institute.findOne({uiid:uiid, "users.teachers":{$elemMatch:{"teacherID":email}}},{
              projection:{_id:0,"users.teachers.$":1}
            });
            const user = userInst.users.teachers[0];
            if(user){
              const payload = {
                user: {
                  id: user._id,
                  uiid: uiid
                },
              };
              clog("payload");
              clog(payload);
              const token = jwt.sign(payload, secret, {expiresIn: this.expiresIn});
              clog("token:" + token);
              clog("setting cookie");
              response.cookie(this.sessionKey, token, { signed: true });
              clog("cookie set, setting result");
              result = {
                event: code.auth.ACCOUNT_CREATED,
                user: getTeacherShareData(user),
              };
              clog("return result");
              clog(result);
              return result;
            } else{
              clog("not found");
              return code.event(code.server.DATABASE_ERROR);
            }
            
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

const getAdminShareData = (data = {}) => {
  return {
    isAdmin:true,
    [sessionUID]: data._id,
    username: data.username,
    [sessionID]: data.email,
    uiid: data.uiid,
    createdAt: data.createdAt,
    verified: data.verified,
  };
};

const getTeacherShareData = (data = {}) => {
  return {
    isTeacher:true,
    [sessionUID]: data._id,
    username: data.username,
    [sessionID]: data.teacherID,
    createdAt: data.createdAt,
    verified: data.verified,
  };
};

let clog = (msg) => console.log(msg);
