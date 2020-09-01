const Admin = require("../config/db").getAdmin(),
  Institute = require("../config/db").getInstitute(),
  view = require("../hardcodes/views"),
  bcrypt = require("bcryptjs"),
  code = require("../public/script/codes"),
  invite = require("./common/invitation"),
  verify = require("./common/verification"),
  reset = require("./common/passwordreset"),
  share = require("./common/sharedata"),
  { ObjectId } = require("mongodb"),
  session = require("./common/session");

class AdminWorker {
  constructor() {
    this.self = new Self();
    this.default = new Default();
    this.users = new Users();
    this.schedule = new Schedule();
    this.invite = new Invite();
    this.pseudo = new PseudoUsers();
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
  async getInstitute(user){
    const inst = await Institute.findOne({uiid:user.uiid});
    return inst?inst:code.event(code.NO);
  }
}

class Self {
  constructor() {
    class Account {
      constructor() {
        this.defaults = new Default();
        this.username = "username";
        this.email = "email";
        this.password = "password";
        this.uiid = "uiid";
        this.createdAt = "createdAt";
        this.verified = "verified";
        this.vlinkexp = "vlinkexp";
        this.rlinkexp = "rlinkexp";
      }

      async getAccount(user){
        const userdoc = await Admin.findOne({"_id":ObjectId(user.id)});
        return userdoc?userdoc:code.event(code.NO);
      }

      //send feedback emails

      async createAccount(newadmin) {
        const result = await Admin.insertOne(newadmin);
        return result.insertedCount == 0 ?code.event(code.NO): result.ops[0];
      }

      /**
       *
       */
      changeName = async (user, body) => {
        const newadmin = await Admin.findOneAndUpdate(
          { _id: ObjectId(user.id) },
          { $set: { [this.username]: body.newname } }
        );
        return newadmin
          ? code.event(
              (await this.defaults.admin.setName(user, body))
                ? code.OK
                : code.NO
            )
          : code.event(code.NO);
      };
      /**
       *
       */
      changePassword = async (user, body) => {
        const salt = await bcrypt.genSalt(10);
        const epassword = await bcrypt.hash(body.newpassword, salt);
        const newpassadmin = await Admin.findOneAndUpdate(
          { _id: ObjectId(user.id) },
          {
            $set: {
              [this.password]: epassword,
            },
            $unset: {
              [this.rlinkexp]: null,
            },
          }
        );
        return code.event(newpassadmin ? code.OK : code.NO);
      };

      /**
       *
       */
      changeEmailID = async (user, admin, body) => {
        if (admin.email == body.newemail)
          return code.event(code.auth.SAME_EMAIL);
        const someadmin = await Admin.findOne({ email: body.newemail });
        if (someadmin) return code.event(code.auth.USER_EXIST);
        const newadmin = await Admin.findOneAndUpdate(
          { _id: ObjectId(user.id) },
          {
            $set: {
              [this.email]: body.newemail,
              verified: false,
            },
          }
        );
        return newadmin
          ? code.event(
              (await this.defaults.admin.setEmail(user, body))
                ? code.OK
                : code.NO
            )
          : code.event(code.NO);
      };

      /**
       *
       */
      changePhone = async (user, body) => {
        return code.event(
          (await this.defaults.admin.setPhone(user, body)) ? code.OK : code.NO
        );
      };

      /**
       *
       */
      deleteAccount = async (user) => {
        const del = await Admin.findOneAndDelete({ _id: ObjectId(user.id) });
        return code.event(del ? code.OK : code.NO);
      };
    }
    class Preferences {
      constructor() {
        this.object = `prefs`;
        this.showemailtoteacher = "showemailtoteacher";
        this.showphonetoteacher = "showphonetoteacher";
        this.showemailtostudent = "showemailtostudent";
        this.showphonetostudent = "showphonetostudent";
      }
      getSpecificPath(specific) {
        return `${this.object}.${specific}`;
      }
      async setPreference(user, body) {
        let value;
        switch (body.specific) {
          case this.showemailtoteacher:
            {
              value = body.show;
            }
            break;
          case this.showphonetoteacher:
            {
              value = body.show;
            }
            break;
          case this.showemailtostudent:
            {
              value = body.show;
            }
            break;
          case this.showphonetostudent:
            {
              value = body.show;
            }
            break;
          default:
            return null;
        }
        const adoc = await Admin.findOneAndUpdate(
          { _id: ObjectId(user.id) },
          {
            $set: {
              [this.getSpecificPath(body.specific)]: value,
            },
          }
        );
        return code.event(adoc ? code.OK : code.NO);
      }
      async getPreference(user, body) {
        switch (body.specific) {
          case this.showemailtoteacher:
            break;
          case this.showphonetoteacher:
            break;
          case this.showemailtostudent:
            break;
          case this.showphonetostudent:
            break;
          default: {
            const adoc = await Admin.findOne({ _id: ObjectId(user.id) });
            return code.event(adoc ? adoc.prefs : code.NO);
          }
        }
        const adoc = await Admin.findOne({ _id: ObjectId(user.id) });
        clog(adoc[this.getSpecificPath(body.specific)]);
        return code.event(
          adoc ? adoc[this.getSpecificPath(body.specific)] : code.NO
        );
      }
    }
    this.account = new Account();
    this.prefs = new Preferences();
  }

  handleAccount = async (user, body, admin) => {
    switch (body.action) {
      case code.action.CHANGE_NAME:
        return await this.account.changeName(user, body);
      case code.action.CHANGE_PASSWORD:
        return await this.account.changePassword(user, body);
      case code.action.CHANGE_ID:
        return await this.account.changeEmailID(user, admin, body);
      case code.action.CHANGE_PHONE:
        return await this.account.changePhone(user, body);
      case code.action.ACCOUNT_DELETE:
        return await this.account.deleteAccount(user);
    }
  };
  handlePreferences = async (user, body) => {
    switch (body.action) {
      case "set":
        return await this.prefs.setPreference(user, body);
      case "get":
        return await this.prefs.getPreference(user, body);
    }
  };
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
  handlePassReset = async (user, body) => {
    switch (body.action) {
      case "send":
        {
          const linkdata = await reset.generateLink(verify.target.admin, {
            uid: user.id,
          });
          clog(linkdata);
          //todo: send email then return.
          return code.event(
            linkdata ? code.mail.MAIL_SENT : code.mail.ERROR_MAIL_NOTSENT
          );
        }
        break;
    }
  };
}

class Default {
  constructor() {
    const object = "default";
    class Admin {
      constructor() {
        this.object = "admin";
        this.path = `${object}.${this.object}`;
        this.namepath = `${this.path}.username`;
        this.emailpath = `${this.path}.email`;
        this.phonepath = `${this.path}.phone`;
      }
      async setEmail(user, body) {
        const newinst = await Institute.findOneAndUpdate(
          { uiid: user.uiid },
          {
            $set: {
              [this.emailpath]: body.newemail,
            },
          }
        );
        return code.event(newinst ? code.OK : code.NO);
      }
      async setName(user, body) {
        const newinst = await Institute.findOneAndUpdate(
          { uiid: user.uiid },
          {
            $set: {
              [this.namepath]: body.newname,
            },
          }
        );
        return code.event(newinst ? code.OK : code.NO);
      }
      async setPhone(user, body) {
        const newinst = await Institute.findOneAndUpdate(
          { uiid: user.uiid },
          {
            $set: {
              [this.phonepath]: body.newphone,
            },
          }
        );
        return code.event(newinst ? code.OK : code.NO);
      }
      async getInfo() {}
    }
    class Institution {
      constructor() {
        this.object = "institute";
        this.path = `${object}.${this.object}`;
        this.namepath = `${this.path}.instituteName`;
        this.emailpath = `${this.path}.email`;
        this.phonepath = `${this.path}.phone`;
      }
      async setName(user, body) {
        const newinst = await Institute.findOneAndUpdate(
          { uiid: user.uiid },
          { $set: { [this.namepath]: body.newname } }
        );
        return code.event(newinst ? code.OK : code.NO);
      }
      async setEmail(user, body) {
        const newinst = await Institute.findOneAndUpdate(
          { uiid: user.uiid },
          { $set: { [this.emailpath]: body.newemail } }
        );
        return code.event(newinst ? code.OK : code.NO);
      }
      async setPhone(user, body) {
        const newinst = await Institute.findOneAndUpdate(
          { uiid: user.uiid },
          { $set: { [this.phonepath]: body.newphone } }
        );
        return code.event(newinst ? code.OK : code.NO);
      }
      async getInfo() {}
    }
    class Timing {
      constructor() {
        this.object = "timings";
        this.path = `${object}.${this.object}`;
        this.startpath = `${this.path}.startTime`;
        this.breakstartpath = `${this.path}.breakStartTime`;
        this.periodminpath = `${this.path}.periodMinutes`;
        this.breakminpath = `${this.path}.breakMinutes`;
        this.totalperiodspath = `${this.path}.periodsInDay`;
        this.daysinweekpath = `${this.path}.daysInWeek`;
      }
      async setStartTime(user, body) {
        const newinst = await Institute.findOneAndUpdate(
          { uiid: user.uiid },
          { $set: { [this.startpath]: body.start } }
        );
        return code.event(newinst ? code.OK : code.NO);
      }
      async setBreakStartTime(user, body) {
        const newinst = await Institute.findOneAndUpdate(
          { uiid: user.uiid },
          { $set: { [this.breakstartpath]: body.breakstart } }
        );
        return code.event(newinst ? code.OK : code.NO);
      }
      async setPeriodDuration(user, body) {
        const newinst = await Institute.findOneAndUpdate(
          { uiid: user.uiid },
          { $set: { [this.periodminpath]: Number(body.periodduration) } }
        );
        return code.event(newinst ? code.OK : code.NO);
      }
      async setBreakDuration(user, body) {
        clog(body);
        const newinst = await Institute.findOneAndUpdate(
          { uiid: user.uiid },
          { $set: { [this.breakminpath]: Number(body.breakduration) } }
        );
        return code.event(newinst ? code.OK : code.NO);
      }

      async setPeriodsInDay(user, body) {
        const newinst = await Institute.findOneAndUpdate(
          { uiid: user.uiid },
          { $set: { [this.totalperiodspath]: Number(body.totalperiods) } }
        );
        return code.event(newinst ? code.OK : code.NO);
      }
      async setDaysInWeek(user, body) {
        const newinst = await Institute.findOneAndUpdate(
          { uiid: user.uiid },
          { $set: { [this.daysinweekpath]: body.daysinweek } }
        );
        return code.event(newinst ? code.OK : code.NO);
      }
      async getInfo() {}
    }
    this.admin = new Admin();
    this.institute = new Institution();
    this.timings = new Timing();
  }
  async getDefaults(user){
    const doc = await Institute.findOne({uiid:user.uiid},{
      projection:{"default":1}
    });
    return doc?doc.default:code.event(code.NO);
  }
  handleAdmin = async (user, inst, body) => {
    switch (body.action) {
      case code.action.CHANGE_NAME:
        return await this.admin.setName();
      case code.action.CHANGE_ID:
        return await this.admin.setEmail();
      case code.action.CHANGE_PHONE:
        return await this.admin.setPhone();
    }
  };
  handleInstitute = async (user, body) => {
    switch (body.action) {
      case code.action.CHANGE_NAME:
        return await this.institute.setName(user, body);
      case code.action.CHANGE_ID:
        return await this.institute.setEmail(user, body);
      case code.action.CHANGE_PHONE:
        return await this.institute.setPhone(user, body);
    }
  };
  handleTimings = async (user, body) => {
    switch (body.action) {
      case code.action.CHANGE_START_TIME:
        return await this.timings.setStartTime(user, body);
      case code.action.CHANGE_BREAK_START_TIME:
        return await this.timings.setBreakStartTime(user, body);
      case code.action.CHANGE_PERIOD_DURATION:
        return await this.timings.setPeriodDuration(user, body);
      case code.action.CHANGE_BREAK_DURATION:
        return await this.timings.setBreakDuration(user, body);
      case code.action.CHANGE_TOTAL_PERIODS:
        return await this.timings.setDaysInWeek(user, body);
      case code.action.CHANGE_WORKING_DAYS:
        return await this.timings.setPeriodsInDay(user, body);
    }
  };
  handleRegistration = async (user, body) => {
    //todo:validation
    clog(body.data);
    const existingInst = await Institute.findOne({ uiid: user.uiid });
    if (existingInst) {
      const doc = Institute.findOneAndUpdate(
        { uiid: user.uiid },
        {
          $set: {
            default: body.data.default,
          },
        }
      );
      return code.event(
        doc
          ? code.inst.INSTITUTION_CREATED
          : code.inst.INSTITUTION_CREATION_FAILED
      );
    }
    const registerdoc = {
      uiid: user.uiid,
      default: body.data.default,
      users: {
        teachers: [],
        classes: [],
      },
      pseudousers:{
        teachers:[],
        classes:[],
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
      },
      restricted: false,
      vacations: [],
      preferences: {},
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
        inst.users.teachers.forEach((teacher, t) => {
          if (
            String(teacher.username)
              .toLowerCase()
              .includes(String(body.q).toLowerCase()) ||
            String(teacher.teacherID)
              .toLowerCase()
              .includes(String(body.q).toLowerCase())
          ) {
            teachers.push({
              username: teacher.username,
              teacherID: teacher.teacherID,
              teacherUID: teacher._id,
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
      searchClass = async (inst, body) => {
        let classes = Array();
        inst.users.classes.forEach((Class, t) => {
          if (
            String(Class.classname)
              .toLowerCase()
              .includes(String(body.q).toLowerCase()) ||
            String(Class.inchargeID)
              .toLowerCase()
              .includes(String(body.q).toLowerCase())
          ) {
            classes.push({
              classname: Class.classname,
              inchargeID: Class.inchargeID,
              classUID: Class._id,
            });
          }
        });
        clog(classes);
        return {
          event: code.OK,
          classes: classes,
        };
      };
    }
    this.teachers = new TeacherAction();
    this.classes = new ClassAction();
  }
  async getUsers(user){
    const userdoc = await Institute.findOne({uiid:user.uiid},{
      projection:{"users":1}
    });
    return userdoc?userdoc.users:code.event(code.NO);
  }
  handleUserSearch = async (inst, body) => {
    switch (body.target) {
      case "teacher":
        return await this.teachers.searchTeacher(inst, body);
      case "student":
        return await this.classes.searchClass(inst, body);
    }
  };
  handleTeacherAction = async (inst, body) => {
    switch (body.action) {
    }
  };
  handleClassAction = async (inst, body) => {
    switch (body.action) {
    }
  };
}

/**
 * For work under 'schedule' subdocument.
 */
class Schedule {
  constructor() {
    const defaults = new Default();
    class TeacherAction {
      constructor() {}
      async scheduleUpload(inst, body) {
        let overwriting = false; //if existing teacher schedule being overwritten after completion.
        let incomplete = false; //if existing teacher schedule being rewritten without completion.
        let tid;
        let found = inst.schedule.teachers.some((teacher) => {
          if (teacher.teacherID == body.teacherID) {
            overwriting = teacher.days.length == inst.default.timings.daysInWeek.length;
            tid = teacher.teacherID;
            if (!overwriting) {
              incomplete = teacher.days.some((day) => {
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
          const found = inst.users.teachers.some((teacher)=>{
            if(teacher.teacherID == tid){
              tid = teacher._id;
              return true;
            }
          })
          clog("here");
          return found?{
            event:code.schedule.SCHEDULE_EXISTS,
            uid:tid
          }:{
            event:code.schedule.SCHEDULE_EXISTS,
            id:tid
          };
        }

        if (incomplete) { //remove incomplete schedule teacher
          await Institute.findOneAndUpdate({ uiid: inst.uiid },{
            $pull: {
              "schedule.teachers": { teacherID: body.teacherID },
            },
          });
          found = false; //add as a new teacher schedule
        }
        let clashClass, clashPeriod, clashTeacher;
        let clashed = inst.schedule.teachers.some((teacher) => {  //period clash checking
          if(teacher.teacherID!=body.teacherID){
            let clashed = teacher.days.some((day) => {
              if (day.dayIndex == body.data.dayIndex) {
                let clashed = day.period.some((period, pindex) => {
                  if (period.classname == body.data.period[pindex].classname && period.classname != code.schedule.FREE) {
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
          }
        });
        if (clashed) {
          //if some period clashed with an existing teacher.
          const found = inst.users.teachers.some((teacher)=>{
            if(teacher.teacherID == clashTeacher){
              tid = teacher._id;
              return true;
            }
          });
          clog(found);
          return {
            event: code.schedule.SCHEDULE_CLASHED,
            clash: found?{
              classname: clashClass,
              period: clashPeriod,
              id: clashTeacher,
              uid:tid,
            }:{classname: clashClass,
              period: clashPeriod,
              id: clashTeacher,
            },
          };
        }
        if (found) {
          //existing teacher schedule, incomplete (new day index)
          const doc = await Institute.findOneAndUpdate({
            uiid: inst.uiid,
            "schedule.teachers": {
              $elemMatch: { teacherID: body.teacherID },
            },
          },{
            $push: { "schedule.teachers.$.days": body.data }, //new day push
          });
          clog("schedule appended?");
          return code.event(doc.value?code.schedule.SCHEDULE_CREATED:code.schedule.SCHEDULE_NOT_CREATED); //new day created.
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
          return code.event(doc.value?code.schedule.SCHEDULE_CREATED:code.schedule.SCHEDULE_NOT_CREATED); //new day created.
        }
      }

      /**
       * To receive data under schedule.teachers
       * @param {Document} inst
       * @param {JSON} body
       * @returns {Promise} success event,unique classes
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
          case "classes":{
              let newClasses = Array();
              inst.schedule.teachers.forEach((teacher) => {
                teacher.days.forEach((day) => {
                  day.period.forEach((period) => {
                    if (!newClasses.includes(period.classname) && period.classname != code.schedule.FREE) {
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
      async scheduleUpdate(user, inst, body) {
        switch (body.specific) {
          case "renameclass":{
              if (body.teacherID) {
                clog(body);
                const teacherdoc = await Institute.findOne({uiid:user.uiid,"schedule.teachers":{$elemMatch:{"teacherID":body.teacherID}}});
                if(!teacherdoc) return code.event(code.auth.USER_NOT_EXIST);
                //check clash with other teachers
                let clashID,clashUID;
                const clash = inst.schedule.teachers.some((teacher, t) => {
                  if (teacher.teacherID != body.teacherID) {
                    const clash = teacher.days.some((day, d) => {
                      if (day.dayIndex == body.dayIndex) {
                        if(day.period[body.period].classname == body.newclassname){
                          clashID = teacher.teacherID;
                          return true;
                        }
                      }
                    });
                    return clash;
                  }
                });
                if (clash) return {
                  event:code.schedule.SCHEDULE_CLASHED,
                  clash:{
                    id:clashID,
                  }
                }; //clashed
                //only change in class shift of a teacher
                const path = `schedule.teachers.$[outer].days.$[outer1].period.${body.period}.classname`;
                const tscheduledoc = await Institute.findOneAndUpdate(
                  {
                    uiid: user.uiid,
                    "schedule.teachers": {
                      $elemMatch: { teacherID: body.teacherID },
                    },
                  },
                  {
                    $set: {
                      [path]: body.newclassname,
                    },
                  },
                  {
                    arrayFilters: [
                      { "outer.teacherID": body.teacherID },
                      { "outer1.dayIndex": body.dayIndex },
                    ],
                  }
                );
                if(!inst.schedule.classes.length){
                  clog(tscheduledoc.value);
                  return code.event(tscheduledoc.value ? code.OK : code.NO);
                }
                if(!tscheduledoc.value) return code.event(code.NO);
                clog("updating given teacherid classname with given teacherid");
                //change in class accordingly
                const path1 = `schedule.classes.$[outer].days.$[outer2].period.${body.period}.teacherID`;
                let classdoc = await Institute.updateOne({uiid:user.uiid},{
                  $set:{
                    [path1]:body.teacherID,
                  }
                },{
                  arrayFilters:[{"outer.classname":body.newclassname},{"outer2.dayIndex":body.dayIndex}]
                });
                return code.event(classdoc.result.nModified?code.OK:code.NO);
              } else {
                //todo: change in classname of all teachers (correction type)
                clog(body);
                try{
                let result = await Promise.all(inst.schedule.teachers.map(async(teacher)=>{
                  return await Promise.all(teacher.days.map(async(day)=>{
                    return await Promise.all(day.period.map(async(period,p)=>{
                      if(period.classname == body.oldclassname){
                        body['teacherID'] = teacher.teacherID;
                        body['dayIndex'] = day.dayIndex;
                        body['period'] = p;
                          const res = await this.scheduleUpdate(user,inst,body);
                          if(res.event == code.schedule.SCHEDULE_CLASHED){
                            res.clash['targetid'] = body.teacherID;
                            res.clash['targetday'] = body.dayIndex;
                            res.clash['targetperiod'] = body.period;
                            clog("throwing");
                            throw res;
                          }
                          clog("returning");
                        return res;
                      };
                    }));
                  }));
                }));
                  clog("result");
                  clog(result);
                  return code.event(code.OK);
                }catch(e){
                  clog("catched");
                  return e;
                }
              }
            }
            break;
          case "renamesubject":{
              clog(body);
              if (body.teacherID) {
                //only change in subject shift of a teacher
                const path = `schedule.teachers.$[outer].days.$[outer1].period.${body.period}.subject`;
                const instdoc = await Institute.findOneAndUpdate({
                    uiid: user.uiid,
                    "schedule.teachers": {
                      $elemMatch: { teacherID: body.teacherID },
                    },
                  },
                  {
                    $set: {
                      [path]: body.newsubject,
                    },
                  },
                  {
                    arrayFilters: [
                      { "outer.teacherID": body.teacherID },
                      { "outer1.dayIndex": body.dayIndex },
                    ],
                  }
                );
                clog(instdoc);
                if(inst.schedule.classes.length){
                  const cpath =  `schedule.classes.$[outer].days.$[outer1].period.${body.period}.subject`;
                  const cdoc = await Institute.findOneAndUpdate({
                    uiid:user.uiid,
                  },{
                    $set:{
                      [cpath]:body.newsubject
                    }
                  },{
                    arrayFilters:[{"outer.classname":body.classname},{"outer1.dayIndex":body.dayIndex}]
                  });
                  clog(cdoc);
                  return code.event(cdoc.value?code.OK:code.NO);
                }
                return code.event(instdoc.value?code.OK:code.NO);
              } else {

              } //change in subject of all teachers (correction type)
            }
            break;
          case "switchweekdays":
            {
              const daysinweek = Array();
              try{
                let result = await Promise.all(inst.schedule.teachers.map(async(teacher, tindex) => {
                  return await Promise.all(teacher.days.map(async(d, dindex) => {
                    return await Promise.all(body.days.map(async (day) => {
                      if (!(day.new < 0) && day.new != null && day.new != "") {
                        if (!daysinweek.includes(day.new))
                          daysinweek.push(day.new);
                        if (day.old == d.dayIndex) {
                          const path = `schedule.teachers.${tindex}.days.${dindex}.dayIndex`;
                          const doc = await Institute.findOneAndUpdate(
                            { uiid: inst.uiid },
                            {
                              $set: { [path]: day.new },
                            }
                          );
                          //todo: doc return
                          clog(doc);
                          return code.event(doc ? code.OK : code.NO);
                        }
                      }else {
                        return clog("invalid new");
                      }
                    }));
                  }));
                }));
                clog(body.days);
                clog(daysinweek);
                clog(result);
                if(!result) throw result;
                
                if(inst.schedule.classes.length){
                  result = await Promise.all(inst.schedule.classes.map(async(Class, c) => {
                    return await Promise.all(Class.days.map(async(d, dindex) => {
                      return await Promise.all(body.days.map(async (day) => {
                        if (!(day.new < 0) && day.new != null && day.new != "") {
                          if (day.old == d.dayIndex) {
                            const path = `schedule.classes.${c}.days.${dindex}.dayIndex`;
                            const doc = await Institute.findOneAndUpdate(
                              { uiid: inst.uiid },
                              {
                                $set: { [path]: day.new },
                              }
                            );
                            //todo: doc return
                            clog(doc);
                            return code.event(doc ? code.OK : code.NO);
                          }
                        }
                      }));
                    }));
                  }));
                  clog(body.days);
                  clog(daysinweek);
                  clog(result);
                  if(!result) throw result;
                  if (daysinweek.length == body.days) {
                    return await defaults.timings.setDaysInWeek(user, {
                      daysinweek,
                    });
                  }
                }
                if (daysinweek.length > 0) {
                  return await defaults.timings.setDaysInWeek(user, {
                    daysinweek,
                  });
                } 
              }catch(e){
                clog(e);
                return code.eventmsg(code.NO,e);
              }
            }
            break;
        }
        return;
      }
      async scheduleRemove(user, inst, body) {
        switch (body.specific) {
          case "weekday":
            {
              const promises = inst.schedule.teachers.map(
                async (teacher, tindex) => {
                  if (!(body.removeday < 0) && !isNaN(body.removeday)) {
                    const path = `schedule.teachers.${tindex}.days`;
                    const doc = await Institute.findOneAndUpdate(
                      { uiid: inst.uiid },
                      {
                        $pull: {
                          [path]: { dayIndex: body.removeday },
                          [defaults.timings.daysinweekpath]: body.removeday,
                        },
                      }
                    );
                  }
                }
              );
              await Promise.all(promises);
              return code.event(code.OK);
            }
            break;
          case "periods": {
          }
        }
      }
    }
    const teacher = new TeacherAction();
    class ClassAction {
      constructor() {}
      async scheduleReceive(user,inst, body) {
        if(body.classname){
          const scheduledoc = await Institute.findOne({uiid:user.uiid,"schedule.classes":{$elemMatch:{"classname":body.classname}}},
          { projection:{"schedule.classes.$":1}});
          if(!scheduledoc) return code.event(code.NO);
          return {
            event:code.OK,
            schedule:scheduledoc.schedule.classes[0]
          }
        } else {
          const scheduledoc = await Institute.findOne({uiid:user.uiid},
          { projection:{"schedule.classes":1}});
          if(!scheduledoc) return code.event(code.NO);
          return {
            event:code.OK,
            classes:scheduledoc.schedule.classes
          }
        }
      }
      async scheduleUpdate(user,inst, body) {
        switch(body.specific){
          case "createclasses":{  //bulk
            const classes = body.classes;
            body.classes.forEach((Class)=>{
              Class['_id'] = new ObjectId()
            })
            clog(body.classes);
            let doc = await Institute.findOneAndUpdate({uiid:inst.uiid},{ //creating classes in users
              $set:{
                "users.classes":body.classes
              }
            });
            if(!doc) return code.event(code.inst.CLASSES_CREATION_FAILED);
            let onlyclasses = Array();
            body.classes.forEach((c)=>{
              onlyclasses.push({
                classname:c.classname,
                students:[]
              });
            });
            doc = await Institute.findOneAndUpdate({uiid:inst.uiid},{ //creating classes for pseudousers
              $set:{
                "pseudousers.classes":onlyclasses
              }
            });
            if(!doc) return code.event(code.inst.CLASSES_CREATION_FAILED);
            classes.forEach((Class,c)=>{  //generating every class' schedule from teachers;
              Class['days'] = Array();
              delete Class['_id'];
              delete Class['inchargeID'];
              delete Class['students'];
              inst.default.timings.daysInWeek.forEach((dw)=>{
                Class.days.push({
                  dayIndex:dw,
                  period:Array(inst.default.timings.periodsInDay)
                });
              });
              inst.schedule.teachers.forEach((teacher,t)=>{
                teacher.days.forEach((day,d)=>{
                  day.period.forEach((period,p)=>{
                    if(period.classname==Class.classname){
                      const found = Class.days.some((cday)=>{
                        if(cday.dayIndex == day.dayIndex){
                          cday.period[p] = {
                            teacherID:teacher.teacherID,
                            subject:period.subject,
                            hold:true,
                          };
                          return true;
                        }
                      });
                      if(!found){   //new day
                        Class.days[d]={
                          dayIndex:day.dayIndex,
                          period:[{
                            teacherID:teacher.teacherID,
                            subject:period.subject,
                            hold:true,
                          }]
                        };
                      };
                    };
                  });
                });
              });
            });
            doc = await Institute.findOneAndUpdate({uiid:inst.uiid},{ //creating classes in schedule.
              $set:{
                "schedule.classes":classes
              }
            });
            return code.event(doc?code.schedule.SCHEDULE_CREATED:code.schedule.SCHEDULE_NOT_CREATED);
          }
          case "renameclasses":{
            
          }break;
          /**
           * Switches teacher id of given classname with given teacherID. Will directly set new teacher id for classname, and classname for 
           * new teacher id, if not clashed with anyother teacher. If clashed, will replace clash teacher classname (will be same as given classname)
           * with new teacher existing classname, and then will proceed with setting new teacher classname and classname new teacher.
           */
          case "switchteacher":{ //specific
            clog("switching start");
            clog(body);
            //new teacher classname update with current classname (must clash with old teacher id classname)
            let res = await teacher.scheduleUpdate(user,inst,{
              specific:"renameclass",
              teacherID:body.newteacherID,
              dayIndex:body.dayIndex,
              period:body.period,
              newclassname:body.classname
            });
            clog(res);
            if(res.event == code.schedule.SCHEDULE_CLASHED){
              clog("clashed 1");
              if(res.clash.id != body.oldteacherID) return res;    //must be clashed with old teacher ID classname
              let newschedoc = await Institute.findOne({uiid:user.uiid,"schedule.teachers":{$elemMatch:{"teacherID":body.newteacherID}}},
              {projection:{"schedule.teachers.$.days":1}});
              //getting new teacher's classname at given day,period.
              let newclassname;
              let found = newschedoc.schedule.teachers[0].days.some((day)=>{
                let found = day.period.some((period,p)=>{
                  if(p == body.period){
                    newclassname = period.classname;
                    return true;
                  }
                })
                return found;
              });
              clog("new teacher classname");
              clog(newclassname);
              if(!found) return code.event(code.NO);
              //force update classname of old teacher with new teacher classname
              clog("force updating old teacher");
              let path = `schedule.teachers.$[outer].days.$[outer1].period.${body.period}.classname`;
              let oldoc = await Institute.findOneAndUpdate({uiid:user.uiid},{
                $set:{
                  [path]:newclassname
                }
              },{
                arrayFilters:[{"outer.teacherID":body.oldteacherID},{"outer1.dayIndex":body.dayIndex}]
              });
              if(!oldoc.value) return code.event(code.NO);
              clog("force updated old teacher classname");
              //re-run new teacher classname update with current classname (should not clash)
              clog("re updating new teacher classname");
              inst = await Institute.findOne({uiid:user.uiid});
              res = await teacher.scheduleUpdate(user,inst,{
                specific:"renameclass",
                teacherID:body.newteacherID,
                dayIndex:body.dayIndex,
                period:body.period,
                newclassname:body.classname
              });
              clog(res);
              if(res.event!=code.OK) {  //new teacher classname not updated
                clog("Not ok, reverting");
                //reverting oldteacher forced classname update.
                oldoc = await Institute.findOneAndUpdate({uiid:user.uiid},{
                  $set:{
                    [path]:body.classname
                  }
                },{
                  arrayFilters:[{"outer.teacherID":body.oldteacherID},{"outer1.dayIndex":body.dayIndex}]
                });
                return code.event(oldoc.value?code.NO:code.server.DATABASE_ERROR);
              }
              clog("new & old teacher classname updated, updating old classname teacher to new teacher");
              //teachers schedule swapped, new teacher's class swapped, now swap their classes' schedule.
              const path2 = `schedule.classes.$[outer1].days.$[outer2].period.${body.period}.classname`;
              let classdoc = await Institute.updateOne({uiid:user.uiid},{
                $set:{
                  [path2]:body.oldteacherID
                }
              },{
                arrayFilters:[{"outer2.dayIndex":body.dayIndex},{"outer1.classname":newclassname}]
              });
              clog("returning");
              clog(classdoc.result);
              return code.event(classdoc.result.nModified?code.OK:code.NO);
            } else {  //not clashed, teacher of given classname already updated, or some other error for given day,period.
              clog("no clashes");
              return res;
            }
          }
          default:return code.event(code.NO);
        }
      }
    }
    this.teacher = new TeacherAction();
    this.classes = new ClassAction();
  }
  async getSchedule(user){
    const scheduledoc = await Institute.findOne({uiid:user.uiid},
      {projection:{"schedule":1}}
    );
    return scheduledoc?scheduledoc.schedule:code.event(code.NO);
  }

  handleScheduleTeachersAction = async (user, inst, body) => {
    switch (body.action) {
      case "upload":
        return await this.teacher.scheduleUpload(inst, body);
      case "receive":
        return await this.teacher.scheduleReceive(inst, body);
      case "update":
        return await this.teacher.scheduleUpdate(user, inst, body);
      case "remove":
        return await this.teacher.scheduleRemove(user, inst, body);
      default:
        return code.event(code.server.DATABASE_ERROR);
    }
  };
  handleScheduleClassesAction = async (user,inst, body) => {
    clog(body.action);
    switch (body.action) {
      case "receive":
        return await this.classes.scheduleReceive(user,inst, body);
      case "update":
        return await this.classes.scheduleUpdate(user,inst, body);
      default:
        return code.event(code.server.DATABASE_ERROR);
    }
  };
}

class Invite {
  constructor() {
    this.object = 'invite';
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
  async getInvitation(user){
    const doc = await Institute.findOne({uiid:user.uiid},{
      projection:{[this.object]:1}
    });
    return doc?doc[this.object]:code.event(code.NO);
  }
}

class PseudoUsers{
  constructor(){
    this.object = 'pseudousers';
    this.teacherpath = `${this.object}.teachers`;
    this.classpath = `${this.object}.classes`;
    this.someteacherpath = `${this.teacherpath}.$`;
    this.someclasspath = `${this.classpath}.$`;
    this.teacherID = 'teacherID';
    this.classname = 'classname';
  }
  async getPseudoUsers(user,body){
    let projection = {[this.object]:1};
    switch(body.specific){
      case "teachers":{projection = {[this.teacherpath]:1}};break;
      case "classes" :{projection = {[this.classpath]:1}};break;
    }
    const doc = await Institute.findOne({uiid:user.uiid},{
      projection:projection
    });
    if(!doc) return code.event(code.NO);
    switch(body.specific){
      case "teachers":{
        doc.pseudousers.teachers.forEach((teacher,t)=>{
          doc.pseudousers.teachers[t] = share.getPseudoTeacherShareData(teacher);
        })
        return doc.pseudousers.teachers;
      };break;
      case "classes" :{

      };break;
    }
  }
  async handleTeachers(user,body){
    switch(body.action){
      case "reject":{
        const rejdoc = await Institute.findOneAndUpdate({uiid:user.uiid},{
          $pull:{
            [this.teacherpath]:{teacherID: body.teacherID}
          }
        });
        return code.event(rejdoc.value?code.OK:code.NO);
      }
      case "accept":{
        const pseudodoc = await Institute.findOne({uiid:user.uiid,[this.teacherpath]:{$elemMatch:{[this.teacherID]:body.teacherID}}},{
          projection:{[this.someteacherpath]:1}
        });
        if(!pseudodoc) return code.event(code.NO);
        const teacher = pseudodoc.pseudousers.teachers[0];
        const tdoc = await Institute.findOneAndUpdate({uiid:user.uiid},{
          $push:{
            "users.teachers":teacher
          }
        });
        if(!tdoc) return code.event(code.NO);
        return await this.handleTeachers(user,{action:"reject",teacherID:body.teacherID});
      }break;
    }
  }
  async handleStudents(user,body){
    switch(body.action){
      case "accept":{

      }
      case "reject":{}
    }
  }
}

class Vacations {
  constructor() {
    this.object = 'vacations';
  }
  async getVacations(user){
    const vacdoc = await Institute.findOne({uiid:user.uiid},{
      projection:{[this.object]:1}
    });
    return vacdoc?vacdoc[this.object]:code.event(code.NO);
  }
}

class Preferences {
  constructor() {
    this.object = "preferences";
    this.allowTeacherAddSchedule = `${this.object}.allowTeacherAddSchedule`;
    this.active = `${this.object}.active`;
  }
  async getPreferences(user){
    const prefdoc = await Institute.findOne({uiid:user.uiid},{
      projection:{[this.object]:1}
    });
    return prefdoc?prefdoc[this.object]:code.event(code.NO);
  }
  async handlePreferences(user, body) {
    switch (body.action) {
      case "set":
        {
          switch (body.specific) {
            case "allowTeacherAddSchedule":
              return await this.teacherAddSchedule(user, body.allow);
            case "active":
              return await this.scheduleActive(user, body.active);
            default:
              return await this.setAllPreferences(user, body);
          }
        }
        break;
      case "get":
        {
          switch (body.specific) {
            case "allowTeacherAddSchedule":
              return await this.canTeacherAddSchedule(user);
            case "active":
              return await this.isScheduleActive(user);
            default:
              return await this.allPreferences(user);
          }
        }
        break;
    }
  }
  async setAllPreferences(user, body) {}
  async allPreferences(user) {
    const doc = await Institute.findOne({ uiid: user.uiid });
    return code.event(doc ? doc.preferences : code.NO);
  }
  async canTeacherAddSchedule(user) {
    const doc = await Institute.findOne({ uiid: user.uiid });
    return doc ? doc.preferences.allowTeacherAddSchedule : code.event(code.NO);
  }
  async teacherAddSchedule(user, allow) {
    const doc = await Institute.findOneAndUpdate(
      { uiid: user.uiid },
      {
        $set: {
          [this.allowTeacherAddSchedule]: allow,
        },
      }
    );
    return code.event(doc ? code.OK : code.NO);
  }
  async isScheduleActive(user) {
    const doc = await Institute.findOne({ uiid: user.uiid });
    return code.event(doc ? doc.preferences.active : code.NO);
  }
  async scheduleActive(user, active) {
    const doc = await Institute.findOneAndUpdate(
      { uiid: user.uiid },
      {
        $set: {
          [this.active]: active,
        },
      }
    );
    return code.event(doc ? code.OK : code.NO);
  }
}

let clog = (msg) => console.log(msg);
module.exports = new AdminWorker();
