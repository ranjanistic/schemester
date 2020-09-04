const express = require("express"),
  admin = express.Router(),
  cookieParser = require("cookie-parser"),
  { ObjectId } = require("mongodb"),
  { check, validationResult } = require("express-validator"),
  code = require("../public/script/codes"),
  view = require("../hardcodes/views"),
  session = require("../workers/common/session"),
  invite = require("../workers/common/invitation"),
  verify = require("../workers/common/verification"),
  share = require("../workers/common/sharedata"),
  reset = require("../workers/common/passwordreset"),
  worker = require("../workers/adminworker"),
  Admin = require("../config/db").getAdmin(),
  Institute = require("../config/db").getInstitute();
  const sessionsecret = session.adminsessionsecret;

admin.use(cookieParser(sessionsecret));

admin.get("/", function (_, res) {
  res.redirect(worker.toLogin());
});

admin.get("/auth/login*", (req, res) => {
  clog("admin login get");
  session
    .verify(req, sessionsecret)
    .then((response) => {
      clog(response);
      if (!session.valid(response))
        return res.render(view.admin.login, { autofill: req.query });
      let data = req.query;
      delete data["u"];
      return res.redirect(worker.toSession(response.user.id, data));
    })
    .catch((error) => {
      res.render(view.servererror, { error });
    });
});

admin.get("/session*", (req, res) => {
  let data = req.query;
  clog("admin session");
  clog(data);
  session
    .verify(req, sessionsecret)
    .catch((e) => {
      clog(e);
      return res.redirect(worker.toLogin(data));
    })
    .then(async (response) => {
      if (!session.valid(response)) return res.redirect(worker.toLogin(data));
      try {
        if (data.u != response.user.id) return res.redirect(worker.toLogin(data));
        clog(Admin);
        const admin = await Admin.findOne({ "_id": ObjectId(response.user.id) });
        if (!admin)
          return session.finish(res).then((response) => {
            if (response) res.redirect(worker.toLogin(data));
          });
        clog(admin);
        let adata = share.getAdminShareData(admin);
        clog(adata);
        if (!admin.verified)
          return res.render(view.verification, { user: adata });
        let inst = await Institute.findOne({ uiid: response.user.uiid });
        if (!inst || !inst.default || !inst.default.timings.daysInWeek.length) {
          data.target = view.admin.target.register;
          return res.render(view.admin.getViewByTarget(data.target), {
            adata,inst:inst?inst:false,binst:false
          });
        }
        if (
          data.target == view.admin.target.register ||
          data.target == undefined ||
          !data.target
        ) {
          return res.redirect(
            worker.toSession(adata.uid, { target: view.admin.target.dashboard })
          );
        }
        try {
          switch (data.target) {
            case view.admin.target.addteacher: {
              return res.render(view.admin.getViewByTarget(data.target), {
                user: adata,
                data:data,
                inst,
              });
            }
            case view.admin.target.manage: {
              return res.render(view.admin.getViewByTarget(data.target), {
                adata,
                inst,
                section: data.section,
              });
            }
            case view.admin.target.classes:{
              clog(inst.users.classes);
              return res.render(view.admin.getViewByTarget(data.target),{
                classes:inst.users.classes,
                defaults:inst.default,
              });
            }
            case view.admin.target.viewschedule:{
                clog(data);
                if (data.type == "teacher") {
                  if(data.t){ //if teacher _id is provided, means required teacher account considered exists.
                    const teacherInst = await Institute.findOne({
                      uiid: response.user.uiid,
                      "users.teachers": {
                        $elemMatch: { "_id": ObjectId(data.t) },
                      },
                    },{
                      projection: {
                        _id: 0,
                        "users.teachers.$": 1,
                      },
                    });
                    if(!teacherInst) return res.render(view.notfound);  //no account for data.t (_id).
                    const teacher = teacherInst.users.teachers[0];
                    const teacherScheduleInst = await Institute.findOne({
                      uiid: response.user.uiid,
                      "schedule.teachers": {
                        $elemMatch: { "teacherID": teacher.teacherID },
                      },
                    },{
                      projection: {
                        _id: 0,
                        "schedule.teachers.$": 1,
                      },
                    });
                    if(!teacherScheduleInst){ //teacher account:true, schedule:false
                      return res.render(view.admin.scheduleview, {
                        group: { teacher: true },
                        teacher,
                        schedule: false,
                        inst,
                      });
                    }
                    return res.render(view.admin.scheduleview, { //both account and schedule
                      group: { teacher: true },
                      teacher: teacher,
                      schedule: teacherScheduleInst.schedule.teachers[0],
                      inst,
                    });
                  } else {  //user account considered not exists.
                    if(!data.teacherID) return res.render(view.notfound); //so teacher ID must be provided for schedule.
                    const teacherdoc = await Institute.findOne({ //checking for account by teacher ID, in case it exists.
                      uiid: response.user.uiid,
                      "users.teachers": {
                        $elemMatch: { "teacherID": data.teacherID },
                      },
                    },{
                      projection: {
                        _id: 0,
                        "users.teachers.$": 1,
                      },
                    });
                    if(teacherdoc){  //then providing teacher _id to session, for previous condition.
                      data['t'] = teacherdoc.users.teachers[0]._id;
                      return res.redirect(worker.toSession(data.u,data))
                    }
                    const teacherScheduledoc = await Institute.findOne({ //finding schedule with teacherID
                      uiid: response.user.uiid,
                      "schedule.teachers": {
                        $elemMatch: { "teacherID": data.teacherID},
                      },
                    },{
                      projection: {
                        _id: 0,
                        "schedule.teachers.$": 1,
                      },
                    });
                    if(!teacherScheduledoc)//no schedule found, so 404, as only schedule was requested.
                      return res.render(view.notfound);

                    return res.render(view.admin.scheduleview, {  //account not found, so only schedule.
                      group: { teacher: false },
                      schedule: teacherScheduledoc.schedule.teachers[0],
                      inst,
                    });
                  }
                } else if (data.type == "student") {  //class schedule
                  if(data.c){ //if class _id is provided, means required class considered exists.
                    const classdoc = await Institute.findOne({
                      uiid: response.user.uiid,
                      "users.classes": {
                        $elemMatch: { "_id": ObjectId(data.c) },
                      },
                    },{
                      projection: {
                        _id: 0,
                        "users.classes.$": 1,
                      },
                    });
                    clog(classdoc);
                    if(!classdoc) return res.render(view.notfound);  //no class for data.c (_id).
                    const Class = classdoc.users.classes[0];
                    const scheduledoc = await Institute.findOne({
                      uiid: response.user.uiid,
                      "schedule.classes": {
                        $elemMatch: { "classname": Class.classname },
                      },
                    },{
                      projection: {
                        _id: 0,
                        "schedule.classes.$": 1,
                      },
                    });
                    if(!scheduledoc){ //class exists:true, schedule:false
                      return res.render(view.admin.scheduleview, {
                        group: { Class: true },
                        Class: Class,
                        schedule: false,
                        inst,
                      });
                    }
                    clog("both");
                    return res.render(view.admin.scheduleview, { //both account and schedule
                      group: { Class: true },
                      Class: Class,
                      schedule: scheduledoc.schedule.classes[0],
                      inst,
                    });
                  } else {  //class considered not exists.
                    if(!data.classname) return res.render(view.notfound); //so classname must be provided for schedule.
                    const classdoc = await Institute.findOne({ //checking for account by teacher ID, in case it exists.
                      uiid: response.user.uiid,
                      "users.classes": {
                        $elemMatch: { "classname": data.classname },
                      },
                    },{
                      projection: {
                        _id: 0,
                        "users.classes.$": 1,
                      },
                    });
                    if(classdoc){  //then providing class _id to session, for previous condition.
                      data['c'] = classdoc.users.classes[0]._id;
                      return res.redirect(worker.toSession(data.u,data))
                    }
                    const classScheduleInst = await Institute.findOne({ //finding schedule with classname
                      uiid: response.user.uiid,
                      "schedule.classes": {
                        $elemMatch: { "classname": data.classname},
                      },
                    },{
                      projection: {
                        _id: 0,
                        "schedule.classes.$": 1,
                      },
                    });
                    if(!classScheduleInst)//no schedule found, so 404, as only schedule was requested.
                      return res.render(view.notfound);

                    return res.render(view.admin.scheduleview, {  //class not found, so only schedule.
                      group: { Class: false },
                      Class:false,
                      schedule: classScheduleInst.schedule.classes[0],
                      inst,
                    });
                  }
                }
                return res.render(view.notfound);
              }
            default:
              return res.render(view.admin.getViewByTarget(data.target), {
                adata,
                inst,
              });
          }
        } catch (e) {
          clog(e);
          data.target = view.admin.target.dashboard;
          return res.redirect(worker.toLogin(data));
        }
      } catch (e) {
        clog(e);
        return res.render(view.servererror);
      }
    });
});
function authFail(e){
  return {result:code.eventmsg(code.auth.AUTH_FAILED,e)}
}
/**
 * For self account subdoc (Admin collection).
 */
admin.post("/self", async (req, res) => {
  const body = req.body;
  if(body.external){
    switch (body.target) {
      case "account": return res.json({ result: await worker.self.handleAccount(body.user,body)});
    }
    return;
  }
  session.verify(req, sessionsecret)
  .catch(e=>{
    return authFail(e);
  })
  .then(async (response) => {
    if (!session.valid(response)) return res.json({result:code.event(code.auth.SESSION_INVALID)});
    clog(body);
    const admin = await Admin.findOne({'_id':ObjectId(response.user.id)});
    if(!admin) return code.event(code.auth.USER_NOT_EXIST);
    switch (body.target) {
      case "authenticate": return res.json({result:await session.authenticate(req,res,body,sessionsecret)});
      case "account": return res.json({ result: await worker.self.handleAccount(response.user,body,admin)});
      case "preferences": return res.json({result: await worker.self.handlePreferences(response.user,body)});
    }
  });
});

admin.post("/session/validate", (req, res) => {
  const { getuser } = req.body;
  clog("getuser=");
  clog(getuser);
  if (getuser) {
    session.userdata(req, sessionsecret)
      .then((response) => {
        clog(response);
        return res.json({ result:response});
      })
      .catch((error) => {
        clog("errr");
        return res.json({result:code.eventmsg(code.server.DATABASE_ERROR, error)});
      });
  } else {
    clog("just verify");
    session.verify(req, sessionsecret)
      .then((response) => {
        clog(response);
        return res.json({ result:response });
      })
      .catch((error) => {
        return res.json({ event: code.auth.AUTH_REQ_FAILED, msg: error });
      });
  }
});

admin.post(
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
    if (!errors.isEmpty())
      return res.json({ result:{ event: errors.array()[0].msg }});
    session.signup(req, res, sessionsecret)
    .catch((error) => {
      clog(error);
      return res.json({ result:{ event: code.auth.ACCOUNT_CREATION_FAILED, msg: error } });
    })
    .then((response) => {
      clog(response);
      return res.json({ result:response });
    });
  }
);

/**
 * Logout admin.
 */
admin.post("/auth/logout", (_, res) => {
  session.finish(res).then((response) => {
    return res.json({ result:response });
  });
});

admin.post( "/auth/login",
  [
    check("email", code.auth.EMAIL_INVALID).isEmail(),
    check("password", code.auth.PASSWORD_INVALID).not().isEmpty(),
    check("uiid", code.auth.UIID_INVALID).not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.json({ result:{ event: errors.array()[0].msg } });
    session.login(req, res, sessionsecret)
      .catch((error) => {
        clog(error);
        return res.json({ result:code.eventmsg(code.auth.AUTH_REQ_FAILED,error) });
      })
      .then((response) => { return res.json({ result:response }) });
  }
);

/**
 * For current session account related requests.
 */
admin.post('/session',(req,res)=>{
  session.verify(req, sessionsecret)
  .catch(e=>{
    return res.json({result:code.eventmsg(code.auth.AUTH_FAILED,e)});
  })
  .then(async (response) => {
    if (!session.valid(response)) return res.json({ result:code.event(code.auth.SESSION_INVALID)});
  })
});

/**
 * For post requests in default subdoc.
 */
admin.post('/default',(req,res)=>{
  session.verify(req, sessionsecret)
    .catch(e=>{
      return res.json({result:code.eventmsg(code.auth.AUTH_FAILED,e)});
    })
    .then(async (response) => {
      if (!session.valid(response)) return res.json({ result:code.event(code.auth.SESSION_INVALID)});
      const body = req.body;
      const inst = await Institute.findOne({ uiid: response.user.uiid });
      if(body.target!="registerinstitute" && !inst) return res.json({result:code.event(code.inst.INSTITUTION_NOT_EXISTS)});
      switch(body.target){
        case "registerinstitute":{
          return res.json({result:await worker.default.handleRegistration(response.user,body)})
        }
        case "admin": return res.json({result:await worker.default.handleAdmin(response.user,inst,body)});
        case "institute":return res.json({result:await worker.default.handleInstitute(response.user,body)});
        case "timings": return res.json({result:await worker.default.handleTimings(response.user,body)});
      }
    });
});

/**
 * For actions related to users subdocument.
 */
admin.post("/users",async (req,res)=>{
  session
    .verify(req, sessionsecret)
    .catch((error) => {
      clog(error);
      return res.json({
        result: code.eventmsg(code.auth.AUTH_FAILED, error),
      });
    })
    .then(async (response) => {
      if (!session.valid(response)) return res.json({ result: code.event(code.auth.SESSION_INVALID) });
      const inst = await Institute.findOne({uiid:response.user.uiid});
      if (!inst) return res.json({result: code.event(code.inst.INSTITUTION_NOT_EXISTS)});
      const body = req.body;
      switch(body.target){
        case "teachers":return res.json({result: await worker.users.handleTeacherAction(inst,body)});
        case "student":return res.json({result: await worker.users.handleClassAction(inst,body)});
      }
    });
});

admin.post("/pseudousers",async(req,res)=>{
  session
    .verify(req, sessionsecret)
    .catch((error) => {
      clog(error);
      return res.json({
        result: code.eventmsg(code.auth.AUTH_FAILED, error),
      });
    })
    .then(async (response) => {
      if (!session.valid(response)) return res.json({ result: code.event(code.auth.SESSION_INVALID) });
      const body = req.body;
      switch(body.target){
        case "teachers":return res.json({result:await worker.pseudo.handleTeachers(response.user,body)})
        case "classes": return res.json({result:await worker.pseudo.handleStudents(response.user,body)})
      }
    })
})

/**
 * For actions related to schedule subdocument.
*/
admin.post("/schedule", async (req, res) => {
  session.verify(req, sessionsecret).catch((error) => {
    clog(error);
    return res.json({
      result: code.eventmsg(code.auth.AUTH_FAILED, error),
    });
  }).then(async (response) => {
    if (!session.valid(response)) return res.json({ result: code.event(code.auth.SESSION_INVALID) });
    const inst = await Institute.findOne({ uiid: response.user.uiid });
    if (!inst) return res.json({result: code.event(code.inst.INSTITUTION_NOT_EXISTS)});
    const body = req.body;
    clog(body);
    switch (body.target) {
      case "teacher": return res.json({result:await worker.schedule.handleScheduleTeachersAction(response.user,inst,body)});
      case "student": return res.json({result:await worker.schedule.handleScheduleClassesAction(response.user,inst,body)});
    }
  }); 
});

admin.post("/receivedata",async(req,res)=>{
  session.verify(req, sessionsecret).catch((error) => {
    clog(error);
    return res.json({
      result: code.eventmsg(code.auth.AUTH_FAILED, error),
    });
  }).then(async (response) => {
    if (!session.valid(response)) return res.json({ result: code.event(code.auth.SESSION_INVALID) });
    const body = req.body;
    switch(body.target){  
      case "default":return res.json({result:await worker.default.getDefaults(response.user)});
      case "users":return res.json({result:await worker.users.getUsers(response.user)});
      case "schedule":return res.json({result:await worker.schedule.getSchedule(response.user)});
      case "pseudousers":return res.json({result:await worker.pseudo.getPseudoUsers(response.user,body)});
      case "vacations":return res.json({result:await worker.vacation.getVacations(response.user)});
      case "preferences":return res.json({result:await worker.prefs.getPreferences(response.user)});
      case "invite":return res.json({result:await worker.invite.getInvitation(response.user)});
      default:return res.json({result:await worker.getInstitute(response.user)})
    }
  })
})

admin.post("/dashboard",async(req,res)=>{
  session.verify(req, sessionsecret).catch((error) => {
    clog(error);
    return res.json({
      result: code.eventmsg(code.auth.AUTH_FAILED, error),
    });
  }).then(async (response) => {
    if (!session.valid(response)) return res.json({ result: code.event(code.auth.SESSION_INVALID) });
    const body = req.body;
    clog(body);
    switch(body.target){  
      case "today":case "today": return res.json({result:await worker.today.handlerequest(response.user,body)});
      
    }
  });
});

admin.post("/manage", async (req, res) => { //for settings
  clog("in post manage");
  const body = req.body;
  if(body.external){
    switch (body.type) {
      case reset.type:{
        const user = await Admin.findOne({'email':body.email});
        if(!user) return {result:code.event(code.OK)};  //don't tell if user not exists, while sending reset email.
        return res.json({result:await worker.self.handlePassReset({id:user._id},body)});
      };
    }
  }
  session.verify(req, sessionsecret)
    .catch((e) => {
      clog(e);
      return res.json({ result: code.eventmsg(code.auth.AUTH_REQ_FAILED, e) });
    })
    .then(async (response) => {
      if (!session.valid(response))
        return res.json({ result: response });
      const inst = await Institute.findOne({uiid: response.user.uiid,});
      if (!inst && body.type!=verify.type)
        return res.json({
          result: code.event(code.inst.INSTITUTION_NOT_EXISTS),
        });
      switch (body.type) {
        case invite.type: return res.json({ result:await worker.invite.handleInvitation(response.user,inst,body)});
        case verify.type: return res.json({ result: await worker.self.handleVerification(response.user,body)});
        case reset.type: return res.json({result:await worker.self.handlePassReset(response.user,body)});
        case "search": return res.json({result: await worker.users.handleUserSearch(inst,body)});
        case "preferences" : return res.json({result:await worker.prefs.handlePreferences(response.user,body)});
        default: res.sendStatus(500);
      }
    });
});

/**
 * For external links, not requiring valid session.
 */
admin.get("/external*", async (req, res) => {
  const query = req.query;
  switch (query.type) {
    case verify.type:{
      verify.handleVerification(query, verify.target.admin).then(async(resp) => {
        if (!resp)
          return res.render(view.notfound);
        return res.render(view.verification, { user: resp.user });
      }).catch(e=>{
        clog(e);
        return res.render(view.servererror, {error:e});
      });
    }break;
    case reset.type:{
      reset.handlePasswordResetLink(query,reset.target.admin).then(async(resp)=>{
        if (!resp) return res.render(view.notfound);
        return res.render(view.passwordreset, { user: resp.user });
      }).catch(e=>{
        clog(e);
        return res.render(view.servererror, {error:e});
      });
    }break;
    default:res.render(view.notfound);
  }
});

const getAdminShareData = (data = {}) => {
  return {
    isAdmin: true,
    [session.sessionUID]: data._id,
    username: data.username,
    [session.sessionID]: data.email,
    uiid: data.uiid,
    createdAt: data.createdAt,
    verified: data.verified,
    vlinkexp: data.vlinkexp,
  };
};

let clog = (msg) => console.log(msg);

module.exports = admin;
