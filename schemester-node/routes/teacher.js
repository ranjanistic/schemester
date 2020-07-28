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

router.get("/", (req, res)=>{
  res.redirect(toLogin(view.teacher.target.today));
});

router.get("/auth/login*", (req, res) => {
  session.verify(req,sessionsecret).then((response) => {
    if (!session.valid(response)) {
      const autofill = req.query;
      res.render(view.teacher.login, { autofill });
    } else {
      res.redirect(toSession(response.user.id,req.query.target));
    }
  }).catch(error=>{
    res.render(view.servererror,{error});
  });
});

router.post("/auth/login",async (req, res) => {
    result = code.event(code.auth.AUTH_FAILED);
    clog(req.body);
    session.login(req,res,sessionsecret).then(response=>{
      clog(response);
      result = response;
      return res.json({result});
    }).catch(error=>{
      clog(error);
    })
});

router.post("/auth/signup", async (req, res) => {
  let result = code.event(code.auth.ACCOUNT_CREATION_FAILED);
  clog(req.body);
  session.signup(req,res,sessionsecret).then((response)=>{
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
  let data = req.query;
  session.verify(req, sessionsecret).then(async (response) => {
      clog(response);
      if(!session.valid(response)) {
        clog("invalid");
        res.redirect(toLogin(data.target));
      } else {
        clog("session valid");
        clog(response);
        if(data.u != response.user.id){
          res.redirect(toLogin(data.target));
        } else {
          clog("u = user.id");
          const _id = response.user.id;
          let uiid = response.user.uiid;
          let inst = await Institute.findOne({uiid});
          if(!inst){
            session.finish(res).then(response=>{
              if(response) res.redirect(toLogin(data.target));
            });
          } else {
            let teacher;
            const found = inst.users.teacher.some((user,_)=>{
              if(user.id == _id){
                teacher = getTeacherShareData(user);
                return true;
              }
            });
            if(!found){
              session.finish(res).then(response=>{
                if(response) res.redirect(toLogin(data.target));
              });
              return;
            }
            clog(teacher);
            try{
              res.render(view.teacher.getViewByTarget(data.target,{teacher}));
            }catch(e){
              clog(e);
              res.redirect(toLogin(data.target));
            }
          }
        }
      }
    }
  )}
);

const getTeacherShareData = (data = {}) => {
  return {
    [sessionUID]: data.id,
    username: data.username,
    [sessionID]: data.teacherID,
    createdAt: data.createdAt,
    verified: data.verified,
    vlinkexp:data.vlinkexp
  };
};

let result = {};

router.post("/session/validate",(req,res)=>{
  session.verify(req,sessionsecret).then(response=>{
    if(session.valid(response)){
      clog("isvalidteacher");
      result = code.event(code.auth.SESSION_VALID);
    } else {
      clog("isvalidteachernot");
      result = response
    };
  }).catch(error=>{
    result = code.eventmsg(code.auth.AUTH_REQ_FAILED,error);
  });
  return res.json({result});
})

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
    let found = inst.users.teachers.some((teacher,index)=>{
      if(teacher.teacherID == email) return true;
    });
    if(found){
      result = code.event(code.auth.USER_EXIST);
    }
  } else {
    result = code.event(code.inst.INSTITUTION_NOT_EXISTS);
  }
  clog(result);
  return res.json({result});
})

const toLogin =(target = view.teacher.target.today)=>`/teacher/auth/login?target=${target}`;
const toSession =(u,target = view.teacher.target.today)=>`/teacher/session?u=${u}&target=${target}`;
module.exports = router;
let clog = (msg) => console.log(msg);
