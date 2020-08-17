const Admin = require("../collections/Admins"),
  Institute = require("../collections/Institutions"),
  view = require("../hardcodes/views"),
  bcrypt = require("bcryptjs"),
  code = require("../public/script/codes"),
  invite = require("./common/invitation"),
  verify = require("./common/verification"),
  reset = require("./common/passwordreset"),
  { ObjectId } = require("mongodb"),
  session = require("./common/session");

class AdminWorker {
  constructor() {
    this.self = new Self();
    this.default = new Default();
    this.users = new Users();
    this.schedule = new Schedule();
    this.invite = new Invite();
    this.vacation = new Vacations();
    this.prefs = new Preferences();
  }
  toSession = (u, query = { target: view.admin.target.dashboard }) => {
    let path = `/admin/session?u=${u}`;
    for (var key in query) {
      if (query.hasOwnProperty(key)) {
        path = `${path}&${key}=${query[key]}`;
      }
    }
    return path;
  };
  toLogin = (query = { target: view.admin.target.dashboard }) => {
    let i = 0;
    let path = "/admin/auth/login";
    for (var key in query) {
      if (query.hasOwnProperty(key)) {
        path =
          i > 0
            ? `${path}&${key}=${query[key]}`
            : `${path}?${key}=${query[key]}`;
        i++;
      }
    }
    return path;
  };
}

class Self {
  constructor() {
    class Account{
      constructor(){}
      //send feedback emails
      changePassword=async(user,body)=>{
        clog(user);
        const admin = await Admin.findOne({'_id':ObjectId(user.id)});
        if(!admin) return code.event(code.auth.USER_NOT_EXIST);
        const salt = await bcrypt.genSalt(10);
        const epassword = await bcrypt.hash(body.newpassword, salt);
        clog(epassword);
        const newpassadmin = await Admin.findOneAndUpdate(
          {_id:ObjectId(user.id)},{
          $set:{
            password:epassword
          },
          $unset:{
            rlinkexp:null
          }
        });
        return code.event(newpassadmin?code.OK:code.NO);
      }
      changeEmailID=async(user,body)=>{
        const admin = await Admin.findOne({'_id':ObjectId(user.id)});
        if(!admin) return code.event(code.auth.USER_NOT_EXIST);
        if(admin.email == body.newemail) return code.event(code.auth.SAME_EMAIL);
        const someadmin = await Admin.findOne({'email':body.newemail});
        if(someadmin) return code.event(code.auth.USER_EXIST);
        const newadmin = await Admin.findOneAndUpdate(
          {'_id':ObjectId(user.id)},
          {$set:{
            email:body.newemail,
            verified:false
          }}
        );
        if(newadmin){
          const inst = await Institute.findOneAndUpdate(
            {uiid:user.uiid},
            {$set:{
              "default.admin.email":body.newemail,
              active:false
            }}
          );
          return code.event(inst?code.OK:code.NO);
        }
        return code.event(code.NO);
      }
      deleteAccount=async(user,body)=>{
        const del = await Admin.findOneAndDelete({_id:ObjectId(user.id)})
        return code.event(del?code.OK:code.NO);
      }
    }
    this.account = new Account();
  }
  
  handleAccount = async(user,body)=>{
    clog(user);
    switch(body.action){
      case code.action.CHANGE_PASSWORD:return await this.account.changePassword(user,body);
      case code.action.CHANGE_ID:return await this.account.changeEmailID(user,body);
      case code.action.ACCOUNT_DELETE:return await this.account.deleteAccount(user);
    }
  }
  handlePreferences=async(user,body)=>{
    switch(body.preference){
      default:return ;
    }
  }
  handleVerification = async (user, body) => {
    switch (body.action) {
      case "send": {
        const linkdata = await verify.generateLink(verify.target.admin, {
          uid: user.id,
        });
        clog(linkdata);
        //todo: send email then return.
        return code.event(
          linkdata ? code.mail.MAIL_SENT : code.mail.ERROR_MAIL_NOTSENT
        );
      }
      case "check": {
        const admin = await Admin.findOne({ _id: ObjectId(user.id) });
        if (!admin) return code.event(code.auth.USER_NOT_EXIST);
        return code.event(
          admin.verified ? code.verify.VERIFIED : code.verify.NOT_VERIFIED
        );
      }
    }
  };
  handlePassReset = async(user,body)=>{
    switch (body.action) {
      case "send": {
        const linkdata = await reset.generateLink(verify.target.admin, {
          uid: user.id,
        });
        clog(linkdata);
        //todo: send email then return.
        return code.event(
          linkdata ? code.mail.MAIL_SENT : code.mail.ERROR_MAIL_NOTSENT
        );
      }break;
    }
  }
}

class Default {
  constructor() {
    class Admin{
      constructor(){}
      async setEmail(user,inst){

      }
      async setName(user,inst){

      }
      async setPhone(user,inst,body){

      }
      async getInfo(){

      }
    }
    class Institute{
      constructor(){}
      async setName(){

      }
      async setEmail(){

      }
      async setPhone(){

      }
      async getInfo(){

      }
    }
    class Timing{
      constructor(){}
      async getInfo(){

      }
      async setDaysInWeek(){

      }
      async setStartTime(){

      }
      async setPeriodDuration(){

      }
      async setBreakStartTime(){

      }
      async setBreakDuration(){

      }
      async setPeriodsInDay(){

      }
    }
    this.admin = new Admin();
    this.institute = new Institute();
    this.timings = new Timing();
  }
  handleAdmin=async(user,inst,body)=>{
    switch(body.action){
      case "getdetails":return await this.admin.getInfo()
      case "changeemail":return await this.admin.setEmail();
      case "changename":return await this.admin.setName();
      case "changephone":return await this.admin.setPhone();
    }
  }
  handleInstitute=async(user,inst,body)=>{
    switch(body.action){
      case "getdetails":return await this.institute.getInfo();
      case "changename":return await this.institute.setName();
      case "changeemail":return await this.institute.setEmail();
      case "changephone":return await this.institute.setPhone();
    }
  }
  handleTimings=async(inst,body)=>{
    switch(body.action){
      case "getdetails":return await this.timings.getInfo();
      case "changedaysinweek": return await this.timings.setDaysInWeek();
      case "changestarttime":return await this.timings.setStartTime();
      case "changeperiodminutes":return await this.timings.setPeriodDuration();
      case "changebreakstarttime":return await this.timings.setBreakStartTime();
      case "changebreakminutes":return await this.timings.setBreakDuration();
      case "changeperiodsinday":return await this.timings.setPeriodsInDay();
    }
  }
  handleRegistration = async (user, body) => {
    clog("creating inst");
    clog(body);
    //todo:validation
    const registerdoc = {
      uiid: user.uiid,
      default: {
        admin: {
          email: body.data.adminemail,
          username: body.data.adminname,
          phone: body.data.adminphone,
        },
        institute: {
          instituteName: body.data.instname,
          email: body.data.instemail,
          phone: body.data.instphone
        },
        timings: {
          startTime: body.data.starttime,
          endTime: body.data.endtime,
          breakStartTime: body.data.breakstarttime,
          periodMinutes: body.data.periodduration,
          breakMinutes: body.data.breakduration,
          periodsInDay: body.data.totalperiods,
          daysInWeek: body.data.workingdays,
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
        }
      },
      active: false,
      restricted: false,
      vacations: [],
      prefs: {},
    };
    const done = await Institute.insertOne(registerdoc);
    return code.event(
      done.insertedCount == 1
        ? code.inst.INSTITUTION_CREATED
        : code.inst.INSTITUTION_CREATION_FAILED
    );
  };
}

/**
 * For work under 'users' subdocument.
 */
class Users {
  constructor() {
    class TeacherAction {
      constructor() {}
      searchTeacher = async (inst, body) => {
        let teachers = Array();
        inst.users.teachers.forEach((teacher, tindex) => {
          if (
            String(teacher.username).toLowerCase() ==
              String(body.q).toLowerCase() ||
            String(teacher.username)
              .toLowerCase()
              .includes(String(body.q).toLowerCase()) ||
            String(teacher.teacherID) == String(body.q).toLowerCase() ||
            String(teacher.teacherID).includes(String(body.q).toLowerCase())
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
        return {
          event: code.OK,
          teachers: teachers,
        };
      };
    }
    class ClassAction {
      constructor() {}
      searchClass = async () => {
        return {};
      };
    }
    this.teachers = new TeacherAction();
    this.classes = new ClassAction();
  }
  handleUserSearch = async (inst, body) => {
    switch (body.target) {
      case "teacher":
        return await this.teachers.searchTeacher(inst, body);
      case "class":
        return await this.classes.searchClass(inst, body);
    }
  };
  handleTeacherAction=async(inst,body)=>{
    switch(body.action){

    }
  }
  handleClassAction = async(inst,body)=>{
    switch(body.action){

    }
  }
}

/**
 * For work under 'schedule' subdocument.
 */
class Schedule {
  constructor() {
    class TeacherAction {
      constructor() {}
      async scheduleUpload(inst, body) {
        let overwriting = false; //if existing teacher schedule being overwritten after completion.
        let incomplete = false; //if existing teacher schedule being rewritten without completion.
        let found = inst.schedule.teachers.some((teacher, index) => {
          if (teacher.teacherID == body.teacherID) {
            overwriting =
              teacher.days.length == inst.default.timings.daysInWeek.length;
            if (!overwriting) {
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
          return code.event(code.schedule.SCHEDULE_EXISTS);
        }
        if (incomplete) {
          //remove teacher schedule
          Institute.findOneAndUpdate(
            { uiid: inst.uiid },
            {
              $pull: {
                "schedule.teachers": { teacherID: body.teacherID },
              },
            }
          );
          found = false; //add as a new teacher schedule
        }
        let clashClass, clashPeriod, clashTeacher;
        let clashed = inst.schedule.teachers.some((teacher, _) => {
          let clashed = teacher.days.some((day, _) => {
            if (day.dayIndex == body.data.dayIndex) {
              let clashed = day.period.some((period, pindex) => {
                if (period.classname == body.data.period[pindex].classname) {
                  clashClass = period.classname;
                  clashPeriod = pindex;
                  return true;
                }
              });
              if (clashed) {
                return true;
              }
            }
          });
          if (clashed) {
            clashTeacher = teacher.teacherID;
            return true;
          }
        });
        if (clashed) {
          //if some period clashed with an existing teacher.
          return {
            event: code.schedule.SCHEDULE_CLASHED,
            clash: {
              classname: clashClass,
              period: clashPeriod,
              teacherID: clashTeacher,
            },
          };
        }
        if (found) {
          //existing teacher schedule, incomplete (new day index)
          const doc = await Institute.findOneAndUpdate(
            {
              uiid: inst.uiid,
              "schedule.teachers": {
                $elemMatch: { teacherID: body.teacherID },
              },
            },
            {
              $push: { "schedule.teachers.$[outer].days": body.data }, //new day push
            },
            {
              arrayFilters: [{ "outer.teacherID": body.teacherID }],
            }
          );
          clog("schedule appended?");
          if (doc) return code.event(code.schedule.SCHEDULE_CREATED); //new day created.
        } else {
          //no existing schedule teacherID
          const doc = await Institute.findOneAndUpdate(
            { uiid: inst.uiid },
            {
              $push: {
                "schedule.teachers": {
                  teacherID: body.teacherID,
                  days: [body.data],
                },
              }, //new teacher schedule push
            }
          );
          clog("schedule created?");
          if (doc) return code.event(code.schedule.SCHEDULE_CREATED); //new teacher new day created.
        }
      }
      /**
       * To receive data under schedule.teachers
       * @param {Document} inst
       * @param {JSON} body
       */
      async scheduleReceive(inst, body) {
        let filter, options;
        console.log(body);
        switch (body.specific) {
          case "single":
            {
              filter = {
                uiid: inst.uiid,
                "schedule.teachers": {
                  $elemMatch: { teacherID: body.teacherID },
                },
              };
              options = { projection: { _id: 0, "schedule.teachers.$": 1 } };
            }
            break;
          case "classes":
            {
              let newClasses = Array();
              inst.schedule.teachers.forEach((teacher, tindex) => {
                teacher.days.forEach((day, _) => {
                  day.period.forEach((period, _) => {
                    if (!newClasses.includes(period.classname)) {
                      newClasses.push(period.classname);
                    }
                  });
                });
              });
              clog(newClasses);
              return {
                event: code.OK,
                classes: newClasses,
              };
            }
            break;
          default: {
            filter = { uiid: inst.uiid };
            options = { projection: { _id: 0, "schedule.teachers": 1 } };
          }
        }
        const teacherInst = await Institute.findOne(filter, options);
        if (!teacherInst) {
          console.log("no");
          return code.event(code.schedule.SCHEDULE_NOT_EXIST);
        }
        switch (body.specific) {
          case "single":
            {
              console.log(teacherInst.schedule.teachers[0]);
              return {
                event: code.OK,
                schedule: teacherInst.schedule.teachers[0],
              };
            }
            break;
          case "classes":
            {
            }
            break;
          default:
            return {
              event: code.OK,
              teachers: teacherInst.schedule.teachers,
            };
        }
      }
      async scheduleUpdate(inst, body) {
        return;
      }
    }

    class ClassAction {
      constructor() {}
      async scheduleReceive(inst, body) {
        let newClasses = Array();
        inst.schedule.teachers.forEach((teacher, tindex) => {
          teacher.days.forEach((day, _) => {
            day.period.forEach((period, _) => {
              if (
                // !existingclasses.includes(period.classname) &&
                !newClasses.includes(period.classname)
              ) {
                newClasses.push(period.classname);
              }
            });
          });
        });
        clog(newClasses);
        return {
          event: code.OK,
          classes: newClasses,
        };
      }
      async scheduleUpdate(inst, body) {
        let existingclasses = Array();
        //getting existing classes
        inst.schedule.classes.forEach((Class, _) => {
          existingclasses.push(Class.classname);
        });
        clog(existingclasses);
        let newClasses = Array();
        inst.schedule.teachers.forEach((teacher, tindex) => {
          teacher.days.forEach((day, _) => {
            day.period.forEach((period, _) => {
              if (
                !existingclasses.includes(period.classname) &&
                !newClasses.includes(period.classname)
              ) {
                newClasses.push(period.classname);
              }
            });
          });
        });
        clog(newClasses);
        if (!body.confirmed) {
          return {
            event: code.OK,
            classes: newClasses,
          };
        } else {
          try {
            let done = false;
            inst.schedule.teachers.forEach((teacher, tindex) => {
              teacher.days.forEach((day, dindex) => {
                day.period.forEach((__, _) => {
                  body.data.forEach(async (c, _) => {
                    const setter = `schedule.teachers.${tindex}.days.${dindex}.period.$[outer].classname`;
                    const filter = {
                      uiid: inst.uiid,
                    };
                    const newdocument = {
                      $set: { [setter]: c.renamed },
                    };
                    const options = {
                      arrayFilters: [{ "outer.classname": c.classname }],
                    };
                    const doc = await Institute.findOneAndUpdate(
                      filter,
                      newdocument,
                      options
                    );
                    done = doc ? true : false;
                  });
                });
              });
            });
            clog(done);
            return code.event(done ? code.OK : code.NO);
          } catch (e) {
            return code.eventmsg(code.NO, e);
          }
        }
      }
    }

    this.teacher = new TeacherAction();
    this.classes = new ClassAction();
  }
  handleScheduleTeachersAction = async (inst, body) => {
    switch (body.action) {
      case "upload":
        return await this.teacher.scheduleUpload(inst, body);
      case "receive":
        return await this.teacher.scheduleReceive(inst, body);
      case "update":
        return await this.teacher.scheduleUpdate(inst, body);
      default:
        return code.event(code.server.DATABASE_ERROR);
    }
  };
  handleScheduleClassesAction = async (inst, body) => {
    switch (body.action) {
      case "receive":
        return await this.classes.scheduleReceive(inst, body);
      case "update":
        return await this.classes.scheduleUpdate(inst, body);
      default:
        return code.event(code.server.DATABASE_ERROR);
    }
  };
}

class Invite {
  constructor() {
    class TeacherAction {
      constructor() {}
      inviteLinkCreation = async (user, inst, body) => {
        clog("post create link ");
        if (inst.invite[body.target].active == true) {
          clog("already active");
          const validresponse = invite.checkTimingValidity(
            inst.invite[body.target].createdAt,
            inst.invite[body.target].expiresAt,
            inst.invite[body.target].createdAt
          );
          if (invite.isActive(validresponse)) {
            let link = invite.getTemplateLink(
              user.id,
              inst._id,
              body.target,
              inst.invite[body.target].createdAt
            );
            clog("templated");
            clog(link);
            clog("returning existing link");
            return {
              event: code.invite.LINK_EXISTS,
              link: link,
              exp: inst.invite[body.target].expiresAt,
            };
          }
        }
        clog("creating new link");
        const genlink = await invite.generateLink(
          user.id,
          inst._id,
          body.target,
          body.daysvalid
        );
        const path = "invite." + body.target;
        const document = await Institute.findOneAndUpdate(
          { uiid: inst.uiid },
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
        clog("returning");
        return document
        ? {
              event: code.invite.LINK_CREATED,
              link: genlink.link,
              exp: genlink.exp,
            }
            : code.event(code.invite.LINK_CREATION_FAILED);
      };
      
      inviteLinkDisable = async (inst, body) => {
        clog("post disabe link");
        const path = "invite." + body.target;
        const doc = await Institute.findOneAndUpdate(
          { uiid: inst.uiid },
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
        clog("returning");
        return doc
        ? code.event(code.invite.LINK_DISABLED)
        : code.event(code.invite.LINK_DISABLE_FAILED);
      };
    }
    this.teacher = new TeacherAction();
  }
  handleInvitation = async (user, inst, body) => {
    switch (body.action) {
      case "create":
        return await this.teacher.inviteLinkCreation(user, inst, body);
      case "disable":
        return await this.teacher.inviteLinkDisable(inst, body);
    }
  };
}

class Vacations {
  constructor() {}
}

class Preferences {
  constructor() {}
}

let clog = (msg) => console.log(msg);
module.exports = new AdminWorker();
