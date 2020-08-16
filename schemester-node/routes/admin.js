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
      clog(e);
      return res.redirect(worker.toLogin(data));
    })
    .then(async (response) => {
      if (!session.valid(response)) return res.redirect(worker.toLogin(data));
      try {
        if (data.u != response.user.id) return res.redirect(worker.toLogin(data));
        const admin = await Admin.findOne({ "_id": ObjectId(response.user.id) });
        if (!admin)
          return session.finish(res).then((response) => {
            if (response) res.redirect(worker.toLogin(data));
          });
        let adata = getAdminShareData(admin);
        if (!admin.verified)
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
                      "schedule.classes": {
                        $elemMatch: { classname: data.classname },
                      },
                    },
                    {
                      projection: {
                        _id: 0,
                        "schedule.classes.$": 1,
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
  session.verify(req, sessionsecret)
  .catch(e=>{
    return authFail(e);
  })
  .then(async (response) => {
    if (!session.valid(response)) return res.json({result:code.event(code.auth.SESSION_INVALID)});
    const body = req.body;
    switch (body.target) {
      case "account": return res.json({ result: await worker.self.handleAccount(response.user,body)});
      case "settings": return res.json({result: await worker.self.handlePreferences(response.user,body)});
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
          if(inst) return res.json({result:code.event(code.inst.INSTITUTION_EXISTS)});
          return res.json({result:await worker.default.handleRegistration(response.user,body)})
        }
        case "admin": return res.json({result:worker.default.handleAdmin(response.user,inst,body)});
        case "institute":return res.json({result:worker.default.handleInstitute(response.user,inst,body)});
        case "timings": return res.json({result:worker.default.handleTimings(inst,body)});
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
    }
  });
});


admin.post("/manage", async (req, res) => { //for settings
  clog("in post manage");
  session.verify(req, sessionsecret)
    .catch((e) => {
      clog(e);
      return res.json({ result: code.eventmsg(code.auth.AUTH_REQ_FAILED, e) });
    })
    .then(async (response) => {
      if (!session.valid(response))
        return res.json({ result: response });
      const inst = await Institute.findOne({uiid: response.user.uiid,});
      const body = req.body;
      if (!inst && body.type!=verify.type)
        return res.json({
          result: code.event(code.inst.INSTITUTION_NOT_EXISTS),
        });
      switch (body.type) {
        case invite.type: return res.json({ result:await worker.invite.handleInvitation(response.user,inst,body)});
        case verify.type: return res.json({ result: await worker.self.handleVerification(response.user,body)});
        case "search": return res.json({result: await worker.users.handleUserSearch(inst,body)});
        default: res.sendStatus(500);
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
      verify.handleVerification(query, verify.target.admin).then(async(resp) => {
        if (!resp)
          return res.render(view.notfound);
        clog("resp true");
        clog(resp);
        return res.render(view.verification, { user: resp.user });
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
