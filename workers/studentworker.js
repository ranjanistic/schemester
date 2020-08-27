const Institute = require("../collections/Institutions"),
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

    this.classname = 'classname';
    class Account {
      constructor() {
        this.path = path;
        this.pseudopath = pseudopath;
        this.studentspath = studentspath;
        this.pseudostudentspath = pseudostudentspath;
        this.classname = 'classname';
        this.uid = '_id';
        this.username = 'username';
        this.studentID = 'studentID';
        this.password = 'password';
        this.createdAt = 'createdAt';
        this.verified = 'verified';
        this.vlinkexp = 'vlinkexp';
        this.rlinkexp = 'rlinkexp';
      }
      //send feedback emails

      async createAccount(uiid,classname,newstudent){
        const doc = await Institute.findOneAndUpdate({
          uiid: uiid,
          [this.path]: {
            $elemMatch: { classname: classname },
          }, //existing classname
        },{
          $push: { "users.classes.$[outer].students":newstudent}, //new student push
        },{
          arrayFilters: [{ "outer.classname": classname }],
        });
        return code.event(doc?code.OK:code.NO);
      }

      /**
       * This will create an account in a class of the pseudousers object of instiution, and will be shown as a requestee student to join the classroom.
       * @param {String} uiid The unique institute ID
       * @param {String} classname The classname of classroom in which request is to be sent.
       * @param {JSON} pseudostudent The student data for which pseudo account will be created.
       */
      async createPseudoAccount(uiid,classname,pseudostudent){
        const doc = await Institute.findOneAndUpdate({
          uiid:uiid,
          [this.pseudopath]:{$elemMatch:{"classname":classname}}
        },{
          $push:{
            [this.pseudostudentspath]:pseudostudent
          }
        });
        clog(doc);
        return code.event(doc.value?code.OK:code.NO);
      }

      /**
       * To change current teacher's user name
       */
      changeName = async (user, body) => {
        const namepath = `${this.studentspath}.$[outer].${this.username}`;
        const newstudent = await Institute.findOneAndUpdate({uiid:user.uiid, [path]:{$elemMatch:{[this.classname]:user.classname}}},{
          $set:{
            [namepath]:body.newname
          }
        },{
          arrayFilters:[{'outer._id':ObjectId(user.id)}]
        });
        return code.event(newstudent ? code.OK : code.NO);
      };

      /**
       * To change current teacher's user password
       */
      changePassword = async (user, body) => {
        const salt = await bcrypt.genSalt(10);
        const epassword = await bcrypt.hash(body.newpassword, salt);
        const passpath = `${this.studentspath}.$[outer].${this.password}`;
        const newstudent = await Institute.findOneAndUpdate({uiid:user.uiid, [path]:{$elemMatch:{[this.classname]:user.classname}}},{
          $set:{
            [passpath]:epassword
          },
          $unset: {
            [this.rlinkexp]: null,
          },
        },{
          arrayFilters:[{'outer._id':ObjectId(user.id)}]
        });
        return code.event(newstudent ? code.OK : code.NO);
      };

      /**
       * 
       */
      changeEmailID = async (user, student, body) => {
        if (student.email == body.newemail)
          return code.event(code.auth.SAME_EMAIL);
        const classdoc = await Institute.findOne({uiid:user.uiid,"users.classes":{$elemMatch:{"classname":user.classname}}},
        {projection:{"users.classes.$":1}});
        if(!classdoc) return code.event(code.NO);
        let somestudent;
        let found = classdoc.users.classes[0].students.some((stud)=>{
          somestudent = stud;
          return String(stud.studentID)==String(body.newemail);
        })
        if(somestudent) return code.event(code.auth.USER_EXIST);
        const emailpath = `${this.studentspath}.$[outer].${this.studentID}`;
        const newstudent = await Institute.findOneAndUpdate({uiid:user.uiid, [path]:{$elemMatch:{[this.classname]:user.classname}}},{
          $set:{
            [emailpath]:body.newemail,
            [this.verified]:false
          },
        },{
          arrayFilters:[{'outer._id':ObjectId(user.id)}]
        });
        return code.event(newstudent ? code.OK : code.NO);
      };

      /**
       * 
       */
      deleteAccount = async (user) => {
        const deldoc = await Institute.findOneAndUpdate({uiid:user.uiid,[path]:{$elemMatch:{[this.classname]:user.classname}}},{
          $pull:{
            [this.studentspath]:{[this.uid]:user.id}
          }
        },{
          arrayFilters:[{'outer._id':ObjectId(user.id)}]
        })
        return code.event(deldoc ? code.OK : code.NO);
      };
    }
    class Preferences{
      constructor(){
        this.studentspath = studentspath;
        this.object = `prefs`;
      }
      getSpecificPath(specific){
        return `${this.object}.${specific}`;
      }
      async setPreference(user,body){
        let value;
        switch(body.specific){
      
          default:return null;
        }
      
      }
      async getPreference(user,body){
      
      }
      
    }
    this.account = new Account();
    this.prefs = new Preferences();
  }

  handleAccount = async (user, body,teacher) => {
    switch (body.action) {
      case code.action.CHANGE_NAME:
        return await this.account.changeName(user, body);
      case code.action.CHANGE_PASSWORD:
        return await this.account.changePassword(user, body);
      case code.action.CHANGE_ID:
        return await this.account.changeEmailID(user, teacher, body);
      case code.action.CHANGE_PHONE:
        return await this.account.changePhone(user, body);
      case code.action.ACCOUNT_DELETE:
        return await this.account.deleteAccount(user);
    }
  };
  handlePreferences = async (user, body) => {
    switch (body.action) {
      case "set": return await this.prefs.setPreference(user,body);
      case "get": return await this.prefs.getPreference(user,body)
    }
  };
  handleVerification = async (user, body) => {
    switch (body.action) {
      case "send": {
        const linkdata = await verify.generateLink(verify.target.student, {
          uid: user.id,
          cid:body.classID,
          instID:body.instID,
        });
        clog(linkdata);
        //todo: send email then return.
        return code.event(
          linkdata ? code.mail.MAIL_SENT : code.mail.ERROR_MAIL_NOTSENT
        );
      }
      case "check": {
        const classdoc = await Institute.findOne({uiid:user.uiid,[this.path]:{$elemMatch:{[this.classname]:user.classname}}},
          {projection:{"users.classes.$":1}});
        let student;
        classdoc.users.classes[0].students.some((stud)=>{
          student = stud;
          return String(stud._id) == String(user.id);
        });
        return code.event(
          student.verified ? code.verify.VERIFIED : code.verify.NOT_VERIFIED
        );
      }
    }
  };
  handlePassReset = async (user, body) => {
    switch (body.action) {
      case "send":{
          const linkdata = await reset.generateLink(verify.target.student, {
            uid: user.id,
          });
          clog(linkdata);
          //todo: send email then return.
          return code.event(
            linkdata ? code.mail.MAIL_SENT : code.mail.ERROR_MAIL_NOTSENT
          );
      }break;
    }
  };
}


class Schedule{
  constructor(){}
  getSchedule = async (user, dayIndex = null) => {
    const classdoc = await Institute.findOne(
      {
        uiid: user.uiid,
        "schedule.classes": { $elemMatch: { classname: user.classname } },
      },{
        projection: {
          "_id":0,
          "default": 1,
          "schedule.classes.$": 1,
        },
      }
    );
    clog(classdoc);
    if (!classdoc) return false;
    const schedule = classdoc.schedule.classes[0].days;
    const timings = classdoc.default.timings;
    if (dayIndex==null) return { schedule: schedule, timings:timings};
    let today = classdoc.schedule.teachers[0].days[0];
    const found = schedule.some((day) => {
      if (day.dayIndex == dayIndex) {
        today = day;
        return true;
      }
    });
    if (!found) return { schedule: false, timings:timings};
    return { schedule: today, timings:timings};
  }
}

module.exports = new StudentWorker();
const clog = (m)=>console.log(m);