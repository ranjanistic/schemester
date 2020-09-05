const { getStudentShareData } = require("../workers/common/sharedata");

const express = require("express"),
  student = express.Router(),
  cookieParser = require("cookie-parser"),
  { ObjectId } = require("mongodb"),
  { check, validationResult } = require("express-validator"),
  code = require("../public/script/codes"),
  view = require("../hardcodes/views"),
  session = require("../workers/common/session"),
  invite = require("../workers/common/invitation"),
  share = require("../workers/common/sharedata"),
  verify = require("../workers/common/verification"),
  reset = require("../workers/common/passwordreset"),
  worker = require("../workers/studentworker"),
  Institute = require("../config/db").getInstitute(),
  Admin = require("../config/db").getAdmin();

const sessionsecret = session.studentsessionsecret;
student.use(cookieParser(sessionsecret));
const invalidsession = {result:code.event(code.auth.SESSION_INVALID)},
  authreqfailed =(error)=>{ return {result: code.eventmsg(code.auth.AUTH_REQ_FAILED, error)}}

student.get("/", (req, res) => {
  res.redirect(worker.toLogin());
});


student.get("/auth/login*", (req, res) => {
  session
    .verify(req, sessionsecret)
    .catch((error) => {
      return res.render(view.servererror, { error });
    })
    .then((response) => {
      clog(response);
      if (!session.valid(response))
        return res.render(view.student.login, { autofill: req.query });
      let data = req.query;
      delete data["u"];
      return res.redirect(worker.toSession(response.user.id, req.query));
    });
});

student.post("/auth",async(req,res)=>{
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

student.get("/session*", async (req, res) => {
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
      
      const classdoc = await Institute.findOne({
          uiid: response.user.uiid,
          "users.classes": {
            $elemMatch: { "classname": response.user.classname },
          },
        },{
          projection: {
            _id: 1,
            uiid: 1,
            default: 1,
            "users.classes.$": 1,
          },
        }
      );
      if(!classdoc) return session.finish(res).then((response) => {
        if (response) res.redirect(worker.toLogin(data));
      });
      let student;
      let found = classdoc.users.classes[0].students.some((stud)=>{
        if(String(stud._id)==String(response.user.id)){
          student = share.getStudentShareData(stud);
          return true;
        }
      })
      if (!found) {
        clog("pseudo?")
        const pclassdoc = await Institute.findOne({
          uiid: response.user.uiid,
          "pseudousers.classes": {
            $elemMatch: { "classname": response.user.classname },
          },
        },{
          projection: {
            "pseudousers.classes.$": 1,
          },
        });
        clog(pclassdoc);
        if(!pclassdoc) return session.finish(res).then((response) => {
          if (response) res.redirect(worker.toLogin(data));
        });
        const pclassroom = pclassdoc.pseudousers.classes[0];
        found = pclassroom.students.some(stud=>{
          if(String(stud._id) == String(response.user.id)){
            student = share.getPseudoStudentShareData(stud);
            return true;
          }
        });
        if(!found) return session.finish(res).then((response) => {
          if (response) res.redirect(worker.toLogin(data));
        });

        if (!student.verified) return res.render(view.verification, { user: student });
        return res.render(view.student.getViewByTarget(view.student.target.dash), {student: student,target:{fragment:null}});
      }

      if (!student.verified)
        return res.render(view.verification, { user: student });

      const scheduledoc = await Institute.findOne({
          uiid: response.user.uiid,
          "schedule.classes": { $elemMatch: { classname: response.user.classname } },
      },{
          projection: { _id: 0, "schedule.classes.$": 1 },
      });
      const schedule = scheduledoc?scheduledoc.schedule.classes[0]:false;
      try {
        clog("in session try");
        clog(data);
        return res.render(view.student.getViewByTarget(data.target), {
          student,
          classinst: classdoc,
          target: {
            fragment: data.fragment,
          },
          schedule
        });
      } catch (e) {
        clog(e);
        return res.redirect(worker.toLogin());
      }
    });
});

student.get("/fragment*", (req, res) => {
  //for student session fragments.
  session
    .verify(req, sessionsecret)
    .catch((e) => {
      clog(e);
      return code.eventmsg(code.auth.AUTH_REQ_FAILED, e);
    })
    .then(async (response) => {
      const query = req.query;
      switch (query.fragment) {
        case view.student.target.fragment.today: {
          clog("todaystudent");
          worker.schedule.getSchedule(response.user, new Date().getDay())
            .then((scheduleresponse) => {
              if(!scheduleresponse){  //no schedule
                return res.render(view.student.getViewByTarget(query.fragment), {
                  today: null,
                  timings:null
                });
              }
              if (!scheduleresponse.schedule)
                return res.render(view.student.getViewByTarget(query.fragment),{
                  today: false,
                  timings: scheduleresponse.timings,
                });
              clog(scheduleresponse.schedule);
              return res.render(view.student.getViewByTarget(query.fragment), {
                today: scheduleresponse.schedule.period,
                timings: scheduleresponse.timings,
              });
            })
            .catch((e) => {
              clog(e);
            });
          return;
        }
        case view.student.target.fragment.fullweek: {
          clog("full week");
          worker.schedule.getSchedule(response.user)
          .then((resp) => {
              return res.render(view.student.getViewByTarget(query.fragment), {
                schedule: resp.schedule,
                timings: resp.timings,
              });
            })
            .catch((e) => {
              clog(e);
            });
          return;
        }
        case view.student.target.fragment.classroom: {
          clog("classroom");
          const classuser = await Institute.findOne({
            uiid:response.user.uiid,"users.classes":{$elemMatch:{"classname":response.user.classname}}
          },{projection:{"users.classes.$":1}});
          const classroom = classuser.users.classes[0];
          clog(classroom);
          return res.render(view.student.getViewByTarget(query.fragment), {
            classroom
          });
          return;
        }
        case view.student.target.fragment.settings: {
          clog("about");
          const classuser = await Institute.findOne({
            uiid: response.user.uiid,
            "users.classes": {
              $elemMatch: { "classname": response.user.classname },
            },
          },
            { projection: { "users.classes.$": 1,"default":1 } }
          );
          if (!classuser) return null;
          let student;
          classuser.users.classes[0].students.some((stud)=>{
            student = share.getStudentShareData(stud);
            return String(stud._id) == String(response.user.id)
          })
          const adminpref = await Admin.findOne({uiid:response.user.uiid},{projection:{"prefs":1}});
          clog(adminpref);
          return res.render(view.student.getViewByTarget(query.fragment), {student,defaults:classuser.default,adminemailvisible:adminpref.prefs.showemailtostudent,adminphonevisible:adminpref.prefs.showphonetostudent});
        }
        default:return res.render(view.notfound);
      }
    });
});


student.post("/self", async (req, res) => {
  const body = req.body;
  clog(body);
  if(body.external){
    switch (body.target) {
      case "account": return res.json({ result: await worker.self.handleAccount(body.user,body)});
    }
    return;
  }
  session.verify(req, sessionsecret)
  .catch(e=>{
    return;
  })
  .then(async (response) => {
    if (!session.valid(response)) return res.json(invalidsession);
    clog(response);
    switch (body.target) {
      case "authenticate": return res.json({result:await session.authenticate(req,res,body,sessionsecret)});
      case "account": return res.json({ result: await worker.self.handleAccount(response.user,body)});
      case "preferences": return res.json({result: await worker.self.handlePreferences(response.user,body)});
    }
  });
});

student.post("/manage", async (req, res) => {
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
      let classdoc = await Institute.findOne({uiid:response.user.uiid,"users.classes":{$elemMatch:{"classname":response.user.classname}}},
      {projection:{"_id":1,"users.classes.$._id":1}});
      if(!classdoc){ 
        classdoc = await Institute.findOne({uiid:response.user.uiid,"pseudousers.classes":{$elemMatch:{"classname":response.user.classname}}},
        {projection:{"_id":1,"pseudousers.classes.$._id":1}});
        if(!classdoc) return false;
        body['cid'] = classdoc.pseudousers.classes[0]._id;
      } else {
        body['cid'] = classdoc.users.classes[0]._id;
      }
      body['instID'] = classdoc._id;
      clog(body);
      switch (body.type) {
        case verify.type: return res.json({result:await worker.self.handleVerification(response.user,body)});
        case reset.type:return res.json({result:await worker.self.handlePassReset(response.user,body)});
        default: return res.sendStatus(500);
      }
    });
});

student.post("/session/validate", async (req, res) => {
  session
    .verify(req, sessionsecret)
    .then((response) => {
      return res.json({ result: response });
    })
    .catch((error) => {
      return res.json(authreqfailed(error));
    });
});

student.get("/external*", async (req, res) => {
  const query = req.query;
  switch (query.type) {
    case invite.type:{
      invite.handleInvitation(query,invite.target.student).then((resp)=>{
        if(!resp) return res.render(view.notfound);
        return res.render(view.userinvitaion,{invite:resp.invite});
      }).catch(e=>{
        return res.render(view.notfound);
      });
    }break;
    case verify.type: { //verification link
      clog("verify type");
      verify.handleVerification(query,verify.target.student).then((resp) => {
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
      reset.handlePasswordResetLink(query,reset.target.student).then(async(resp)=>{
        if (!resp) return res.render(view.notfound);
        return res.render(view.passwordreset, { user: resp.user,uiid:resp.uiid,classname:resp.classname});
      }).catch(e=>{
        clog(e);
        return res.render(view.servererror, {error:e});
      });
    }break;
    default:
      res.render(view.servererror);
  }
});


module.exports = student;
let clog=(m)=>console.log(m);