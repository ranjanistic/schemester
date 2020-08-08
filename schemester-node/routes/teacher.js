const { ObjectId } = require("mongodb");

const express = require("express"),
  teacher = express.Router(),
  cookieParser = require("cookie-parser"),
  { check, validationResult } = require("express-validator"),
  code = require("../public/script/codes"),
  view = require("../hardcodes/views"),
  session = require("../workers/session"),
  invite = require("../workers/invitation"),
  verify = require("../workers/verification"),
  Institute = require("../collections/Institutions"),
  Admin = require("../collections/Admins");

const sessionsecret = session.teachersessionsecret;
teacher.use(cookieParser(sessionsecret));

teacher.get("/", (req, res) => {
  res.redirect(toLogin());
});

teacher.get("/auth/login*", (req, res) => {
  session
    .verify(req, sessionsecret)
    .catch((error) => {
      return res.render(view.servererror, { error });
    })
    .then((response) => {
      if (!session.valid(response))
        return res.render(view.teacher.login, { autofill: req.query });
      let data = req.query;
      delete data["u"];
      return res.redirect(toSession(response.user.id, req.query));
    });
});

teacher.post("/auth/login", async (req, res) => {
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

teacher.post("/auth/logout", (_, res) => {
  session.finish(res).then((response) => {
    return res.json({ result: response });
  });
});

teacher.post("/auth/signup", async (req, res) => {
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


teacher.get("/session*", async (req, res) => {
  let data = req.query;
  clog(data);
  session.verify(req, sessionsecret)
  .catch((e) => {
    clog("session catch");
    clog(e);
    return res.redirect(toLogin(data));
  })
  .then(async (response) => {
    if (!session.valid(response)) return res.redirect(toLogin(data));
    if (data.u != response.user.id) return res.redirect(toLogin(data));
    const userinst = await Institute.findOne(
      {
        uiid: response.user.uiid,
        "users.teachers": {
          $elemMatch: { _id: ObjectId(response.user.id) },
        },
      },
      {
        projection: {
          _id: 1,
          uiid: 1,
          default: 1,
          schedule: 1,
          "users.teachers.$": 1,
        },
      }
    );
    if (!userinst)
      return session.finish(res).then((response) => {
        if (response) res.redirect(toLogin(data));
      });

    //user teacher exists
    const teacher = getTeacherShareData(userinst.users.teachers[0]);
    if (!teacher.verified)
      return res.render(view.verification, { user: teacher });
    const scheduleinst = await Institute.findOne(
      {
        uiid: response.user.uiid,
        "schedule.teachers": { $elemMatch: { teacherID: teacher.id } },
      },
      {
        projection: { _id: 0, "schedule.teachers.$": 1 },
      }
    );

    const inst = await Institute.findOne(
      {
        uiid: response.user.uiid,
        "users.teachers": { $elemMatch: { teacherID: teacher.id } },
      },
      {
        projection: {
          _id: 1,
          uiid: 1,
          default: 1,
          schedule: 1,
          "users.teachers.$": 1,
        },
      }
    );
    if (!scheduleinst) {
      //no schedule for this user teacher
      clog("no schedule");
      return res.render(view.teacher.addschedule, {
        user: teacher,
        inst,
      });
    }
    //schedule exists;
    const schedule = scheduleinst.schedule.teachers[0];
    if (
      Object.keys(schedule.days).length !=
      inst.default.timings.daysInWeek.length
    ) {
      Institute.findOneAndUpdate(
        { uiid: response.user.uiid },
        {
          $pull: { "schedule.teachers": { teacherID: teacher.id } },
        }
      );
      return res.redirect(
        toSession(teacher.uid, { target: view.teacher.target.addschedule })
      );
    } else {
      if (
        data.target == view.teacher.target.addschedule ||
        data.target == undefined
      )
        return res.redirect(toLogin());
    }
    try {
      clog("in session try");
      clog(data);
      return res.render(view.teacher.getViewByTarget(data.target), {
        teacher,
        inst,
        target:{
          fragment:data.fragment
        }
      });
    } catch (e) {
      clog(e);
      return res.redirect(toLogin());
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
          getSchedule(response, 1)
            .then((resp) => {
              if(!resp.schedule)
                return res.render(view.teacher.getViewByTarget(query.fragment), {
                  today: false,
                  timings:resp.timings
                });
              return res.render(view.teacher.getViewByTarget(query.fragment), {
                today: resp.schedule.period,
                timings:resp.timings
              });
            })
            .catch((e) => {
              clog(e);
            });
          return;
        }
        case view.teacher.target.fragment.fullweek: {
          clog("full week");
          getSchedule(response)
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
        case view.teacher.target.fragment.about: {
          clog("about");
          const teacheruser = await Institute.findOne({
            uiid:response.user.uiid,"users.teachers":{$elemMatch:{"_id":ObjectId(response.user.id)}}
          },{projection:{"users.teachers.$":1}});
          if(!teacheruser) return null;
          return res.render(view.teacher.getViewByTarget(query.fragment),{teacher:getTeacherShareData(teacheruser.users.teachers[0])});
        }
      }
    });
});

const getSchedule = async (response, dayIndex = null) => {
  const teacheruser = await Institute.findOne(
    {
      uiid: response.user.uiid,
      "users.teachers": { $elemMatch: { _id: ObjectId(response.user.id) } },
    },
    { projection: { _id: 0, "users.teachers.$": 1 } }
  );
  if (!teacheruser)
    return session.finish(res).then((response) => {
      if (response) res.redirect(toLogin());
    });
  const teacher = teacheruser.users.teachers[0];
  const teacherschedule = await Institute.findOne(
    {
      uiid: response.user.uiid,
      "schedule.teachers": { $elemMatch: { teacherID: teacher.teacherID } },
    },
    {
      projection: {
        _id:0,
        default: 1,
        "schedule.teachers.$": 1,
      },
    }
  );
  if (!teacherschedule) return res.redirect(toLogin(req.query));
  const schedule = teacherschedule.schedule.teachers[0].days;
  const timings = teacherschedule.default.timings;
  if (!dayIndex) return { schedule: schedule, timings:timings};
  let today = teacherschedule.schedule.teachers[0].days[0];
  const found = schedule.some((day, index) => {
    if (day.dayIndex == dayIndex) {
      today = day;
      return true;
    }
  });
  if (!found) return { schedule: false, timings:timings};
  return { schedule: today, timings:timings};
};

teacher.post("/schedule", async (req, res) => {
  session
    .verify(req, sessionsecret)
    .then(async (response) => {
      if (!session.valid(response)) {
        return res.json({ result: code.auth.SESSION_INVALID });
      }
      switch (req.body.action) {
        case "upload":
          {
            const body = req.body;
            let inst = await Institute.findOne({ uiid: response.user.uiid });
            if (!inst)
              return res.json({ result: code.inst.INSTITUTION_NOT_EXISTS });

            let overwriting = false; //if existing teacher schedule being overwritten after completion.
            let incomplete = false; //if existing teacher schedule being rewritten without completion.
            let found = inst.schedule.teachers.some((teacher, index) => {
              if (teacher.teacherID == body.teacherID) {
                if (
                  teacher.days.length == inst.default.timings.daysInWeek.length
                ) {
                  overwriting = true;
                } else {
                  incomplete = teacher.days.some((day, index) => {
                    if (body.data.dayIndex <= day.dayIndex) {
                      return true;
                    }
                  });
                }
                return true;
              }
            });
            if (overwriting) {
              //completed schedule, must be edited from schedule view.
              result = code.event(code.schedule.SCHEDULE_EXISTS);
              return res.json({ result });
            }
            if (incomplete) {
              //remove teacher schedule
              clog("is incomplete");
              await Institute.findOneAndUpdate(
                { uiid: response.user.uiid },
                {
                  $pull: { "schedule.teachers": { teacherID: body.teacherID } },
                }
              );
              found = false; //add as a new teacher schedule
            }
            clog("bodydata");
            clog(body.data);
            let clashClass,clashPeriod,clashTeacher;
            let clashed = inst.schedule.teachers.some((teacher,_)=>{
              clog("eachteacher");
              clog(teacher);
              let clashed = teacher.days.some((day,_)=>{
                clog("eachday")
                clog(day);
                if(day.dayIndex == body.data.dayIndex){
                  let clashed = day.period.some((period,pindex)=>{
                    clog("eachperiod");
                    clog(period);
                    if(period.classname == body.data.period[pindex].classname){
                      mathcclass = period.classname;
                      clashPeriod = pindex;
                      return true;
                    }
                  })
                  clog(clashed);
                  if(clashed){
                    return true
                  }
                }
              })
              clog(clashed)
              if(clashed){
                clashTeacher = teacher.teacherID;
                return true
              }
            });
            clog(clashed);
            if(clashed){  //if schedule clashed.
              return res.json({result:{
                event:code.schedule.SCHEDULE_CLASHED,
                clash:{
                  classname:clashClass,
                  period:clashPeriod,
                  teacherID:clashTeacher
                }
              }});
            }
            if (found) {
              //existing teacher schedule, incomplete (new day index)
              const filter = {
                uiid: response.user.uiid,
                "schedule.teachers": {
                  $elemMatch: { teacherID: body.teacherID },
                }, //existing schedule teacherID
              };
              const newdocument = {
                $push: { "schedule.teachers.$[outer].days": body.data }, //new day push
              };
              const options = {
                arrayFilters: [{ "outer.teacherID": body.teacherID }],
              };
              let doc = await Institute.findOneAndUpdate(
                filter,
                newdocument,
                options
              );
              clog("schedule appended?");
              if (doc) {
                result = code.event(code.schedule.SCHEDULE_CREATED);
                return res.json({ result }); //new day created.
              }
            } else {
              //no existing schedule teacherID
              const filter = { uiid: response.user.uiid };
              const newdocument = {
                $push: {
                  "schedule.teachers": {
                    teacherID: body.teacherID,
                    days: [body.data],
                  },
                }, //new teacher schedule push
              };
              let doc = await Institute.findOneAndUpdate(filter, newdocument);
              clog("schedule created?");
              if (doc) {
                result = code.event(code.schedule.SCHEDULE_CREATED);
                return res.json({ result }); //new teacher new day created.
              }
            }
          }
          break;
        case "update":
          {
          }
          break;
      }
    })
    .catch((e) => {
      clog(e);
    });
});

let result = {};

teacher.post("/session/validate", async (req, res) => {
  session
    .verify(req, sessionsecret)
    .then((response) => {
      return res.json({ result: response });
    })
    .catch((error) => {
      return res.json({
        result: code.eventmsg(code.auth.AUTH_REQ_FAILED, error),
      });
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
    default:
      res.render(view.servererror);
  }
});


teacher.post("/manage", async (req, res) => {
  session
    .verify(req, sessionsecret)
    .catch((e) => {
      clog(e);
      return res.json({ result: code.event(code.auth.AUTH_REQ_FAILED) });
    })
    .then(async (response) => {
      if (!session.valid(response)) return res.json({ result: response });
      const manage = req.body;
      switch (manage.type) {
        case verify.type: {
          switch (manage.action) {
            case "send":
              {
                clog(response);
                const inst = await Institute.findOne({
                  uiid: response.user.uiid,
                });
                const linkdata = verify.generateLink(verify.target.teacher, {
                  instID: inst._id,
                  uid: response.user.id,
                });
                clog(linkdata);
                //todo: send email then save.
                let teacherInst = await Institute.findOneAndUpdate(
                  {
                    uiid: response.user.uiid,
                    "users.teachers": {
                      $elemMatch: { _id: ObjectId(response.user.id) },
                    },
                  },
                  {
                    $set: {
                      "users.teachers.$.vlinkexp": linkdata.exp,
                    },
                  }
                );
                clog(teacherInst);
                if (teacherInst) {
                  return res.json({ result: code.event(code.mail.MAIL_SENT) });
                }
              }
              break;
            case "check":
              {
                const teacherinst = await Institute.findOne(
                  {
                    uiid: response.user.uiid,
                    "users.teachers": {
                      $elemMatch: { _id: ObjectId(response.user.id) },
                    },
                  },
                  {
                    projection: {
                      "users.teachers.$": 1,
                    },
                  }
                );
                if (!teacherinst)
                  return res.json({
                    result: code.event(code.auth.USER_NOT_EXIST),
                  });
                const teacher = teacherinst.users.teachers[0];
                return teacher.verified
                  ? res.json({ result: code.event(code.verify.VERIFIED) })
                  : res.json({ result: code.event(code.verify.NOT_VERIFIED) });
              }
              break;
            default:
              res.sendStatus(500);
          }
        }
        default:
          res.sendStatus(500);
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

const toSession = (u, query = { target: view.teacher.target.dash }) => {
  let path = `/teacher/session?u=${u}`;
  for (var key in query) {
    if (query.hasOwnProperty(key)) {
      path = `${path}&${key}=${query[key]}`;
    }
  }
  return path;
};
const toLogin = (query = { target: view.teacher.target.dash }) => {
  let i = 0;
  let path = "/teacher/auth/login";
  for (var key in query) {
    if (query.hasOwnProperty(key)) {
      path =
        i > 0 ? `${path}&${key}=${query[key]}` : `${path}?${key}=${query[key]}`;
      i++;
    }
  }
  return path;
};

const getTeacherShareData = (data = {}) => {
  return {
    isTeacher: true,
    [session.sessionUID]: data._id,
    username: data.username,
    [session.sessionID]: data.teacherID,
    createdAt: data.createdAt,
    verified: data.verified,
  };
};

module.exports = teacher;
let clog = (msg) => console.log(msg);
