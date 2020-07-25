
const code = require("../hardcodes/events.js"),
  jwt = require("jsonwebtoken"),
  bcrypt = require("bcryptjs"),
  sessionID = "id",
  sessionUID = "uid";

class Session {
  constructor() {
    this.adminsessionsecret = "adminschemesterSecret2001";
    this.teachersessionsecret = "teacherschemesterSecret2001";
    this.sessionKey = "bailment"; //bailment ~ amaanat
    this.expiresIn = 7 * 86400;
  }

  verify = async (request, secret) => {
    let token = request.signedCookies[this.sessionKey];
    console.log("token:" + token);
    if (token == null) {
      console.log("nul token");
      return event(code.auth.SESSION_INVALID);
    }
    let result = event(code.auth.SESSION_INVALID);
    try {
      result = jwt.verify(token, secret);
    } catch (e) {
      result = false;
    }
    console.log("result:" + result);
    if (result == false) {
      return event(code.auth.SESSION_INVALID);
    } else {
      return result;
    }
  };

  finish = async (response) => {
    await response.clearCookie(this.sessionKey);
    return event(code.auth.LOGGED_OUT);
  };

  login = async (request, response, secret, model) => {
    const { email, password, uiid, target } = request.body;
    switch (secret) {
      case this.adminsessionsecret: {
        let user = await model.findOne({ email });
        if (!user) return event(code.auth.USER_NOT_EXIST);
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return event(code.auth.WRONG_PASSWORD);
        if (uiid != user.uiid) return event(code.auth.WRONG_UIID);
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
          let inst = await model.findOne({ uiid })
          .where(users.teachers.teacher.teacherID, email);
          if (inst) {
            user = inst.users.teachers.teacher;
          } else {
            return event(code.inst.INSTITUTION_NOT_EXISTS);
          }
        }
        break;
      default:
        user = null;
    }
  };

  signup = async (request, response, secret, model) => {
    const { username, email, password, uiid } = request.body;
    switch (secret) {
      case this.adminsessionsecret: {
        let user = await model.findOne({ email });
        if (user) return event(code.auth.USER_EXIST);
        let inst = await model.findOne({ uiid });
        if (inst) return event(code.server.UIID_TAKEN);
        clog("checks cleared");
        user = new model({ username, email, password, uiid });
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
      case this.teachersessionsecret:{
        let inst = await model.findOne({uiid});
        if(!inst) return event(code.inst.INSTITUTION_NOT_EXISTS);
                
      }
      default: return event(code.server.DATABASE_ERROR)
    }
  };
  userdata = async (request, model, secret) => {
    let token = request.signedCookies[this.sessionKey];
    if (token == null) {
      console.log("tokennull");
      return event(code.auth.SESSION_INVALID);
    } else {
      let decode = event(code.auth.SESSION_INVALID);
      try {
        decode = jwt.verify(token, secret);
      } catch (e) {
        decode = false;
      }
      if (decode == false) {
        console.log("decodefalse");
        return event(code.auth.SESSION_INVALID);
      } else {
        let _id = decode.user.id;
        switch(secret){
          case this.adminsessionsecret:{
            let user = await model.findOne({ _id });
            if (user) {
              console.log("session_Id");
              console.log(_id);
              return getAdminShareData(user);
            } else {
              return event(code.auth.SESSION_INVALID);
            }
          }
          case this.teachersessionsecret:{

          }
          default:return event(code.auth.AUTH_REQ_FAILED);
        }
      }
    }
  };

  valid = (response) => {
    return response.event != code.auth.SESSION_INVALID;
  };
}

module.exports = new Session();

let event=(code)=> {
  return {event:code};
}


let getAdminShareData = (data = {}) => {
  return {
    [sessionUID]: data.id,
    username: data.username,
    [sessionID]: data.email,
    uiid: data.uiid,
    createdAt: data.createdAt,
  };
};

let getTeacherShareData = (data = {})=>{
  return {
    [sessionUID]:data.id,
    username:data.username,
    [sessionID]:data.email,
    createdAt:data.createdAt
  };
}

let clog = (msg) => console.log(msg);
