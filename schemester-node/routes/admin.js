const express = require("express"),
  router = express.Router(),
  cookieParser = require("cookie-parser"),
  { check, validationResult } = require("express-validator"),
  code = require("../hardcodes/events"),
  view = require("../hardcodes/views"),
  session = require("../workers/session"),
  invite = require("../workers/invitation"),
  Admin = require("../modelschema/Admins"),
  Institute = require("../modelschema/Institutions");

const sessionsecret = session.adminsessionsecret;
const sessionID = "id";
const sessionUID = "uid";

router.use(cookieParser(sessionsecret));

router.get("/", function (req, res) {
  res.redirect("/admin/auth/login?target=dashboard");
});

router.get("/auth/login*", (req, res) => {
  let result;
  session.verify(req,sessionsecret).then((response) => {
    clog("login:" + jstr(response));
    if (!session.valid(response)) {
      let autofill = req.query;
      res.render(view.admin.login, { autofill });
    } else {
      let link =
        req.query.target != null
          ? `/admin/session?u=${response.user.id}&target=${req.query.target}`
          : `/admin/session?u=${response.user.id}&target=dashboard`;
      res.redirect(link);
    }
  }).catch(error=>{
    clog(error);
    res.send(500).render(view.servererror);
  });
});

router.get("/session*", (req, res) => {
  let data = req.query;
  clog("response");
  session.verify(req,sessionsecret).then(async (response) => {
    clog("verify" + jstr(response));
    if (!session.valid(response)) {
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
                  uiid:uiid,
                  users:{teachers:[],students:[]},
                  schedule:{},
                  teacherSchedule:{},
                  invite:{teacher:{},student:{}}
                });
                await inst.save();
                data.target = "registration";
              } else {
                clog("inst hai");
                if(inst.default!=null){
                  if(data.target!='addteacher'){
                    data.target = "dashboard";
                  }
                }else{
                  data.target = "registration";
                }
              }
            }
            switch (data.target) {
              case "manage":{
                  res.render(view.admin.settings, { adata,inst });
              }break;
              case "dashboard":{
                  res.render(view.admin.dash, { adata, inst });
              }break;
              case "registration":{
                clog("inregistration");
                res.render(view.admin.setup, { adata });
              }break;
              case "addteacher":{
                res.render(view.admin.addTeacher,{adata,inst})
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
  session.verify(req,sessionsecret).then(response=>{
    if(!session.valid(response)){
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
      .userdata(req, Admin,sessionsecret)
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
      .verify(req,sessionsecret)
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
    session.signup(req, res,sessionsecret)
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

router.post("/auth/login",
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
      .login(req, res, sessionsecret,Admin)
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
  session.verify(req,sessionsecret).then(async (response)=>{
    if(!session.valid(response)){
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
        },
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

router.post('/session/receiveinstitution',async (req,res)=>{
  session.verify(req,sessionsecret).then(async response=>{
    let result;
    const {uiid, doc} = req.body;
    if(!session.valid(response)){
      result = {event:code.auth.SESSION_INVALID}
      return res.json({result});
    }
    let inst = await Institute.findOne({uiid});
    if(!inst){
      clog(uiid);
      inst = new Institute({
        uiid:uiid,
        invite:{
          teacher:{

          }
        }
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
});

router.post('/schedule',(req,res)=>{
  let result;
  res.render(view.admin.settings);
  return;
  session.verify(req,sessionsecret).then(response=>{
    if(session.valid(response)){
      switch(req.body.action){
        case 'upload':{
          clog("upload data");
          clog(req.body.data);
          result = code.event(code.inst.SCHEDULE_UPLOADED)
          return res.json({result});
        }
      }
    } else {
      result = code.event(code.auth.SESSION_INVALID);
      return result;
    }
  }).catch(error=>{
    result = {
      event:code.inst.SCHEDULE_UPLOAD_FAILED,
      msg:error
    };
    return res.json({result});
  })
})

router.post("/manage", async (req, res) => {
  clog("in post manage");
  clog(req.body);
  switch (req.body.type) {
    case invite.type: {
      clog("invite type");
      session.verify(req,sessionsecret).then(async (response)=>{
        let result;
        if(session.valid(response)){
          clog("verified");
          clog(response);
          switch(req.body.action){
            case 'create':{
              clog("post create link ");
              let uiid = response.user.uiid;
              let inst = await Institute.findOne({uiid})
              if(inst){
                clog("inst exists");
                clog(inst.id);
                clog(inst.invite[req.body.target].active);
                if(inst.invite[req.body.target].active == true){
                  clog("already active")
                  let validresponse = invite.checkTimingValidity(inst.invite[req.body.target].createdAt,inst.invite[req.body.target].expiresAt,inst.invite[req.body.target].createdAt)
                  if(invite.isValid(validresponse)){
                    clog("already valid link");
                    clog(response);
                    let link = invite.getTemplateLink(response.user.id,inst.id,req.body.target,inst.invite[req.body.target].createdAt);
                    clog('templated');
                    clog(link);
                    result = {
                      event:code.invite.LINK_EXISTS,
                      link:link,
                      exp:inst.invite[req.body.target].expiresAt
                    }
                    clog("returning existing link");
                    return res.json({result});
                  }
                }
                clog("creating new link");
                let data = await invite.generateLink(response.user.id,inst.id,req.body.target,req.body.daysvalid);
                await Institute.findOneAndUpdate(
                  {uiid:response.user.uiid},
                  {
                    invite:{
                      [req.body.target]:{
                        active:true,
                        createdAt:data.create,
                        expiresAt:data.exp
                      }
                    }
                  },
                  {useFindAndModify:false},
                  async (error,document)=>{
                    if(error){
                      clog("error creating link");
                      clog(error);
                      result = {
                        event:code.invite.LINK_CREATION_FAILED,
                        msg:error
                      };
                    }else{
                      if(document){
                        clog("link created");
                        result = {
                          event:code.invite.LINK_CREATED,
                          link:data.link,
                          exp:data.exp
                        }
                      } else {
                        result = code.event(code.inst.INSTITUTION_NOT_EXISTS);
                      }
                    }
                  }
                );
              } else {
                result = code.event(code.inst.INSTITUTION_NOT_EXISTS);
              }
              clog("returning result");
              clog(result);
              return res.json({result});
            };
            case 'disable':{
              clog("post disabe link");
              await Institute.findOneAndUpdate(
                {uiid:response.user.uiid},
                {
                  invite:{
                    [req.body.target]:{
                      active:false,
                      createdAt:0,
                      expiresAt:0
                    }
                  }
                },
                {useFindAndModify:false},
                async (error,document)=>{
                  if(error){
                    clog("unable to disable");
                    clog(error);
                    result = {
                      event:code.invite.LINK_EXISTS,
                      msg:error
                    };
                  }else{
                    if(document){
                      clog("link disabled true");
                      result = code.event(code.invite.LINK_DISABLED);
                    } else {
                      result = code.event(code.inst.INSTITUTION_NOT_EXISTS);
                    }
                  }
                }
              );
              clog("returning result");
              clog(result);
              return res.json({result});
            }
          }
        } else {
          result = response;
        }
        return res.json({result});
      }).catch(e=>{
        clog(e);
        result = code.eventmsg(code.server.DATABASE_ERROR,e);
        res.json({result});
      });
    }break;
    default:res.send(404);
  }
});

let getAdminShareDataV = (data = {}) => {
  return {
    isAdmin:true,
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
