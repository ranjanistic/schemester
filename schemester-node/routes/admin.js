const express = require("express"),
  router = express.Router(),
  cookieParser = require("cookie-parser"),
  { check, validationResult } = require("express-validator"),
  code = require("../hardcodes/events"),
  view = require("../hardcodes/views"),
  session = require("../workers/session"),
  Admin = require("../modelschema/Admins"),
  Institute = require("../modelschema/Institutions");

const sessionsecret = "schemesterSecret2001";
const sessionKey = "bailment"; //bailment ~ amaanat
const sessionID = "id";
const sessionUID = "uid";

router.use(cookieParser(sessionsecret));

router.get("/", function (req, res) {
  res.redirect("/admin/auth/login?target=dashboard");
});

router.get("/auth/login*", (req, res) => {
  session.verify(req, res).then((response) => {
    clog("login:" + jstr(response));
    if (response.event === code.auth.SESSION_INVALID) {
      let autofill = req.query;
      res.render(view.adminlogin, { autofill });
    } else {
      let link =
        req.query.target != null
          ? `/admin/session?u=${response.user.id}&target=${req.query.target}`
          : `/admin/session?u=${response.user.id}&target=registration`;
      res.redirect(link);
    }
  });
});

router.get("/session*", (req, res) => {
  let data = req.query;
  clog("response");
  session.verify(req, res).then(async (response) => {
    clog("verify" + jstr(response));
    if (response.event === code.auth.SESSION_INVALID) {
      clog("invalid session");
      res.redirect(`/admin/auth/login?target=${data.target}`);
    } else {
      try {
        clog("verify" + jstr(response.user));
        if (data.u == response.user.id) {
          clog("u = user.id");
          const _id = response.user.id;
          let user = await Admin.findOne({ _id });
          if (user) {
            let adata = getAdminShareData(user);
            let uiid = adata.uiid;
            let inst = await Institute.findOne({ uiid });
            if (data.target != "manage") {
              if (!inst) {
                clog("no inst registered");
                data.target = "registration";
              } else {
                data.target = "dashboard";
              }
            }
            switch (data.target) {
              case "manage":{
                  res.render(view.adminsettings, { adata });
                }
                break;
              case "dashboard":{
                  res.render(view.admindash, { adata });
                }
                break;
              case "registration":{
                  res.render(view.adminsetup, { adata });
                }
                break;
              default: {
                res.redirect(`/admin/auth/login?target=${data.target}`);
              }
            }
          } else {
            session.finish(res).then(response=>{
              if(response) res.redirect(`/admin/auth/login?target=${data.target}`);
            });
          }
        } else {
          res.redirect(`/admin/auth/login?target=${data.target}`);
        }
      } catch (e) {
        clog("session catch");
        clog(e);
        res.redirect(`/admin/auth/login?target=${data.target}`);
      }
    }
  });
});


//for account settings
router.post("/account/action", (req, res) => {
  session.verify(req,res).then(response=>{
    if(response.event == code.auth.SESSION_INVALID){
      res.redirect(`/admin/auth/login?target=manage`);
    }else{
      switch (req.body.action) {
        case code.action.CHANGE_PASSWORD:{

        }break;
        case code.action.CHANGE_ID:{

        }break;
        case code.action.ACCOUNT_DELETE:{

        }break;
        default:res.redirect(`/admin/auth/login?target=manage`);
      }
    }
  })
});

router.post("/session/validate", async (req, res) => {
  let result;
  const { getuser } = req.body;
  clog(getuser);
  if (getuser) {
    clog("getuser");
    session
      .userdata(req, Admin)
      .then((response) => {
        result = response;
        clog("postttt");
        clog(result);
        res.json({ result });
      })
      .catch((error) => {
        clog("errr");
        throw error;
      });
  } else {
    clog("just verify");
    await session
      .verify(req, res)
      .then((response) => {
        result = response;
        clog("post validate");
        clog(result);
        return res.json({ result });
      })
      .catch((error) => {
        return res.json({ event: code.auth.AUTH_REQ_FAILED, msg: error });
      });
  }
});

router.post(
  "/auth/signup",
  [
    check("username", code.auth.NAME_INVALID).not().isEmpty(),
    check("email", code.auth.EMAIL_INVALID).isEmail(),
    check("password", code.auth.PASSWORD_INVALID)
      .isAlphanumeric()
      .isLength({ min: 6 }),
    check("uiid", code.auth.UIID_INVALID).not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    let result;
    if (!errors.isEmpty()) {
      result = { event: errors.array()[0].msg };
      res.json({ result });
      return;
    }
    session.signup(req, res, Admin)
      .then((response) => {
        clog("Response");
        clog(response);
        result = response;
        return res.json({ result });
      })
      .catch((error) => {
        clog('error');
        clog(error);
        result = { event: code.auth.ACCOUNT_CREATION_FAILED, msg: error };
        return res.status(500).json({ result });
      });
  }
);

router.post("/auth/logout", (_, res) => {
  session.finish(res).then((response) => {
    let result = response;
    return res.json({ result });
  });
});

router.post(
  "/auth/login",
  [
    check("email", code.auth.EMAIL_INVALID).isEmail(),
    check("password", code.auth.PASSWORD_INVALID).not().isEmpty(),
    check("uiid", code.auth.UIID_INVALID).not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      result = { event: errors.array()[0].msg };
      return res.json({ result });
    }
    let result = { event: code.auth.AUTH_REQ_FAILED };
    await session
      .login(req, res, Admin)
      .then((response) => {
        clog("post login:" + jstr(response));
        result = response;
        return res.json({ result });
      })
      .catch((error) => {
        result = { event: code.auth.AUTH_REQ_FAILED, msg: error };
        clog("post login:" + jstr(result));
        return res.json({ result });
      });
  }
);

router.post("/createInstitution", (req, res) => {
  const register = require("../workers/registration.js");
  res.send(register.createInstitutionDefaults(req.body));
});

router.post("/external/*", (req, response) => {
  switch (req.query.type) {
    case "invitation":
      {
        //todo: Generate only if expired. Check getMoment()<lastlinkdate equality from database.
        //also check if user has disabled previous link, in {req.query.revoked}, then create and send new link as follows.
        //var prevlinkData = getPreviousInviteLink();
        //prevlinkData.time;
        if (req.query.target == "teacher") {
          var linkdata = createInviteLink(
            "priyanshuranjan88@gmail.com", //use session id
            "mvmnoidab64b", //use session uiid
            "teacher"
          );
          clog("new link:" + linkdata);
          response.json({ linkdata });
        } else {
          response.render(view.notfound);
        }
      }
      break;
    case "action":
      {
        if (req.body.accepted) {
          res.render(view.adminsettings);
        } else {
          res.render(view.loader);
        }
      }
      break;
    default:
      response.send(404);
  }
});

router.get("/external/*", (req, response) => {
  clog(req.query);
  switch (req.query.type) {
    case "invitation":
      {
        if (req.query.target == "teacher") {
          var invite = getInviteLinkData(req.query);
          if (invite == null) {
            response.render(view.notfound);
          } else {
            response.render(view.userinvitaion, { invite });
          }
        } else {
          response.render(view.notfound);
        }
      }
      break;
    default:
      response.render(view.notfound);
  }
});

var getPreviousInviteLinkData = (_) => {
  //read from database;
  adb.collection(testInstitute);
  let expfromdb;
  let valid = getTheMoment(false) < expfromdb;
  return {
    adminName: "Admin kumar",
    adminEmail: [email], //from session
    active: [valid],
    uiid: [query.uiid], //for creation of user email object in users document of institution, for teacher schedule.
    instituteName: "Institution of Example",
    exp: [query.exp],
  };
};

var createInviteLink = (email, uiid, target) => {
  let id = String(email).split("@", 1);
  let dom = String(email).split("@")[1];
  let exp = getTheMoment(true, 7); // set exp time one week later
  return jstr({
    link: `http://localhost:3000/admin/external/?type=invitation&target=${target}&id=${id}&dom=${dom}&uiid=${uiid}&exp=${exp}`,
    time: [exp],
  });
};

var getInviteLinkData = (query) => {
  let email = `${query.id}@${query.dom}`;
  clog(getTheMoment(false) + "<" + parseInt(query.exp));
  let valid = getTheMoment(false) < parseInt(query.exp);
  if (isInvalidQuery(query)) {
    return null;
  }
  //todo: let admin = getAdminNameFromDB(email); //admin name to be shown
  //match exp from server, return null if conflict.
  return {
    adminName: "Admin kumar",
    adminEmail: [email], //for user to contact admin if !active, and other verification purposes if active.
    active: [valid],
    uiid: [query.uiid], //for creation of user email object in users document of institution, for teacher schedule.
    instituteName: "Institution of Example",
    target: [query.target],
    exp: [query.exp],
  };
};
var getTheMoment = (stringForm = true, dayincrement = 0) => {
  let d = new Date();
  let year = d.getFullYear();
  let month = d.getMonth() + 1;
  let date = d.getDate();
  let incrementedDate = date + dayincrement;
  if (daysInMonth(month, year) - incrementedDate < 0) {
    incrementedDate = incrementedDate - daysInMonth(month, year);
    if (12 - (month + 1) < 0) {
      month = 13 - month;
      year++;
    } else {
      month++;
    }
  }
  incrementedDate =
    incrementedDate < 10 ? `0${incrementedDate}` : incrementedDate;
  month = month < 10 ? `0${month}` : month;
  let hour = d.getHours() < 10 ? `0${d.getHours()}` : d.getHours();
  let min = d.getMinutes() < 10 ? `0${d.getMinutes()}` : d.getMinutes();
  let insts = d.getSeconds();
  let secs = insts < 10 ? `0${insts}` : insts;
  let instm = d.getMilliseconds();
  let milli = instm < 10 ? `00${instm}` : instm < 100 ? `0${instm}` : instm;
  if (stringForm) {
    return (
      String(year) +
      String(month) +
      String(incrementedDate) +
      String(hour) +
      String(min) +
      String(secs) +
      String(milli)
    );
  } else {
    return parseInt(
      String(year) +
        String(month) +
        String(incrementedDate) +
        String(hour) +
        String(min) +
        String(secs) +
        String(milli)
    );
  }
};

let daysInMonth = (month, year) => new Date(year, month, 0).getDate();

var isInvalidQuery = (query) =>
  query.id == null ||
  query.dom == null ||
  query.exp == null ||
  query.uiid == null ||
  query.id == "" ||
  query.dom == "" ||
  query.exp == "" ||
  query.uiid == "" ||
  String(parseInt(query.exp)).length < getTheMoment(true).length;

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

let clog = (msg) => console.log(msg);

let jstr = (obj)=> JSON.stringify(obj);

module.exports = router;
