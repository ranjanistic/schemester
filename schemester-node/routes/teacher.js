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
    session.login(req,res,sessionsecret).then(response=>{
      clog(response);
      result = response;
      return res.json({result});
    }).catch(error=>{
      clog(error);
    })
});

router.post("/auth/signup", (req, res) => {
  let result = code.event(code.auth.ACCOUNT_CREATION_FAILED);
  clog(req.body);
  session.signup(req,res,sessionsecret).then(response=>{
    result = response;
    clog("in teacher signup post");
    clog(response);
    return res.json({result});
  }).catch(error=>{
    clog("in teacher signup post error");
    clog(error);
    return res.json({result});
  });
});

router.get("/session*", async (req, res) => {
  session.verify(req, sessionsecret).then(async (response) => {
      clog(response);
      if(!session.valid(response)) {
        clog("invalid");
        res.redirect(`/teacher/auth/login?target=${req.query.target}`);
      } else {
        clog(response);
        let target = req.query.target?req.query.target:'today';
        let uiid = response.user.uiid;
        let inst = await Institute.findOne({uiid})
        if(inst.users.teachers){clog("has teachers");}
        //schedule filler view, as schedule (teacherschedule/schedule subdocuments) is assumed not to be present if user is joining via invitaiton, however if present already
        //(say, admin added schedule themselves even after inviting), then proceed directly to dashboard (today page, for teachers).                    
        let user;
        inst.users.teachers.forEach((teacher)=>{
          if(teacher.id == response.user.id){
            user = teacher;
          }
        });
        if(!inst.teacherSchedule[user.teacherID]) {target = 'addschedule'};
        switch(target){
          case 'today':{
            res.render(view.teacher.today,{user,inst});
          }break;
          case 'addschedule':{
            res.render(view.teacher.addschedule,{adata:{isAdmin:false},user,inst});
          }
        }
      }
  }).catch((error) => {
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
              let expires = inst.invite.teacher.expiresAt;
              const invite = {
                valid: false,
                uiid: inst.uiid,
                adminemail: admin.email,
                adminName: admin.username,
                expireAt:expires,
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

router.post('/find',async (req,res)=>{
  const {email,uiid} = req.body;
  let result = code.event(code.auth.USER_NOT_EXIST);
  let inst = await Institute.findOne({uiid});
  if(inst){
    inst.users.teachers.forEach((teacher)=>{
      if(teacher.teacherID == email){
        clog("found");
        result = code.event(code.auth.USER_EXIST);
      }
    })
  } else {
    result = code.event(code.inst.INSTITUTION_NOT_EXISTS);
  }
  clog(result);
  return res.json({result});
})

module.exports = router;
let clog = (msg) => console.log(msg);
