const { ObjectId } = require("mongodb");

const express = require("express"),
  teacher = express.Router(),
  cookieParser = require("cookie-parser"),
  { check, validationResult } = require("express-validator"),
  code = require("../public/script/codes"),
  view = require("../hardcodes/views"),
  session = require("../workers/common/session"),
  invite = require("../workers/common/invitation"),
  verify = require("../workers/common/verification"),
  reset = require("../workers/common/passwordreset"),
  mailer = require("../workers/common/mailer"),
  worker = require("../workers/teacherworker"),
  share = require("../workers/common/sharedata"),
  Institute = require("../collections/Institutions"),
  Admin = require("../collections/Admins");

const sessionsecret = session.teachersessionsecret;
teacher.use(cookieParser(sessionsecret));
const invalidsession = {result:code.event(code.auth.SESSION_INVALID)},
  authreqfailed =(error)=>{ return {result: code.eventmsg(code.auth.AUTH_REQ_FAILED, error)}}

teacher.get("/", (req, res) => {
  res.redirect(worker.toLogin());
});

teacher.get("/auth/login*", (req, res) => {
  session.verify(req, sessionsecret)
    .catch((error) => {
      return res.render(view.servererror, { error });
    })
    .then((response) => {
      if (!session.valid(response))
        return res.render(view.teacher.login, { autofill: req.query });
      let data = req.query;
      delete data["u"];
      return res.redirect(worker.toSession(response.user.id, req.query));
    });
});

teacher.post("/auth",async(req,res)=>{
  const body = req.body;
  clog(body);
  switch(body.action){
    case "login":{  session.login(req, res, sessionsecret)
      .then((response) => {
        return res.json({ result: response });
      })
      .catch((error) => {
        return res.json(authreqfailed(error));
      })
    }break;
    case "logout":{
      session.finish(res).then((response) => {
        return res.json({ result: response });
      }); 
    }break;
    case "signup":{
      session.signup(req, res, sessionsecret,body.pseudo)
      .then((response) => {
        return res.json({ result: response });
      })
      .catch((error) => {
        clog(error);
        return res.json({
          result: code.eventmsg(code.auth.ACCOUNT_CREATION_FAILED, error),
        });
      });
    }break;
    default:res.sendStatus(500);
  }
});


teacher.get("/session*", async (req, res) => {
  let data = req.query;
  clog(data);
  session.verify(req, sessionsecret)
  .catch((e) => {
    clog(e);
    return res.redirect(worker.toLogin(data));
  })
  .then(async (response) => {
    if (!session.valid(response)) return res.redirect(worker.toLogin(data));
    if (data.u != response.user.id) return res.redirect(worker.toLogin(data));
    const userinst = await Institute.findOne({
      uiid: response.user.uiid,
      "users.teachers": {
        $elemMatch: { _id: ObjectId(response.user.id) },
      },
    },{
      projection: {
        _id: 1,
        uiid: 1,
        default: 1,
        schedule: 1,
        "users.teachers.$": 1,
        preferences:1
      },
    });
    if (!userinst){
      //checking if membership requested (pseudo user)
      const pseudodoc = await Institute.findOne({
        uiid:response.user.uiid,
        "pseudousers.teachers":{$elemMatch:{"_id":ObjectId(response.user.id)}}
      },{
        projection:{
          "pseudousers.teachers.$":1
        }
      });
      if(!pseudodoc){
        return session.finish(res).then((response) => {
          if (response) res.redirect(worker.toLogin(data));
        });
      }
      const teacher = share.getPseudoTeacherShareData(pseudodoc.pseudousers.teachers[0]);
      if (!teacher.verified) return res.render(view.verification, { user: teacher });
      return res.render(view.teacher.getViewByTarget(view.teacher.target.dash), {teacher,target:{fragment:null}});
    }

    //user teacher exists
    const teacher = share.getTeacherShareData(userinst.users.teachers[0]);
    if (!teacher.verified)
      return res.render(view.verification, { user: teacher });
      
    const scheduledoc = await Institute.findOne({
        uiid: response.user.uiid,
        "schedule.teachers": { $elemMatch: { teacherID: teacher.id } },
    },{
        projection: { _id: 0, "schedule.teachers.$": 1 },
    });

    if (!scheduledoc) {
      //no schedule for this user teacher
      if(userinst.preferences.allowTeacherAddSchedule){
        clog("yes");
        return res.render(view.teacher.addschedule, {
          user: teacher,
          inst:userinst,
        });
      } else {
        data.target = view.teacher.target.dash;
      }
    } else {
      //schedule exists;
      const schedule = scheduledoc.schedule.teachers[0];
      if (
        Object.keys(schedule.days).length !=
        userinst.default.timings.daysInWeek.length
      ) {
        Institute.findOneAndUpdate(
          { uiid: response.user.uiid },
          {
            $pull: { "schedule.teachers": { teacherID: teacher.id } },
          }
        );
      } else {
        if (
          data.target == view.teacher.target.addschedule ||
          data.target == undefined
        )
          return res.redirect(worker.toLogin({target:view.teacher.target.dash}));
      }
    }
    try {
      clog("in session try");
      clog(data);
      return res.render(view.teacher.getViewByTarget(data.target), {
        teacher,
        userinst,
        target:{
          fragment:data.fragment
        }
      });
    } catch (e) {
      clog(e);
      return res.redirect(worker.toLogin());
    }
  });
});

teacher.get("/fragment*", (req, res) => {
  //for teacher session fragments.
  session
    .verify(req, sessionsecret)
    .catch((e) => {
      clog(e);
      return code.eventmsg(code.auth.AUTH_REQ_FAILED, e);
    })
    .then(async (response) => {
      const query = req.query;
      switch (query.fragment) {
        case view.teacher.target.fragment.today: {
          clog("today");
          worker.schedule.getSchedule(response.user, {dayIndex:new Date().getDay()})
            .then((scheduleresponse) => {
              if(!scheduleresponse){  //no schedule
                return res.render(view.teacher.getViewByTarget(query.fragment), {
                  today: null,
                  timings:null
                });
              }
              if(!scheduleresponse.schedule)
                return res.render(view.teacher.getViewByTarget(query.fragment), {
                  today: false,
                  timings:scheduleresponse.timings
                });
              return res.render(view.teacher.getViewByTarget(query.fragment), {
                today: scheduleresponse.schedule.period,
                timings:scheduleresponse.timings
              });
            })
            .catch((e) => {
              clog(e);
            });
          return;
        }
        case view.teacher.target.fragment.fullweek: {
          clog("full week");
          worker.schedule.getSchedule(response.user)
            .then((resp) => {
              return res.render(view.teacher.getViewByTarget(query.fragment), {
                schedule: resp.schedule,
                timings:resp.timings
              });
            })
            .catch((e) => {
              clog(e);
            });
          return;
        }
        case view.teacher.target.fragment.classroom: {
          clog("classroom");
          const teacherdoc = await Institute.findOne({
            uiid:response.user.uiid,"users.teachers":{$elemMatch:{"_id":ObjectId(response.user.id)}}
          },{projection:{"users.teachers.$":1}});
          const teacher = teacherdoc.users.teachers[0];
          clog(teacher);
          worker.classroom.getClassroom(response.user,teacher)
            .then((resp) => {
              clog(resp);
              return res.render(view.teacher.getViewByTarget(query.fragment), {
                classroom: resp.classroom,
                pseudostudents:resp.pseudostudents,
                teacher:share.getTeacherShareData(teacher),
              });
            })
            .catch((e) => {
              clog(e);
            });
          return;
        }
        case view.teacher.target.fragment.about: {
          clog("about");
          const teacheruser = await Institute.findOne({
            uiid:response.user.uiid,"users.teachers":{$elemMatch:{"_id":ObjectId(response.user.id)}}
          },{projection:{"users.teachers.$":1,"default":1}});
          if(!teacheruser) return null;
          const admindoc = await Admin.findOne({uiid:response.user.uiid},{projection:{"prefs":1}});
          return res.render(view.teacher.getViewByTarget(query.fragment),{
            teacher:share.getTeacherShareData(teacheruser.users.teachers[0]),
            defaults:teacheruser.default,
            adminphonevisible:admindoc.prefs.showphonetoteacher,
            adminemailvisible:admindoc.prefs.showemailtoteacher
          });
        }
      }
    });
});

teacher.post("/self", async (req, res) => {
  const body = req.body;
  clog(body);
  if(body.external){
    switch (body.action) {
      case code.action.CHANGE_PASSWORD: return res.json({ result: await worker.self.account.changePassword(body.user,body,true)});
    }
    return;
  }
  session.verify(req, sessionsecret)
  .catch(e=>{
    return;
  })
  .then(async (response) => {
    if (!session.valid(response)) return res.json({result:code.event(code.auth.SESSION_INVALID)});
    clog(body);
    switch (body.target) {
      case "authenticate": return res.json({result:await session.authenticate(req,res,body,sessionsecret)});
      case "account": return res.json({ result: await worker.self.handleAccount(response.user,body)});
      case "preferences": return res.json({result: await worker.self.handlePreferences(response.user,body)});
    }
  });
});

teacher.post("/schedule", async (req, res) => {
  session
    .verify(req, sessionsecret).catch((e) => {
      clog(e);
      return authreqfailed(e)
    }).then(async (response) => {
      if (!session.valid(response)) return res.json(invalidsession);
      const body = req.body
      switch (body.action) {
        case "upload":
          return res.json({result:await worker.schedule.scheduleUpload(response.user, body)});
        case "receive":
          return res.json({result:await worker.schedule.getSchedule(response.user, body)});
        case "update":
          return res.json({result:await worker.schedule.scheduleUpdate(response.user, body)});
        default:
          return res.json({result:code.event(code.server.DATABASE_ERROR)});
      }
    })
});

teacher.post("/classroom",async(req,res)=>{
  session
    .verify(req, sessionsecret)
    .catch((error) => {
      return res.json(authreqfailed(error));
    })
    .then(async(response) => {
      if(!session.valid(response)) return res.json(invalidsession);
      const teacherdoc = await Institute.findOne({uiid:response.user.uiid, "users.teachers":{$elemMatch:{"_id":ObjectId(response.user.id)}}},
        {projection:{"users.teachers.$":1}}
      );
      const teacher = teacherdoc.users.teachers[0];
      const classdoc = await Institute.findOne({uiid:response.user.uiid, "users.classes":{$elemMatch:{"incharge":teacher.teacherID}}},{
        projection:{"users.classes.$":1}
      });
      const classroom = classdoc?classdoc.users.classes[0]:false;
      const body = req.body;
      clog(body);
      switch(body.target){
        case "classroom":return res.json({ result:await worker.classroom.manageClassroom(response.user,body,teacher,classroom)});
        case "pseudousers": return res.json({ result:await worker.pseudo.managePseudousers(response.user,body,teacher)});
        case "invitation":return res.json({ result: await worker.classroom.handleInvitation(response.user,body,teacher,classroom)});
      }
    });
});


teacher.post("/session/validate", async (req, res) => {
  session
    .verify(req, sessionsecret)
    .then((response) => {
      return res.json({ result: response });
    })
    .catch((error) => {
      return res.json(authreqfailed(error));
    });
});

teacher.get("/external*", async (req, res) => {
  const query = req.query;
  switch (query.type) {
    case invite.type:
      {
        try {
          const inst = await Institute.findOne({ _id: ObjectId(query.in) });
          if (!inst) return res.render(view.notfound);
          const admin = await Admin.findOne({ _id: ObjectId(query.ad) });
          if (!admin) return res.render(view.notfound);
          if (admin.uiid != inst.uiid) return res.render(view.notfound);
          if (!inst.invite.teacher.active)
            return res.render(view.userinvitaion, {
              invite: {
                valid: false,
                uiid: inst.uiid,
                adminemail: admin.email,
                adminName: admin.username,
                expireAt: inst.invite.teacher.expiresAt,
                instname: inst.default.institute.instituteName,
                target: invite.target.teacher,
              },
            });

          const expires = inst.invite.teacher.expiresAt;
          const validity = invite.checkTimingValidity(
            inst.invite.teacher.createdAt,
            expires,
            query.t
          );
          if (invite.isInvalid(validity)) return res.render(view.notfound);
          return res.render(view.userinvitaion, {
            invite: {
              valid: invite.isActive(validity),
              uiid: inst.uiid,
              adminemail: admin.email,
              adminName: admin.username,
              instname: inst.default.institute.instituteName,
              expireAt: expires,
              target: invite.target.teacher,
            },
          });
        } catch (e) {
          clog(e);
          return res.render(view.notfound);
        }
      }
      break;
    case verify.type: { //verification link
      clog("verify type");
      verify.handleVerification(query,verify.target.teacher).then((resp) => {
        clog("resp");
          clog(resp);
          if (!resp) return res.render(view.notfound);
          return res.render(view.verification,{user:resp.user});
        })
        .catch((e) => {
          clog(e);
          return res.render(view.servererror, { error: e });
        });
      return;
    }
    case reset.type:{
      reset.handlePasswordResetLink(query,reset.target.teacher).then(async(resp)=>{
        if (!resp) return res.render(view.notfound);
        return res.render(view.passwordreset, { user: resp.user,uiid:resp.uiid});
      }).catch(e=>{
        clog(e);
        return res.render(view.servererror, {error:e});
      });
    }break;
    default:
      res.render(view.servererror);
  }
});


teacher.post("/manage", async (req, res) => {
  const body = req.body;
  if(body.external){
    switch (body.type) {
      case reset.type:return res.json({result:await worker.self.handlePassReset(null,body,true)});
    }
  }
  session
    .verify(req, sessionsecret)
    .catch((e) => {
      clog(e);
      return res.json(authreqfailed(e));
    })
    .then(async (response) => {
      if (!session.valid(response)) return res.json({ result: response });
      const inst = await Institute.findOne({uiid:response.user.uiid},{projection:{"_id":1}});
      if(!inst) return false;
      body['instID'] = inst._id;
      clog(body);
      switch (body.type) {
        case verify.type: return res.json({result:await worker.self.handleVerification(response.user,body)});
        default: return res.sendStatus(500);
      }
    });
});

teacher.post("/find", async (req, res) => {
  const { email, uiid } = req.body;
  const inst = await Institute.findOne({
    uiid: uiid,
    "users.teachers": { $elemMatch: { teacherID: email } },
  });
  result = inst
    ? code.event(code.auth.USER_EXIST)
    : code.event(code.auth.USER_NOT_EXIST);
  return res.json({ result });
});

module.exports = teacher;
let clog = (msg) => console.log(msg);
