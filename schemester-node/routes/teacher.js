const express = require("express"),
  router = express.Router(),
  cookieParser = require("cookie-parser"),
  { check, validationResult } = require("express-validator"),
  code = require("../hardcodes/events"),
  view = require("../hardcodes/views"),
  session = require("../workers/session"),
  invite = require("../workers/invitation"),
  Institute = require("../modelschema/Institutions"),
  Admin = require("../modelschema/Admins");

const sessionsecret = session.teachersessionsecret;
router.use(cookieParser(sessionsecret));

router.get("/", function (req, res) {
  res.redirect("/teacher/auth/login?target=today");
});

router.get("/auth/login*", (req, res) => {
  session.verify(req, sessionsecret).then((response) => {
    if (session.valid(response)) {
      clog("valid login");
      let link = req.query.target
        ? `/teacher/session?u=${response.user.id}&target=${req.query.target}`
        : `/teacher/session?u=${response.user.id}&target=today`;
      res.redirect(link);
    } else {
      clog("invalid login");
      let autofill = req.query;
      res.render(view.teacher.login, { autofill });
    }
  });
});

router.post("/auth/login",async (req, res) => {
    let result = code.event(code.auth.AUTH_FAILED);
    clog(req.body);
    switch(req.body.type){
      case 'uiid':{
        clog("case uiid");
        let uiid = req.body.uiid;
        clog(uiid);
        let inst = await Institute.findOne({uiid});
        if(inst){
          result = {
            event:code.inst.INSTITUTION_EXISTS,
            uiid:uiid
          }
        } else {
          result = {
            event:code.inst.INSTITUTION_NOT_EXISTS
          }
        }
        return res.json({result});
      }
      case 'email':{
        let uiid = req.body.uiid;
        let teacherID = req.body.email;
        clog(uiid);
        clog(teacherID);
        //check response.teacher.verified, show verification dialog after login and proceed further.
        result = code.event(code.auth.USER_EXIST); //check in users.teachers subdocument array for existence.
        
        return res.json({result});
      }
      case 'password':{
        let uiid = req.body.uiid;
        let email = req.body.email;
        let password = req.body.password;
        let target = req.body.target;
        clog(uiid+email+password+target);
        session.login(req, res, sessionsecret,Institute)
          .then((response) => {
            //todo: retrive teacher from array, if exists.
            result = {
              event:code.auth.AUTH_SUCCESS,//accordingly
              teacher:{
                teacherName:"{type:String}",
                teacherID: teacherID,
                username: "{type: String}",
                verified:"false",
                createdAt: "{ type: Date, default: Date.now()}",
              }
            }
            return res.json({ result });
          })
          .catch((error) => {
            result = { event: code.auth.AUTH_REQ_FAILED, msg: error };
            clog("t post login:" + jstr(result));
            return res.json({ result });
          });
      }break;
      default:{res.json({result})}
    }
  }
);

router.post("/auth/signup", async (req, res) => {
  clog(req.body);
  uiid = "bb";
  let inst = await Institute.findOne({uiid});

  if(inst){
    clog("yeah bro");
    if(inst.users){
      clog(inst.users)
    }else {
      clog("pushing works!");
      Institute.updateOne({
        uiid:req.body.uiid
      },{
        $push:{
          "users.teachers":{
            username: req.body.username,
            teacherID: req.body.email,
            password: req.body.password
          }
        }
      },{upsert:true},(err,docs)=>{
        if(err){
          clog(err);
          //return result event error
        }
        if(docs){
          clog(docs);
          //return result event success
        }
      })
      
    }
  }
});

router.get("/session*", (req, res) => {
  session.verify(req, sessionsecret)
    .then((response) => {
      clog(response);
      if (session.valid(response)) {
        clog("teacher session valid:" + response.event);
        res.render(view.teacher.dash);
      } else {
        clog("invalid");
        res.redirect(`/teacher/auth/login?target=${req.query.target}`);
      }
    })
    .catch((error) => {
      clog(error);
      res.redirect(`/teacher/auth/login?target=${req.query.target}`);
    });
});

router.get("/external*", async (req, res) => {
  switch (req.query.type) {
    case invite.type:
      {
        let _id = req.query.in;
        try {
          let inst = await Institute.findOne({ _id });
          if (inst) {
            _id = req.query.ad;
            let admin = await Admin.findOne({ _id });
            if (inst.invite.teacher.active) {
              if (admin) {
                if (admin.uiid == inst.uiid) {
                  let creation = inst.invite.teacher.createdAt;
                  let expires = inst.invite.teacher.expiresAt;
                  let response = invite.checkTimingValidity(
                    creation,
                    expires,
                    req.query.t
                  );
                  clog(response);
                  if (invite.isValid(response)) {
                    const invite = {
                      valid: true,
                      uiid: inst.uiid,
                      adminemail: admin.email,
                      adminName: admin.username,
                      instname: inst.default.institute.instituteName,
                      expireAt: expires,
                      target: "teacher",
                    };
                    clog(invite);
                    res.render(view.userinvitaion, { invite });
                  } else if (invite.isExpired(response)) {
                    const invite = {
                      valid: false,
                      uiid: inst.uiid,
                      adminemail: admin.email,
                      adminName: admin.username,
                      instname: inst.default.institute.instituteName,
                      expireAt: expires,
                      target: "teacher",
                    };
                    clog(invite);
                    res.render(view.userinvitaion, { invite });
                  } else {
                    throw Error("Invalid link");
                  }
                } else {
                  throw Error("uiidmismatch");
                }
              } else {
                throw Error("admin null");
              }
            } else {
              const invite = {
                valid: false,
                uiid: inst.uiid,
                adminemail: admin.email,
                adminName: admin.username,
                instname: inst.default.institute.instituteName,
                target: "teacher",
              };
              clog(invite);
              res.render(view.userinvitaion, { invite });
            }
            //res.send(admin);
          } else {
            throw Error("institution null");
          }
        } catch (e) {
          clog(e);
          res.render(view.notfound);
        }
      }
      break;
    default:
      res.render(view.notfound);
  }
});

module.exports = router;
let clog = (msg) => console.log(msg);
