const code = require("../hardcodes/events.js"),
  jwt = require("jsonwebtoken"),
  bcrypt = require("bcryptjs");
const sessionsecret = "schemesterSecret2001";
const sessionKey = "bailment"; //bailment ~ amaanat
const sessionID = "id";
const sessionUID = "uid";

class Session {
  constructor() {}

  verify = async (request, response) => {
    let token = request.signedCookies[sessionKey];
    console.log("token:" + token);
    if (token == null) {
      console.log("nul token");
      return { event: code.auth.SESSION_INVALID };
    }
    let result = { event: code.auth.SESSION_INVALID };
    try {
      result = jwt.verify(token, sessionsecret);
    } catch (e) {
      result = false;
    }
    console.log("result:" + result);
    if (result == false) {
      response.clearCookie(sessionKey);
      return { event: code.auth.SESSION_INVALID };
    } else {
      return result;
    }
  };

  finish = async (response) => {
    await response.clearCookie(sessionKey);
    return { event: code.auth.LOGGED_OUT };
  };

  login = async (request, response, model) => {
    const { email, password, uiid, target } = request.body;
    let user = await model.findOne({ email });
    if (!user) return { event: code.auth.USER_NOT_EXIST };
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return { event: code.auth.WRONG_PASSWORD };
    if (uiid != user.uiid) return { event: code.auth.WRONG_UIID };

    const payload = {
      user: {
        id: user.id,
        uiid:user.uiid
      },
    };

    let token = jwt.sign(payload, sessionsecret, {
      expiresIn: 28 * 1440,
    });
    response.cookie(sessionKey, token, { signed: true });
    return {
      event: code.auth.AUTH_SUCCESS,
      user: getAdminShareData(user),
      target: target,
    };
  };

  signup = async (request, response, model) => {
    const { username, email, password, uiid } = request.body;

    let user = await model.findOne({ email });
    if (user) return {event:code.auth.USER_EXIST};
    let inst = await model.findOne({ uiid });
    if (inst) return {event:code.server.UIID_TAKEN};
    clog("checks cleared")
    user = new model({ username, email, password, uiid });
    clog("got new user model");
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save(); //account created
    clog("account created");
    const payload = {
      user: { 
        id: user.id,
        uiid:user.uiid
      },
    };

    let token = jwt.sign(payload, sessionsecret, { expiresIn: 2 * 1440 });
    clog("token:"+token);
    response.cookie(sessionKey, token, { signed: true });
    clog("cookie created");
    return {
      event: code.auth.ACCOUNT_CREATED,
      user: getAdminShareData(user),
    };
  };
  userdata = async (request, model) => {
    let token = request.signedCookies[sessionKey];
    if (token == null) {
      console.log("tokennull");
      return { event: code.auth.SESSION_INVALID };
    } else {
      let decode = { event: code.auth.SESSION_INVALID };
      try {
        decode = jwt.verify(token, sessionsecret);
      } catch (e) {
        decode = false;
      }
      if (decode == false) {
        console.log("decodefalse");
        return { event: code.auth.SESSION_INVALID };
      } else {
        let _id = decode.user.id;
        let user = await model.findOne({ _id });
        if(user){
            console.log("session_Id");
            console.log(_id);
            return getAdminShareData(user);
        } else {
            return { event: code.auth.SESSION_INVALID };
        }
      }
    }
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
  };
};

let clog = (msg)=> console.log(msg);