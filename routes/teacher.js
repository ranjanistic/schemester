const express = require("express"),
  teacher = express.Router(),
  path = require("path"),
  {
    code,
    client,
    view,
    action,
    get,
    post,
    key,
  } = require("../public/script/codes"),
  session = require("../workers/common/session"),
  invite = require("../workers/common/invitation"),
  { render } = require("../workers/common/inspector"),
  alert = require("../workers/common/alerts"),
  { sendException } = require("../workers/common/mailer"),
  verify = require("../workers/common/verification"),
  reset = require("../workers/common/passwordreset"),
  worker = require("../workers/teacherworker");

session.use(teacher, client.teacher);

const invalidsession = { result: code.event(code.auth.SESSION_INVALID) },
  authreqfailed = (error) => {
    return { result: code.eventmsg(code.auth.AUTH_REQ_FAILED, error) };
  };

teacher.get(get.root, (req, res) => {
  res.redirect(worker.toLogin());
  // return render(res,view.teacher.landing)
});

teacher.get(get.authlogin, (req, res) => {
  const response = session.verify(req, client.teacher);
  if (!session.valid(response))
    return render(res, view.teacher.login, { autofill: req.query });
  let data = req.query;
  delete data[key.uid[0]];
  return res.redirect(worker.toSession(response.user.id, req.query));
});

teacher.post(post.auth, async (req, res) => {
  const body = req.body;
  switch (body.action) {
    case action.login:
      {
        session
          .login(req, res, client.teacher)
          .then((response) => {
            return res.json({ result: response });
          })
          .catch((error) => {
            return res.json(authreqfailed(error));
          });
      }
      break;
    case action.logout:
      {
        session.finish(res).then((response) => {
          return res.json({ result: response });
        });
      }
      break;
    case action.signup:
      {
        session
          .signup(req, res, client.teacher, body.pseudo)
          .then((response) => {
            return res.json({ result: response });
          })
          .catch((error) => {
            return res.json({
              result: code.eventmsg(code.auth.ACCOUNT_CREATION_FAILED, error),
            });
          });
      }
      break;
    default:
      res.sendStatus(500);
  }
});

teacher.get(get.session, async (req, res) => {
  let query = req.query;
  const response = session.verify(req, client.teacher);

  if (!session.valid(response)) return res.redirect(worker.toLogin(query));
  if (query.u != response.user.id) return res.redirect(worker.toLogin(query));
  let teacher = await worker.self.account.getAccount(response.user);
  if (!teacher) {
    return session.finish(res).then((response) => {
      if (response) return res.redirect(worker.toLogin(query));
    });
  }

  if (!teacher.verified)
    return render(res, view.verification, { user: teacher });

  const alerts = await alert.teacherAlerts();
  if (teacher.pseudo)
    //if membership requested (pseudo user)
    return render(res, view.teacher.getViewByTarget(view.teacher.target.dash), {
      teacher,
      target: { fragment: null },
      alerts,
    });

  //user teacher exists
  const inst = await worker.institute.getInstituteByUIID(response.user);

  let scheddoc = await worker.schedule.getSchedule(response.user);
  let schedule = scheddoc.schedule;
  if (!schedule) {
    //no schedule for this user teacher
    if (inst.preferences.allowTeacherAddSchedule) {
      return render(res, view.teacher.addschedule, {
        user: teacher,
        inst: inst,
      });
    } else {
      query.target = view.teacher.target.dash;
    }
  } else {
    //schedule exists;
    if (Object.keys(schedule).length != scheddoc.timings.daysInWeek.length) {
      //incomplete schedule
      await worker.schedule.removeScheduleByTeacherID(
        response.user,
        teacher.id
      );
    } else {
      if (
        query.target == view.teacher.target.addschedule ||
        query.target == undefined
      )
        return res.redirect(
          worker.toLogin({ target: view.teacher.target.dash })
        );
    }
  }
  try {
    switch (query.target) {
      case view.teacher.target.comms: {
        const comms = await worker.comms.getRoomAndCallList(response.user);
        return render(res, view.teacher.getViewByTarget(query.target), {
          client: teacher,
          rooms: comms.rooms,
          calls: comms.calls,
        });
      }
      case view.teacher.target.chatroom: {
        const room = await worker.comms.getRoom(response.user, {
          rid: query.rid ? query.rid : false,
          roomname: query.roomname ? query.roomname : false,
          personid: query.personid ? query.personid : false,
        });
        if (!room) return render(res, view.notfound);
        return render(res, view.teacher.getViewByTarget(query.target), {
          client: teacher,
          room,
        });
      }
      default:
        return render(res, view.teacher.getViewByTarget(query.target), {
          teacher,
          inst,
          target: {
            fragment: query.fragment,
          },
          alerts,
        });
    }
  } catch (error) {
    return res.redirect(worker.toLogin());
  }
});

//for teacher session fragments.
teacher.get(get.fragment, async (req, res) => {
  const response = session.verify(req, client.teacher);
  const query = req.query;
  if (!session.valid(response)) return worker.toLogin(query);
  try {
    switch (query.fragment) {
      case view.teacher.target.fragment.today: {
        worker.schedule
          .getSchedule(response.user, { dayIndex: Number(query.day) })
          .then((scheduleresponse) => {
            if (!scheduleresponse) {
              //no schedule
              return render(res, view.teacher.getViewByTarget(query.fragment), {
                today: null,
                timings: null,
              });
            }
            if (!scheduleresponse.schedule)
              return render(res, view.teacher.getViewByTarget(query.fragment), {
                today: false,
                timings: scheduleresponse.timings,
              });
            return render(res, view.teacher.getViewByTarget(query.fragment), {
              today: scheduleresponse.schedule.period,
              timings: scheduleresponse.timings,
            });
          })
          .catch((error) => {
            sendException(error);
            return render(res, view.servererror, { error });
          });
        return;
      }
      case view.teacher.target.fragment.fullweek: {
        worker.schedule
          .getSchedule(response.user)
          .then((resp) => {
            if (!resp)
              session.finish(res).then((response) => {
                if (response) return false;
              });
            return render(res, view.teacher.getViewByTarget(query.fragment), {
              schedule: resp.schedule,
              timings: resp.timings,
            });
          })
          .catch((error) => {
            sendException(error);
            return render(res, view.servererror, { error });
          });
        return;
      }
      case view.teacher.target.fragment.classroom:
        {
          const teacher = await worker.self.account.getAccount(response.user);

          const inchargeof = await worker.classroom.getClassroomByInchargeID(
            response.user,
            teacher.id
          );
          const classes = await worker.classroom.getClassroomsBySchedule(
            response.user,
            false,
            true
          );
          if (!inchargeof) {
            return render(res, view.teacher.getViewByTarget(query.fragment), {
              classroom: false,
              teacher,
              other: false,
              otherclasses: [],
            });
          } else if (classes) {
            query.classname = query.classname
              ? query.classname
              : classes.find((Class) => Class.classname == inchargeof.classname)
                  .classname;
          } else if (!query.classname) query.classname = inchargeof.classname;
          const classnames = await worker.classroom.getClassroomsBySchedule(
            response.user
          );
          if (classnames) {
            if (!classes.find((Class) => Class.classname == query.classname)) {
              return render(res, view.notfound);
            }
          }
          return render(res, view.teacher.getViewByTarget(query.fragment), {
            classroom: classes
              ? classes.find((Class) => Class.classname == query.classname)
              : inchargeof,
            pseudostudents: inchargeof.pseudostudents,
            teacher,
            otherclasses: classnames,
            other: query.classname != inchargeof.classname,
          });
        }
        break;
      case view.teacher.target.fragment.about:
        {
          const teacher = await worker.self.account.getAccount(response.user);
          const defaults = await worker.institute.getDefaultsWithAdminPrefs(
            response.user
          );
          return render(res, view.teacher.getViewByTarget(query.fragment), {
            teacher,
            defaults,
          });
        }
        break;
      default:
        return render(res, view.notfound);
    }
  } catch (error) {
    sendException(error);
    render(res, view.servererror, { error });
  }
});

teacher.post(post.self, async (req, res) => {
  const body = req.body;
  if (body.external) {
    switch (body.action) {
      case code.action.CHANGE_PASSWORD:
        return res.json({
          result: await worker.self.account.changePassword(
            body.user,
            body,
            true
          ),
        });
    }
    return;
  }
  const response = session.verify(req, client.teacher);

  if (!session.valid(response))
    return res.json({ result: code.event(code.auth.SESSION_INVALID) });
  switch (body.target) {
    case action.receive:
      return res.json({
        result: await worker.self.account.getAccount(response.user),
      });
    case action.authenticate:
      return res.json({
        result: await session.authenticate(req, res, body, client.teacher),
      });
    case "account":
      return res.json({
        result: await worker.self.handleAccount(response.user, body),
      });
    case "preferences":
      return res.json({
        result: await worker.self.handlePreferences(response.user, body),
      });
  }
});

teacher.post(post.schedule, async (req, res) => {
  const response = session.verify(req, client.teacher);
  if (!session.valid(response)) return res.json(invalidsession);
  const body = req.body;
  switch (body.action) {
    case "upload":
      return res.json({
        result: await worker.schedule.scheduleUpload(response.user, body),
      });
    case "receive":
      return res.json({
        result: await worker.schedule.getSchedule(response.user, body),
      });
    case "update":
      return res.json({
        result: await worker.schedule.scheduleUpdate(response.user, body),
      });
    case code.schedule.CREATE_BACKUP:
      {
        worker.schedule.createScheduleBackup(
          response.user,
          (filename, error) => {
            return res.json({
              result: {
                event: code.OK,
                url: `/${client.teacher}/download?type=${code.schedule.CREATE_BACKUP}&res=${filename}`,
              },
            });
            // if(error) return res.json({result:code.event(code.NO)});
          }
        );
      }
      break;
    default:
      return res.json({ result: code.event(code.server.DATABASE_ERROR) });
  }
});

teacher.get("/download*", async (req, res) => {
  const response = session.verify(req, client.teacher);

  if (!session.valid(response)) return render(res, view.forbidden);
  const query = req.query;
  if (!(query.type && query.res)) return render(res, view.notfound);
  switch (query.type) {
    case code.schedule.CREATE_BACKUP: {
      try {
        return res.download(
          path.join(
            __dirname + `/../backups/${response.user.uiid}/${query.res}`
          ),
          (err) => {
            if (err) render(res, view.notfound);
          }
        );
      } catch (error) {
        sendException(error);
        return render(res, view.notfound);
      }
    }
  }
});

teacher.post(post.classroom, async (req, res) => {
  const response = session.verify(req, client.teacher);

  if (!session.valid(response)) return res.json(invalidsession);
  const teacher = await worker.self.account.getAccount(response.user, true);
  const classroom = await worker.classroom.getClassroomByInchargeID(
    response.user,
    teacher.teacherID
  );
  const body = req.body;
  switch (body.target) {
    case "classroom":
      return res.json({
        result: await worker.classroom.manageClassroom(
          response.user,
          body,
          teacher,
          classroom
        ),
      });
    case "pseudousers":
      return res.json({
        result: await worker.pseudo.managePseudousers(
          response.user,
          body,
          teacher
        ),
      });
    case action.invite:
      return res.json({
        result: await worker.classroom.handleInvitation(
          response.user,
          body,
          classroom
        ),
      });
  }
});

teacher.post(post.sessionvalidate, async (req, res) => {
  const response = session.verify(req, client.teacher);
  return res.json({ result: response });
});

teacher.get(get.external, async (req, res) => {
  const query = req.query;
  switch (query.type) {
    case invite.type:
      {
        //invitation link
        invite
          .handleInvitation(query, client.teacher)
          .then((resp) => {
            if (!resp) return render(res, view.notfound);
            return render(res, view.userinvitaion, { invite: resp.invite });
          })
          .catch((error) => {
            return render(res, view.notfound);
          });
      }
      break;
    case invite.personalType:
      {
        invite
          .handlePersonalInvitation(query, client.teacher)
          .then((resp) => {
            if (!resp) return render(res, view.notfound);
            return render(res, view.userinvitaion, { invite: resp.invite });
          })
          .catch((e) => {
            return render(res, view.notfound);
          });
      }
      break;
    case verify.type:
      {
        //verification link
        verify
          .handleVerification(query, client.teacher)
          .then((resp) => {
            if (!resp) return render(res, view.notfound);
            return render(res, view.verification, { user: resp.user });
          })
          .catch((e) => {
            return render(res, view.servererror, { error: e });
          });
      }
      break;
    case reset.type:
      {
        //password reset link
        reset
          .handlePasswordResetLink(query, client.teacher)
          .then(async (resp) => {
            if (!resp) return render(res, view.notfound);
            return render(res, view.passwordreset, {
              user: resp.user,
              uiid: resp.uiid,
            });
          })
          .catch((e) => {
            return render(res, view.servererror, { error: e });
          });
      }
      break;
    default:
      render(res, view.servererror);
  }
});

teacher.post(post.manage, async (req, res) => {
  const body = req.body;
  if (body.external) {
    switch (body.type) {
      case reset.type:
        return res.json({
          result: await worker.self.handlePassReset(null, body),
        });
    }
  }
  const response = session.verify(req, client.teacher);

  if (!session.valid(response)) return res.json({ result: response });
  switch (body.type) {
    case verify.type:
      return res.json({
        result: await worker.self.handleVerification(response.user, body),
      });
    case reset.type:
      return res.json({
        result: await worker.self.handlePassReset(response.user, body),
      });
    default:
      return res.sendStatus(500);
  }
});

teacher.post(post.comms, async (req, res) => {
  const response = session.verify(req, client.teacher);
  if (!session.valid(response)) return res.json({ result: response });
  switch (req.body.action) {
    case action.chat:
      worker.comms.chatroom();
      break;
    case action.voicecall:
      worker.comms.voicecalling();
      break;
    case action.videocall:
      worker.comms.videocalling();
      break;
  }
});

teacher.post("/find", async (req, res) => {
  const response = session.verify(req, client.teacher);
  if (!session.valid(response)) return res.json(invalidsession);
  const inst = await worker.institute.findTeacherByTeacherID(
    response.user,
    email
  );
  result = inst
    ? code.event(code.auth.USER_EXIST)
    : code.event(code.auth.USER_NOT_EXIST);
  return res.json({ result });
});

module.exports = teacher;
