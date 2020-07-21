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
const sessionID = "id";
const sessionUID = "uid";

router.use(cookieParser(sessionsecret));

router.get("/", function (req, res) {
  res.redirect("/admin/auth/login?target=dashboard");
});

router.get("/auth/login*", (req, res) => {
  session.verify(req, res).then((response) => {
    clog("login:" + jstr(response));
    if (!sessionValid(response)) {
      let autofill = req.query;
      res.render(view.adminlogin, { autofill });
    } else {
      let link =
        req.query.target != null
          ? `/admin/session?u=${response.user.id}&target=${req.query.target}`
          : `/admin/session?u=${response.user.id}&target=dashboard`;
      res.redirect(link);
    }
  });
});

router.get("/session*", (req, res) => {
  let data = req.query;
  
  clog("response");
  session.verify(req, res).then(async (response) => {
    clog("verify" + jstr(response));
    if (!sessionValid(response)) {
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
            clog(user);
            let adata = getAdminShareDataV(user);
            let uiid = adata.uiid;
            let inst = await Institute.findOne({ uiid });
            if (data.target != "manage") {
              if (!inst) {
                clog("no inst registered");
                inst = new Institute({
                  uiid:uiid
                });
                await inst.save();
                data.target = "registration";
              } else {
                clog("inst hai");
                if(inst.default!=null){
                  data.target = "dashboard";
                }else{
                  data.target = "registration";
                }
              }
            }            
            switch (data.target) {
              case "manage":{
                  res.render(view.adminsettings, { adata,inst });
              }break;
              case "dashboard":{
                  res.render(view.admindash, { adata });
              }break;
              case "registration":{
                clog("inregistration");
                res.render(view.adminsetup, { adata });
              }break;
              case "addteacher":{
                res.render(view.adminAddTeacher,{adata})
              }break;
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
    if(!sessionValid(response)){
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


router.post("/session/registerinstitution",
// [
//   check("adminName",code.inst.INVALID_ADMIN_NAME).notEmpty(),
//   check("adminPhone",code.inst.INVALID_ADMIN_PHONE).isNumeric(),
//   check("adminEmail",code.inst.INVALID_ADMIN_EMAIL).isEmail(),
//   check("instName",code.inst.INVALID_INST_NAME).notEmpty(),
//   check("instPhone",code.inst.INVALID_INST_PHONE).isNumeric(),
//   check("instUIID",code.inst.INVALID_INST_UIID).notEmpty(),
//   check("startTime",code.inst.INVALID_TIME_START).notEmpty(),
//   check("endTime",code.inst.INVALID_TIME_END).notEmpty(),
//   check("breakStartTime",code.inst.INVALID_TIME_BREAKSTART).notEmpty(),
//   check("weekStartDay",code.inst.INVALID_DAY).notEmpty(),
//   check("periodDuration",code.inst.INVALID_DURATION_PERIOD).isNumeric(),
//   check("breakDuration",code.inst.INVALID_DURATION_BREAK).isNumeric(),
//   check("workingDays",code.inst.INVALID_WORKING_DAYS).isLength({min:1,max:7}),
//   check("periodsInDay",code.inst.INVALID_PERIODS).isLength({min:1,max:1440})
// ]
// ,
async (req,res)=>{
  let result;
  clog("in registration final");
  session.verify(req,res).then(async (response)=>{
    if(!sessionValid(response)){
      clog("invalid session");
      await session.finish(res);
      result = {event:code.auth.SESSION_INVALID};
      return res.json({result});
    }
    clog(response);
    await Institute.findOneAndUpdate(
      {uiid:response.user.uiid},
      {
        default:{
          admin:{
            email:req.body.adminemail,
            username:req.body.adminname,
            phone:req.body.adminphone
          },
          institute:{
            instituteName:req.body.instname,
            email:req.body.instemail,
            phone:req.body.instphone
          },
          timings:{
            startTime:req.body.starttime,
            endTime:req.body.endtime,
            breakStartTime:req.body.breakstarttime,
            startDay:req.body.firstday,
            periodMinutes:req.body.periodduration,
            breakMinutes:req.body.breakduration,
            periodsInDay:req.body.totalperiods,
            daysInWeek:req.body.workingdays,
          }
        }
      },
      {useFindAndModify:false},
      async (error,document)=>{
        if(error){
          clog("erro");
          clog(error);
          result = {event:code.inst.INSTITUTION_DEFAULTS_UNSET}
        }else{
          clog("doc");
          if(document){
            result = {event:code.inst.INSTITUTION_DEFAULTS_SET}
          }
        }
      }
    );
    return res.json({result});
  }).catch((error)=>{
    result = {event:code.server.DATABASE_ERROR,msg:error};
    return res.json({result});
  })
})

let sessionValid = (response) =>{
  return response.event != code.auth.SESSION_INVALID
}

router.post('/session/receiveinstitution',async (req,res)=>{
  session.verify(req,res).then(async response=>{
    let result;
    const {uiid, doc} = req.body;
    if(!sessionValid(response)){
      result = {event:code.auth.SESSION_INVALID}
      return res.json({result});
    }
    let inst = await Institute.findOne({uiid});
    if(!inst){
      clog(uiid);
      inst = new Institute({
        uiid:uiid
      });
      clog("vallll");
      val = await inst.save();
      clog("val:"+val);
      if (val){

        result = {event:code.inst.INSTITUTION_CREATED};
      }else{
        result = {event:code.inst.INSTITUTION_CREATION_FAILED};
      }
    } else {
      if(inst[doc]){
        result = {event:code.inst.INSTITUTION_DEFAULTS_SET};
      } else{
        result = {event:code.inst.INSTITUTION_EXISTS};
      }
    }
    return res.json({result})
  }).catch(error=>{
    result = {event:code.server.DATABASE_ERROR,msg:error};
    return res.json({result});
  });
})

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

let getAdminShareDataV = (data = {}) => {
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
let i = Institute();



module.exports = router;
