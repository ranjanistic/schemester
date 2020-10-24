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

      async getAccount(user){
        let studentdoc = await Institute.findOne({
          uiid:user.uiid,
          [studentspath]:{
            $elemMatch:{[this.uid]:ObjectId(user.id)}
          }
        },{
          projection:{
            [this.uid]:0,
            "users.students.$":1
          }
        });
        if(studentdoc)
          return studentdoc.users.students[0];
        studentdoc = await Institute.findOne({
          uiid:user.uiid,
          [pseudostudentspath]:{
            $elemMatch:{[this.uid]:ObjectId(user.id)}
          }
        },{
          projection:{
            [this.uid]:0,
            "pseudousers.students.$":1
          }
        });
        studentdoc.pseudousers.students[0]['pseudo'] = true;
        return studentdoc?studentdoc.pseudousers.students[0]:false;
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
        const linkdata = await verify.generateLink(client.student, {
          uid: user.id,
          cid: body.cid,
          instID: body.instID,
        });
        if(!linkdata) return code.event(code.mail.ERROR_MAIL_NOTSENT);
        return await mailer.sendVerificationEmail(linkdata);
      }
      case "check": {
        let studdoc = await Institute.findOne(
          {
            uiid: user.uiid,
            [this.studentspath]: { $elemMatch: { [this.uid]: ObjectId(user.id) } },
          },
          { projection: { "users.students.$": 1 } }
        );
        let student;
        if(studdoc){
          student = studdoc.users.students[0];
          return code.event(
            student.verified ? code.verify.VERIFIED : code.verify.NOT_VERIFIED
          );
        }
        if (!studdoc) {
          studdoc = await Institute.findOne(
            {
              uiid: user.uiid,
              [this.pseudostudentspath]: {
                $elemMatch: { [this.uid]: ObjectId(user.id) },
              },
            },
            { projection: { "pseudousers.students.$": 1 } }
          );
          if(!studdoc) return false;
          student = studdoc.pseudousers.students[0];
          return code.event(
            student.verified ? code.verify.VERIFIED : code.verify.NOT_VERIFIED
          );
        }
        
      }
    }
  };
  handlePassReset = async (user, body) => {
    switch (body.action) {
      case "send":{

          if (!user) {
            //user not logged in
            const classdoc = await Institute.findOne({
                uiid: body.uiid,
                "users.classes": { $elemMatch: { classname: body.classname } },
              },
              { projection: { _id: 1, "users.classes.$": 1 } }
            );

            if (!classdoc) code.event(code.inst.CLASS_NOT_FOUND);
            let student = share.getStudentShareData(classdoc.users.classes[0].students.find((stud) =>stud.studentID == body.email));
            if (!student) {
              const pseudodoc = await Institute.findOne(
                {
                  uiid: body.uiid,
                  "pseudousers.classes": {
                    $elemMatch: { classname: body.classname },
                  },
                },
                { projection: { _id: 1, "pseudousers.classes.$": 1 } }
              );
              if (!pseudodoc) return code.event(code.inst.CLASS_NOT_FOUND); //don't tell if user not exists, while sending reset email.
              student = share.getPseudoStudentShareData(pseudodoc.pseudousers.classes[0].students.find((stud) =>stud.studentID == body.email));
              if (!student) return code.event(code.OK);
              body["instID"] = pseudodoc._id;
              body["cid"] = pseudodoc.pseudousers.classes[0]._id;
              return await this.handlePassReset({ id: student.uid }, body);  
            }
            body["instID"] = classdoc._id;
            body["cid"] = classdoc.users.classes[0]._id;

            return await this.handlePassReset({ id: student.uid }, body);
          }
          const linkdata = await reset.generateLink(client.student, {
            uid: user.id,
            cid: body.cid,
            instID: body.instID,
          });
          if(!linkdata) return code.event(code.mail.ERROR_MAIL_NOTSENT);
          return await mailer.sendPasswordResetEmail(linkdata);
        }
    }
  };
}

class Schedule {
  constructor() {}
  getSchedule = async (user, dayIndex = null) => {
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
          });}
        });
        let done = !days.find((day) => day.period.includes(undefined))?true:false;
        return !done;
      });
      return { schedule: days, timings: timings };
    }
  };
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
