const Institute = require("../config/db").getInstitute(),
  {code,client,view,clog} = require("../public/script/codes"),
  invite = require("./common/invitation"),
  session = require("./common/session"),
  verify = require("./common/verification"),
  mailer = require("./common/mailer"),
  bcrypt = require("bcryptjs"),
  reset = require("./common/passwordreset"),
  share = require("./common/sharedata"),
  { ObjectId } = require("mongodb");
class TeacherWorker {
  constructor() {
    this.self = new Self();
    this.schedule = new Schedule();
    this.classroom = new Classroom();
    this.pseudo = new PseudoUsers();
  }
  toSession = (u, query = { target: view.teacher.target.dash }) => {
    let path = `/${client.teacher}/session?u=${u}`;
    for (var key in query) {
      if (query.hasOwnProperty(key)) {
        path = `${path}&${key}=${query[key]}`;
      }
    }
    return path;
  };
  toLogin = (query = { target: view.teacher.target.dash }) => {
    let i = 0;
    let path = `/${client.teacher}/auth/login`;
    for (var key in query) {
      if (query.hasOwnProperty(key)) {
        path = i > 0
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
    const path = `users.teachers`;
    const pseudopath = `pseudousers.teachers`;
    class Account {
      constructor() {
        this.path = path;
        this.pseudopath = pseudopath;
        this.username = "username";
        this.uid = "_id";
        this.teacherID = "teacherID";
        this.password = "password";
        this.createdAt = "createdAt";
        this.verified = "verified";
        this.vlinkexp = "vlinkexp";
        this.rlinkexp = "rlinkexp";
      }
      //send feedback emails

      async getAccount(user){
        let teacherdoc = await Institute.findOne({
          uiid:user.uiid,
          "users.teachers":{
            $elemMatch:{"_id":ObjectId(user.id)}
          }
        },{
          projection:{
            "_id":0,
            "users.teachers.$":1
          }
        });
        if(!teacherdoc){
          teacherdoc = await Institute.findOne({
            uiid:user.uiid,
            "pseudousers.teachers":{
              $elemMatch:{"_id":ObjectId(user.id)}
            }
          },{
            projection:{
              "_id":0,
              "pseudousers.teachers.$":1
            }
          });
          clog(share.getPseudoTeacherShareData(teacherdoc.pseudousers.teachers[0],user.uiid));
          return teacherdoc?share.getPseudoTeacherShareData(teacherdoc.pseudousers.teachers[0],user.uiid):code.event(code.auth.USER_NOT_EXIST);
        }
        return teacherdoc?share.getTeacherShareData(teacherdoc.users.teachers[0],user.uiid):code.event(code.auth.USER_NOT_EXIST);
      }

      async createAccount(uiid, newteacher) {
        const doc = await Institute.findOneAndUpdate(
          { uiid: uiid },
          {
            $push: {
              [path]: newteacher,
            },
          }
        );
        return code.event(doc.value ? code.OK : code.NO);
      }

      /**
       * This will create an account in teachers of the pseudousers object of instiution, and will be shown as a requestee teacher to join the institution.
       * @param {String} uiid The unique institute ID
       * @param {JSON} pseudoteacher The teacher data for which pseudo account will be created.
       */
      async createPseudoAccount(uiid, pseudoteacher) {
        const doc = await Institute.findOneAndUpdate(
          {
            uiid: uiid,
          },
          {
            $push: {
              [pseudopath]: pseudoteacher,
            },
          }
        );
        return code.event(doc.value ? code.OK : code.NO);
      }

      /**
       * To change current teacher's user name (pseudo or user)
       */
      changeName = async (user, body) => {
        let teacher = await getTeacherById(user.uiid,user.id);
        const pseudo = teacher?false:true;
        teacher = teacher?teacher:await getTeacherById(user.uiid,user.id,true);
        if(!teacher) return code.event(code.auth.USER_NOT_EXIST);
        const namepath = pseudo?`${pseudopath}.$.${this.username}`:`${this.path}.$.${this.username}`;
        const path = pseudo?pseudopath:this.path;
        const newteacher = await Institute.findOneAndUpdate({
            uiid: user.uiid,
            [path]: { $elemMatch: { [this.uid]: ObjectId(user.id) } },
        },
          {
            $set: {
              [namepath]: body.newname,
            },
          }
        );
        return code.event(newteacher.value ? code.OK : code.NO);
      };

      /**
       * To change current teacher's user password (pseudo or user)
       */
      changePassword = async (user, body) => {
        let teacher = await getTeacherById(user.uiid,user.id);
        clog(teacher);
        const pseudo = teacher?false:true;
        teacher = teacher?teacher:await getTeacherById(user.uiid,user.id,true);
        if(!teacher) return code.event(code.auth.USER_NOT_EXIST);
        const passpath = pseudo?`${pseudopath}.$.${this.password}`:`${this.path}.$.${this.password}`;
        const rlinkpath = pseudo?`${pseudopath}.$.${this.rlinkexp}`:`${this.path}.$.${this.rlinkexp}`;
        const path = pseudo?pseudopath:this.path;

        const salt = await bcrypt.genSalt(10);
        const epassword = await bcrypt.hash(body.newpassword, salt);
        const newteacher = await Institute.findOneAndUpdate(
          {
            uiid: user.uiid,
            [path]: { $elemMatch: { [this.uid]: ObjectId(user.id) } },
          },
          {
            $set: {
              [passpath]: epassword,
            },
            $unset: {
              [rlinkpath]: null,
            },
          }
        );
        clog(newteacher);
        return code.event(newteacher.value ? code.OK : code.NO);
      };

      /**
       * To change email address of teacher, pseudo or user
       */
      changeEmailID = async (user, body) => {
        let teacher = await getTeacherById(user.uiid,user.id);
        const pseudo = teacher?false:true;
        teacher = teacher?teacher:await getTeacherById(user.uiid,user.id,true);
        if(!teacher) return code.event(code.auth.USER_NOT_EXIST);
        const mailpath = pseudo?`${pseudopath}.$.${this.teacherID}`:`${this.path}.$.${this.teacherID}`;
        const verifiedpath = pseudo?`${pseudopath}.$.${this.verified}`:`${this.path}.$.${this.verified}`;
        const path = pseudo?pseudopath:this.path;

        if (teacher.teacherID == body.newemail)
          return code.event(code.auth.SAME_EMAIL);
        const someteacher = await getTeacherByEmail(user.uiid,body.newemail);
        if (someteacher) return code.event(code.auth.USER_EXIST);
        const newteacher = await Institute.findOneAndUpdate(
          { uiid: user.uiid, [path]:{$elemMatch:{[this.uid]:ObjectId(user.id)}}},
          {
            $set: {
              [mailpath]: body.newemail,
              [verifiedpath]: false,
            },
          }
        );
        if(newteacher.value){
          const sched = await Institute.findOneAndUpdate({uiid:user.uiid,"schedule.teachers":{$elemMatch:{"teacherID":teacher.teacherID}}},
          {
            $set:{
              "schedule.teachers.$.teacherID":body.newemail
            }
          });
        }
        clog(newteacher);
        return code.event(newteacher.value? code.OK: code.NO);
      };

      /**
       *To delete teacher account, pseudo or user.
       */
      deleteAccount = async (user) => {
        let teacher = await getTeacherById(user.uiid,user.id);
        const pseudo = teacher?false:true;
        teacher = teacher?teacher:await getTeacherById(user.uiid,user.id,true);
        if(!teacher) return code.event(code.auth.USER_NOT_EXIST);
        const path = pseudo?pseudopath:this.path;
        const deluser = await Institute.findOneAndUpdate({
            uiid: user.uiid,
            [path]: { $elemMatch: { [this.uid]: ObjectId(user.id) } },
          },
          {
            $pull: {
              [path]: { [this.uid]: ObjectId(user.id) },
            },
          }
        );
        return code.event(deluser.value ? code.OK : code.NO);
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

  handleAccount = async (user, body) => {
    switch (body.action) {
      case code.action.CHANGE_NAME:
        return await this.account.changeName(user, body);
      case code.action.CHANGE_PASSWORD:
        return await this.account.changePassword(user, body);
      case code.action.CHANGE_ID:
        return await this.account.changeEmailID(user, body);
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
        const linkdata = await verify.generateLink(client.teacher, {
          uid: user.id,
          instID: body.instID,
        });
        clog(linkdata);
        if(!linkdata) return code.event(code.mail.ERROR_MAIL_NOTSENT);
        return await mailer.sendVerificationEmail(linkdata);
      }
      case "check": {
        const teacherdoc = await Institute.findOne(
          {
            uiid: user.uiid,
            "users.teachers": { $elemMatch: { _id: ObjectId(user.id) } },
          },
          {
            projection: { "users.teachers.$": 1 },
          }
        );
        if (!teacherdoc) {
          const pseudodoc = await Institute.findOne(
            {
              uiid: user.uiid,
              "pseudousers.teachers": {
                $elemMatch: { _id: ObjectId(user.id) },
              },
            },
            {
              projection: { "pseudousers.teachers.$": 1 },
            }
          );
          if (!pseudodoc) return code.event(code.auth.USER_NOT_EXIST);
          return code.event(
            pseudodoc.pseudousers.teachers[0].verified
              ? code.verify.VERIFIED
              : code.verify.NOT_VERIFIED
          );
        }
        return code.event(
          teacherdoc.users.teachers[0].verified
            ? code.verify.VERIFIED
            : code.verify.NOT_VERIFIED
        );
      }
    }
  };
  handlePassReset = async (user, body) => {
    switch (body.action) {
      case "send":{
          if (!user) {
            //user not logged in
            const userdoc = await Institute.findOne({
                uiid: body.uiid,
                "users.teachers": { $elemMatch: { teacherID: body.email } },
              },
              { projection: { _id: 1, "users.teachers.$": 1 } }
            );
            if (!userdoc) {
              const pseudodoc = await Institute.findOne(
                {
                  uiid: body.uiid,
                  "pseudousers.teachers": {
                    $elemMatch: { teacherID: body.email },
                  },
                },
                { projection: { _id: 1, "pseudousers.teachers.$": 1 } }
              );
              if (!pseudodoc) return { result: code.event(code.OK) }; //don't tell if user not exists, while sending reset email.
              body["instID"] = pseudodoc._id;
              return await this.handlePassReset({
                  id: share.getPseudoTeacherShareData(
                    pseudodoc.pseudousers.teachers[0]
                  ).uid,
                },
                body
              );
            }
            body["instID"] = userdoc._id;
            return await this.handlePassReset(
              { id: share.getTeacherShareData(userdoc.users.teachers[0]).uid },
              body
            );
          }
          clog(user);
          const linkdata = await reset.generateLink(client.teacher, {
            uid: user.id,
            instID: body.instID,
          });
          if(!linkdata) return 
          clog(linkdata); code.event(code.mail.ERROR_MAIL_NOTSENT);
          return await mailer.sendPasswordResetEmail(linkdata);
      }
        break;
    }
  };
}

class Schedule {
  constructor() {}
  async scheduleUpload(user, body) {
    const inst = await Institute.findOne({ uiid: user.uiid });
    if (!inst) return code.event(code.inst.INSTITUTION_NOT_EXISTS);
    let overwriting = false; //if existing teacher schedule being overwritten after completion.
    let incomplete = false; //if existing teacher schedule being rewritten without completion.
    let found = inst.schedule.teachers.some((teacher) => {
      if (teacher.teacherID == body.teacherID) {
        if (teacher.days.length == inst.default.timings.daysInWeek.length) {
          overwriting = true;
        } else {
          incomplete = teacher.days.some((day) => {
            if (body.data.dayIndex <= day.dayIndex) {
              return true;
            }
          });
        }
        return true;
      }
    });
    if (overwriting) //completed schedule, must be edited from schedule view.
      return code.event(code.schedule.SCHEDULE_EXISTS);

    if (incomplete) { //remove teacher schedule
      clog("is incomplete");
      await Institute.findOneAndUpdate({ uiid: user.uiid },{
        $pull: { "schedule.teachers": { teacherID: body.teacherID } },
      });
      found = false; //add as a new teacher schedule
    }

    let clashClass, clashPeriod, clashTeacher;
    let clashed = inst.schedule.teachers.some((teacher) => {  //for clash checking
      let clashed = teacher.days.some((day) => {
        if (day.dayIndex == body.data.dayIndex) {
          let clashed = day.period.some((period, pindex) => {
            if (
              period.classname == body.data.period[pindex].classname &&
              period.classname != code.schedule.FREE
            ) {
              clashClass = period.classname;
              clashPeriod = pindex;
              return true;
            }
          });
          return clashed;
        }
      });
      if (clashed) {
        clashTeacher = teacher.teacherID;
        return true;
      }
    });
    if (clashed) {//if schedule clashed.
      inst.users.teachers.some((teacher)=>{
        if(teacher.teacherID == clashTeacher){
          clashTeacher = teacher.username;
        }
      });
      return {
        event: code.schedule.SCHEDULE_CLASHED,
        clash: {
          classname: clashClass,
          period: clashPeriod,
          clashwith: clashTeacher,
        },
      }
    }
    if (found) { //existing teacher schedule, incomplete (new day index)
      let doc = await Institute.findOneAndUpdate({
        uiid: user.uiid,
        "schedule.teachers": {
          $elemMatch: { teacherID: body.teacherID },
        }, //existing schedule teacherID
      },{
        $push: { "schedule.teachers.$[outer].days": body.data }, //new day push
      },{
        arrayFilters:[{"outer.teacherID":body.teacherID}]
      });
      clog(doc.value);
      clog("schedule appended?");
      return code.event(doc.value?code.schedule.SCHEDULE_CREATED:code.schedule.SCHEDULE_NOT_CREATED); //new day created.
    } else { //no existing schedule teacherID
      let doc = await Institute.findOneAndUpdate({ uiid: user.uiid }, {
        $push: {
          "schedule.teachers": {
            teacherID: body.teacherID,
            days: [body.data],
          },
        }, //new teacher schedule push
      });
      clog(doc.value);
      clog("schedule created?");
      return code.event(doc.value?code.schedule.SCHEDULE_CREATED:code.schedule.SCHEDULE_NOT_CREATED);//new teacher new day created.
    }
  }

  async scheduleUpdate(user, body) {}

  async getSchedule(user, body = {}){
    clog(user);
    const teacheruser = await Institute.findOne({
        uiid: user.uiid,
        "users.teachers": { $elemMatch: { _id: ObjectId(user.id) } },
      },
      { projection: { _id: 0, default:1,"users.teachers.$": 1 } }
    );
    if (!teacheruser)
      return session.finish(res).then((response) => {
        if (response) res.redirect(this.toLogin());
      });
    const teacher = teacheruser.users.teachers[0];
    const teacherschedule = await Institute.findOne({
        uiid: user.uiid,
        "schedule.teachers": { $elemMatch: { teacherID: teacher.teacherID } },
      },
      {
        projection: {
          _id: 0,
          "schedule.teachers.$": 1,
        },
      }
    );
    const timings = teacheruser.default.timings;
    if (!teacherschedule) return { schedule:false,timings:timings};
    const schedule = teacherschedule.schedule.teachers[0].days;
    if (body.dayIndex == null) return { schedule: schedule, timings: timings };
    let today = teacherschedule.schedule.teachers[0].days[0];
    const found = schedule.some((day, index) => {
      if (day.dayIndex == body.dayIndex) {
        today = day;
        return true;
      }
    });
    if (!found) return { schedule: false, timings: timings };
    return { schedule: today, timings: timings };
  };
}

class Classroom {
  constructor() {
    this.path = "users.classes";
    this.classname = "classname";
    this.incharge = "incharge";
    this.students = "students";

    class Manage {
      constructor() {}
      async handleSettings(user, teacher, body, classroom) {
        return;
      }
    }
    this.manage = new Manage();
  }

  async manageClassroom(user, body, teacher, classroom) {
    switch (body.action) {
      case "create":
        return await this.createClassroom(user, body);
      case "update":
        return await this.updateClassroom(user, teacher, body, classroom);
      case "receive":
        return await this.getClassroom(user, teacher,body);
      case "manage":
        return await this.manage.handleSettings(user, body, teacher, classroom);
    }
  }

  async createClassroom(user, teacher, body) {
    switch (body.specific) {
      case "newclass": {
        const data = {
          classname: body.classname,
          incharge: teacher.teacherID,
          students: [],
        };
        const classdoc = await Institute.findOneAndUpdate(
          { uiid: user.uiid },
          {
            $push: {
              [this.path]: data,
            },
          }
        );
        return code.event(
          classdoc
            ? code.inst.CLASSES_CREATED
            : code.inst.CLASSES_CREATION_FAILED
        );
      }
    }
  }
  async updateClassroom(user, teacher, body, classroom) {
    clog(user.uiid);
    clog(classroom);
    clog(teacher.teacherID);
    clog(body.studentID);
    switch (body.specific) {
      case "addstudent": {
      }break;
      case "removestudent": {
        const deldoc = await Institute.updateOne({uiid:user.uiid,"users.classes":{$elemMatch:{"classname":classroom.classname}}},{
          $pull:{
            "users.classes.$[outer].students":{studentID:body.studentID}
          }
        },{
          arrayFilters:[{"outer.inchargeID":teacher.teacherID}]
        });
        clog(deldoc.result)
        return code.event(deldoc.result.nModified?code.OK:code.NO);
      }
    }
  }

  async getClassroom(user, teacher, body) {
    let classdoc = await Institute.findOne({
        uiid: user.uiid,
        "users.classes": { $elemMatch: { inchargeID: teacher.teacherID } },
      },
      { projection: { "users.classes.$": 1 } }
    );
    if (!classdoc) return { classroom: false, pseudostudents: false };
    const pclassdoc = await Institute.findOne({
        uiid: user.uiid,
        "pseudousers.classes": {
          $elemMatch: { classname: classdoc.users.classes[0].classname },
        },
      },
      { projection: { "pseudousers.classes.$": 1 } }
    );
    let pseudostudents = [];
    if(pclassdoc){
      pseudostudents = pclassdoc.pseudousers.classes[0].students;
      pseudostudents.forEach((stud,s)=>{
        pseudostudents[s] = share.getStudentShareData(stud);
      })
    }
    let classroom = classdoc.users.classes[0];
    let todayschedule = await new Schedule().getSchedule(user);
    let otherclasses = [];
    todayschedule.schedule.forEach(day=>{
      day.period.forEach((period)=>{
        if(!otherclasses.includes(period.classname)){
          otherclasses.push(period.classname);
        }
      });
    });
    if(body&&otherclasses.includes(body.otherclass)){//a specific classes needed
      classdoc = await Institute.findOne({uiid:user.uiid,"users.classes":{$elemMatch:{"classname":body.otherclass}}},{
        projection:{"users.classes.$":1}
      });
      classroom = classdoc?classdoc.users.classes[0]:classroom;
    }
    classroom.students.forEach((stud,s)=>{
      classroom.students[s] = share.getStudentShareData(stud);
    });
    clog(classroom);
    return {
      classroom: classroom,
      pseudostudents: pseudostudents,
      otherclasses:otherclasses
    };
  }

  async handleInvitation(user, body, teacher, classroom,instID) {
    clog(body);
    switch (body.action) {
      case "create":{
        return await invite.generateLink(client.student,{
          cid:classroom._id,
          instID:instID
        });
      }break;
      case "disable":{
        return await invite.disableInvitation(client.student,{
          cid:classroom._id,
          instID:instID
        });
      }
        
    }
    return;
  }

  async createStudentInviteLink() {}
}

class PseudoUsers {
  constructor() {}
  async managePseudousers(user, body, teacher) {
    const classdoc = await Institute.findOne({uiid: user.uiid,
      "users.classes": {
        $elemMatch: { inchargeID: teacher.teacherID },
      }
    },{
      projection: { "users.classes.$": 1 } 
    });
    if(!classdoc) return code.event(code.NO);
    switch (body.action) {
      case "receive":
        return await this.getPseudoUsers(user, body,classdoc.users.classes[0].classname);
      case "accept":
        return await this.acceptStudentRequest(user, body,classdoc.users.classes[0].classname);
      case "reject":
        return await this.rejectStudentRequest(user, body,classdoc.users.classes[0].classname);
    }
  }
  async getPseudoUsers(user, teacher,classname) {
    const pclassdoc = await Institute.findOne({
        uiid: user.uiid,
        "pseudousers.classes": {
          $elemMatch: { classname: classname },
        },
    },
      { projection: { "pseudousers.classes.$": 1 } }
    );
    clog(pclassdoc.pseudousers.classes[0].students);
    return pclassdoc
      ? pclassdoc.pseudousers.classes[0].students
      : code.event(code.NO);
  }

  async acceptStudentRequest(user, body,classname) {
    const pclassdoc = await Institute.findOne(
      {
        uiid: user.uiid,
        "pseudousers.classes": {
          $elemMatch: { classname: classname },
        },
      },
      { projection: { "pseudousers.classes.$": 1 } }
    );
    if (!pclassdoc) return code.event(code.NO);
    let student;
    const found = pclassdoc.pseudousers.classes[0].students.some((stud) => {
      if (stud.studentID == body.studentID) {
        student = stud;
        return true;
      }
    });
    if (!found) return code.event(code.NO);
    const doc = await Institute.updateOne({
        uiid: user.uiid,
        "users.classes": { $elemMatch: { classname: classname } },
      },{
        $push: {
          "users.classes.$.students": student,
        },
        $pull: {
          "pseudousers.classes.$[outer].students": {
            studentID: student.studentID,
          },
        },
      },
      {
        arrayFilters: [{ "outer.classname": classname }],
      }
    );
    return code.event(doc.result.nModified ? code.OK : code.NO);
  }
  async rejectStudentRequest(user, body,classname) {
    clog(body.studentID);
    const doc = await Institute.updateOne(
      {
        uiid: user.uiid,
        "pseudousers.classes": {
          $elemMatch: { classname: classname },
        },
      },
      {
        $pull: {
          "pseudousers.classes.$.students": { studentID: body.studentID },
        },
      }
    );
    clog(doc.result);
    return code.event(doc.result.nModified ? code.OK : code.NO);
  }
}
module.exports = new TeacherWorker();

async function getTeacherById(uiid,id,pseudo = false){
  clog(pseudo);
  let path = pseudo?"pseudousers.teachers":"users.teachers";
  let getpath = pseudo?"pseudousers.teachers.$":"users.teachers.$";
  const tdoc = await Institute.findOne({uiid:uiid,[path]:{$elemMatch:{"_id":ObjectId(id)}}},{
    projection:{
      [getpath]:1
    }
  });
  return tdoc?pseudo?tdoc.pseudousers.teachers[0]:tdoc.users.teachers[0]:false;
}
async function getTeacherByEmail(uiid,email,pseudo = false){
  let path = pseudo?"pseudousers.teachers":"users.teachers";
  let getpath = pseudo?"pseudousers.teachers.$":"users.teachers.$";
  const tdoc = await Institute.findOne({uiid:uiid,[path]:{$elemMatch:{"teacherID":email}}},{
    projection:{
      [getpath]:1
    }
  });
  return tdoc?pseudo?tdoc.pseudousers.teachers[0]:tdoc.users.teachers[0]:false;
}