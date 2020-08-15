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
  worker = require("../workers/adminworker"),
  Admin = require("../collections/Admins"),
  Institute = require("../collections/Institutions");

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
      clog("session catch");
      clog(e);
      return res.redirect(worker.toLogin(data));
    })
    .then(async (response) => {
      if (!session.valid(response)) return res.redirect(worker.toLogin(data));
      try {
        if (data.u != response.user.id) return res.redirect(worker.toLogin(data));
        const admin = await Admin.findOne({ _id: ObjectId(response.user.id) });
        if (!admin)
          return session.finish(res).then((response) => {
            if (response) res.redirect(worker.toLogin(data));
          });
        let adata = getAdminShareData(admin);
        if (!adata.verified)
          return res.render(view.verification, { user: adata });
        let inst = await Institute.findOne({ uiid: response.user.uiid });
        if (!inst) {
          data.target = view.admin.target.register;
        } else {
          if (
            data.target == view.admin.target.register ||
            data.target == undefined
          ) {
            return res.redirect(
              worker.toSession(adata.uid, { target: view.admin.target.dashboard })
            );
          }
        }
        try {
          switch (data.target) {
            case view.admin.target.register: {
              return res.render(view.admin.getViewByTarget(data.target), {
                adata,
              });
            }
            case view.admin.target.addteacher: {
              return res.render(view.admin.getViewByTarget(data.target), {
                user: adata,
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
            case view.admin.target.viewschedule:
              {
                clog(data);
                if (data.client == "teacher") {
                  const teacherScheduleInst = await Institute.findOne(
                    {
                      uiid: response.user.uiid,
                      "schedule.teachers": {
                        $elemMatch: { teacherID: data.teacherID },
                      },
                    },
                    {
                      projection: {
                        _id: 0,
                        "schedule.teachers.$": 1,
                      },
                    }
                  );
                  const teacherInst = await Institute.findOne(
                    {
                      uiid: response.user.uiid,
                      "users.teachers": {
                        $elemMatch: { teacherID: data.teacherID },
                      },
                    },
                    {
                      projection: {
                        _id: 0,
                        "users.teachers.$": 1,
                      },
                    }
                  );
                  if (teacherInst && teacherScheduleInst) {
                    return res.render(view.admin.scheduleview, {
                      group: { teacher: true },
                      teacher: teacherInst.users.teachers[0],
                      schedule: teacherScheduleInst.schedule.teachers[0],
                      inst,
                    });
                  }
                  if (!teacherInst && !teacherScheduleInst) {
                    return res.render(view.admin.scheduleview, {
                      group: { teacher: false },
                      schedule: false,
                      inst,
                    });
                  }
                  if (!teacherInst && teacherScheduleInst) {
                    return res.render(view.admin.scheduleview, {
                      group: { teacher: false },
                      schedule: teacherScheduleInst.schedule.teachers[0],
                      inst,
                    });
                  } else {
                    return res.render(view.admin.scheduleview, {
                      group: { teacher: true },
                      teacher: teacherInst.users.teachers[0],
                      schedule: false,
                      inst,
                    });
                  }
                } else if (data.client == "student") {
                  const scheduleInst = await Institute.findOne(
                    {
                      uiid: response.user.uiid,
                      "schedule.students": {
                        $elemMatch: { classname: data.classname },
                      },
                    },
                    {
                      projection: {
                        _id: 0,
                        "schedule.students.$": 1,
                      },
                    }
                  );
                  if (!scheduleInst)
                    res.render(view.admin.scheduleview, { schedule: false });
                  return res.render(view.admin.scheduleview, {
                    group: { Class: true },
                    schedule: scheduleInst.schedule.students[0],
                    inst,
                  });
                } else {
                  return res.render(view.notfound);
                }
              }
              break;
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

//for account settings
admin.post("/account/action", (req, res) => {
  session.verify(req, sessionsecret).then((response) => {
    if (!session.valid(response)) {
      res.redirect(`/admin/auth/login?target=manage`);
    } else {
      switch (req.body.action) {
        case code.action.CHANGE_PASSWORD:
          {
          }
          break;
        case code.action.CHANGE_ID:
          {
          }
          break;
        case code.action.ACCOUNT_DELETE:
          {
          }
          break;
        default:
          res.redirect(`/admin/auth/login?target=manage`);
      }
    }
  });
});

admin.post("/session/validate", (req, res) => {
  let result;
  const { getuser } = req.body;
  clog("getuser=");
  clog(getuser);
  if (getuser) {
    clog("getuser");
    session
      .userdata(req, Admin, sessionsecret)
      .then((response) => {
        result = response;
        clog("postttt");
        clog(result);
        res.json({ result });
      })
      .catch((error) => {
        clog("errr");
        result = code.eventmsg(code.server.DATABASE_ERROR, error);
      });
  } else {
    clog("just verify");
    session
      .verify(req, sessionsecret)
      .then((response) => {
        result = response;
        clog("post validate");
        clog(result);
        clog("returning");
        res.json({ result });
      })
      .catch((error) => {
        clog("here");
        res.json({ event: code.auth.AUTH_REQ_FAILED, msg: error });
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
    if (!errors.isEmpty()) {
      res.json({ result:{ event: errors.array()[0].msg }});
      return;
    }
    session.signup(req, res, sessionsecret)
    .then((response) => {
      clog(response);
      return res.json({ result:response });
    })
    .catch((error) => {
      clog(error);
      return res.json({ result:{ event: code.auth.ACCOUNT_CREATION_FAILED, msg: error } });
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

admin.post(
  "/auth/login",
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
    clog("inpost admin login");
    session
      .login(req, res, sessionsecret)
      .then((response) => {
        clog("post login");
        clog(response);
        result = response;
        return res.json({ result });
      })
      .catch((error) => {
        clog(error);
        result = { event: code.auth.AUTH_REQ_FAILED, msg: error };
        clog("post login:" + jstr(result));
        return res.json({ result });
      });
  }
);

admin.post(
  "/session/registerinstitution",
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
  async (req, res) => {
    let result;
    clog("in registration final");
    clog(req.body);
    const data = req.body;
    session.verify(req, sessionsecret).then(async (response) => {
      if (!session.valid(response)) {
        clog("invalid session");
        await session.finish(res);
        result = { event: code.auth.SESSION_INVALID };
        return res.json({ result });
      }
      clog(response);
      let inst = await Institute.findOne({ uiid: response.user.uiid });
      if(inst) return res.json({result:code.event(code.inst.INSTITUTION_EXISTS)});
      if (!inst) {
        clog("creating inst");
        const registerdoc = {
          uiid: response.user.uiid,
          default: {
            admin: {
              email: data.adminemail,
              username: data.adminname,
              phone: data.adminphone,
            },
            institute: {
              instituteName: data.instname,
              email: data.instemail,
              phone: data.instphone,
              prefs: {},
            },
            timings: {
              startTime: data.starttime,
              endTime: data.endtime,
              breakStartTime: data.breakstarttime,
              periodMinutes: data.periodduration,
              breakMinutes: data.breakduration,
              periodsInDay: data.totalperiods,
              daysInWeek: String(data.workingdays).split(","),
            },
          },
          users: {
            teachers: [],
            classes: [],
          },
          schedule: {
            teachers: [],
            classes: [],
          },
          invite: {
            teacher: {
              active: false,
              createdAt: 0,
              expiresAt: 0,
            },
            student: {
              active: false,
              createdAt: 0,
              expiresAt: 0,
            },
          },
          active: false,
          restricted: false,
          vacations: [],
          prefs: {},
        };
        const done = await Institute.insertOne(registerdoc);
        return done.insertedCount == 1
          ?res.json({ result:code.event(code.inst.INSTITUTION_CREATED)})
          :res.json({ result:code.event(code.inst.INSTITUTION_CREATION_FAILED)});
      }
    });
  }
);

admin.post("/session/receiveinstitution", async (req, res) => {
  session
    .verify(req, sessionsecret)
    .then(async (response) => {
      let result;
      const { uiid, doc } = req.body;
      if (!session.valid(response)) {
        result = { event: code.auth.SESSION_INVALID };
        return res.json({ result });
      }
      let inst = await Institute.findOne({ uiid });
      if (!inst) {
        clog(uiid);
        inst = new Institute({
          uiid: uiid,
          invite: {
            teacher: {},
          },
        });
        clog("vallll");
        val = await inst.save();
        clog("val:" + val);
        if (val) {
          result = { event: code.inst.INSTITUTION_CREATED };
        } else {
          result = { event: code.inst.INSTITUTION_CREATION_FAILED };
        }
      } else {
        if (inst[doc]) {
          result = { event: code.inst.INSTITUTION_DEFAULTS_SET };
        } else {
          result = { event: code.inst.INSTITUTION_EXISTS };
        }
      }
      return res.json({ result });
    })
    .catch((error) => {
      result = { event: code.server.DATABASE_ERROR, msg: error };
      return res.json({ result });
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
      
      
    })
});

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
    switch (body.target) {
      case "teacher": return res.json({result:await worker.schedule.handleScheduleTeachersAction(inst,body)});
      case "student": return res.json({result:await worker.schedule.handleScheduleClassesAction(inst,body)});
      default : return null;
    }
  });
});


admin.post("/manage", async (req, res) => { //for settings
  clog("in post manage");
  session
    .verify(req, sessionsecret)
    .catch((e) => {
      clog(e);
      return res.json({ result: code.eventmsg(code.auth.AUTH_REQ_FAILED, e) });
    })
    .then(async (response) => {
      if (!session.valid(response)) {
        return res.json({ result: response });
      }
      clog(req.body);
      const data = req.body;
      switch (data.type) {
        case invite.type:
          {
            clog("invite type");
            switch (data.action) {
              case "create": {
                clog("post create link ");
                const inst = await Institute.findOne({
                  uiid: response.user.uiid,
                });
                if (!inst)
                  return res.json({
                    result: code.event(code.inst.INSTITUTION_NOT_EXISTS),
                  });

                if (inst.invite[data.target].active == true) {
                  clog("already active");
                  const validresponse = invite.checkTimingValidity(
                    inst.invite[data.target].createdAt,
                    inst.invite[data.target].expiresAt,
                    inst.invite[data.target].createdAt
                  );
                  if (invite.isActive(validresponse)) {
                    clog("already valid link");
                    clog(response);
                    let link = invite.getTemplateLink(
                      response.user.id,
                      inst._id,
                      data.target,
                      inst.invite[data.target].createdAt
                    );
                    clog("templated");
                    clog(link);
                    result = {
                      event: code.invite.LINK_EXISTS,
                      link: link,
                      exp: inst.invite[data.target].expiresAt,
                    };
                    clog("returning existing link");
                    return res.json({ result });
                  }
                }
                clog("creating new link");
                const genlink = await invite.generateLink(
                  response.user.id,
                  inst._id,
                  data.target,
                  data.daysvalid
                );
                const path = "invite." + data.target;
                const document = await Institute.findOneAndUpdate(
                  { uiid: response.user.uiid },
                  {
                    $set: {
                      [path]: {
                        active: true,
                        createdAt: genlink.create,
                        expiresAt: genlink.exp,
                      },
                    },
                  }
                );
                if (document) {
                  clog("link created");
                  result = {
                    event: code.invite.LINK_CREATED,
                    link: genlink.link,
                    exp: genlink.exp,
                  };
                } else {
                  result = code.event(code.invite.LINK_CREATION_FAILED);
                }
                clog("returning result");
                clog(result);
                return res.json({ result });
              }
              case "disable": {
                clog("post disabe link");
                const path = "invite." + req.body.target;
                const doc = await Institute.findOneAndUpdate(
                  { uiid: response.user.uiid },
                  {
                    $set: {
                      [path]: {
                        active: false,
                        createdAt: 0,
                        expiresAt: 0,
                      },
                    },
                  }
                );
                if (doc) {
                  clog("link disabled true");
                  result = code.event(code.invite.LINK_DISABLED);
                } else {
                  result = code.event(code.invite.LINK_DISABLE_FAILED);
                }
                clog("returning result");
                clog(result);
                return res.json({ result });
              }
            }
          }
          break;
        case verify.type:
          {
            switch (data.action) {
              case "send":
                {
                  clog(response);
                  const linkdata = verify.generateLink(verify.target.admin, {
                    uid: response.user.id,
                  });
                  clog(linkdata);
                  //todo: send email then save.
                  let admin = await Admin.findOneAndUpdate(
                    { _id: ObjectId(response.user.id) },
                    {
                      $set: {
                        vlinkexp: linkdata.exp,
                      },
                    }
                  );
                  clog(admin);
                  return admin
                    ? res.json({ result: code.event(code.mail.MAIL_SENT) })
                    : res.json({
                        result: code.event(code.mail.ERROR_MAIL_NOTSENT),
                      });
                }
                break;
              case "check":
                {
                  const admin = await Admin.findOne({
                    _id: ObjectId(response.user.id),
                  });
                  if (!admin)
                    return res.json({
                      result: code.event(code.auth.USER_NOT_EXIST),
                    });
                  return admin.verified
                    ? res.json({ result: code.event(code.verify.VERIFIED) })
                    : res.json({
                        result: code.event(code.verify.NOT_VERIFIED),
                      });
                }
                break;
            }
          }
          break;
        case "search": {
          switch (data.target) {
            case "teacher": {
              let inst = await Institute.findOne({ uiid: response.user.uiid });
              if (!inst) return code.inst.INSTITUTION_NOT_EXISTS;
              let teachers = Array();
              inst.users.teachers.forEach((teacher, index) => {
                if (
                  String(teacher.username).toLowerCase() ==
                    String(data.q).toLowerCase() ||
                  String(teacher.username)
                    .toLowerCase()
                    .includes(String(data.q).toLowerCase()) ||
                  String(teacher.teacherID) == String(data.q).toLowerCase() ||
                  String(teacher.teacherID).includes(
                    String(data.q).toLowerCase()
                  )
                ) {
                  teachers.push({
                    username: teacher.username,
                    teacherID: teacher.teacherID,
                  });
                }
              });
              inst.schedule.teachers.forEach((teacher, index) => {
                let id;
                let found = teachers.some((t, i) => {
                  if (teacher.teacherID == t.teacherID) {
                    return true;
                  } else {
                    id = teacher.teacherID;
                    return false;
                  }
                });
                if (!found) {
                  teachers.push({
                    username: "Not Set",
                    teacherID: id,
                  });
                }
              });
              clog(teachers);
              return res.json({
                result: {
                  event: "OK",
                  teachers: teachers,
                },
              });
            }
            default:
              res.sendStatus(500);
          }
        }
        default:
          res.sendStatus(500);
      }
    });
});

/**
 * For external links.
 */
admin.get("/external*", async (req, res) => {
  const query = req.query;
  switch (query.type) {
    case verify.type:{
      verify.handleVerification(query, verify.target.admin).then((resp) => {
        if (!resp) return res.render(view.notfound);
        return res.render(view.verification, { user: resp.user });
      }).catch(e=>{
        clog(e);
        return res.render(view.servererror, {error:e});
      });
    }
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

let jstr = (obj) => JSON.stringify(obj);

module.exports = admin;
