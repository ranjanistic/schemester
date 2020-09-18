const { ObjectId } = require("mongodb");

const express = require("express"),
  teacher = express.Router(),
  path = require('path'),
  cookieParser = require("cookie-parser"),
  { check, validationResult } = require("express-validator"),
  {code,client,view,get} = require("../public/script/codes"),
  session = require("../workers/common/session"),
  invite = require("../workers/common/invitation"),
  verify = require("../workers/common/verification"),
  reset = require("../workers/common/passwordreset"),
  mailer = require("../workers/common/mailer"),
  worker = require("../workers/teacherworker"),
  share = require("../workers/common/sharedata"),
  Institute = require("../config/db").getInstitute(),
  Admin = require("../config/db").getAdmin();

const sessionsecret = session.teachersessionsecret;
teacher.use(cookieParser(sessionsecret));
const invalidsession = {result:code.event(code.auth.SESSION_INVALID)},
  authreqfailed =(error)=>{ return {result: code.eventmsg(code.auth.AUTH_REQ_FAILED, error)}}

teacher.get(get.root, (req, res) => {
  res.redirect(worker.toLogin());
});

teacher.get(get.authlogin, (req, res) => {
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
      clog("finishing session");
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

//for teacher session fragments.
teacher.get(get.fragment, (req, res) => {
  session
    .verify(req, sessionsecret)
    .catch((e) => {
      clog(e);
      return authreqfailed(e);
    })
    .then(async (response) => {
      const query = req.query;
      switch (query.fragment) {
        case view.teacher.target.fragment.today: {
          clog("today");
          worker.schedule.getSchedule(response.user, {dayIndex:Number(query.day)})
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
              clog(resp);
              if(!resp) session.finish(res).then((response) => {
                if (response) return false;
              });
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
                otherclasses:resp.otherclasses
              });
            })
            .catch((e) => {
              clog(e);
              return res.render(view.notfound);
            });
        }break;
        case view.teacher.target.fragment.about: {
          clog("about");
          const teacherdoc = await Institute.findOne({
            uiid:response.user.uiid,"users.teachers":{$elemMatch:{"_id":ObjectId(response.user.id)}}
          },{projection:{"users.teachers.$":1,"default":1}});
          const admindoc = await Admin.findOne({uiid:response.user.uiid},{projection:{"prefs":1}});
          return res.render(view.teacher.getViewByTarget(query.fragment),{
            teacher:teacherdoc?share.getTeacherShareData(teacherdoc.users.teachers[0]):false,
            defaults:teacherdoc?teacherdoc.default:false,
            adminphonevisible:admindoc?admindoc.prefs.showphonetoteacher:false,
            adminemailvisible:admindoc?admindoc.prefs.showemailtoteacher:false
          });
        }break;
        default:return res.render(view.notfound);
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
    switch (body.target) {
      case "receive": return res.json({result:await worker.self.account.getAccount(response.user)});
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
        case "upload":return res.json({result:await worker.schedule.scheduleUpload(response.user, body)});
        case "receive":
          return res.json({result:await worker.schedule.getSchedule(response.user, body)});
        case "update":
          return res.json({result:await worker.schedule.scheduleUpdate(response.user, body)});
        case code.schedule.CREATE_BACKUP:{
          worker.schedule.createScheduleBackup(response.user,(filename,error)=>{
            return res.json({result:{event:code.OK,url:`/${client.teacher}/download?type=${code.schedule.CREATE_BACKUP}&res=${filename}`}})
            // if(error) return res.json({result:code.event(code.NO)});
          });
        }break;
        default:
          return res.json({result:code.event(code.server.DATABASE_ERROR)});
      }
    });
});

teacher.get('/download*',async(req,res)=>{
  session.verify(req, sessionsecret)
  .catch(e=>{
    return res.json({result:code.eventmsg(code.auth.AUTH_FAILED,e)});
  })
  .then(async (response) => {
    if (!session.valid(response)) return res.render(view.forbidden);
    const query = req.query;
    if(!(query.type&&query.res)) return res.render(view.notfound);
    switch(query.type){
      case code.schedule.CREATE_BACKUP:{
        try{
          if(response.user.uiid == String(query.res).slice(0,query.res.lastIndexOf('_'))){
            clog(query);
            // clog(path.join(__dirname+`/../backups/${response.user.uiid}/${query.res}`));
            res.download(path.join(__dirname+`/../backups/${response.user.uiid}/${query.res}`),(err)=>{
              clog(err);
              clog("here");
              if(err) res.render(view.notfound);
            });
          } else {
            res.render(view.notfound);
          }
        }catch{
          res.render(view.notfound);
        }
      }
    }
  })
})

teacher.post("/classroom",async(req,res)=>{
  session
    .verify(req, sessionsecret)
    .catch((error) => {
      return res.json(authreqfailed(error));
    })
    .then(async(response) => {
      if(!session.valid(response)) return res.json(invalidsession);
      const teacherdoc = await Institute.findOne({uiid:response.user.uiid, "users.teachers":{$elemMatch:{"_id":ObjectId(response.user.id)}}},
        {projection:{"users.teachers.$":1,"_id":1}}
      );
      const teacher = teacherdoc.users.teachers[0];
      const instID = teacherdoc._id;
      const classdoc = await Institute.findOne({uiid:response.user.uiid, "users.classes":{$elemMatch:{"inchargeID":teacher.teacherID}}},{
        projection:{"users.classes.$":1}
      });
      const classroom = classdoc?classdoc.users.classes[0]:false;
      const body = req.body;
      clog("hereree");
      clog(teacher);
      clog(classroom);
      switch(body.target){
        case "classroom":return res.json({ result:await worker.classroom.manageClassroom(response.user,body,teacher,classroom)});
        case "pseudousers": return res.json({ result:await worker.pseudo.managePseudousers(response.user,body,teacher)});
        case "invite":return res.json({ result: await worker.classroom.handleInvitation(response.user,body,teacher,classroom,instID)});
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

teacher.get(get.external, async (req, res) => {
  const query = req.query;
  clog(query);
  switch (query.type) {
    case invite.type:{  //invitation link
      invite.handleInvitation(query,client.teacher).then((resp)=>{
        if(!resp) return res.render(view.notfound);
        return res.render(view.userinvitaion,{invite:resp.invite});
      }).catch(e=>{
        return res.render(view.notfound);
      });
    }break;
    case invite.personalType:{
      clog("here");
      invite.handlePersonalInvitation(query,client.teacher).then(resp=>{
        clog(resp);
        if(!resp) return res.render(view.notfound);
        return res.render(view.userinvitaion,{invite:resp.invite});
      }).catch(e=>{
        return res.render(view.notfound);
      });
    }break;
    case verify.type: { //verification link
      verify.handleVerification(query,client.teacher).then((resp) => {
          if (!resp) return res.render(view.notfound);
          return res.render(view.verification,{user:resp.user});
      }).catch((e) => {
        clog(e);
        return res.render(view.servererror, { error: e });
      });
    }break;
    case reset.type:{ //password reset link
      reset.handlePasswordResetLink(query,client.teacher).then(async(resp)=>{
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
      case reset.type:return res.json({result:await worker.self.handlePassReset(null,body)});
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
        case reset.type:return res.json({result:await worker.self.handlePassReset(response.user,body)});
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
