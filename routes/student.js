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
  worker = require("../workers/studentworker"),
  Institute = require("../collections/Institutions"),
  Admin = require("../collections/Admins");

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
      if (!session.valid(response))
        return res.render(view.student.login, { autofill: req.query });
      let data = req.query;
      delete data["u"];
      return res.redirect(worker.toSession(response.user.id, req.query));
    });
});

student.post("/auth/login", async (req, res) => {
  session
    .login(req, res, sessionsecret)
    .then((response) => {
      clog(response);
      return res.json({ result: response });
    })
    .catch((error) => {
      clog(error);
    });
});

student.post("/auth/signup", async (req, res) => {
  clog(req.body);
  session
    .signup(req, res, sessionsecret)
    .then((response) => {
      return res.json({ result: response });
    })
    .catch((error) => {
      clog(error);
      return res.json({
        result: code.eventmsg(code.auth.ACCOUNT_CREATION_FAILED, error),
      });
    });
});

student.get("/session*", async (req, res) => {
  let data = req.query;
  clog(data);
  session
    .verify(req, sessionsecret)
    .catch((e) => {
      clog("session catch");
      clog(e);
      return res.redirect(worker.toLogin(data));
    })
    .then(async (response) => {
      if (!session.valid(response)) return res.redirect(worker.toLogin(data));
      if (data.u != response.user.id) return res.redirect(worker.toLogin(data));
      const classinst = await Institute.findOne({
          uiid: response.user.uiid,
          "users.classes": {
            $elemMatch: { "classname": response.user.classname },
          },
        },
        {
          projection: {
            _id: 1,
            uiid: 1,
            default: 1,
            "schedule.classes": 1,
            "users.classes.$": 1,
          },
        }
      );
      if (!classinst)
        return session.finish(res).then((response) => {
          if (response) res.redirect(worker.toLogin(data));
        });

      //classroom exists
      const classroom  = classinst.users.classes[0];
      let student;
      const found = classroom.students.some((stud)=>{
        student = share.getStudentShareData(stud);
        return student._id == response.user.id
      })
      if(!found) return session.finish(res).then((response) => {
        if (response) res.redirect(worker.toLogin(data));
      });

      if (!student.verified)
        return res.render(view.verification, { user: student });

      const scheduleinst = await Institute.findOne({
          uiid: response.user.uiid,
          "schedule.classes": { $elemMatch: { classname: response.user.classname } },
      },{
          projection: { _id: 0, "schedule.classes.$": 1 },
      });
      const schedule = scheduleinst?scheduleinst.schedule.classes[0]:false;
      try {
        clog("in session try");
        clog(data);
        return res.render(view.student.getViewByTarget(data.target), {
          student,
          classinst,
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
          clog("today");
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
          return res.render(view.teacher.getViewByTarget(query.fragment), {
            classroom: false,
            classroom
          });
        }
        case view.student.target.fragment.about: {
          clog("about");
          const classuser = await Institute.findOne({
            uiid: response.user.uiid,
            "users.classes": {
              $elemMatch: { "classname": response.user.classname },
            },
          },
            { projection: { "users.classes.$": 1 } }
          );
          if (!classuser) return null;
          let student;
          classuser.users.classes[0].students.some((stud)=>{
            student = share.getStudentShareData(stud);
            return String(stud._id) == String(response.user.id)
          })
          return res.render(view.student.getViewByTarget(query.fragment), {student});
        }
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
    switch (body.target) {
      case "authenticate": return res.json({result:await session.authenticate(req,res,body,sessionsecret)});
      case "account": return res.json({ result: await worker.self.handleAccount(response.user,body)});
      case "preferences": return res.json({result: await worker.self.handlePreferences(response.user,body)});
    }
  });
});


module.exports = student;
let clog=(m)=>console.log(m);