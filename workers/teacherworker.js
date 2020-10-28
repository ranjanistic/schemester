const Institute = require("../config/db").getInstitute(),
  fs = require("fs"),
  path = require("path"),
  pusher = require("pusher"),
  {code,client,view,clog} = require("../public/script/codes"),
  invite = require("./common/invitation"),
  session = require("./common/session"),
  verify = require("./common/verification"),
  mailer = require("./common/mailer"),
  timer = require("./common/timer"),
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
    this.comms = new Comms();
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
    const teacherpath = `users.teachers`;
    const pseudoteacherpath = `pseudousers.teachers`;
    class Account {
      constructor() {
        this.teacherpath = teacherpath;
        this.pseudoteacherpath = pseudoteacherpath;
        this.username = "username";
        this.uid = "_id";
        this.teacherID = "teacherID";
        this.password = "password";
        this.createdAt = "createdAt";
        this.verified = "verified";
        this.vlinkexp = "vlinkexp";
        this.rlinkexp = "rlinkexp";
      }
      //todo:send feedback emails

      /**
       * Returns the teacher account associated with current user session.
       * @param {JSON} user The session user object.
       * @param {Boolean} raw If true, will return exact account data (including password, encrypted), else will return through sharedata methods. Defaults to false.
       * @returns {JSON} If account exists, returns account object (if raw=false,returns filtered account object via sharedata module), else returns false.
       */
      async getAccount(user,raw = false){
        let teacher = await this.getTeacherById(user.uiid,user.id);
        if(teacher)
          return raw?teacher:share.getTeacherShareData(teacher,user.uiid);
        teacher = this.getTeacherById(user.uiid,user.id,true);
        if(!teacher) return false;
        if(raw) teacher['pseudo'] = true;
        return raw?teacher:share.getPseudoTeacherShareData(teacher,user.uiid);
      }

      async getTeacherById(uiid,id,pseudo = false){
        const path = pseudo ? pseudoteacherpath : teacherpath;
        const getpath = `${path}.$`;
        const tdoc = await Institute.findOne({uiid:uiid,[path]:{$elemMatch:{[this.uid]:ObjectId(id)}}},{
          projection:{
            [getpath]:1
          }
        });
        return tdoc?pseudo?tdoc.pseudousers.teachers[0]:tdoc.users.teachers[0]:false;
      }
      async getTeacherByEmail(uiid, email, pseudo = false) {
        const path = pseudo ? pseudoteacherpath : teacherpath;
        const getpath = `${path}.$`;
        const cdoc = await Institute.findOne(
          { uiid: uiid, [path]: { $elemMatch: { teacherID: email } } },
          {
            projection: {
              [getpath]: 1,
            },
          }
        );
        if (!cdoc) return false;
        const teacher = pseudo
          ? cdoc.pseudousers.teachers[0]
          : cdoc.users.teachers[0];
        return teacher ? teacher : false;
      }

      async createAccount(uiid, newteacher) {
        let doc = await Institute.findOneAndUpdate(
          { uiid: uiid },
          {
            $push: {
              [teacherpath]: newteacher,
            },
          }
        );
        if(!doc.value) return code.event(code.NO);
        doc = await Institute.findOneAndUpdate({uiid:uiid,
          "schedule.teachers":{$elemMatch:{"teacherID":newteacher.teacherID}}},{
            $set:{
              "schedule.teachers.$.teachername":newteacher.username
            }
        });
        return code.event(code.OK);
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
              [pseudoteacherpath]: pseudoteacher,
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
        const namepath = pseudo?`${pseudoteacherpath}.$.${this.username}`:`${this.teacherpath}.$.${this.username}`;
        const path = pseudo?pseudoteacherpath:this.teacherpath;
        let newteacher = await Institute.findOneAndUpdate({
            uiid: user.uiid,
            [path]: { $elemMatch: { [this.uid]: ObjectId(user.id) } },
        },
          {
            $set: {
              [namepath]: body.newname,
            },
          }
        );
        if(!newteacher.value) return code.event(code.NO);
        if(!pseudo){
          newteacher = await Institute.findOneAndUpdate({uiid:user.uiid,
          "schedule.teachers":{$elemMatch:{"teacherID":teacher.teacherID}}},{
            $set:{
              "schedule.teachers.$.teachername":body.newname
            }
          });
          newteacher = await Institute.findOneAndUpdate({uiid:user.uiid,"users.classes":{$elemMatch:{"inchargeID":teacher.teacherID}}},{
            $set:{
              "users.classes.$.inchargename":body.newname
            }
          });
        }
        return code.event(code.OK);
      };

      /**
       * To change current teacher's account password (pseudo or user)
       */
      changePassword = async (user, body) => {
        let teacher = await getTeacherById(user.uiid,user.id);
        const pseudo = teacher?false:true;
        teacher = teacher?teacher:await getTeacherById(user.uiid,user.id,true);
        if(!teacher) return code.event(code.auth.USER_NOT_EXIST);
        const salt = await bcrypt.genSalt(10);
        const epassword = await bcrypt.hash(body.newpassword, salt);
        const newteacher = await Institute.findOneAndUpdate(
          {
            uiid: user.uiid,
            [pseudo?pseudoteacherpath:this.teacherpath]: { $elemMatch: { [this.uid]: ObjectId(user.id) } },
          },
          {
            $set: {
              [pseudo?`${pseudoteacherpath}.$.${this.password}`:`${this.teacherpath}.$.${this.password}`]: epassword,
            },
            $unset: {
              [pseudo?`${pseudoteacherpath}.$.${this.rlinkexp}`:`${this.teacherpath}.$.${this.rlinkexp}`]: null,
            },
          }
        );
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

        if (teacher.teacherID == body.newemail)
          return code.event(code.auth.SAME_EMAIL);
        const someteacher = await getTeacherByEmail(user.uiid,body.newemail);
        if (someteacher) return code.event(code.auth.USER_EXIST);
        const newteacher = await Institute.findOneAndUpdate(
          { uiid: user.uiid, [pseudo?pseudoteacherpath:this.teacherpath]:{$elemMatch:{[this.uid]:ObjectId(user.id)}}},
          {
            $set: {
              [pseudo?`${pseudoteacherpath}.$.${this.teacherID}`:`${this.teacherpath}.$.${this.teacherID}`]: body.newemail,
              [pseudo?`${pseudoteacherpath}.$.${this.verified}`:`${this.teacherpath}.$.${this.verified}`]: false,
            },
          }
        );
        if(!newteacher.value) return code.event(code.NO);        
        let res = await Institute.findOneAndUpdate({uiid:user.uiid,"schedule.teachers":{$elemMatch:{"teacherID":teacher.teacherID}}},
        {
          $set:{
            "schedule.teachers.$.teacherID":body.newemail
          }
        });
        res = await Institute.findOneAndUpdate({uiid:user.uiid,"users.classes":{$elemMatch:{"inchargeID":teacher.teacherID}}},{
          $set:{
            "users.classes.$.inchargeID":body.newemail
          }
        });
        return code.event(code.OK);
      };

      /**
       *To delete teacher account, pseudo or user.
       */
      deleteAccount = async (user) => {
        let teacher = await getTeacherById(user.uiid,user.id);
        const pseudo = teacher?false:true;
        teacher = teacher?teacher:await getTeacherById(user.uiid,user.id,true);
        if(!teacher) return code.event(code.auth.USER_NOT_EXIST);
        const path = pseudo?pseudoteacherpath:this.teacherpath;
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
        const inst = await Institute.findOne({uiid:user.uiid},{projection:{"_id":1}});
        if(!inst) return code.event(code.inst.INSTITUTION_NOT_EXISTS);
        const linkdata = await verify.generateLink(client.teacher, {
          uid: user.id,
          instID: inst._id,
        });
        if(!linkdata) return code.event(code.mail.ERROR_MAIL_NOTSENT);
        return await mailer.sendVerificationEmail(linkdata);
      }
      case "check": {
        const teacher = await this.account.getAccount(user);
        if (!teacher)
          return code.event(code.auth.USER_NOT_EXIST);
        return code.event(
          teacher.verified
            ? code.verify.VERIFIED
            : code.verify.NOT_VERIFIED
        );
      }
    }
  };
  handlePassReset = async (user, body) => {
    switch (body.action) {
      case "send":{
        let inst;
        if (!user) {
          inst = await Institute.findOne({uiid:body.uiid},{projection:{"_id":1}});
          //user not logged in
          if(!inst) return code.event(code.OK);
          let teacher = await this.account.getTeacherByEmail(body.uiid,body.email)
          if (!teacher) {
            teacher = await this.account.getTeacherByEmail(body.uiid,body.email,true);
            if (!teacher) return code.event(code.OK); //don't tell if user not exists, while sending reset email.
          }
          return await this.handlePassReset({ id: share.getTeacherShareData(teacher).uid,uiid:body.uiid },body);
        } else{
          inst = await Institute.findOne({uiid:user.uiid},{projection:{"_id":1}});
        }
        const linkdata = await reset.generateLink(client.teacher, {
          uid: user.id,
          instID: inst._id,
        });
        if(!linkdata) return code.event(code.mail.ERROR_MAIL_NOTSENT);
        return await mailer.sendPasswordResetEmail(linkdata);
      }break;
    }
  };
}

class Schedule {
  constructor() {
    this.account = new Self().account;
    this.schedulepath = `schedule.teachers`;
    this.getschedulepath = `${this.schedulepath}.$`
    this.teachername = `teachername`;
    this.teacherID = `teacherID`;
    this.days = `days`;
      this.dayIndex = `dayIndex`;
      this.absent = `absent`;
      this.period = `period`;
        this.classname = `classname`;
        this.subject = `subject`;
        this.hold = `hold`;
  }
  async scheduleUpload(user, body) {
    const inst = await Institute.findOne({ uiid: user.uiid });
    if (!inst) return code.event(code.inst.INSTITUTION_NOT_EXISTS);
    let overwriting = false; //if existing teacher schedule being overwritten after completion.
    let incomplete = false; //if existing teacher schedule being rewritten without completion.
    let found = inst.schedule.teachers.some((teacher) => {
      if (teacher.teacherID == body.teacherID) {
        overwriting = inst.default.timings.daysInWeek.every((d)=>{
          //check if all days are present in teacher schedule
          return teacher.days.find((day)=>day.dayIndex == d)?true:false;
        });
        if(!overwriting) {
          //check if incoming day index is less than any day index present in teacher schedule
          incomplete = teacher.days.find((day) => body.data.dayIndex <= day.dayIndex)?true:false;
        }
        return true;
      }
    });
    if (overwriting) //completed schedule, must be edited from schedule view.
      return code.event(code.schedule.SCHEDULE_EXISTS);

    if (incomplete) { //remove teacher schedule
      await Institute.findOneAndUpdate({ uiid: user.uiid },{
        $pull: { "schedule.teachers": { teacherID: body.teacherID } },
      });
      found = false; //add as a new teacher schedule
    }

    const clashdata = [];
    let clashed = inst.schedule.teachers.some((teacher) => {  //for clash checking
      if(teacher.teacherID!=body.teacherID){
        let clashed = teacher.days.some((day) => {
          if (day.dayIndex == body.data.dayIndex) {
            let clashed = day.period.some((period, pindex) => {
              if (
                period.classname == body.data.period[pindex].classname &&
                period.classname != code.schedule.FREE
              ) {
                clashdata.push({
                  classname:period.classname,
                  period:pindex,
                  id:teacher.teacherID,
                  clashwith:teacher.teachername,
                });
                return true;
              }
            });
            return clashed;
          }
        });
        return clashed;
      }
    });
    if (clashed) {
      //if some period clashed with an existing teacher.
      return {
        event: code.schedule.SCHEDULE_CLASHED,
        clash: clashdata[0]
      }
    }
    if (found) {
      //existing teacher schedule, incomplete
      let doc = await Institute.updateOne({uiid:user.uiid},{
        $set:{
          "schedule.teachers.$[outer].days.$[outer1].period":body.data.period  //overwrite existing day
        }
      },{
        arrayFilters:[{"outer.teacherID":body.teacherID},{"outer1.dayIndex":body.data.dayIndex}]
      });
      //return if existing day is overwritten.
      if(doc.result.nModified) return code.event(code.schedule.SCHEDULE_CREATED);
      doc = await Institute.findOneAndUpdate({
        uiid: user.uiid,
        "schedule.teachers": {
          $elemMatch: { teacherID: body.teacherID },
        }, //existing schedule teacherID
      },{
        $push: { "schedule.teachers.$[outer].days": body.data }, //new day push
      },{
        arrayFilters:[{"outer.teacherID":body.teacherID}]
      });
      return code.event(doc.value?code.schedule.SCHEDULE_CREATED:code.schedule.SCHEDULE_NOT_CREATED); //new day created.
    } else { 
      //no existing schedule teacherID
      const doc = await Institute.findOneAndUpdate({ uiid: user.uiid }, {
        $push: {
          "schedule.teachers": {
            teachername:body.teachername,
            teacherID: body.teacherID,
            days: [body.data],
          },
        }, //new teacher schedule push
      });
      //return if teacher created in schedule
      return code.event(doc.value?code.schedule.SCHEDULE_CREATED:code.schedule.SCHEDULE_NOT_CREATED);//new teacher new day created.
    }
  }

  async scheduleUpdate(user, body) {}

  async createScheduleBackup(user,sendPromptCallback=(filename,err)=>{}){
    const teacher = await getTeacherById(user.uiid,user.id);
    if(!teacher) return false;
    const scheduledoc = await Institute.findOne({uiid:user.uiid,"schedule.teachers":{$elemMatch:{"teacherID":teacher.teacherID}}},{
      projection:{"schedule.teachers.$":1}
    });
    if(!scheduledoc) return false;
    const schedule = scheduledoc.schedule.teachers[0];
    
    fs.mkdir(path.join(path.dirname(require.main.filename)+`/backups/${user.uiid}`),()=>{
      const filename = `${user.uiid}_${timer.getTheMoment()}.json`;
      fs.writeFile(path.join(path.dirname(require.main.filename)+`/backups/${user.uiid}/${filename}`),JSON.stringify(schedule),(err)=>{
        sendPromptCallback(filename,err);
      });
    });
  }
  async getSchedule(user, body = {}){
    let teacher = await this.account.getAccount(user);
    if(!teacher) return false;
    
    const inst = await Institute.findOne({uiid: user.uiid},{ projection: { _id: 0, default:1} });
    if (!inst) return false;
    const teacherschedule = await Institute.findOne({uiid: user.uiid,
      [this.schedulepath]: { $elemMatch: { [this.teacherID]: teacher.id } },
    },{
      projection: {[this.getschedulepath]: 1},
    });
    const timings = inst.default.timings;
    if (!teacherschedule) return { schedule:false,timings:timings};
    const schedule = teacherschedule.schedule.teachers[0].days;
    if (body.dayIndex == null) return { schedule: schedule, timings: timings };
    let today = teacherschedule.schedule.teachers[0].days[0];
    today = schedule.find((day) => day.dayIndex == body.dayIndex);
    return { schedule: today?today:false, timings: timings };
  };
}

class Classroom {
  constructor() {
    this.account = new Self().account;
    this.classpath = "users.classes";
    this.studentpath = "users.students";
    this.schedulepath = "schedule.teachers";
    this.uid = "_id";
    this.classname = "classname";
    this.inchargename = "inchargename";
    this.inchargeID = "inchargeID";
    this.students = "students";
      this.username = "username";
      this.studentID = "studentID";

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
              [this.classpath]: data,
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
        return code.event(deldoc.result.nModified?code.OK:code.NO);
      }
    }
  }

  /**
   * Returns classes taken by given teacherID from schedule.
   * @param {String} uiid The uiid of institute.
   * @param {String} teacherID The teacher ID of teacher (email address) to be looked in.
   * @returns {Array} classes taken by the teacher.
   */
  async getClassesByTeacherID(uiid,teacherID){
    let tscheddoc = await Institute.findOne({uiid:uiid,'schedule.teachers':{$elemMatch:{teacherID:teacherID}}});
    let classes = [];
    tscheddoc.days.forEach((day)=>{
      day.period.forEach((period)=>{
        if(!classes.includes(period.classname)){
          classes.push(period.classname);
        }
      })
    });
    return classes.length?classes:false;
  }



  /**
   * returns assigned classroom of given teacher, with pseudo students and other classes taken by the teacher.
   */
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
    
    return {
      classroom: classroom,
      pseudostudents: pseudostudents,
      otherclasses:otherclasses
    };
  }

  /**
   * Returns student account by ID.
   * @param {JSON} user
   * @param {String} studentID
   * @param {Boolean} fullaccount If false, will return full student account (filtered via sharedata module), else returns only name and id. Defaults to false.
   */
  async getStudentByStudentID(user,studentID,fullaccount = false){
    const teacher = await this.account.getAccount(user);
    if(!teacher) return false;
    const studpath = await Institute.findOne({uiid:user.uiid,[this.studentpath]:{$elemMatch:{[this.studentID]:studentID}}},{projection:{[`${this.studentpath}.$`]:1}});
    return fullaccount?share.getStudentShareData(studpath.users.students[0]):{username:studpath.users.students[0].username,studentID:studpath.users.students[0].studentID};
  }

  async getClassroomByClassID(user,classid){
    const classdoc = await Institute.findOne({uiid:user.uiid,[this.classpath]:{$elemMatch:{[this.uid]:ObjectId(classid)}}});
    if(!classdoc) return false;
    return classdoc.users.classes[0];
  }

  async getClassroomByClassname(user,classname){
    const classdoc = await Institute.findOne({uiid:user.uiid,[this.classpath]:{$elemMatch:{[this.classname]:classname}}});
    if(!classdoc) return false;
    return classdoc.users.classes[0];
  }

  async getClassroomByInchargeID(user,inchargeID){
    const classdoc = await Institute.findOne({uiid:user.uiid,[this.classpath]:{$elemMatch:{[this.inchargeID]:inchargeID}}});
    if(!classdoc) return false;
    return classdoc.users.classes[0];
  }

  async getClassroomsBySchedule(user,classnameonly = true,pseudostudents = false){
    const teacher = await this.account.getAccount(user);
    const scheddoc = await Institute.findOne({uiid:user.uiid,[this.schedulepath]:{$elemMatch:{'teacherID':teacher.id}}},{
      projection:{[`${this.schedulepath}.$`]:1}
    });
    let classnames = [];
    scheddoc.teachers[0].days.forEach((day)=>{
      day.period.forEach((period)=>{
        if(!classnames.includes(period.classname)){
          classnames.push(period.classname);
        }
      })
    });
    if(!classnames.length) return false;
    if(classnameonly) return classnames;

    //users.classes
    let classes = [];
    const classdoc = await Institute.findOne({uiid:user.uiid},{projection:{[`${this.classpath}`]:1}});
    classnames.forEach((cname)=>{
      const theclass = classdoc.users.classes.find((Class)=>Class.classname == cname);
      if(theclass) classes.push(theclass);
    });
    if(!classes.length) return false;
    if(!pseudostudents) return classes;

    //including pseudostudents
    const pseudodoc = await Institute.findOne({uiid:user.uiid},{projection:{'pseudousers.classes':1}});
    classes.forEach((Class,c)=>{
      const pclass = pseudodoc.pseudousers.classes.find((pClass)=>pClass.classname == Class.classname);
      if(pclass) classes[c]['pseudostudents'] = pclass.students;
    });
    return classes;
  }

  async handleInvitation(user, body, classroom) {
    const inst = await Institute.findOne({uiid:user.uiid},{projection:{[this.uid]:1}});
    switch (body.action) {
      case "create":{
        return await invite.generateLink(client.student,{
          cid:classroom._id,
          instID:inst._id
        });
      }break;
      case "disable":{
        return await invite.disableInvitation(client.student,{
          cid:classroom._id,
          instID:inst._id
        });
      }
        
    }
    return;
  }
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
      { projection: { "pseudousers.classes.$": 1,"pseudousers.students":1 } }
    );
    if (!pclassdoc) return code.event(code.NO);
    let student = pclassdoc.pseudousers.classes[0].students.find((stud)=>stud.studentID == body.studentID);
    let studaccount = pclassdoc.pseudousers.students.find((acc)=>acc.studentID==body.studentID);
    const query = studaccount?{
      $push: {
        "users.classes.$.students": student,
        "users.students":studaccount
      },
      $pull: {
        "pseudousers.classes.$[outer].students": {
          studentID: student.studentID,
        },
        "pseudousers.students":{studentID:studaccount.studentID}
      },
    }:{
      $push: {
        "users.classes.$.students": student,
      },
      $pull: {
        "pseudousers.classes.$[outer].students": {
          studentID: student.studentID,
        },
      },
    }
    if (!student) return code.event(code.NO);
    const doc = await Institute.updateOne({
        uiid: user.uiid,
        "users.classes": { $elemMatch: { classname: classname } },
      },query,
      {
        arrayFilters: [{ "outer.classname": classname }],
      }
    );
    return code.event(doc.result.nModified ? code.OK : code.NO);
  }
  async rejectStudentRequest(user, body,classname) {
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

    return code.event(doc.result.nModified ? code.OK : code.NO);
  }
}

class Comms{
  constructor(){
    this.account = new Self().account;
    this.classes = new Classroom();
    this.id = "_id";
    this.comms = "comms";
    this.roomname = "roomname";
    this.people = "people";
    this.chats = "chats";
    this.lastmsg = "lastmsg";
    this.voicecalls = "voicecalls";
    this.videocalls = "videocalls";
  }
  /**
   * Returns rooms and calls.
   * @param {JSON} user 
   * @param {String} teacherID 
   */
  async getRoomAndCallList(user){
    const teacher = await this.account.getAccount(user);
    const inst = await Institute.findOne({uiid:user.uiid},{
      projection:{[this.comms]:1,"users.classes":1}
    });
    let rooms = [];
    let calls = [];
    let calltimes = [];
    inst.comms.forEach((room)=>{
      if(room.people.find((person)=>person.id==teacher.id)){
        rooms.push({
          [this.id]:room._id,
          [this.roomname]:room.roomname,
          [this.people]:room.people,
          [this.lastmsg]:room.chats[room.chats.length-1]
        });
        room.voicecalls.forEach((call)=>{
          calltimes.push(call.time);
        });
      }
    });
    calltimes.sort();
    inst.comms.forEach((room)=>{
      if(room.people.find((person)=>person.id==teacher.id)){
        calltimes.forEach((time)=>{
          if(room.voicecalls.find((call)=>call.time==time)){
            calls.push(room.voicecalls);
            if(room.roomname) return calls[calls.length-1][this.roomname] = room.roomname;
            room.people.forEach((person)=>{
              if(person.id!=teacher.id){
                calls[calls.length-1][this.roomname] += `${person.username}, `;
              }
            });
            calls[calls.length-1][this.roomname] = calls[calls.length-1][this.roomname].trim()
            calls[calls.length-1][this.roomname] = calls[calls.length-1][this.roomname].substr(0,calls[calls.length-1][this.roomname].length-2);
          }
        })
      }
    })
    const classroom = inst.users.classes.find((Class)=>Class.inchargeID==teacher.id);
    if(classroom){
      if(rooms.find((room)=>room.roomname==classroom.classname)?false:true){
        rooms.push({
          [this.roomname]:classroom.classname,
          [this.people]:classroom.students
        });
      }
    }
    return rooms.length?{rooms:rooms,calls:calls}:false;
  }


  async getRoom(user,roomdata){
    const teacher = await this.account.getAccount(user);
    let room;
    if(roomdata.roomid) room = await this.getRoomByID(user.uiid,roomdata.roomid);
    else if(roomdata.roomname) {
      room = await this.getRoomByName(user.uiid,roomdata.roomname)
      if(!room){
        const classes = await this.classes.getClassroomsBySchedule(user,false);
        if(classes){  //if classroom is being accessed by teacher
          const theclass = classes.find((Class)=>Class.classname==roomdata.roomname);
          if(theclass) {
            theclass.students.forEach((student,s)=>{
              theclass.students[s]['id'] = student.studentID;
              delete theclass.students[s]['studentID'];
            });
            this.createNewRoom(user,theclass.students,theclass._id,theclass.classname);
          }
        }
      }
    } else if(roomdata.personid){
      room = await this.getSinglePersonRoom(user.uiid,roomdata.personid)
      if(!room){
        const student = await this.classes.getStudentByStudentID(user,roomdata.personid);
        room = await this.createNewRoom(user,[{
          username:student.username,
          id:student.studentID
        }]);
      }
    };
    if(!room) return code.event(code.comms.ROOM_NOT_FOUND);
    if(!room.people.find((person)=>person.id==teacher.id)) return code.event(code.comms.ROOM_ACCESS_DENIED);
    if(room.blocked.includes(teacher.id)) return code.event(code.comms.BLOCKED_FROM_ROOM);
    return room;
  }

  async getRoomByID(uiid,roomid){
    const roomdoc = await Institute.findOne({uiid:uiid,[this.comms]:{$elemMatch:{[this.id]:ObjectId(roomid)}}},{
      projection:{[`${this.comms}.$`]:1}
    });
    if(!roomdoc) return false;
    return roomdoc.comms[0];
  }
  async getRoomByName(uiid,roomname){
    const roomdoc = await Institute.findOne({uiid:uiid,[this.comms]:{$elemMatch:{[this.roomname]:roomname}}},{
      projection:{[`${this.comms}.$`]:1}
    });
    if(!roomdoc) return false;
    return roomdoc.comms[0];
  }
  
  async getSinglePersonRoom(uiid,personid){
    const roomdoc = await Institute.findOne({uiid:uiid},{
      projection:{[`${this.comms}`]:1}
    });
    if(!roomdoc) return false;
    const room = roomdoc.find((room)=>{
      (room.people.length == 2) && (room.people.find((person)=>person.id==personid))
    });
    return room?room:false;
  }

  /**
   * Creates a new room in comms.
   * @returns {Promise} The new room if created, else false.
   */
  async createNewRoom(user,people = [],roomID = new ObjectId(),roomname = String()){
    const teacher = await this.account.getAccount(user);
    if(!teacher) return false;
    if(!people.length) return false;
    people.push({
      username:teacher.username,
      id:teacher.id
    });
    const newroom = {
      _id:roomID,
      roomname:roomname,
      people:people,
      chats:[],
      voicecalls:[],
      videocalls:[],
      blocked:[]
    };
    const donedoc = await Institute.findOneAndUpdate({uiid:user.uiid},{
      $push:{
        [this.comms]:newroom
      }
    });
    if(!donedoc.value) return false;
    return newroom;
  }
  
  chatroom(){

  }
  voicecalling(){

  }
  videocalling(){

  }
}

module.exports = new TeacherWorker();

async function getTeacherById(uiid,id,pseudo = false){
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