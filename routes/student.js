const express = require("express"),
  student = express.Router(),
  { code, client, view, action,get,post, clog,key } = require("../public/script/codes"),
  session = require("../workers/common/session"),
  invite = require("../workers/common/invitation"),
  {render} = require("../workers/common/inspector"),
  verify = require("../workers/common/verification"),
  reset = require("../workers/common/passwordreset"),
  worker = require("../workers/studentworker");

session.use(student,client.student);

const invalidsession = { result: code.event(code.auth.SESSION_INVALID) },
  authreqfailed = (error) => {
    return { result: code.eventmsg(code.auth.AUTH_REQ_FAILED, error) };
};

student.get(get.root, (_, res) => {
  res.redirect(worker.toLogin());
  // return render(res,view.student.landing)
});

student.get(get.authlogin, (req, res) => {
  const response = session.verify(req, client.student);
  if (!session.valid(response,client.student))
    return render(res,view.student.login, { autofill: req.query });
  let data = req.query;
  delete data[key.uid[0]];
  return res.redirect(worker.toSession(response.user.id, req.query));
});

student.post(post.auth, async (req, res) => {
  const body = req.body;
  switch (body.action) {
    case action.login:
      {
        session
          .login(req, res, client.student)
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
          .signup(req, res, client.student, body.pseudo)
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

student.get(get.session, async (req, res) => {
  let query = req.query;
  const response = session.verify(req, client.student);

  if (!session.valid(response,client.student)) return res.redirect(worker.toLogin(query));
  if (query.u != response.user.id) return res.redirect(worker.toLogin(query));
  let student = await worker.self.account.getAccount(response.user);
  if (!student)
    return session.finish(res).then((response) => {
      if (response) res.redirect(worker.toLogin(query));
    });
  if (!student.verified)
    return render(res,view.verification, { user: student });
  let classrooms = await worker.classes.getClassesByStudentID(
    response.user.uiid,
    student.id
  );
  if (student.pseudo)
    return render(res,view.student.getViewByTarget(view.student.target.dash), {
      student: student,
      target: { fragment: null },
      pseudoclasses: classrooms.pseudoclasses,
    });
  try {
    switch (query.target) {
      case view.student.target.comms: {
        const comms = await worker.comms.getRoomAndCallList(response.user);
        return render(res,view.student.getViewByTarget(query.target), {
          client: student,
          rooms: comms.rooms,
          calls: comms.calls,
        });
      }
      case view.student.target.chatroom: {
        const room = await worker.comms.getRoom(response.user, {
          rid: query.rid ? query.rid : false,
          roomname: query.roomname ? query.roomname : false,
          personid: query.personid ? query.personid : false,
        });
        if (!room) return render(res,view.notfound);
        if (room.event == code.comms.BLOCKED_FROM_ROOM)
          return render(res,view.forbidden);
        return render(res,view.student.getViewByTarget(query.target), {
          client: student,
          room,
        });
      }
      default:
        return render(res,view.student.getViewByTarget(query.target), {
          student,
          target: {
            fragment: query.fragment,
          },
        });
    }
  } catch (e) {
    clog(e);
    return res.redirect(worker.toLogin());
  }
});

student.get(get.fragment, async (req, res) => {
  //for student session fragments.
  const response = session.verify(req, client.student);
  const query = req.query;
  if(!session.valid(response,client.student)) return worker.toLogin(query);
  switch (query.fragment) {
    case view.student.target.fragment.today: {
      const scheduleresponse = await worker.schedule.getSchedule(
        response.user,
        Number(query.day)
      );
      if (!scheduleresponse)
        //no schedule
        return render(res,view.student.getViewByTarget(query.fragment), {
          today: null,
          timings: null,
        });
      return render(res,view.student.getViewByTarget(query.fragment), {
        today: scheduleresponse.schedule
          ? scheduleresponse.schedule.period
          : false,
        timings: scheduleresponse.timings,
      });
    }
    case view.student.target.fragment.fullweek: {
      worker.schedule
        .getSchedule(response.user)
        .then((resp) => {
          return render(res,view.student.getViewByTarget(query.fragment), {
            schedule: resp.schedule,
            timings: resp.timings,
          });
        })
        .catch((e) => {
          clog(e);
          return render(res,view.servererror, { error: e });
        });
      return;
    }
    case view.student.target.fragment.classroom: {
      let student = await worker.self.account.getAccount(response.user);
      let classroom = await worker.classes.getClassesByStudentID(
        response.user.uiid,
        student.id
      );
      query.classname = query.classname
        ? query.classname
        : classroom.classes.find(
            (Class) => Class.classname == response.user.classname
          ).classname;
      let classnames = await worker.classes.getClassesByStudentID(
        response.user.uiid,
        student.id,
        true
      );
      if (
        !classroom.classes.find((Class) => Class.classname == query.classname)
      ) {
        return render(res,view.notfound);
      }
      return render(res,view.student.getViewByTarget(query.fragment), {
        classroom: classroom.classes.find(
          (Class) => Class.classname == query.classname
        ),
        classes: classnames.classes,
        pseudoclasses: classnames.pseudoclasses,
      });
    }
    case view.student.target.fragment.settings: {
      let student = await worker.self.account.getAccount(response.user);
      if (!student || student.pseudo) return null;
      const defaults = await worker.institute.getDefaultsWithAdminPrefs(
        response.user
      );
      return render(res,view.student.getViewByTarget(query.fragment), {
        student,
        defaults,
      });
    }
    default:
      return render(res,view.notfound);
  }
});

student.post(post.self, async (req, res) => {
  const body = req.body;
  if (body.external) {
    switch (body.target) {
      case "account":
        return res.json({
          result: await worker.self.handleAccount(body.user, body),
        });
    }
    return;
  }
  const response = session.verify(req, client.student);

  if (!session.valid(response,client.student)) return res.json(invalidsession);
  switch (body.target) {
    case action.receive:
      return res.json({
        result: await worker.self.account.getAccount(response.user),
      });
    case action.authenticate:
      return res.json({
        result: await session.authenticate(req, res, body, client.student),
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

student.post(post.manage, async (req, res) => {
  const body = req.body;
  if (body.external) {
    switch (body.type) {
      case reset.type:
        return res.json({
          result: await worker.self.handlePassReset(null, body),
        });
    }
  }
  const response = session.verify(req, client.student);
  if (!session.valid(response,client.student)) return res.json({ result: response });
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

student.post(post.sessionvalidate, async (req, res) => {
  const response = session.verify(req, client.student);
  return res.json({ result: response });
});

student.post(post.classroom, async (req, res) => {
  const response = session.verify(req, client.student);
  if (!session.valid(response,client.student)) return res.json({ result: response });
  const body = req.body;
  switch (body.action) {
    case "request":
      return res.json({
        result: await worker.classes.handleClassRequest(response.user, body),
      });
    default:
      return res.json({ result: null });
  }
});

student.post(post.comms,async(req,res)=>{
  const response = session.verify(req, client.student);
  if (!session.valid(response,client.student)) return res.json({ result: response });
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
})

student.get(get.external, async (req, res) => {
  const query = req.query;
  switch (query.type) {
    case invite.type:
      {
        invite
          .handleInvitation(query, client.student)
          .then((resp) => {
            if (!resp) return render(res,view.notfound);
            return render(res,view.userinvitaion, { invite: resp.invite });
          })
          .catch((e) => {
            return render(res,view.notfound);
          });
      }
      break;
    case verify.type: {
      //verification link
      verify
        .handleVerification(query, client.student)
        .then((resp) => {
          if (!resp) return render(res,view.notfound);
          return render(res,view.verification, { user: resp.user });
        })
        .catch((e) => {
          return render(res,view.servererror, { error: e });
        });
      return;
    }
    case reset.type:
      {
        //pass reset link
        reset
          .handlePasswordResetLink(query, client.student)
          .then(async (resp) => {
            if (!resp) return render(res,view.notfound);
            return render(res,view.passwordreset, {
              user: resp.user,
              uiid: resp.uiid,
              classname: resp.classname,
            });
          })
          .catch((e) => {
            return render(res,view.servererror, { error: e });
          });
      }
      break;
    default:
      render(res,view.servererror);
  }
});

module.exports = student;
