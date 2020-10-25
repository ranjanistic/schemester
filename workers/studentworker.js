const Institute = require("../config/db").getInstitute(),
  {code,client,view,clog} = require("../public/script/codes"),
  verify = require("./common/verification"),
  bcrypt = require("bcryptjs"),
  reset = require("./common/passwordreset"),
  mailer = require("./common/mailer"),
  share = require("./common/sharedata"),
  { ObjectId } = require("mongodb");

class StudentWorker {
  constructor() {
    this.self = new Self();
    this.schedule = new Schedule();
    this.classes = new Classroom();
  }
  toSession = (u, query = { target: view.student.target.dash }) => {
    let path = `/${client.student}/session?u=${u}`;
    for (var key in query) {
      if (query.hasOwnProperty(key)) {
        path = `${path}&${key}=${query[key]}`;
      }
    }
    return path;
  };
  toLogin = (query = { target: view.student.target.dash }) => {
    let i = 0;
    let path = `/${client.student}/auth/login`;
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
    const classpath = `users.classes`;
    const pseudoclasspath = `pseudousers.classes`;
    const studentspath = `users.students`;
    const pseudostudentspath = `pseudousers.students`;
    const studentsclasspath = `${classpath}.$.students`;
    const pseudostudentsclasspath = `${pseudoclasspath}.$.students`;

    this.classpath = classpath;
    this.pseudoclasspath = pseudoclasspath;
    this.studentspath = studentspath;
    this.pseudostudentspath = pseudostudentspath;
    this.studentsclasspath = studentsclasspath;
    this.pseudostudentsclasspath = pseudostudentsclasspath;
    this.uid = "_id";
    this.classname = "classname";
    class Account {
      constructor() {
        this.path = classpath;
        this.pseudopath = pseudoclasspath;
        this.studentspath = studentsclasspath;
        this.pseudostudentspath = pseudostudentsclasspath;
        this.classname = "classname";
        this.uid = "_id";
        this.username = "username";
        this.studentID = "studentID";
        this.password = "password";
        this.createdAt = "createdAt";
        this.verified = "verified";
        this.vlinkexp = "vlinkexp";
        this.rlinkexp = "rlinkexp";
      }
      //send feedback emails

      async getAccount(user,raw = false){
        let student = await this.getStudentById(user.uiid,user.id);
        if(student)
          return raw?student:share.getStudentShareData(student,user.uiid);
        student = this.getStudentById(user.uiid,user.id,true);
        if(!student) return false;
        if(raw) student['pseudo'] = true;
        return raw?student:share.getPseudoStudentShareData(student,user.uiid);
      }

      async getStudentById(uiid, id, pseudo = false) {
        const path = pseudo ? [pseudostudentspath] : [studentspath];
        const getpath =`${path}.$`;
        const sdoc = await Institute.findOne(
          { uiid: uiid, [path]: { $elemMatch: { _id: ObjectId(id) } } },
          {
            projection: {
              [getpath]: 1,
            },
          }
        );
        if (!sdoc) return false;
        const student = pseudo
          ? sdoc.pseudousers.students[0]
          : sdoc.users.students[0];
        return student ? student : false;
      }

      /**
       * This will create an account in a class of the pseudousers object of instiution, and will be shown as a requestee student to join the classroom.
       * @param {String} uiid The unique institute ID
       * @param {String} classname The classname of classroom in which request is to be sent.
       * @param {JSON} pseudostudent The student data for which pseudo account will be created.
       */
      async createAccount(uiid, newstudent,pseudo = true) {
        const doc = await Institute.findOneAndUpdate({
            uiid: uiid,
          },
          {
            $push: { [pseudo?pseudostudentspath:studentspath]: newstudent }, //new student account push
          }
        );
        return code.event(doc.value ? code.OK : code.NO);
      }

      async getStudentByEmail(uiid, email, pseudo = false) {
        const path = pseudo ? "pseudousers.students" : "users.students";
        const getpath = `${path}.$`;
        const cdoc = await Institute.findOne(
          { uiid: uiid, [path]: { $elemMatch: { studentID: email } } },
          {
            projection: {
              [getpath]: 1,
            },
          }
        );
        if (!cdoc) return false;
        const student = pseudo
          ? cdoc.pseudousers.students[0]
          : cdoc.users.students[0];
        return student ? student : false;
      }
      

      /**
       * This will create add student to the given class of instiution, and will be shown as a requestee student to join the classroom if pseudo = true (default).
       * @param {String} uiid The unique institute ID
       * @param {String} classname The classname of classroom in which request is to be sent.
       * @param {JSON} student The student data, should only contain username & studentID.
       * @param {Boolean} pseudo Defaults to true. If true, will add student in pseudousers.classes classroom, as a request, otherwise in users.classes classroom, as student.
       */
      async addStudentToClass(uiid,classname,student,pseudo = true){
        const doc = await Institute.findOneAndUpdate({
          uiid:uiid,
          [pseudo?pseudoclasspath:classpath]:{$elemMatch:{classname:classname}}
        },{
          $push:{
            [pseudo?pseudostudentsclasspath:studentsclasspath]:student
          }
        });
        return code.event(doc.value ? code.OK : code.NO); 
      }

      /**
       * Changes the student's username, everywhere.
       */
      changeName = async (user, body) => {
        let student = await getStudentById(user.uiid, user.id);
        const pseudo = student ? false : true;
        student = student
          ? student
          : await getStudentById(user.uiid, user.id, true);
        if (!student) return code.event(code.auth.USER_NOT_EXIST);
        const namepath = pseudo
          ? `${pseudostudentspath}.$.${this.username}`
          : `${studentspath}.$.${this.username}`;
        const accdoc = await Institute.findOneAndUpdate({
          uiid:user.uiid,
          [pseudo?pseudostudentspath:studentspath]:{$elemMatch:{[this.uid]:ObjectId(user.id)}}
        },{
          $set:{[namepath]:body.newname}
        }); //updating in student account

        if(!accdoc.value) return code.event(code.NO);
        const nameclasspath = pseudo
          ? `${pseudoclasspath}.$[outer].students.$[outer1].${this.username}`
          : `${classpath}.$[outer].students.$[outer1].${this.username}`;
        const newstudent = await Institute.update(
          { uiid: user.uiid },
          {
            $set: {
              [nameclasspath]: body.newname,
            },
          },
          {
            arrayFilters: [
              { "outer.classname": user.classname },
              { "outer1.studentID": student.studentID },
            ],
          }
        );  //updating in all classrooms
        return code.event(newstudent.result.nModified ? code.OK : code.NO);
      };

      /**
       * Changes the student's account password.
       */
      changePassword = async (user, body) => {
        let student = await getStudentById(user.uiid, user.id);
        const pseudo = student ? false : true;
        student = student
          ? student
          : await getStudentById(user.uiid, user.id, true);
        if (!student) return code.event(code.auth.USER_NOT_EXIST);

        const passpath = pseudo
          ? `${pseudostudentspath}.$.${this.password}`
          : `${studentspath}.$.${this.password}`;
        const rlinkpath = pseudo
        ? `${pseudostudentspath}.$.${this.rlinkexp}`
        : `${studentspath}.$.${this.rlinkexp}`;

        const salt = await bcrypt.genSalt(10);
        const epassword = await bcrypt.hash(body.newpassword, salt);
        const accdoc = await Institute.findOneAndUpdate({
          uiid:user.uiid,
          [studentspath]:{$elemMatch:{[this.uid]:ObjectId(user.id)}}
        },{
          $set:{
            [passpath]:epassword
          },
          $unset: {
            [rlinkpath]: null,
          },
        }); //updating in student account
        return code.event(accdoc.value ? code.OK : code.NO);
      };

      /**
       * Changes email address of a student, everywhere.
       */
      changeEmailID = async (user, body) => {
        let student = await getStudentById(user.uiid, user.id);
        const pseudo = student ? false : true;
        student = student
          ? student
          : await getStudentById(user.uiid, user.id, true);
        if (!student) return code.event(code.auth.USER_NOT_EXIST);
        if (student.studentID == body.newemail)
          return code.event(code.auth.SAME_EMAIL);
        const mailpath = pseudo
          ? `${pseudostudentspath}.$.${this.studentID}`
          : `${studentspath}.$.${this.studentID}`;
        const verifypath = pseudo
          ? `${pseudostudentspath}.$.${this.verified}`
          : `${studentspath}.$.${this.verified}`;
        const accdoc = await Institute.findOneAndUpdate({
          uiid:user.uiid,
          [pseudo?pseudostudentspath:studentspath]:{$elemMatch:{[this.uid]:ObjectId(user.id)}}
        },{
          $set:{[mailpath]:body.newemail,[verifypath]: false}
        }); //updating in student account
        if(!accdoc.value) return code.event(code.NO);

        const mailclasspath = pseudo
          ? `${pseudoclasspath}.$[outer].students.$[outer1].${this.studentID}`
          : `${classpath}.$[outer].students.$[outer1].${this.studentID}`;
        const newstudent = await Institute.update(
          { uiid: user.uiid },
          {
            $set: {
              [mailclasspath]: body.newemail,
            },
          },
          {
            arrayFilters: [
              { "outer.classname": user.classname },
              { "outer1.studentID": student.studentID },
            ],
          }
        );  //updating in all classrooms
        return code.event(newstudent.result.nModified ? code.OK : code.NO);
      };

      /**
       * Delete student account, and remove from classrooms.
       */
      deleteAccount = async (user) => {
        let student = await getStudentById(user.uiid, user.id);
        const pseudo = student ? false : true;
        student = student
          ? student
          : await getStudentById(user.uiid, user.id, true);
        if (!student) return code.event(code.auth.USER_NOT_EXIST);
        const delacc = await Institute.findOneAndUpdate({
          uiid:user.uiid,
          [pseudo?pseudostudentspath:studentspath]:{$elemMatch:{[this.uid]:ObjectId(user.id)}}
        },{
          $pull:{
            [pseudo?pseudostudentspath:studentspath]:{[this.uid]:ObjectId(user.id)}
          }
        });//removing student account
        if(!delacc.value) return code.event(code.NO);
        const studentcpath =  `${classpath}.$[outer].students`;
        const pstudentcpath = `${pseudoclasspath}.$[outer].students`;
        const delcstudent = await Institute.updateOne(
          { uiid: user.uiid },
          {
            $pull: {
              [pstudentcpath]: { [this.studentID]: student.studentID },
              [studentcpath]: { [this.studentID]: student.studentID },
            },
          },
          {
            arrayFilters: [{ "outer.classname": user.classname }],
          }
        );  //removing from all classrooms
        return code.event(code.OK);
      };
    }

    class Preferences {
      constructor() {
        this.studentspath = studentsclasspath;
        this.object = `prefs`;
      }
      getSpecificPath(specific) {
        return `${this.object}.${specific}`;
      }
      async setPreference(user, body) {
        let value;
        switch (body.specific) {
          default:
            return null;
        }
      }
      async getPreference(user, body) {}
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
        const inst = await Institute.findOne({uiid:user.uiid},{projection:{[this.uid]:1}});
        if(!inst) return code.event(code.inst.INSTITUTION_NOT_EXISTS);
        const linkdata = await verify.generateLink(client.student, {
          uid: user.id,
          instID: inst._id,
        });
        if(!linkdata) return code.event(code.mail.ERROR_MAIL_NOTSENT);
        return await mailer.sendVerificationEmail(linkdata);
      } break;
      case "check": {
        const student = await this.account.getAccount(user);
        if (!student)
          return code.event(code.auth.USER_NOT_EXIST);
        return code.event(
          student.verified
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
          inst = await Institute.findOne({uiid:body.uiid},{projection:{[this.uid]:1}});
          if(!inst) return code.event(code.OK);
          //user not logged in
          let student = await this.account.getStudentByEmail(body.uiid,body.email);
          if (!student) {
            student = await this.account.getStudentByEmail(body.uiid,body.email,true);
            if (!student) return code.event(code.OK);
          }
          return await this.handlePassReset({ id: share.getPseudoStudentShareData(student).uid,uiid:body.uiid }, body);
        } else {
          inst = await Institute.findOne({uiid:user.uiid},{projection:{[this.uid]:1}});
        }
        const linkdata = await reset.generateLink(client.student, {
          uid: user.id,
          instID: inst._id,
        });
        if(!linkdata) return code.event(code.mail.ERROR_MAIL_NOTSENT);
        return await mailer.sendPasswordResetEmail(linkdata);
      }
    }
  };
}

class Schedule {
  constructor() {
    this.account = new Self().account;
    this.classes = new Classroom();
  }
  async getSchedule (user, dayIndex = null){
    const teacherdoc = await Institute.findOne({uiid: user.uiid},{
      projection: {
        _id: 0,
        default: 1,
        "schedule.teachers": 1,
      }
    });
    const timings = teacherdoc.default.timings;
    let thisday = {};
    const days = Array(timings.daysInWeek.length);
    if (dayIndex!=null) {
      teacherdoc.schedule.teachers.some((teacher) => {
        teacher.days.some((day) => {
          if (dayIndex == day.dayIndex) {
            thisday = {
              dayIndex: day.dayIndex,
              period: Array(timings.periodsInDay),
            };
            day.period.forEach((period, p) => {
              if (period.classname == user.classname) {
                thisday.period[p] = {
                  teachername:teacher.teachername,
                  teacherID: teacher.teacherID,
                  subject: period.subject,
                  hold: period.hold,
                  temp:period.temp
                };
              }
            });
            return true;
          }
        });
        if (thisday.period&&!thisday.period.includes(undefined)) return true;
      });
      return { schedule: thisday.hasOwnProperty('period')?thisday:false, timings: timings };
    } else {
      teacherdoc.schedule.teachers.some((teacher) => {
        teacher.days.forEach((day, d) => {
          try {
            if (days[d].dayIndex != day.dayIndex) {
              days.push({
                dayIndex: day.dayIndex,
                period: Array(timings.periodsInDay),
              });
            }
          } catch {
            days[d] = {
              dayIndex: day.dayIndex,
              period: Array(timings.periodsInDay),
            };
          }
          if(days[d].period.includes(undefined)){
          day.period.forEach((period, p) => {
            if (period.classname == user.classname) {
              days[d].period[p] = {
                teachername:teacher.teachername,
                teacherID: teacher.teacherID,
                subject: period.subject,
                hold: period.hold,
              };
            }
          })};
        });
        let done = !days.find((day) => day.period.includes(undefined))?true:false;
        return !done;
      });
      //todo: schedule of other classes of student in place of free periods of base class of student.
      // let student = await this.account.getAccount(user);
      // let classrooms = await this.classes.getClassesByStudentID(user.uiid,student.id);
      // classrooms.classes.map((Class)=>{
      //   return new Promise(async(resolve)=>{
      //     if(Class.classname!=user.classname){
      //       await this.getSchedule({id:user.id,uiid:user.uiid,classname:Class.classname});
      //     }
      //     resolve()
      //   })
      // })
      // days.forEach((day,d)=>{
      //   day.period.forEach((period,p)=>{
      //     if(period==undefined){

      //     }
      //   })
      // })
      // clog(days[0].period[0]==undefined?true:false);
      return { schedule: days, timings: timings };
    }
  };
}

class Classroom{
  constructor(){
    this.classpath = `users.classes`;
    this.pseudoclasspath = `pseudousers.classes`;
  }
  /**
   * Finds all classrooms of given student ID in institution of given uiid. (including pseudo classes)
   * @param {String} uiid The uiid of institution
   * @param {String} studentID The student ID (email address) of student to be searched in classrooms.
   * @param {Boolean} classnameonly If true, will only return array of classnames, else array of classes with details. Defaults to false.
   * @returns {JSON} JSON object of JSONArrays classes & pseudoclasses.
   */
  async getClassesByStudentID(uiid,studentID,classnameonly = false){
    const cdoc = await Institute.findOne({
      uiid:uiid
    },{
      projection:{
        [this.classpath]:1,
        [this.pseudoclasspath]:1
      }
    });
    if(!cdoc) return false;
    let classes = [];
    cdoc.users.classes.forEach((Class)=>{
      if(Class.students.find((stud)=>stud.studentID == studentID)?true:false){
        classes.push(Class)
      }
    });
    let pclasses = [];
    cdoc.pseudousers.classes.forEach((Class)=>{
      if(Class.students.find((stud)=>stud.studentID == studentID)?true:false){
        pclasses.push(Class)
      }
    });
    if(!(classes.length||pclasses.length)) return false;
    if(classnameonly){
      classes.forEach((Class,c)=>{
        classes[c] = Class.classname;
      });
      pclasses.forEach((pClass,c)=>{
        pclasses[c] = pClass.classname;
      });
    }
    return {
      classes:classes,
      pseudoclasses:pclasses
    };
  }
}


module.exports = new StudentWorker();

async function getStudentById(uiid, id, pseudo = false) {
  const path = pseudo ? "pseudousers.students" : "users.students";
  const getpath =`${path}.$`;
  const sdoc = await Institute.findOne(
    { uiid: uiid, [path]: { $elemMatch: { _id: ObjectId(id) } } },
    {
      projection: {
        [getpath]: 1,
      },
    }
  );
  if (!sdoc) return false;
  const student = pseudo
    ? sdoc.pseudousers.students[0]
    : sdoc.users.students[0];
  return student ? student : false;
}
async function getStudentByEmail(uiid, email, pseudo = false) {
  const path = pseudo ? "pseudousers.students" : "users.students";
  const getpath = `${path}.$`;
  const cdoc = await Institute.findOne(
    { uiid: uiid, [path]: { $elemMatch: { studentID: email } } },
    {
      projection: {
        [getpath]: 1,
      },
    }
  );
  if (!cdoc) return false;
  const student = pseudo
    ? cdoc.pseudousers.students[0]
    : cdoc.users.students[0];
  return student ? student : false;
}
