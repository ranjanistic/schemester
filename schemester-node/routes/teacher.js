const { ObjectId } = require("mongodb");

const express = require("express"),
  router = express.Router(),
  cookieParser = require("cookie-parser"),
  { check, validationResult } = require("express-validator"),
  code = require("../hardcodes/events"),
  view = require("../hardcodes/views"),
  session = require("../workers/session"),
  invite = require("../workers/invitation"),
  Institute = require("../collections/Institutions"),
  Admin = require("../collections/Admins");

const sessionsecret = session.teachersessionsecret;
router.use(cookieParser(sessionsecret));

router.get("/", (req, res)=>{
  res.redirect(toLogin(view.teacher.target.today));
});

router.get("/auth/login*", (req, res) => {
  session.verify(req,sessionsecret).then((response) => {
    if (!session.valid(response)) {
      const autofill = req.query;
      res.render(view.teacher.login, { autofill });
    } else {
      res.redirect(toSession(response.user.id,req.query.target));
    }
  }).catch(error=>{
    res.render(view.servererror,{error});
  });
});

router.post("/auth/login",async (req, res) => {
    result = code.event(code.auth.AUTH_FAILED);
    clog(req.body);
    session.login(req,res,sessionsecret).then(response=>{
      clog(response);
      result = response;
      return res.json({result});
    }).catch(error=>{
      clog(error);
    })
});

router.post("/auth/logout", (_, res) => {
  session.finish(res).then((response) => {
    let result = response;
    return res.json({ result });
  });
});

router.post("/auth/signup", async (req, res) => {
  let result = code.event(code.auth.ACCOUNT_CREATION_FAILED);
  clog(req.body);
  session.signup(req,res,sessionsecret).then((response)=>{
    result = response;
    clog("in teacher signup post");
    clog(response);
    return res.json({result});
  }).catch(error=>{
    clog("in teacher signup post error");
    clog(error);
    return res.json({result});
  });
});

router.get("/session*", async (req, res) => {
  const data = req.query;
  session.verify(req, sessionsecret).then(async (response) => {
      clog(response);
      if(!session.valid(response)) {
        clog("invalid");
        res.redirect(toLogin(data.target));
      } else {
        clog("session valid");
        clog(response);
        if(data.u != response.user.id){
          res.redirect(toLogin(data.target));
        } else {
          clog("u = user.id");
          const userinst = await Institute.findOne({uiid:response.user.uiid,"users.teachers":{$elemMatch:{"_id":ObjectId(response.user.id)}}},
            {projection:{_id:0,"users.teachers.$":1}}
          );
          if(!userinst){
            session.finish(res).then(response=>{
              if(response) res.redirect(toLogin(data.target));
            });
          } else {  //user teacher exists
            clog("user teacher:");
            const teacher = getTeacherShareData(userinst.users.teachers[0]);
            clog(teacher);
            if(!teacher.verified){
              return res.render(view.verification,{user:teacher});
            }
            const scheduleinst = await Institute.findOne({uiid:response.user.uiid,"schedule.teachers":{$elemMatch:{"teacherID":teacher.id}}},
              {projection:{_id:0,"schedule.teachers.$":1}}
            );
            let inst;
            if(!scheduleinst){  //no schedule for this user teacher
              clog("no schedule");
              inst = await Institute.findOne({uiid:response.user.uiid,"users.teachers":{$elemMatch:{"teacherID":teacher.id}}},
                {
                  projection:{
                    _id:1,
                    default:1,
                    "users.teachers.$":1,
                  }
                }
              );
              clog(inst);
              data.target = view.teacher.target.addschedule;
              return res.render(view.teacher.addschedule,{user:teacher,inst})
            } else {  //schedule exists;
              const schedule = scheduleinst.schedule.teachers[0];
              clog("schedule");
              clog(schedule);
              inst = await Institute.findOne({uiid:response.user.uiid,"users.teachers":{$elemMatch:{"teacherID":teacher.teacherID}}},
              {
                projection:{
                  _id:1,
                  uiid:1,
                  default:1,
                  "users.teachers.$":1,
                  schedule:1
                }
              }
              );
              if(data.target==view.teacher.target.addschedule||data.target==undefined){
                return res.redirect(toLogin(view.teacher.target.today));
              }
              try{
                res.render(view.teacher.getViewByTarget(data.target),{teacher,inst});
              }catch(e){
                clog(e);
                data.target = view.teacher.target.today;
                res.redirect(toLogin(data.target));
              }
            }
          }
        }
      }
    }
  )}
);

router.post('/schedule',async (req,res)=>{
  const data = req.query;
  session.verify(req, sessionsecret).then(async (response) => {
    if(!session.valid(response)){
      return res.json({result:code.auth.SESSION_INVALID});
    }
    switch (req.body.action) {
      case "upload":{
        const body = req.body;
        let inst = await Institute.findOne({uiid: response.user.uiid});
        if (!inst) return res.json({ result:code.inst.INSTITUTION_NOT_EXISTS});
        
        let overwriting = false;//if existing teacher schedule being overwritten after completion.
        let incomplete = false;//if existing teacher schedule being rewritten without completion.
        let found = inst.schedule.teachers.some((teacher, index) => {
          if (teacher.teacherID == body.teacherID) {
            if(teacher.days.length == inst.default.timings.daysInWeek.length){
              overwriting = true;
            } else{
              incomplete = teacher.days.some((day,index)=>{
                if(body.data.dayIndex <= day.dayIndex){
                  return true;
                }
              });
            }
            return true;
          }
        });
        if(overwriting){  //completed schedule, must be edited from schedule view.
          result = code.event(code.schedule.SCHEDULE_EXISTS);
          return res.json({result});
        }
        if(incomplete){ //remove teacher schedule
          Institute.findOneAndUpdate({ uiid:response.user.uiid },{
            $pull:{'schedule.teachers': { teacherID: body.teacherID }}
          });
          found = false;  //add as a new teacher schedule
        }
        if (found) {//existing teacher schedule, incomplete (new day index)
          const filter = {
            uiid: response.user.uiid,
            "schedule.teachers":{$elemMatch:{"teacherID":body.teacherID}}//existing schedule teacherID
          };
          const newdocument = {
            $push: {"schedule.teachers.$[outer].days":body.data}//new day push
          };
          const options = { 
            "arrayFilters":[{"outer.teacherID":body.teacherID}]
          };
          let doc = await Institute.findOneAndUpdate(filter,newdocument,options);
          clog("schedule appended?");
          if (doc) {
            result = code.event(code.schedule.SCHEDULE_CREATED);
            return res.json({ result });  //new day created.
          }
        } else {  //no existing schedule teacherID
          const filter = { uiid: response.user.uiid }
          const newdocument = {
            $push: {"schedule.teachers": {teacherID: body.teacherID, days: [body.data]}}  //new teacher schedule push
          };
          let doc = await Institute.findOneAndUpdate(filter,newdocument);
          clog("schedule created?");
          if (doc) {
            result = code.event(code.schedule.SCHEDULE_CREATED);
            return res.json({ result });  //new teacher new day created.
          }
        }
      }break;
      case "update":{}break;
    }

  }).catch(e=>{
    clog(e);
  })

})

const getTeacherShareData = (data = {}) => {
  return {
    isTeacher:true,
    [session.sessionUID]: data._id,
    username: data.username,
    [session.sessionID]: data.teacherID,
    createdAt: data.createdAt,
    verified: data.verified,
    vlinkexp:data.vlinkexp
  };
};

let result = {};

router.post("/session/validate",(req,res)=>{
  session.verify(req,sessionsecret).then(response=>{
    if(session.valid(response)){
      clog("isvalidteacher");
      result = code.event(code.auth.SESSION_VALID);
    } else {
      clog("isvalidteachernot");
      result = response
    };
  }).catch(error=>{
    result = code.eventmsg(code.auth.AUTH_REQ_FAILED,error);
  });
  return res.json({result});
})

router.get("/external*", async (req, res) => {
  switch (req.query.type) {
    case invite.type:
      {
        const query = req.query;
        let _id = req.query.in;
        try {
          const inst = await Institute.findOne({ _id:ObjectId(query.in) });
          if (inst) {
            clog("inst true");
            const admin = await Admin.findOne({ _id:ObjectId(query.ad) });
            if (inst.invite.teacher.active) {
              if (admin) {
                if (admin.uiid == inst.uiid) {
                  const creation = inst.invite.teacher.createdAt;
                  const expires = inst.invite.teacher.expiresAt;
                  const response = invite.checkTimingValidity(
                    creation,
                    expires,
                    query.t
                  );
                  clog(response);
                  if (invite.isActive(response)) {
                    const invite = {
                      valid: true,
                      uiid: inst.uiid,
                      adminemail: admin.email,
                      adminName: admin.username,
                      instname: inst.default.institute.instituteName,
                      expireAt: expires,
                      target: "teacher",
                    };
                    clog(invite);
                    res.render(view.userinvitaion, { invite });
                  } else if (invite.isExpired(response)) {
                    const invite = {
                      valid: false,
                      uiid: inst.uiid,
                      adminemail: admin.email,
                      adminName: admin.username,
                      instname: inst.default.institute.instituteName,
                      expireAt: expires,
                      target: "teacher",
                    };
                    clog(invite);
                    return res.render(view.userinvitaion, { invite });
                  } else {
                    throw Error("Invalid link");
                  }
                } else {
                  throw Error("uiidmismatch");
                }
              } else {
                throw Error("admin null");
              }
            } else {
              let expires = inst.invite.teacher.expiresAt;
              const invite = {
                valid: false,
                uiid: inst.uiid,
                adminemail: admin.email,
                adminName: admin.username,
                expireAt:expires,
                instname: inst.default.institute.instituteName,
                target: "teacher",
              };
              clog(invite);
              return res.render(view.userinvitaion, { invite });
            }
          } else {
            throw Error("institution null");
          }
        } catch (e) {
          clog(e);
          return res.render(view.notfound);
        }
      }
      break;
    default:
      res.render(view.notfound);
  }
});

router.post('/find',async (req,res)=>{
  const {email,uiid} = req.body;
  const inst = await Institute.findOne({uiid: uiid,"users.teachers":{$elemMatch:{"teacherID":email}}});
  clog("findings:");
  clog(inst);
  result = inst?code.event(code.auth.USER_EXIST):code.event(code.auth.USER_NOT_EXIST);
  return res.json({result});
});

const toLogin =(target = view.teacher.target.today)=>`/teacher/auth/login?target=${target}`;
const toSession =(u,target = view.teacher.target.today)=>`/teacher/session?u=${u}&target=${target}`;
module.exports = router;
let clog = (msg) => console.log(msg);
