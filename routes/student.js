const express = require("express"),
  student = express.Router(),
  cookieParser = require("cookie-parser"),
  { ObjectId } = require("mongodb"),
  { check, validationResult } = require("express-validator"),
  code = require("../public/script/codes"),
  view = require("../hardcodes/views"),
  session = require("../workers/common/session"),
  invite = require("../workers/common/invitation"),
  verify = require("../workers/common/verification"),
  worker = require("../workers/studentworker"),
  Institute = require("../collections/Institutions"),
  Admin = require("../collections/Admins");

const sessionsecret = session.studentsessionsecret;
student.use(cookieParser(sessionsecret));

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
      const userinst = await Institute.findOne(
        {
          uiid: response.user.uiid,
          "users.students": {
            $elemMatch: { _id: ObjectId(response.user.id) },
          },
        },
        {
          projection: {
            _id: 1,
            uiid: 1,
            default: 1,
            schedule: 1,
            "users.students.$": 1,
          },
        }
      );
      if (!userinst)
        return session.finish(res).then((response) => {
          if (response) res.redirect(worker.toLogin(data));
        });

      //user student exists
      const student = getStudentShareData(userinst.users.students[0]);
      if (!student.verified)
        return res.render(view.verification, { user: student });

      const scheduleinst = await Institute.findOne(
        {
          uiid: response.user.uiid,
          "schedule.students": { $elemMatch: { classname: student.classname } },
        },
        {
          projection: { _id: 0, "schedule.students.$": 1 },
        }
      );

      const inst = await Institute.findOne(
        {
          uiid: response.user.uiid,
          "users.students": { $elemMatch: { studentID: student.id } },
        },
        {
          projection: {
            _id: 1,
            uiid: 1,
            default: 1,
            schedule: 1,
            "users.students.$": 1,
          },
        }
      );
      try {
        clog("in session try");
        clog(data);
        return res.render(view.student.getViewByTarget(data.target), {
          student,
          inst,
          target: {
            fragment: data.fragment,
          },
          schedule:scheduleinst.schedule.students[0],
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
          getSchedule(response, 1)
            .then((resp) => {
              if (!resp.schedule)
                return res.render(
                  view.student.getViewByTarget(query.fragment),
                  {
                    today: false,
                    timings: resp.timings,
                  }
                );
              return res.render(view.student.getViewByTarget(query.fragment), {
                today: resp.schedule.period,
                timings: resp.timings,
              });
            })
            .catch((e) => {
              clog(e);
            });
          return;
        }
        case view.student.target.fragment.fullweek: {
          clog("full week");
          getSchedule(response)
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
        case view.student.target.fragment.about: {
          clog("about");
          const studentuser = await Institute.findOne(
            {
              uiid: response.user.uiid,
              "users.students": {
                $elemMatch: { _id: ObjectId(response.user.id) },
              },
            },
            { projection: { "users.students.$": 1 } }
          );
          if (!studentuser) return null;
          return res.render(view.student.getViewByTarget(query.fragment), {
            student: getStudentShareData(studentuser.users.students[0]),
          });
        }
      }
    });
});

const getSchedule = async (response, dayIndex = null) => {
  const studentuser = await Institute.findOne(
    {
      uiid: response.user.uiid,
      "users.students": { $elemMatch: { _id: ObjectId(response.user.id) } },
    },
    { projection: { _id: 0, "users.students.$": 1 } }
  );
  if (!studentuser)
    return session.finish(res).then((response) => {
      if (response) res.redirect(worker.toLogin());
    });
  const student = getStudentShareData(studentuser.users.students[0]);
  const studentschedule = await Institute.findOne(
    {
      uiid: response.user.uiid,
      "schedule.students": { $elemMatch: { classname: student.classname } },
    },
    {
      projection: {
        _id: 0,
        default: 1,
        "schedule.students.$": 1,
      },
    }
  );
  if (!studentschedule) return res.redirect(worker.toLogin(req.query));
  const schedule = studentschedule.schedule.students[0].days;
  const timings = studentschedule.default.timings;
  if (!dayIndex) return { schedule: schedule, timings: timings };
  let today = studentschedule.schedule.students[0].days[0];
  const found = schedule.some((day, index) => {
    if (day.dayIndex == dayIndex) {
      today = day;
      return true;
    }
  });
  if (!found) return { schedule: false, timings: timings };
  return { schedule: today, timings: timings };
};

const getStudentShareData = (data = {}) => {
  return {
    isStudent: true,
    [sessionUID]: data._id,
    username: data.username,
    [sessionID]: data.teacherID,
    classname:data.className,
    createdAt: data.createdAt,
    verified: data.verified,
    prefs: data.prefs,
  };
};

module.exports = student;
let clog=(m)=>console.log(m);