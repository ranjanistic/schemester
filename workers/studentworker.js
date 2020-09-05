const Institute = require("../config/db").getInstitute(),
  view = require("../hardcodes/views"),
  code = require("../public/script/codes"),
  verify = require("./common/verification"),
  bcrypt = require("bcryptjs"),
  reset = require("./common/passwordreset"),
  share = require("./common/sharedata"),
  { ObjectId } = require("mongodb");

class StudentWorker {
  constructor() {
    this.self = new Self();
    this.schedule = new Schedule();
  }
  toSession = (u, query = { target: view.student.target.dash }) => {
    let path = `/student/session?u=${u}`;
    for (var key in query) {
      if (query.hasOwnProperty(key)) {
        path = `${path}&${key}=${query[key]}`;
      }
    }
    return path;
  };
  toLogin = (query = { target: view.student.target.dash }) => {
    let i = 0;
    let path = "/student/auth/login";
    for (var key in query) {
      if (query.hasOwnProperty(key)) {
        path =
          i > 0
            ? `${path}&${key}=${query[key]}`
            : `${path}?${key}=${query[key]}`;
        i++;
      }
    }
    clog(path);
    return path;
  };
}

class Self {
  constructor() {
    const path = `users.classes`;
    const pseudopath = `pseudousers.classes`;

    const studentspath = `${path}.$.students`;
    const pseudostudentspath = `${pseudopath}.$.students`;

    this.path = path;
    this.pseudopath = pseudopath;

    this.studentspath = studentspath;
    this.pseudostudentspath = pseudostudentspath;

    this.classname = "classname";
    class Account {
      constructor() {
        this.path = path;
        this.pseudopath = pseudopath;
        this.studentspath = studentspath;
        this.pseudostudentspath = pseudostudentspath;
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

      async createAccount(uiid, classname, newstudent) {
        clog("og");
        const doc = await Institute.findOneAndUpdate(
          {
            uiid: uiid,
            [path]: {
              $elemMatch: { classname: classname },
            }, //existing classname
          },
          {
            $push: { [studentspath]: newstudent }, //new student push
          }
        );
        clog(doc);
        return code.event(doc.value ? code.OK : code.NO);
      }

      /**
       * This will create an account in a class of the pseudousers object of instiution, and will be shown as a requestee student to join the classroom.
       * @param {String} uiid The unique institute ID
       * @param {String} classname The classname of classroom in which request is to be sent.
       * @param {JSON} pseudostudent The student data for which pseudo account will be created.
       */
      async createPseudoAccount(uiid, classname, pseudostudent) {
        const doc = await Institute.findOneAndUpdate(
          {
            uiid: uiid,
            [pseudopath]: { $elemMatch: { classname: classname } },
          },
          {
            $push: {
              [pseudostudentspath]: pseudostudent,
            },
          }
        );
        clog(doc);
        return code.event(doc.value ? code.OK : code.NO);
      }

      /**
       * To change current teacher's user name
       */
      changeName = async (user, body) => {
        let student = await getStudentById(user.uiid, user.classname, user.id);
        clog(student);
        const pseudo = student ? false : true;
        student = student
          ? student
          : await getStudentById(user.uiid, user.classname, user.id, true);
        if (!student) return code.event(code.auth.USER_NOT_EXIST);
        const namepath = pseudo
          ? `${pseudopath}.$[outer].students.$[outer1].${this.username}`
          : `${this.path}.$[outer].students.$[outer1].${this.username}`;
        const newstudent = await Institute.updateOne(
          { uiid: user.uiid },
          {
            $set: {
              [namepath]: body.newname,
            },
          },
          {
            arrayFilters: [
              { "outer.classname": user.classname },
              { "outer1._id": ObjectId(user.id) },
            ],
          }
        );
        clog(newstudent.result);
        return code.event(newstudent.result.nModified ? code.OK : code.NO);
      };

      /**
       * To change current students's user password
       */
      changePassword = async (user, body) => {
        let student = await getStudentById(user.uiid, user.classname, user.id);
        clog(student);
        const pseudo = student ? false : true;
        student = student
          ? student
          : await getStudentById(user.uiid, user.classname, user.id, true);
        if (!student) return code.event(code.auth.USER_NOT_EXIST);
        const passpath = pseudo
          ? `${pseudopath}.$[outer].students.$[outer1].${this.password}`
          : `${this.path}.$[outer].students.$[outer1].${this.password}`;
        const rlinkpath = pseudo
          ? `${pseudopath}.$[outer].students.$[outer1].${this.rlinkexp}`
          : `${this.path}.$[outer].students.$[outer1].${this.rlinkexp}`;
        const salt = await bcrypt.genSalt(10);
        const epassword = await bcrypt.hash(body.newpassword, salt);
        const newstudent = await Institute.updateOne(
          { uiid: user.uiid },
          {
            $set: {
              [passpath]: epassword,
            },
            $unset: {
              [rlinkpath]: null,
            },
          },
          {
            arrayFilters: [
              { "outer.classname": user.classname },
              { "outer1._id": ObjectId(user.id) },
            ],
          }
        );
        clog(newstudent.result);
        return code.event(newstudent.result.nModified ? code.OK : code.NO);
      };

      /**
       *
       */
      changeEmailID = async (user, body) => {
        let student = await getStudentById(user.uiid, user.classname, user.id);
        clog(student);
        const pseudo = student ? false : true;
        student = student
          ? student
          : await getStudentById(user.uiid, user.classname, user.id, true);
        if (!student) return code.event(code.auth.USER_NOT_EXIST);
        if (student.studentID == body.newemail)
          return code.event(code.auth.SAME_EMAIL);
        const mailpath = pseudo
          ? `${pseudopath}.$[outer].students.$[outer1].${this.studentID}`
          : `${this.path}.$[outer].students.$[outer1].${this.studentID}`;
        const verifypath = pseudo
          ? `${pseudopath}.$[outer].students.$[outer1].${this.verified}`
          : `${this.path}.$[outer].students.$[outer1].${this.verified}`;
        const newstudent = await Institute.updateOne(
          { uiid: user.uiid },
          {
            $set: {
              [mailpath]: body.newemail,
              [verifypath]: false,
            },
          },
          {
            arrayFilters: [
              { "outer.classname": user.classname },
              { "outer1._id": ObjectId(user.id) },
            ],
          }
        );
        clog(newstudent.result);
        return code.event(newstudent.result.nModified ? code.OK : code.NO);
      };

      /**
       *
       */
      deleteAccount = async (user) => {
        let student = await getStudentById(user.uiid, user.classname, user.id);
        clog(student);
        const pseudo = student ? false : true;
        student = student
          ? student
          : await getStudentById(user.uiid, user.classname, user.id, true);
        if (!student) return code.event(code.auth.USER_NOT_EXIST);
        const studentpath = pseudo
          ? `${pseudopath}.$[outer].students`
          : `${this.path}.$[outer].students`;
        const newstudent = await Institute.updateOne(
          { uiid: user.uiid },
          {
            $pull: {
              [studentpath]: { _id: ObjectId(user.id) },
            },
          },
          {
            arrayFilters: [{ "outer.classname": user.classname }],
          }
        );
        clog(newstudent.result);
        return code.event(newstudent.result.nModified ? code.OK : code.NO);
      };
    }
    class Preferences {
      constructor() {
        this.studentspath = studentspath;
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
        const linkdata = await verify.generateLink(verify.target.student, {
          uid: user.id,
          cid: body.cid,
          instID: body.instID,
        });
        clog(linkdata);
        //todo: send email then return.
        return code.event(
          linkdata ? code.mail.MAIL_SENT : code.mail.ERROR_MAIL_NOTSENT
        );
      }
      case "check": {
        let classdoc = await Institute.findOne(
          {
            uiid: user.uiid,
            [this.path]: { $elemMatch: { [this.classname]: user.classname } },
          },
          { projection: { "users.classes.$": 1 } }
        );
        let student;
        if (!classdoc) {
          return false;
        }
        let found = classdoc.users.classes[0].students.some((stud) => {
          if (String(stud._id) == String(user.id)) {
            student = stud;
            return true;
          }
        });
        if (!found) {
          classdoc = await Institute.findOne(
            {
              uiid: user.uiid,
              [this.pseudopath]: {
                $elemMatch: { [this.classname]: user.classname },
              },
            },
            { projection: { "pseudousers.classes.$": 1 } }
          );
          found = classdoc.pseudousers.classes[0].students.some((stud) => {
            if (String(stud._id) == String(user.id)) {
              student = stud;
              return true;
            }
          });
          if (!found) return false;
          return code.event(
            student.verified ? code.verify.VERIFIED : code.verify.NOT_VERIFIED
          );
        }
        return code.event(
          student.verified ? code.verify.VERIFIED : code.verify.NOT_VERIFIED
        );
      }
    }
  };
  handlePassReset = async (user, body) => {
    switch (body.action) {
      case "send":
        {
          clog("insend");
          clog(body);
          clog(user ? true : false);
          if (!user) {
            //user not logged in
            const classdoc = await Institute.findOne(
              {
                uiid: body.uiid,
                "users.classes": { $elemMatch: { classname: body.classname } },
              },
              { projection: { _id: 1, "users.classes.$": 1 } }
            );
            if (!classdoc) code.event(code.inst.CLASS_NOT_FOUND);
            let student;
            let found = classdoc.users.classes[0].students.some((stud) => {
              if (stud.studentID == body.email) {
                student = share.getStudentShareData(stud);
                return true;
              }
            });
            clog(classdoc);
            if (!found) {
              const pseudodoc = await Institute.findOne(
                {
                  uiid: body.uiid,
                  "pseudousers.classes": {
                    $elemMatch: { classname: body.classname },
                  },
                },
                { projection: { _id: 1, "pseudousers.classes.$": 1 } }
              );
              clog(pseudodoc);
              if (!pseudodoc) return code.event(code.inst.CLASS_NOT_FOUND); //don't tell if user not exists, while sending reset email.
              found = classdoc.users.classes[0].students.some((stud) => {
                if (stud.studentID == body.email) {
                  student = share.getPseudoStudentShareData(stud);
                  return true;
                }
              });
              clog(found);
              if (!found) return code.event(code.OK);
            }
            body["instID"] = classdoc._id;
            body["cid"] = classdoc.users.classes[0]._id;
            clog(body);
            clog("here");
            return await this.handlePassReset({ id: student.uid }, body);
          }
          clog("gotcha");
          clog(user);
          const linkdata = await reset.generateLink(reset.target.student, {
            uid: user.id,
            cid: body.cid,
            instID: body.instID,
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

class Schedule {
  constructor() {}
  getSchedule = async (user, dayIndex = null) => {
    const classdoc = await Institute.findOne({uiid: user.uiid,},{
      projection: {
        _id: 0,
        default: 1,
        "schedule.teachers": 1,
      }
    });
    const timings = classdoc.default.timings;
    let thisday = {};
    let days = Array(timings.daysInWeek.length);
    if (dayIndex!=null) {
      classdoc.schedule.teachers.some((teacher) => {
        teacher.days.some((day) => {
          if (dayIndex == day.dayIndex) {
            thisday = {
              dayIndex: day.dayIndex,
              period: Array(timings.periodsInDay),
            };
            day.period.forEach((period, p) => {
              if (period.classname == user.classname) {
                thisday["period"][p] = {
                  teacherID: teacher.teacherID,
                  subject: period.subject,
                  hold: period.hold,
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
      classdoc.schedule.teachers.some((teacher) => {
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
              days[d]["period"][p] = {
                teacherID: teacher.teacherID,
                subject: period.subject,
                hold: period.hold,
              };
            }
          });}
        });
        let done = days.some((day) => {
          return day.period.includes(undefined);
        });
        return !done;
      });
      return { schedule: days, timings: timings };
    }
  };
}

module.exports = new StudentWorker();
const clog = (m) => console.log(m);
async function getStudentById(uiid, classname, id, pseudo = false) {
  let path = pseudo ? "pseudousers.classes" : "users.classes";
  let getpath = pseudo ? "pseudousers.classes.$" : "users.classes.$";
  const cdoc = await Institute.findOne(
    { uiid: uiid, [path]: { $elemMatch: { classname: classname } } },
    {
      projection: {
        [getpath]: 1,
      },
    }
  );
  if (!cdoc) return false;
  let student;
  let found = pseudo
    ? cdoc.pseudousers.classes[0].students.some((stud) => {
        if (String(stud._id) == String(id)) {
          student = stud;
          return true;
        }
      })
    : cdoc.users.classes[0].students.some((stud) => {
        if (String(stud._id) == String(id)) {
          student = stud;
          return true;
        }
      });
  return found ? student : false;
}
async function getStudentByEmail(uiid, classname, email, pseudo = false) {
  let path = pseudo ? "pseudousers.classes" : "users.classes";
  let getpath = pseudo ? "pseudousers.classes.$" : "users.classes.$";
  const cdoc = await Institute.findOne(
    { uiid: uiid, [path]: { $elemMatch: { classname: classname } } },
    {
      projection: {
        [getpath]: 1,
      },
    }
  );
  if (!cdoc) return false;
  let student;
  let found = pseudo
    ? cdoc.pseudousers.classes[0].students.some((stud) => {
        if (stud.studentID == email) {
          student = stud;
          return true;
        }
      })
    : cdoc.users.classes[0].students.some((stud) => {
        if (stud.studentID == email) {
          student = stud;
          return true;
        }
      });
  return found ? student : false;
}
