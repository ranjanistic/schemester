const cpass = require("../config/config.json").db.cpass,
  Admin = require("../config/db").getAdmin(cpass),
  Institute = require("../config/db").getInstitute(cpass),
  bcrypt = require("bcryptjs"),
  path = require("path"),
  fs = require("fs"),
  timer = require("./common/timer"),
  inspect = require("./common/inspector"),
  {code, client, view, action, stringIsValid, validType, clog} = require("../public/script/codes"),
  invite = require("./common/invitation"),
  verify = require("./common/verification"),
  mailer = require("./common/mailer"),
  reset = require("./common/passwordreset"),
  share = require("./common/sharedata"),
  { ObjectId } = require("mongodb");


class AdminWorker {
  constructor() {
    this.inst = new Institution();
    this.today = new Today();
    this.self = new Self();
    this.default = new Default();
    this.users = new Users();
    this.schedule = new Schedule();
    this.classroom = new Classroom();
    this.invite = new Invite();
    this.pseudo = new PseudoUsers();
    this.vacation = new Vacations();
    this.prefs = new Preferences();
  }
  toSession = (u, query = { target: view.admin.target.dashboard }) => {
    let path = `/${client.admin}/session?u=${u}`;
    for (var key in query) {
      if (query.hasOwnProperty(key)) {
        path = `${path}&${key}=${query[key]}`;
      }
    }
    return path;
  };
  toLogin = (query = { target: view.admin.target.dashboard }) => {
    let i = 0;
    let path = `/${client.admin}/auth/login`;
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
  async getInstitute(user) {
    const inst = await Institute.findOne({ uiid: user.uiid });
    return inst ? inst : code.event(code.NO);
  }
}

class Today {
  constructor() {}
  async handlerequest(user, body) {
    switch (body.action) {
      case action.fetch:
        {
          switch (body.specific) {
            default: {
              const today = new Date().getDay();
              const instdoc = await Institute.findOne(
                { uiid: user.uiid },
                {
                  projection: {
                    _id: 1,
                    "default.timings": 1,
                    schedule: 1,
                    vacations: 1,
                  },
                }
              );
              if (!instdoc) return code.event(code.inst.INSTITUTION_NOT_EXISTS);
              let teachers = [];
              instdoc.schedule.teachers.forEach((teacher) => {
                teacher.days.forEach((day) => {
                  if (day.dayIndex == today) {
                    teachers.push({
                      teacherID: teacher.teacherID,
                      absent: teacher.absent,
                      periods: day.period,
                    });
                  }
                });
              });
              return {
                instID: instdoc._id,
                timings: instdoc.default.timings,
                teachers: teachers,
                vacations: instdoc.vacations,
              };
            }
          }
        }
        break;
      case action.update: {
      }
    }
  }
}

class Self {
  constructor() {
    class Account {
      constructor() {
        this.defaults = new Default();
        this.uid = "_id";
        this.username = "username";
        this.email = "email";
        this.password = "password";
        this.uiid = "uiid";
        this.createdAt = "createdAt";
        this.verified = "verified";
        this.vlinkexp = "vlinkexp";
        this.rlinkexp = "rlinkexp";
      }

      async getAccount(user,raw = false) {
        const userdoc = await Admin.findOne({ _id: ObjectId(user.id) });
        return userdoc?raw?userdoc:share.getAdminShareData(userdoc):false;
      }

      //send feedback emails

      async createAccount(newadmin) {
        const result = await Admin.insertOne(newadmin);
        return result.insertedCount == 0 ? code.event(code.NO) : result.ops[0];
      }

      /**
       * Rename everywhere
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
       * Change account password, revoke pass reset link
       */
      async changePassword (user, body){
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
        if(newpassadmin.ok){
          await mailer.sendAlertMail(code.mail.PASSWORD_CHANGED,{
            to:newpassadmin.value.email,
            username:newpassadmin.value.username,
            client:client.admin,
          })
        }
        return code.event(newpassadmin.value ? code.OK : code.NO);
      };

      /**
       *Change email address everywhere
       */
      changeEmailID = async (user, body) => {
        const admin = await this.getAccount(user);
        if (admin.id == body.newemail)
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
        if(newadmin.ok){
          await mailer.sendAlertMail(code.mail.EMAIL_CHANGED,{
            to:admin.id,
            newmail:body.newemail,
            username:admin.username,
            client:client.admin,
          })
        }
        return newadmin.value
          ? code.event(
              (await this.defaults.admin.setEmail(user, body))
                ? code.OK
                : code.NO
            )
          : code.event(code.NO);
      };

      /**
       * change phone everywhere
       */
      changePhone = async (user, body) => {
        return code.event(
          (await this.defaults.admin.setPhone(user, body)) ? code.OK : code.NO
        );
      };

      /**
       * Delete admin account
       */
      async deleteAccount(user, uiid = null){
        if (uiid) {
          const admin = await Admin.findOne({ _id: ObjectId(user.id) });
          if (!admin.uiid.includes(uiid)) return code.event(code.auth.WRONG_UIID);
        }
        const del = await Admin.findOneAndDelete({ _id: ObjectId(user.id) });
        if(del.value){
          await mailer.sendAlertMail(code.mail.ACCOUNT_DELETED,{
            to:del.value.email,
            username:del.value.username,
            client:client.admin,
          })
        }
        if (!uiid) return code.event(del.value ? code.OK : code.NO);
        if (!del.value) return code.event(code.NO);
        if (uiid != del.value.uiid) return code.event(code.auth.WRONG_UIID);
        const delinst = await Institute.findOneAndDelete({ uiid: uiid });
        return code.event(delinst.value ? code.OK : code.NO);
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
        return await this.account.deleteAccount(user, body.uiid);
    }
  };
  handlePreferences = async (user, body) => {
    switch (body.action) {
      case action.set:
        return await this.prefs.setPreference(user, body);
      case action.get:
        return await this.prefs.getPreference(user, body);
    }
  };
  handleVerification = async (user, body) => {
    switch (body.action) {
      case action.send: {
        const linkdata = await verify.generateLink(client.admin, {
          uid: user.id,
        });
        if (!linkdata) return code.event(code.mail.ERROR_MAIL_NOTSENT);
        return await mailer.sendVerificationEmail(linkdata);
      }
      case action.check: {
        const admin = await Admin.findOne({ _id: ObjectId(user.id) });
        if (!admin) return code.event(code.auth.USER_NOT_EXIST);
        return code.event(
          admin.verified ? code.verify.VERIFIED : code.verify.NOT_VERIFIED
        );
      }
    }
  };
  async handlePassReset(user, body){
    switch (body.action) {
      case action.send: {
        if(!user){
          const admin = await Admin.findOne({ email: body.email });
          if (!admin) return code.event(code.OK); //don't tell if user not exists, while sending reset email.
          return await this.handlePassReset({id:share.getAdminShareData(admin).uid},body)
        }
        const linkdata = await reset.generateLink(client.admin, {
          uid: user.id,
        });
        if (!linkdata) return code.event(code.mail.ERROR_MAIL_NOTSENT);
        return await mailer.sendPasswordResetEmail(linkdata);
      }
    }
  };
}

class Default {
  constructor() {
    const object = "default";
    class Admins {
      constructor() {
        this.object = "admin";
        this.path = `${object}.${this.object}`;
        this.username = "username";
        this.email = "email";
        this.phone = "phone";
        this.namepath = `${this.path}.$.${this.username}`;
        this.emailpath = `${this.path}.$.${this.email}`;
        this.phonepath = `${this.path}.$.${this.phone}`;
      }
      async setEmail(user, body) {
        const admin = await Admin.findOne({ _id: ObjectId(user.id) });
        const newinst = await Institute.findOneAndUpdate(
          { uiid: user.uiid,[this.path]:{$elemMatch:{[this.email]:admin.id}}},
          {
            $set: {
              [this.emailpath]: body.newemail,
            },
          }
        );
        return code.event(newinst ? code.OK : code.NO);
      }
      async setName(user, body) {
        const admin = await Admin.findOne({ _id: ObjectId(user.id) });
        const newinst = await Institute.findOneAndUpdate(
          { uiid: user.uiid,[this.path]:{$elemMatch:{[this.email]:admin.id}}},
          {
            $set: {
              [this.namepath]: body.newname,
            },
          }
        );
        return code.event(newinst ? code.OK : code.NO);
      }
      async setPhone(user, body) {
        const admin = await Admin.findOne({ _id: ObjectId(user.id) });
        const newinst = await Institute.findOneAndUpdate(
          { uiid: user.uiid,[this.path]:{$elemMatch:{[this.email]:admin.id}}},
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
      async createInstituteBackup(
        user,
        sendPromptCallback = (filename, err) => {}
      ) {
        const institute = await Institute.findOne({ uiid: user.uiid });
        if (!institute) return false;
        fs.mkdir(
          path.join(path.dirname(require.main.filename) + `/backups/`),
          (err) => {
            fs.mkdir(
              path.join(
                path.dirname(require.main.filename) + `/backups/${user.uiid}`
              ),
              (err) => {
                const filename = `${user.id}_${
                  user.uiid
                }_${timer.getTheMoment()}.json`;
                fs.writeFile(
                  path.join(
                    path.dirname(require.main.filename) +
                      `/backups/${user.uiid}/${filename}`
                  ),
                  JSON.stringify(institute),
                  (err) => {

                    sendPromptCallback(filename, err);
                  }
                );
              }
            );
          }
        );
      }
      async deleteInstitution(user, body) {
        if (user.uiid != body.uiid) return code.event(code.auth.WRONG_UIID);
        const inst = await Institute.findOne({ uiid: user.uiid });
        if (!inst) return code.event(code.inst.INSTITUTION_NOT_EXISTS);
        const deldoc = await Institute.findOneAndDelete({ uiid: user.uiid });
        return code.event(deldoc.value ? code.OK : code.NO);
      }
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
        
        const newinst = await Institute.findOneAndUpdate(
          { uiid: user.uiid },
          { $set: { [this.breakminpath]: Number(body.breakduration) } }
        );
        return code.event(newinst ? code.OK : code.NO);
      }

      async setPeriodsInDay(user, totalperiods = 0) {
        const newinst = await Institute.findOneAndUpdate(
          { uiid: user.uiid },
          { $set: { [this.totalperiodspath]: Number(totalperiods) } }
        );
        return code.event(newinst ? code.OK : code.NO);
      }
      async setDaysInWeek(user, daysinweek = []) {
        const newinst = await Institute.findOneAndUpdate(
          { uiid: user.uiid },
          { $set: { [this.daysinweekpath]: daysinweek } }
        );
        return code.event(newinst.value ? code.OK : code.NO);
      }
      async getInfo() {}
    }
    this.admin = new Admins();
    this.institute = new Institution();
    this.timings = new Timing();
  }
  async getDefaults(user) {
    const doc = await Institute.findOne(
      { uiid: user.uiid },
      {
        projection: { default: 1 },
      }
    );
    return doc ? doc.default : code.event(code.NO);
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
      case code.action.INSTITUTE_DELETE:
        return await this.institute.deleteInstitution(user, body);
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
    }
  };
  handleRegistration = async (user, body) => {
    if (!stringIsValid(body.data.default.institute.email, validType.email))
      return code.event(code.auth.EMAIL_INVALID);
    if (!stringIsValid(body.data.default.institute.phone, validType.phone))
      return code.event(code.inst.INVALID_INST_PHONE);
    if (
      !stringIsValid(body.data.default.institute.instituteName, validType.name)
    )
      return code.event(code.inst.INVALID_INST_NAME);
    const existingInst = await Institute.findOne({ uiid: user.uiid });
    if (existingInst) {
      const admin = await Admin.findOne({ _id: ObjectId(user.id) });
      if (!admin) return code.event(code.NO);
      if (!existingInst.default.admin.email == admin.email)
        return code.event(code.inst.INSTITUTION_EXISTS);
      const doc = await Institute.findOneAndUpdate(
        { uiid: user.uiid },
        {
          $set: {
            default: body.data.default,
          },
        }
      );
      return code.event(
        doc.value
          ? code.inst.INSTITUTION_CREATED
          : code.inst.INSTITUTION_CREATION_FAILED
      );
    }
    if (body.fromfile) {
      if (body.data.users.teachers) {
        body.data.users.teachers.forEach((teacher) => {
          teacher._id = ObjectId(teacher._id);
        });
      }
      if (body.data.pseudousers.teachers) {
        body.data.pseudousers.teachers.forEach((teacher) => {
          teacher._id = ObjectId(teacher._id);
        });
      }
      if (body.data.users.classes) {
        body.data.users.classes.forEach((Class) => {
          Class.students.forEach((student) => {
            student._id = ObjectId(student._id);
          });
        });
      }
    }
    const registerdoc = body.fromfile
      ? {
          uiid: user.uiid,
          default: body.data.default,
          users: body.data.users,
          pseudousers: body.data.pseudousers,
          schedule: body.data.schedule,
          invite: body.data.invite,
          restricted: body.data.restricted,
          vacations: body.data.vacations,
          preferences: body.data.preferences,
        }
      : {
          uiid: user.uiid,
          default: body.data.default,
          users: {
            teachers: [],
            students:[],
            classes: [],
          },
          pseudousers: {
            teachers: [],
            students:[],
            classes: [],
          },
          schedule: {
            teachers: [],
          },
          invite: {
            teacher: {
              active: false,
              createdAt: 0,
              expiresAt: 0,
            },
            admin: {
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
    class Teachers {
      constructor() {
        this.teacherpath = `users.teachers`;
        this.pseudoteacherpath = `pseudousers.teachers`;
        this.uid = "_id";
        this.teacherID = "teacherID";
      }
      async getTeacherByID(user,id,pseudo = false){
        const tdoc = await Institute.findOne({uiid:user.uiid,[pseudo?this.pseudoteacherpath:this.teacherpath]:{$elemMatch:{[this.uid]:ObjectId(id)}}},{
         projection:{
           [pseudo?`${this.pseudoteacherpath}.$`:`${this.teacherpath}.$`]:1
         } 
        });
        return tdoc?pseudo?tdoc.pseudousers.teachers[0]:tdoc.users.teachers[0]:false;
      }
      async getTeacherByTeacherID(user,teacherID,pseudo = false){
        const tdoc = await Institute.findOne({uiid:user.uiid,[pseudo?this.pseudoteacherpath:this.teacherpath]:{$elemMatch:{[this.teacherID]:teacherID}}},{
         projection:{
           [pseudo?`${this.pseudoteacherpath}.$`:`${this.teacherpath}.$`]:1
         } 
        });
        return tdoc?pseudo?tdoc.pseudousers.teachers[0]:tdoc.users.teachers[0]:false;
      }
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
        return {
          event: code.OK,
          teachers: teachers,
        };
      };



      async sendInvitation(user, body) {
        const inst = await Institute.findOne({ uiid: user.uiid });
        const admin = await new Self().account.getAccount(user);
        body["invitor"] = admin.username;
        body["uid"] = user.id;
        body["institute"] = inst.default.institute.instituteName;
        body["instID"] = inst._id;
        body["link"] = invite.getPersonalInviteLink(client.teacher, body);
        return await mailer.sendInvitationEmail(client.teacher, body);
      }

      async removeTeacher(user, body) {
        const deldoc = await Institute.findOneAndUpdate(
          {
            uiid: user.uiid,
            "users.teachers": { $elemMatch: { teacherID: body.teacherID } },
          },
          {
            $pull: {
              "users.teachers": { teacherID: body.teacherID },
            },
          }
        );
        return code.event(deldoc.value ? code.OK : code.NO);
      }
    }
    class Classes {
      constructor() {
        this.path = "users.classes";
        this.operatorpath = `${this.path}.$`;
        this._id = "_id";
        this._idpath = `${this.operatorpath}.${this._id}`;
        this.classname = "classname";
        this.classnamepath = `${this.operatorpath}.${this.classname}`;
        this.inchargeID = "inchargeID";
        this.inchargeIDpath = `${this.operatorpath}.${this.inchargeID}`;
        this.inchargename = "inchargename";
        this.inchargenamepath = `${this.operatorpath}.${this.inchargename}`;
        this.students = "students";
        this.studentspath = `${this.operatorpath}.${this.students}`;
      }
      /**
       * Checks whether a classname exists in classes.
       * @param {JSON} user The session user object.
       * @param {String} classname The classname to be searched.
       * @returns {Promise} classroom object if exists, else false.
       */
      async getClassByClassname(user, classname) {
        const classdoc = await Institute.findOne(
          {
            uiid: user.uiid,
            [this.path]: { $elemMatch: { [this.classname]: classname } },
          },
          { projection: { [this.operatorpath]: 1 } }
        );
        return classdoc ? classdoc.users.classes[0] : false;
      }

      async getClassBy_id(user, _id) {
        const classdoc = await Institute.findOne(
          {
            uiid: user.uiid,
            [this.path]: { $elemMatch: { [this._id]: ObjectId(_id) } },
          },
          { projection: { [this.operatorpath]: 1 } }
        );
        return classdoc ? classdoc.users.classes[0] : false;
      }

      async getClassByIncharge(user, inchargeID) {
        const classdoc = await Institute.findOne(
          {
            uiid: user.uiid,
            [this.path]: { $elemMatch: { [this.inchargeID]: inchargeID } },
          },
          {
            projection: {
              [this.operatorpath]: 1,
            },
          }
        );
        return classdoc ? classdoc.users.classes[0] : false;
      }

      async setClassname(user, oldclassname, newclassname) {
        const classdoc = await Institute.findOneAndUpdate(
          {
            uiid: user.uiid,
            [this.path]: { $elemMatch: { [this.classname]: oldclassname } },
          },
          {
            $set: {
              [this.classnamepath]: newclassname,
            },
          }
        );
        return code.event(classdoc.value ? code.OK : code.NO);
      }

      async setIncharge(user, classname, inchargename, inchargeID) {
        const classdoc = await Institute.findOneAndUpdate(
          {
            uiid: user.uiid,
            [this.path]: { $elemMatch: { [this.classname]: classname } },
          },
          {
            $set: {
              [this.inchargeIDpath]: inchargeID,
              [this.inchargenamepath]: inchargename,
            },
          }
        );
        return code.event(classdoc.value ? code.OK : code.NO);
      }

      async switchClassnames(user, classname1, classname2) {
        const doc = await Institute.updateOne(
          { uiid: user.uiid },
          {
            $set: {
              "users.classes.$[older].classname": classname1,
              "users.classes.$[newer].classname": classname2,
            },
          },
          {
            arrayFilters: [
              { "older.classname": classname2 },
              { "newer.classname": classname1 },
            ],
          }
        );
        return code.event(doc.result.nModified ? code.OK : code.NO);
      }

      async switchIncharges(user, classname1, classname2) {
        const class1 = await this.getClassByClassname(user, classname1);
        const class2 = await this.getClassByClassname(user, classname2);
        if (!(class1 && class2)) return code.event(code.NO);
        const doc = await Institute.updateOne(
          { uiid: user.uiid },
          {
            $set: {
              "users.classes.$[newer].inchargeID": class1.inchargeID,
              "users.classes.$[newer].inchargename": class1.inchargename,
              "users.classes.$[older].inchargeID": class2.inchargeID,
              "users.classes.$[older].inchargename": class2.inchargename,
            },
          },
          {
            arrayFilters: [
              { "newer.classname": class2.classname },
              { "older.classname": class1.classname },
            ],
          }
        );
        return code.event(doc.result.nModified ? code.OK : code.NO);
      }

      async searchClass(inst, body) {
        let classes = Array();
        inst.users.classes.forEach((Class) => {
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
        return {
          event: code.OK,
          classes: classes,
        };
      }

      /**
       * Pushes a single classroom element in users.classes array.
       * @param {JSON} user The session user object.
       * @param {JSON} body The JSONobject containing necessary classroom details.
       * @returns {Promise} A code, indicating operation success or failure.
       */
      async pushClassroom(user, body) {
        let classroom = await this.getClassByClassname(
          user,
          body.newclass.classname
        );
        if (classroom) return code.event(code.inst.CLASS_EXISTS);
        const teacher = await Institute.findOne({uiid:user.uiid,"users.teachers":{$elemMatch:{"teacherID":body.newclass.inchargeID}}});
        if(!teacher) return code.event(code.inst.INCHARGE_NOT_FOUND);
        const existclassincharge = await this.getClassByIncharge(user,body.newclass.inchargeID);
        if(existclassincharge) return {
          event:code.inst.INCHARGE_OCCUPIED,
          inchargeof:existclassincharge.classname
        };
        body.newclass._id = new ObjectId();
        body.newclass.inchargename = teacher.users.teachers[0].username;
        classroom = await Institute.findOneAndUpdate(
          { uiid: user.uiid },
          {
            $push: {
              [this.path]: body.newclass,
            },
          }
        );
        return code.event(classroom.value ? code.OK : code.NO);
      }

      /**
       * This method only handles update requests for and under users.classes subdocument.
       * @warning If a class rename request is received, then it will only be executed for users.classes, and
       * not for schedule subdocument. That means, the renaming will not be executed for the occurence of target classname
       * in schedule of users.
       * @see Schedule().scheduleUpdate() method for a full renaming execution, including users and schedule
       * subdocuments.
       * @param user The user object of current user session. Usually retrieved from validate method of session module.
       * @param body The body of request to be processed. Must contain all the relevant data regarding the specifity of update request.
       * @param inst The institution document object.
       * @returns {Promise} Usually success/failure event codes; could be specific for special update requests.
       */
      async updateClass(user, body, inst) { 
        switch (body.specific) {
          case code.action.RENAME_CLASS: {
            let classroom = await this.getClassByClassname(
              user,
              body.newclassname
            );
            if (classroom) {
              //already a newclassname class exists
              if (!body.switchclash) return code.event(code.inst.CLASS_EXISTS);
              //switch with conflicting class.
              return await this.switchClassnames(
                user,
                body.oldclassname,
                body.newclassname
              );
            }
            //no conflicts.
            return await this.setClassname(
              user,
              body.oldclassname,
              body.newclassname
            );
          }
          case code.action.SET_INCHARGE: {
            let classroom = body.classname
              ? await this.getClassByClassname(user, body.classname)
              : await this.getClassBy_id(user, body.cid);
            if (!classroom) return code.event(code.inst.CLASS_NOT_FOUND);
            if (classroom.inchargeID == body.newinchargeID)
              return code.event(code.OK);
            const teacherdoc = await Institute.findOne({uiid:user.uiid,"users.teachers":{$elemMatch:{"teacherID":body.newinchargeID}}},{
              projection:{"users.teachers.$":1}
            });
            if(!teacherdoc) return code.event(code.inst.INCHARGE_NOT_FOUND);
            let iclassroom = await this.getClassByIncharge(
              user,
              teacherdoc.users.teachers[0].teacherID
            );
            if (iclassroom) {
              if (!body.switchclash)
                return {
                  event: code.inst.INCHARGE_OCCUPIED,
                  iclassname: iclassroom.classname,
                  inchargename: iclassroom.inchargename,
                  inchargeID: iclassroom.inchargeID,
                };
              return await this.switchIncharges(
                user,
                classroom.classname,
                iclassroom.classname
              );
            }
            //no conflicts.
            return await this.setIncharge(
              user,
              classroom.classname,
              teacherdoc.users.teachers[0].username,
              body.newinchargeID
            );
          }
          /**
           * To push a single new class in users.classes.
           */
          case code.action.CREATE_NEW_CLASS:{
            return await this.pushClassroom(user, body);
          }
          break;
        }
      }
    }
    this.teachers = new Teachers();
    this.classes = new Classes();
  }
  async getUsers(user) {
    const userdoc = await Institute.findOne(
      { uiid: user.uiid },
      {
        projection: { users: 1 },
      }
    );
    return userdoc ? userdoc.users : code.event(code.NO);
  }
  handleUserSearch = async (inst, body) => {
    switch (body.target) {
      case client.teacher:
        return await this.teachers.searchTeacher(inst, body);
      case client.student:
        return await this.classes.searchClass(inst, body);
    }
  };
  handleTeacherAction = async (user, body) => {
    switch (body.action) {
      case action.remove: {
        if (body.teacherID) {
          return await this.teachers.removeTeacher(user, body);
        }
      }
    }
  };
  handleClassAction = async (user, body) => {
    const inst = await Institute.findOne({ uiid: user.uiid });
    switch (body.action) {
      case action.update:
        return await this.classes.updateClass(user, body, inst);
    }
  };
}

/**
 * For work under 'schedule' subdocument.
 */
class Schedule {
  constructor() {
    const defaults = new Default();

    this.teacherschedulepath = "schedule.teachers";
    this.teacherID = "teacherID";


    class TeacherAction {
      constructor() {}
      async scheduleUpload(body, inst) {
        let overwriting = false; //if existing teacher schedule being overwritten after completion.
        let incomplete = false; //if existing teacher schedule being rewritten without completion.
        let tid;
        let found = inst.schedule.teachers.some((teacher) => {
          if (teacher.teacherID == body.teacherID) {
            overwriting = inst.default.timings.daysInWeek.every((d) => {
              //check if all days are present in teacher schedule
              return teacher.days.find((day) => day.dayIndex == d)
                ? true
                : false;
            });
            if (!overwriting) {
              //check if incoming day index is less than any day index present in teacher schedule
              incomplete = teacher.days.find(
                (day) => body.data.dayIndex <= day.dayIndex
              )
                ? true
                : false;
            }
            tid = teacher.teacherID;
            return true;
          }
        });
        if (overwriting) {
          //completed schedule, must be edited from schedule view.
          const teacher = inst.users.teachers.find(
            (teacher) => teacher.teacherID == tid
          );
          return teacher
            ? {
                event: code.schedule.SCHEDULE_EXISTS,
                name: teacher.username,
                uid: teacher.teacherID,
              }
            : {
                event: code.schedule.SCHEDULE_EXISTS,
                id: tid,
              };
        }
        if (incomplete) {
          //remove incomplete schedule teacher
          if (
            body.data.dayIndex == Math.min(...inst.default.timings.daysInWeek)
          ) {
            await Institute.findOneAndUpdate(
              { uiid: inst.uiid },
              {
                $pull: {
                  "schedule.teachers": { teacherID: body.teacherID },
                },
              }
            );
            found = false; //add as a new teacher schedule
          }
        }
        const clashdata = [];
        let clashed = inst.schedule.teachers.some((teacher) => {
          //period clash checking
          if (teacher.teacherID != body.teacherID) {
            let clashed = teacher.days.some((day) => {
              if (day.dayIndex == body.data.dayIndex) {
                let clashed = day.period.some((period, pindex) => {
                  if (
                    period.classname == body.data.period[pindex].classname &&
                    period.classname != code.schedule.FREE
                  ) {
                    clashdata.push({
                      classname: period.classname,
                      period: pindex,
                      id: teacher.teacherID,
                      name: teacher.teachername,
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
          const teacher = inst.users.teachers.find(
            (teacher) => teacher.teacherID == clashdata.id
          );
          if (teacher) clashdata["uid"] = teacher._id;
          return {
            event: code.schedule.SCHEDULE_CLASHED,
            clash: clashdata[0],
          };
        }
        if (found) {
          //existing teacher schedule, incomplete
          let doc = await Institute.updateOne(
            { uiid: inst.uiid },
            {
              $set: {
                "schedule.teachers.$[teacher].days.$[day].period":
                  body.data.period, //overwrite existing day
              },
            },
            {
              arrayFilters: [
                { "teacher.teacherID": body.teacherID },
                { "day.dayIndex": body.data.dayIndex },
              ],
            }
          );
          //return if existing day is overwritten.
          if (doc.result.nModified)
            return code.event(code.schedule.SCHEDULE_CREATED);
          doc = await Institute.findOneAndUpdate(
            {
              uiid: inst.uiid,
              "schedule.teachers": {
                $elemMatch: { teacherID: body.teacherID },
              },
            },
            {
              $push: { "schedule.teachers.$.days": body.data }, //new day push
            }
          );
          //return if a new day is appended
          return code.event(
            doc.value
              ? code.schedule.SCHEDULE_CREATED
              : code.schedule.SCHEDULE_NOT_CREATED
          ); //new day created.
        } else {
          if (!stringIsValid(body.teacherID, validType.email))
            return code.event(code.auth.EMAIL_INVALID);
          //no existing schedule of received teacher ID
          const doc = await Institute.findOneAndUpdate(
            { uiid: inst.uiid },
            {
              $push: {
                "schedule.teachers": {
                  teachername: String(),
                  teacherID: body.teacherID,
                  days: [body.data],
                },
              }, //new teacher schedule push
            }
          );
          //return if teacher created in schedule
          return code.event(
            doc.value
              ? code.schedule.SCHEDULE_CREATED
              : code.schedule.SCHEDULE_NOT_CREATED
          ); //new schedule created.
        }
      }

      /**
       * To receive data under schedule.teachers
       * @param {Document} inst
       * @param {JSON} body
       * @returns {Promise} success event,unique classes
       */
      async scheduleReceive(body, inst) {
        let filter, options;
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
          case "nonusers":
            {
              const nonusers = [];
              inst.schedule.teachers.forEach((teacher) => {
                if (
                  !inst.users.teachers.find(
                    (t) => t.teacherID == teacher.teacherID
                  )
                ) {
                  nonusers.push(teacher.teacherID);
                }
              });
              return { nonusers: nonusers };
            }
            break;
          case "classes":
            {
              let newClasses = [];
              inst.schedule.teachers.forEach((teacher) => {
                teacher.days.forEach((day) => {
                  day.period.forEach((period) => {
                    if (
                      !newClasses.includes(period.classname) &&
                      period.classname != code.schedule.FREE
                    ) {
                      newClasses.push(period.classname);
                    }
                  });
                });
              });
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
          return code.event(code.schedule.SCHEDULE_NOT_EXIST);
        }
        switch (body.specific) {
          case "single":
            {
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
      async scheduleUpdate(user, body, inst) {
        switch (body.specific) {
          case code.action.RENAME_CLASS:
            {
              if (body.teacherID) {
                //rename a class of a teacher
                const teacherdoc = await Institute.findOne({
                  uiid: user.uiid,
                  "schedule.teachers": {
                    $elemMatch: { teacherID: body.teacherID },
                  },
                });
                if (!teacherdoc) return code.event(code.auth.USER_NOT_EXIST);
                //check clash with other teacher(s)
                let clashes = [];
                inst.schedule.teachers.forEach((teacher, t) => {
                  if (teacher.teacherID != body.teacherID) {
                    teacher.days.forEach((day, d) => {
                      if (day.dayIndex == body.dayIndex) {
                        if (
                          day.period[body.period].classname ==
                            body.newclassname &&
                          day.period[body.period].classname != code.free
                        ) {
                          /**
                           * Even though clashes is an array object, and the loop is being rotated for each teacher and day,
                           * it should be kept in mind that conflict of having the new classname
                           * as someone else's existing classname on the same period of same day, must be only one.
                           * Which means there can only be one conflicting teacher, if it occurres.
                           * If more than one teachers with same classname at same period of the day emerge,
                           * then a pre-existing conflict is much bigger than this one.
                           */
                          clashes.push({
                            username: teacher.teachername,
                            id: teacher.teacherID,
                            dayIndex: body.dayIndex,
                            period: body.period,
                          });
                        }
                      }
                    });
                  }
                });
                if (clashes.length) {
                  if (!body.switchclash)
                    return {
                      //reporting clash
                      event: code.schedule.SCHEDULE_CLASHED,
                      clash: clashes[0],
                    };
                  //replace conflict teacher(s) schedule with oldclassname, to switch the given teacher for newclassname
                  let res = await Promise.all(
                    clashes.map(async (clash) => {
                      //must be only one object in clashes.
                      return new Promise(async(resolve)=>{
                        const doc = await Institute.updateOne(
                         {
                           uiid: user.uiid,
                           "schedule.teachers": {
                             $elemMatch: { teacherID: clash.id },
                           },
                         },
                         {
                           $set: {
                             "schedule.teachers.$.days.$[day].period.$[period].classname":
                               body.oldclassname,
                           },
                         },
                         {
                           arrayFilters: [
                             { "day.dayIndex": body.dayIndex },
                             { "period.classname": body.newclassname },
                           ],
                         }
                       );
                       resolve(doc);
                      })
                    })
                  );
                  if (!res) return code.event(code.NO);
                }
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
                return code.event(tscheduledoc.value ? code.OK : code.NO);
              } else {
                //renaming class for all teachers
                try {
                  let result = await Promise.all(
                    inst.schedule.teachers.map(async (teacher) => {
                      return await Promise.all(
                        teacher.days.map(async (day) => {
                          return await Promise.all(
                            day.period.map(async (period, p) => {
                              return new Promise(async(resolve)=>{
                                if (period.classname == body.oldclassname) {
                                  body["teacherID"] = teacher.teacherID;
                                  body["dayIndex"] = day.dayIndex;
                                  body["period"] = p;
                                  const res = await this.scheduleUpdate(user,body,inst);
                                  resolve(res);
                                }
                              })
                            })
                          );
                        })
                      );
                    })
                  );
                  return code.event(code.OK);
                } catch (e) {
                  return code.event(code.NO);
                }
              }
            }
            break;
          case code.action.REMOVE_CLASS:
            {
              //definitely removing for all teachers.
              Promise.all(
                inst.schedule.teachers.map((teacher, t) => {
                  Promise.all(
                    teacher.days.map((day, d) => {
                      Promise.all(
                        day.period.map(async (period, p) => {
                          if (period.classname == body.classname) {
                            const classpath = `schedule.teachers.${t}.days.${d}.period.${p}.classname`;
                            const subjectpath = `schedule.teachers.${t}.days.${d}.period.${p}.subject`;
                            const doc = await Institute.findOneAndUpdate(
                              { uiid: user.uiid },
                              {
                                $set: {
                                  [classpath]: code.free,
                                  [subjectpath]: code.free,
                                },
                              }
                            );
                            if (!doc.value) throw doc;
                          }
                        })
                      ).catch((err) => {
                        throw err;
                      });
                    })
                  ).catch((err) => {
                    throw err;
                  });
                })
              )
                .then((value) => {
                  return code.event(code.OK);
                })
                .catch((doc) => {
                  return code.event(code.NO);
                });
            }
            break;
          case code.action.RENAME_SUBJECT:
            {
              if (body.teacherID) {
                //only change in subject shift of a teacher
                const path = `schedule.teachers.$[outer].days.$[outer1].period.${body.period}.subject`;
                const instdoc = await Institute.findOneAndUpdate(
                  {
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
                return code.event(instdoc.value ? code.OK : code.NO);
              } else {
                //change in subject of all teachers (correction type)
              }
            }
            break;
          case code.action.ADD_DAY:
            {
              //adding a new day in everyone's schedule.
              if (inst.default.timings.daysInWeek.includes(body.newdayindex))
                return code.event(code.schedule.WEEKDAY_EXISTS);
              const periods = [];
              let p = 0;
              while (p < inst.default.timings.periodsInDay) {
                periods.push({
                  classname: code.free,
                  subject: code.free,
                  hold: true,
                });
                p++;
              }
              const day = {
                dayIndex: body.newdayindex,
                absent: false,
                period: periods,
              };
              const res = await Promise.all(
                inst.schedule.teachers.map(async (teacher, t) => {
                  const path = `schedule.teachers.${t}.days`;
                  return new Promise(async (resolve) => {
                    const doc = await Institute.findOneAndUpdate(
                      { uiid: inst.uiid },
                      {
                        $push: {
                          [path]: day,
                        },
                      }
                    );
                    resolve(doc);
                  });
                })
              );
              if (res.find((teacher)=>teacher.value==null)) return code.event(code.NO);
              const daysinweek = inst.default.timings.daysInWeek;
              daysinweek.push(body.newdayindex);
              return await defaults.timings.setDaysInWeek(user, daysinweek);
            }
            break;
          case code.action.SWITCH_DAY: //renaming or switching a day with new one.
            {
              try {
                if (
                  inst.default.timings.daysInWeek.includes(body.newdayindex)
                ) {
                  //rename old day as new and vice versa
                  if (!body.switchclash)
                    return code.event(code.schedule.WEEKDAY_EXISTS);
                  const res = await Promise.all(
                    inst.schedule.teachers.map(async (teacher, t) => {
                      const path = `schedule.teachers.${t}.days.$[day].dayIndex`;
                      const opath = `schedule.teachers.${t}.days.$[oday].dayIndex`;
                      return new Promise(async (resolve) => {
                        const doc = await Institute.findOneAndUpdate(
                          { uiid: inst.uiid },
                          {
                            $set: {
                              [path]: body.newdayindex,
                              [opath]: body.olddayindex,
                            },
                          },
                          {
                            arrayFilters: [
                              { "day.dayIndex": body.olddayindex },
                              { "oday.dayIndex": body.newdayindex },
                            ],
                          }
                        );
                        resolve(doc);
                      });
                    })
                  );
                  return code.event(!res.find(teacher=>teacher.value==null)? code.OK : code.NO);
                }
                //just rename old as new
                const res = await Promise.all(
                  inst.schedule.teachers.map(async (teacher, t) => {
                    const path = `schedule.teachers.${t}.days.$[day].dayIndex`;
                    return new Promise(async (resolve) => {
                      const doc = await Institute.findOneAndUpdate(
                        { uiid: inst.uiid },
                        {
                          $set: { [path]: body.newdayindex },
                        },
                        {
                          arrayFilters: [{ "day.dayIndex": body.olddayindex }],
                        }
                      );
                      resolve(doc);
                    });
                  })
                );
                if (!res.find(teacher=>teacher.value==null)) {
                  const daysinweek = [];
                  inst.default.timings.daysInWeek.forEach((dw) => {
                    daysinweek.push(
                      dw == body.olddayindex ? body.newdayindex : dw
                    );
                  });
                  return await defaults.timings.setDaysInWeek(user, daysinweek);
                } else {
                  return code.event(code.NO);
                }
              } catch (e) {
                return code.eventmsg(code.NO, e);
              }
            }
            break;
          case code.action.REMOVE_DAY:
            {
              //remove for everyone
              const res = await Promise.all(
                inst.schedule.teachers.map(async (_, t) => {
                  if (body.removedayindex >= 0 && !isNaN(body.removedayindex)) {
                    const path = `schedule.teachers.${t}.days`;
                    return Promise.resolve(
                      Institute.findOneAndUpdate(
                        { uiid: user.uiid },
                        {
                          $pull: {
                            [path]: { dayIndex: body.removedayindex },
                          },
                        }
                      )
                    );
                  } else throw body;
                })
              );
              if (res) {
                const daysinweek = [];
                inst.default.timings.daysInWeek.forEach((dindex) => {
                  if (dindex != body.removedayindex) {
                    daysinweek.push(dindex);
                  }
                });
                return await new Default().timings.setDaysInWeek(
                  user,
                  daysinweek
                );
              } else {
                code.event(code.NO);
              }
            }
            break;
          case code.action.ADD_PERIOD:
            {
              //push a new period in everyone's schedule.
              if (body.newperiod != inst.default.timings.periodsInDay + 1)
                return code.event(code.schedule.INVALID_PERIOD);
              const period = {
                classname: code.free,
                subject: code.free,
                hold: true,
              };
              const res = await Promise.all(
                inst.schedule.teachers.map(async (teacher, t) => {
                  return await Promise.all(
                    teacher.days.map(async (day, d) => {
                      const path = `schedule.teachers.${t}.days.${d}.period`;
                      return new Promise(async (resolve) => {
                        const doc = await Institute.findOneAndUpdate(
                          { uiid: inst.uiid },
                          {
                            $push: {
                              [path]: period,
                            },
                          }
                        );
                        resolve(doc);
                      });
                    })
                  );
                })
              );
              if (res.find((teacher) => teacher.find((day)=>day.value == null)?true:false))
                return code.event(code.NO);
              return await defaults.timings.setPeriodsInDay(
                user,
                inst.default.timings.periodsInDay + 1
              );
            }
            break;
          case code.action.SWITCH_PERIODS:
            {
              if (body.dayIndex) {
                //switch periods of a particular day for everyone.
              } else {
                //switch periods of all days for everyone.
                const res = await Promise.all(
                  inst.schedule.teachers.map(async (teacher, t) => {
                    return await Promise.all(
                      teacher.days.map(async (day, d) => {
                        return await Promise.all(
                          day.period.map(async (period, p) => {
                            return new Promise(async (resolve) => {
                              let doc = {};
                              if (p == body.oldperiod) {
                                const oldpcontent = period; //content of original period
                                const newpcontent = day.period[body.newperiod]; //content of replacement period
                                const opath = `schedule.teachers.${t}.days.${d}.period.${body.oldperiod}`;  //original period path
                                const path = `schedule.teachers.${t}.days.${d}.period.${body.newperiod}`; //replacement period path
                                doc = await Institute.findOneAndUpdate(
                                  { uiid: inst.uiid },
                                  {
                                    $set: {
                                      [path]: oldpcontent,  //original content to replacement period
                                      [opath]: newpcontent, //replacement content to original period
                                    },
                                  }
                                );
                              }
                              resolve(doc);
                            });
                          })
                        );
                      })
                    );
                  })
                );
                return code.event(res ? code.OK : code.NO);
              }
            }
            break;
          case code.action.REMOVE_PERIOD:
            {
              //remove period from everyone's daily schedule
              const res = await Promise.all(
                inst.schedule.teachers.map(async (teacher, t) => {
                  return await Promise.all(
                    teacher.days.map(async (day, d) => {
                      const path = `schedule.teachers.${t}.days.${d}.period`;
                      return await Promise.all(
                        day.period.map(async (period, p) => {
                          return new Promise(async (resolve) => {
                            let doc = {};
                            if (body.period == p) {
                              doc = await Institute.findOneAndUpdate(
                                { uiid: user.uiid },
                                {
                                  $pull: {
                                    [path]: { classname: period.classname },
                                  },
                                }
                              );
                            }
                            resolve(doc);
                          });
                        })
                      );
                    })
                  );
                })
              );
              if (!res) return code.event(code.NO);
              return await defaults.timings.setPeriodsInDay(
                user,
                inst.default.timings.periodsInDay - 1
              );
            }
            break;
        }
        return;
      }
      async scheduleRemove(user, body, inst) {
        if (body.teacherID) {
          //removing one's schedule.
          const doc = await Institute.findOneAndUpdate(
            {
              uiid: user.uiid,
              "schedule.teachers": {
                $elemMatch: { teacherID: body.teacherID },
              },
            },
            {
              $pull: {
                "schedule.teachers": { teacherID: body.teacherID },
              },
            }
          );
          return code.event(doc.value ? code.OK : code.NO);
        }
      }
    }
    const teacher = new TeacherAction();
    class ClassAction {
      constructor() {

      }

      async getScheduleByClassname(user,classname){
        const teacherdoc = await Institute.findOne({uiid: user.uiid},{
          projection: {
            _id: 0,
            default: 1,
            "schedule.teachers": 1,
          }
        });
        const timings = teacherdoc.default.timings;
        const days = Array(timings.daysInWeek.length);
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
              if (period.classname == classname) {
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

        return days;
      }

      async scheduleReceive(user, body) {
        if (body.classname) {
          const teacherdoc = await Institute.findOne(
            {
              uiid: user.uiid,
              "users.classes": { $elemMatch: { classname: body.classname } },
            },
            {
              projection: {
                _id: 0,
                default: 1,
                "schedule.teachers": 1,
              },
            }
          );
          if (!teacherdoc) return code.event(code.inst.CLASS_NOT_FOUND);
          const timings = teacherdoc.default.timings;
          let days = Array(timings.daysInWeek.length);
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
              if (days[d].period.includes(undefined)) {
                day.period.forEach((period, p) => {
                  if (period.classname == body.classname) {
                    days[d].period[p] = {
                      teachername:teacher.teachername,
                      teacherID: teacher.teacherID,
                      subject: period.subject,
                      hold: period.hold,
                    };
                  }
                });
              }
            });
            let done = days.some((day) => {
              return day.period.includes(undefined);
            });
            return !done;
          });
          return {
            event: code.OK,
            schedule: {
              classname: body.classname,
              days: days,
            },
          };
        } else {
        }
      }
      /**
       * To perform schedule level create operations for classrooms.
       * @case createclasses: To create new classes, only at the time of registration or schedule re-intitation.
       *  Otherwise, will overwrite any existing classes.
       * @case newclass: To push a new class in institution, with it's schedule.
       */
      async scheduleCreate(user, body) {
        switch (body.specific) {
          case code.action.CREATE_CLASSES: {
            const userclasslist = [],
              pseudoclasslist = [];
            body.classes.forEach((Class) => {
              userclasslist.push({
                _id: new ObjectId(),
                classname: Class.classname,
                inchargename: Class.inchargename,
                inchargeID: Class.inchargeID,
                students: [],
                invite:{
                  student:{
                    active:false,
                    createdAt:0,
                    expiresAt:0,
                  }
                }
              });
              pseudoclasslist.push({
                classname: Class.classname,
                students: [],
              });
            });
            const doc = await Institute.findOneAndUpdate(
              { uiid: user.uiid },
              {
                //creating classes in users
                $set: {
                  "users.classes": userclasslist,
                  "pseudousers.classes": pseudoclasslist,
                },
              }
            );
            return code.event(
              doc.value
                ? code.inst.CLASSES_CREATED
                : code.inst.CLASSES_CREATION_FAILED
            );
          }
        }
      }
      async scheduleUpdate(user, body, inst) {
        switch (body.specific) {
          case code.action.RENAME_CLASS:
            {
              //teachers schedule classes first.
              let result = await teacher.scheduleUpdate(
                user,
                {
                  specific: body.specific,
                  oldclassname: body.oldclassname,
                  newclassname: body.newclassname,
                  switchclash: body.switchclash,
                },
                inst
              );              
              if (result.event == code.NO) return result;
              return inst.users.classes.length
                ? await new Users().classes.updateClass(user, body, inst)
                : code.OK;
            }
            break;

          case code.action.REMOVE_CLASS: {
            let result = await teacher.scheduleUpdate();
          }

          /**
           * Switches teacher id of given classname with given teacherID. Will directly set new teacher id for classname, and classname for
           * new teacher id, if not clashed with anyother teacher. If clashed, will replace clash teacher classname (will be same as given classname)
           * with new teacher existing classname, and then will proceed with setting new teacher classname and classname new teacher.
           */
          case "switchteacher": {
            //specific
            
            let newteacherschedoc = await Institute.findOne(
              {
                uiid: user.uiid,
                "schedule.teachers": {
                  $elemMatch: { teacherID: body.newteacherID },
                },
              },
              { projection: { "schedule.teachers.$": 1 } }
            );
            //getting new teacher's classname at given day,period.
            let newteacherclassname;
            let found = newteacherschedoc.schedule.teachers[0].days.some(
              (day) => {
                if (day.dayIndex == body.dayIndex) {
                  let found = day.period.some((period, p) => {
                    if (p == body.period) {
                      newteacherclassname = period.classname;
                      return true;
                    }
                  });
                  return found;
                }
              }
            );
            if (!found) return code.event(code.NO);
            //new teacher classname update with current classname (probable clash with old teacher id classname)
            const res = await teacher.scheduleUpdate(
              user,
              {
                specific: code.action.RENAME_CLASS,
                teacherID: body.newteacherID,
                dayIndex: body.dayIndex,
                period: body.period,
                switchclash: body.switchclash,
                oldclassname: newteacherclassname,
                newclassname: body.classname,
              },
              inst
            );
            return res;
          }
          default:
            return code.event(code.NO);
        }
      }
    }
    this.teacher = new TeacherAction();
    this.classes = new ClassAction();
  }
  async getSchedule(user) {
    const scheduledoc = await Institute.findOne(
      { uiid: user.uiid },
      { projection: { schedule: 1 } }
    );
    return scheduledoc ? scheduledoc.schedule : code.event(code.NO);
  }

  async getScheduleByTeacherID(user,teacherID){
    const tscheddoc = await Institute.findOne({ //finding schedule with teacherID
      uiid: user.uiid,
      [this.teacherschedulepath]: {
        $elemMatch: { [this.teacherID]: teacherID},
      },
    },{
      projection: {
        _id: 0,
        [`${this.teacherschedulepath}.$`]: 1,
      },
    });
    return tscheddoc?tscheddoc.schedule.teachers[0]:false;
  }

  handleScheduleTeachersAction = async (user, body, inst) => {
    switch (body.action) {
      case action.upload:
        return await this.teacher.scheduleUpload(body, inst);
      case action.receive:
        return await this.teacher.scheduleReceive(body, inst);
      case action.update:
        return await this.teacher.scheduleUpdate(user, body, inst);
      case action.remove:
        return await this.teacher.scheduleRemove(user, body, inst);
      default:
        return code.event(code.server.DATABASE_ERROR);
    }
  };
  handleScheduleClassesAction = async (user, body, inst) => {
    switch (body.action) {
      case action.receive:
        return await this.classes.scheduleReceive(user, body);
      case action.update:
        return await this.classes.scheduleUpdate(user, body, inst);
      case action.create:
        return await this.classes.scheduleCreate(user, body);
      default:
        return code.event(code.server.DATABASE_ERROR);
    }
  };
}

class Institution{
  constructor(){
    this.account = new Self().account;
    this.uid = "_id";
    this.default = "default";
  }
  async getInsituteByUIID(user){
    if(!inspect.sessionTokenValid(user)) return false;
    return await Institute.findOne({ uiid: user.uiid });
  }
  async joinInstituteAsAdmin(instID,admin){
    const doc = await Institute.findOneAndUpdate({[this.uid]:ObjectId(instID)},{
      $push:{
        [`${this.default}.admin`]:{
          username:admin.username,
          email:admin.email,
          phone:admin.phone?admin.phone:''
        }
      }
    });
    return doc.value?true:false;
  }

  async isAdminOfInstitute(uiid,email){
    const emails = await this.getAdminsOfInstitute(uiid);
    return emails.includes(email);
  }

  async getAdminsOfInstitute(uiid,emailonly = true){
    const inst = await Institute.findOne({uiid:uiid},{projection:{"default.admin":1}});
    if(!emailonly)
      return inst.default.admin
    let emails = [];
    inst.default.admin.forEach((admin)=>{
      emails.push(admin.email);
    });
    return emails;
  }

  async leaveInstitute(user){
    const admin = await this.account.getAccount(user);
    const doc = await Institute.findOneAndUpdate({uiid:user.uiid},{
      $pull:{
        "default.admin":{email:admin.id}
      }
    });
    return code.event(doc.value?code.OK:code.NO);
  }

  async removeAdminFromInstitute(user,adminemail){
    const admin = await this.account.getAccount(user);
    if(admin.id == adminemail) return false;
    const doc = await Institute.findOneAndUpdate({uiid:user.uiid},{
      $pull:{
        "default.admin":{email:adminemail}
      }
    });
    return code.event(doc.value?code.OK:code.NO);
  }
}


class Classroom {
  constructor() {
    this.classpath = "users.classes";
    this.pseudoclasspath = "pseudousers.classes";
    this.uid = "_id";
    this.classname = "classname";
    this.inchargeID = "inchargeID";
  }

  async getClassByClassID(user,id){
    const cdoc = await Institute.findOne({uiid:user.uiid,[this.classpath]:{$elemMatch:{[this.uid]:ObjectId(id)}}},{
      projection:{
        [`${this.classpath}.$`]:1
      }
    });
    return cdoc?cdoc.users.classes[0]:false;
  }

  async getClassByClassname(user,classname,pseudo = false){
    const cdoc = await Institute.findOne({uiid:user.uiid,[pseudo?this.pseudoclasspath:this.classpath]:{$elemMatch:{[this.classname]:classname}}},{
      projection:{
        [pseudo?`${this.pseudoclasspath}.$`:`${this.classpath}.$`]:1
      }
    });
    return cdoc?pseudo?cdoc.pseudousers.classes[0]:cdoc.users.classes[0]:false;
  }
  
  async getClassByInchargeID(user,inchargeID,pseudo = false){
    const cdoc = await Institute.findOne({uiid:user.uiid,[this.classpath]:{$elemMatch:{[this.inchargeID]:inchargeID}}},{
      projection:{
        [`${this.classpath}.$`]:1
      }
    });
    if(!cdoc) return false;
    if(!pseudo) return cdoc.users.classes[0];
    return await this.getClassByClassname(user,cdoc.users.classes[0].classname,true); //pseudoclass
  }

  async getClasses(user, body) {
    switch (body.specific) {
      case "teacherclasses": {
        const inst = await Institute.findOne({ uiid: user.uiid });
        let uniqueclasses = [];
        let found = inst.schedule.teachers.some((teacher) => {
          if (teacher.teacherID == body.teacherID) {
            teacher.days.forEach((day) => {
              day.period.forEach((period) => {
                if (
                  !uniqueclasses.includes(period.classname) &&
                  period.classname != code.schedule.FREE
                ) {
                  uniqueclasses.push(period.classname);
                }
              });
            });
            return true;
          }
        });
        return found
          ? {
              event: code.OK,
              classes: uniqueclasses,
            }
          : code.event(code.auth.USER_NOT_EXIST);
      }
    }
  }
}

class Invite {
  constructor() {
    this.object = "invite";
    class TeacherAction {
      constructor() {}
      inviteLinkCreation = async (user, inst, body) => {
        const result = await invite.generateLink(
          body.target,
          {
            uid: user.id,
            instID: inst._id,
          },
          body.daysvalid
        );
        return result;
      };
      inviteLinkDisable = async (inst, body) => {
        return await invite.disableInvitation(body.target, {
          instID: inst._id,
        });
      };
    }
    this.teacher = new TeacherAction();
    class AdminAction {
      constructor() {}
      inviteLinkCreation = async (user, inst, body) => {
        const result = await invite.generateLink(
          body.target,
          {
            uid: user.id,
            instID: inst._id,
          },
          body.daysvalid
        );
        return result;
      };
      inviteLinkDisable = async (inst, body) => {
        return await invite.disableInvitation(body.target, {
          instID: inst._id,
        });
      };
    }
    this.admin = new AdminAction();
  }
  handleInvitation = async (user, inst, body) => {
    if(body.target == client.teacher){
      switch (body.action) {
        case action.create:
          return await this.teacher.inviteLinkCreation(user, inst, body);
        case action.disable:
          return await this.teacher.inviteLinkDisable(inst, body);
      }
    } else if(body.target==client.admin){
      switch (body.action) {
        case action.create:
          return await this.admin.inviteLinkCreation(user, inst, body);
        case action.disable:
          return await this.admin.inviteLinkDisable(inst, body);
      }
    }
  };
  async getInvitation(user) {
    const doc = await Institute.findOne(
      { uiid: user.uiid },
      {
        projection: { [this.object]: 1 },
      }
    );
    return doc ? doc[this.object] : code.event(code.NO);
  }
}

class PseudoUsers {
  constructor() {
    this.object = "pseudousers";
    this.teacherpath = `${this.object}.teachers`;
    this.classpath = `${this.object}.classes`;
    this.someteacherpath = `${this.teacherpath}.$`;
    this.someclasspath = `${this.classpath}.$`;
    this.teacherID = "teacherID";
    this.classname = "classname";
  }
  async getPseudoUsers(user, body) {
    let projection = { [this.object]: 1 };
    switch (body.specific) {
      case client.teacher:
        {
          projection = { [this.teacherpath]: 1 };
        }
        break;
      case client.student:
        {
          projection = { [this.classpath]: 1 };
        }
        break;
    }
    const doc = await Institute.findOne(
      { uiid: user.uiid },
      {
        projection: projection,
      }
    );
    if (!doc) return code.event(code.NO);
    switch (body.specific) {
      case client.teacher:
        {
          doc.pseudousers.teachers.forEach((teacher, t) => {
            doc.pseudousers.teachers[t] = share.getPseudoTeacherShareData(
              teacher
            );
          });
          return doc.pseudousers.teachers;
        }
        break;
      case client.student:
        {
        }
        break;
    }
  }
  async handleTeachers(user, body) {
    switch (body.action) {
      case action.receive: {
        if (body.pteacherID) {
          const pdoc = await Institute.findOne(
            {
              uiid: user.uiid,
              [this.teacherpath]: {
                $elemMatch: { [this.teacherID]: body.teacherID },
              },
            },
            { projection: { [this.someteacherpath]: 1 } }
          );
          return pdoc
            ? {
                pseudoteacher: share.getPseudoTeacherShareData(
                  pdoc.pseudousers.teachers[0]
                ),
              }
            : code.event(code.NO);
        }
        const pdoc = await Institute.findOne(
          { uiid: user.uiid },
          { projection: { [this.teacherpath]: 1 } }
        );
        if (!pdoc) code.event(code.NO);
        pdoc.pseudousers.teachers.forEach((pteacher) => {
          pteacher = share.getPseudoTeacherShareData(pteacher);
        });
        return pdoc
          ? { pseudoteachers: pdoc.pseudousers.teachers }
          : code.event(code.NO);
      }
      case action.reject: {
        const rejdoc = await Institute.findOneAndUpdate(
          { uiid: user.uiid },
          {
            $pull: {
              [this.teacherpath]: { teacherID: body.teacherID },
            },
          }
        );
        return code.event(rejdoc.value ? code.OK : code.NO);
      }
      case action.accept:
        {
          const pseudodoc = await Institute.findOne(
            {
              uiid: user.uiid,
              [this.teacherpath]: {
                $elemMatch: { [this.teacherID]: body.teacherID },
              },
            },
            {
              projection: { [this.someteacherpath]: 1 },
            }
          );
          if (!pseudodoc) return code.event(code.NO);
          const teacher = pseudodoc.pseudousers.teachers[0];
          const tdoc = await Institute.findOneAndUpdate(
            { uiid: user.uiid },
            {
              $push: {
                "users.teachers": teacher,
              },
            }
          );
          if (!tdoc) return code.event(code.NO);
          return await this.handleTeachers(user, {
            action: action.reject,
            teacherID: body.teacherID,
          });
        }
        break;
    }
  }
  async handleStudents(user, body) {
    switch (body.action) {
      case action.accept: {
      }
      case action.reject: {
      }
    }
  }
}

class Vacations {
  constructor() {
    this.object = "vacations";
  }
  async getVacations(user) {
    const vacdoc = await Institute.findOne(
      { uiid: user.uiid },
      {
        projection: { [this.object]: 1 },
      }
    );
    return vacdoc ? vacdoc[this.object] : code.event(code.NO);
  }
}

class Preferences {
  constructor() {
    this.object = "preferences";
    this.allowTeacherAddSchedule = `${this.object}.allowTeacherAddSchedule`;
    this.active = `${this.object}.active`;
  }
  async getPreferences(user) {
    const prefdoc = await Institute.findOne(
      { uiid: user.uiid },
      {
        projection: { [this.object]: 1 },
      }
    );
    return prefdoc ? prefdoc[this.object] : code.event(code.NO);
  }
  async handlePreferences(user, body) {
    switch (body.action) {
      case action.set:
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
      case action.get:
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

module.exports = new AdminWorker();
