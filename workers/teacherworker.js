const Institute = require("../collections/Institutions"),
  view = require("../hardcodes/views"),
  code = require("../public/script/codes"),
  verify = require("./common/verification"),
  bcrypt = require("bcryptjs"),
  reset = require("./common/passwordreset"),
  share = require("./common/sharedata"),
  { ObjectId } = require("mongodb");
class TeacherWorker {
  constructor() {
    this.self = new Self();
    this.schedule = new Schedule();
    this.classroom = new Classroom();
  }
  toSession = (u, query = { target: view.teacher.target.dash }) => {
    let path = `/teacher/session?u=${u}`;
    for (var key in query) {
      if (query.hasOwnProperty(key)) {
        path = `${path}&${key}=${query[key]}`;
      }
    }
    return path;
  };
  toLogin = (query = { target: view.teacher.target.dash }) => {
    let i = 0;
    let path = "/teacher/auth/login";
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
    const path = `users.teachers`;
    const pseudopath = `pseudousers.teachers`;
    class Account {
      constructor() {
        this.path = path;
        this.pseudopath = pseudopath;
        this.username = 'username';
        this.uid = '_id';
        this.teacherID = 'teacherID';
        this.password = 'password';
        this.createdAt = 'createdAt';
        this.verified = 'verified';
        this.vlinkexp = 'vlinkexp';
        this.rlinkexp = 'rlinkexp';
      }
      //send feedback emails

      async createAccount(uiid,newteacher){
        const doc = await Institute.findOneAndUpdate(
          { uiid: uiid },
          {
            $push: {
              [this.path]: newteacher
            },
          }
        );
        return code.event(doc?code.OK:code.NO);
      }

      /**
       * This will create an account in teachers of the pseudousers object of instiution, and will be shown as a requestee teacher to join the institution.
       * @param {String} uiid The unique institute ID
       * @param {JSON} pseudoteacher The teacher data for which pseudo account will be created.
       */
      async createPseudoAccount(uiid,pseudoteacher){
        const doc = await Institute.findOneAndUpdate({
          uiid:uiid,
        },{
          $push:{
            [this.pseudopath]:pseudoteacher
          }
        });
        return code.event(doc?code.OK:code.NO);
      }

      /**
       * To change current teacher's user name
       */
      changeName = async (user, body) => {
        const namepath = `${path}.$.${this.username}`;
        const newteacher = await Institute.findOneAndUpdate({uiid:user.uiid, [path]:{$elemMatch:{[this.uid]:ObjectId(user.id)}}},{
          $set:{
            [namepath]:body.newname
          }  
        });
        return code.event(newteacher ? code.OK : code.NO);
      };

      /**
       * To change current teacher's user password
       */
      changePassword = async (user, body) => {
        const salt = await bcrypt.genSalt(10);
        const epassword = await bcrypt.hash(body.newpassword, salt);
        const passpath = `${path}.$.${this.password}`;
        const rlinkpath = `${path}.$.${this.rlinkexp}`;
        const newteacher = await Institute.findOneAndUpdate({uiid:user.uiid, [path]:{$elemMatch:{[this.uid]:ObjectId(user.id)}}},{
          $set:{
            [passpath]:epassword
          },
          $unset: {
            [rlinkpath]: null,
          },
        });
        if(!newteacher.value){
          const passpath = `${pseudopath}.$.${this.password}`;
          const rlinkpath = `${pseudopath}.$.${this.rlinkexp}`;
          const newteacher = await Institute.findOneAndUpdate({uiid:user.uiid, [pseudopath]:{$elemMatch:{[this.uid]:ObjectId(user.id)}}},{
            $set:{
              [passpath]:epassword
            },
            $unset: {
              [rlinkpath]: null,
            },
          });
          return code.event(newteacher.value ? code.OK : code.NO);
        }
        return code.event(newteacher.value ? code.OK : code.NO);
      };

      /**
       * 
       */
      changeEmailID = async (user, teacher, body) => {
        if (teacher.email == body.newemail)
          return code.event(code.auth.SAME_EMAIL);
        const someteacher = await Admin.findOne({ email: body.newemail });
        if (someteacher) return code.event(code.auth.USER_EXIST);
        const newteacher = await Admin.findOneAndUpdate(
          { _id: ObjectId(user.id) },
          {
            $set: {
              [this.teacherID]: body.newemail,
              verified: false,
            },
          }
        );
        return newteacher?code.event(
          (await this.defaults.admin.setEmail(user, body)) ? code.OK : code.NO
        ):code.event(code.NO);
      };

      /**
       * 
       */
      deleteAccount = async (user) => {
        const deluser = await Institute.findOneAndUpdate({uiid:user.uiid,[this.path]:{$elemMatch:{[this.uid]:ObjectId(user.id)}}},{
          $pull:{
            [this.path]:{[this.uid]:ObjectId(user.id)}
          }
        });
        if(!deluser.value){
          const delpseudo = await Institute.findOneAndUpdate({uiid:user.uiid,[this.pseudopath]:{$elemMatch:{[this.uid]:ObjectId(user.id)}}},{
            $pull:{
              [this.pseudopath]:{[this.uid]:ObjectId(user.id)}
            }
          });
          return code.event(delpseudo.value?code.OK:code.NO);
        }
        return code.event(deluser.value?code.OK:code.NO);
      };
    }
    class Preferences{
      constructor(){
        this.object = `prefs`;
        this.showemailtoteacher = 'showemailtoteacher';
        this.showphonetoteacher = 'showphonetoteacher';
        this.showemailtostudent = 'showemailtostudent';
        this.showphonetostudent = 'showphonetostudent';
      }
      getSpecificPath(specific){
        return `${this.object}.${specific}`;
      }
      async setPreference(user,body){
        let value;
        switch(body.specific){
          case this.showemailtoteacher:{value = body.show}break;
          case this.showphonetoteacher:{value = body.show}break;
          case this.showemailtostudent:{value = body.show}break;
          case this.showphonetostudent:{value = body.show}break;
          default:return null;
        }
        const adoc = await Admin.findOneAndUpdate({"_id":ObjectId(user.id)},{
          $set:{
            [this.getSpecificPath(body.specific)]:value
          }
        });
        return code.event(adoc?code.OK:code.NO);
      }
      async getPreference(user,body){
        switch(body.specific){
          case this.showemailtoteacher:break;
          case this.showphonetoteacher:break;
          case this.showemailtostudent:break;
          case this.showphonetostudent:break;
          default:{
            const adoc = await Admin.findOne({"_id":ObjectId(user.id)});
            return code.event(adoc?adoc.prefs:code.NO);
          }
        }
        const adoc = await Admin.findOne({"_id":ObjectId(user.id)});
        clog(adoc[this.getSpecificPath(body.specific)]);
        return code.event(adoc?adoc[this.getSpecificPath(body.specific)]:code.NO);
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
        const linkdata = await verify.generateLink(verify.target.teacher, {
          uid: user.id,
          instID:body.instID
        });
        clog(linkdata);
        //todo: send email then return.
        return code.event(
          linkdata ? code.mail.MAIL_SENT : code.mail.ERROR_MAIL_NOTSENT
        );
      }
      case "check": {
        const teacherdoc = await Institute.findOne({uiid:user.uiid,"users.teachers":{$elemMatch:{"_id":ObjectId(user.id)}}},{
          projection:{"users.teachers.$":1}
        });
        if(!teacherdoc){
          const pseudodoc = await Institute.findOne({uiid:user.uiid,"pseudousers.teachers":{$elemMatch:{"_id":ObjectId(user.id)}}},{
            projection:{"pseudousers.teachers.$":1}
          });
          if(!pseudodoc) return code.event(code.auth.USER_NOT_EXIST);
          return code.event(
            pseudodoc.pseudousers.teachers[0].verified? code.verify.VERIFIED : code.verify.NOT_VERIFIED
          );
        }
        return code.event(
          teacherdoc.users.teachers[0].verified? code.verify.VERIFIED : code.verify.NOT_VERIFIED
        );
      }
    }
  };
  handlePassReset = async (user, body,anonymous = false) => {
    switch (body.action) {
      case "send":{
        if(anonymous){  //user not logged in
          const userdoc = await Institute.findOne({uiid:body.uiid,"users.teachers":{$elemMatch:{"teacherID":body.email}}},
            {projection:{"_id":1,"users.teachers.$":1}}
          );
          if(!userdoc) {
            const pseudodoc = await Institute.findOne({uiid:body.uiid,"pseudousers.teachers":{$elemMatch:{"teacherID":body.email}}},
              {projection:{"_id":1,"pseudousers.teachers.$":1}}
            );
            if(!pseudodoc) return {result:code.event(code.OK)};  //don't tell if user not exists, while sending reset email.
            body['instID'] = pseudodoc._id;
            return await this.handlePassReset({id:share.getPseudoTeacherShareData(pseudodoc.pseudousers.teachers[0]).uid},body);
          }
          body['instID'] = userdoc._id;
          return await this.handlePassReset({id:share.getTeacherShareData(userdoc.users.teachers[0]).uid},body);
        }
        clog(user);
        const linkdata = await reset.generateLink(reset.target.teacher, {
          uid: user.id,
          instID:body.instID
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
    const teacheruser = await Institute.findOne(
      {
        uiid: user.uiid,
        "users.teachers": { $elemMatch: { "_id": ObjectId(user.id) } },
      },
      { projection: { "_id": 0, "users.teachers.$": 1 } }
    );
    if (!teacheruser)
      return session.finish(res).then((response) => {
        if (response) res.redirect(this.toLogin());
      });
    const teacher = teacheruser.users.teachers[0];
    const teacherschedule = await Institute.findOne(
      {
        uiid: user.uiid,
        "schedule.teachers": { $elemMatch: { teacherID: teacher.teacherID } },
      },
      {
        projection: {
          "_id":0,
          "default": 1,
          "schedule.teachers.$": 1,
        },
      }
    );
    clog(teacherschedule);
    if (!teacherschedule) return false;
    const schedule = teacherschedule.schedule.teachers[0].days;
    const timings = teacherschedule.default.timings;
    if (dayIndex==null) return { schedule: schedule, timings:timings};
    let today = teacherschedule.schedule.teachers[0].days[0];
    const found = schedule.some((day, index) => {
      if (day.dayIndex == dayIndex) {
        today = day;
        return true;
      }
    });
    if (!found) return { schedule: false, timings:timings};
    return { schedule: today, timings:timings};
  };
  

}

class Classroom{
  constructor(){
    this.path = 'users.classes';
    this.classname = 'classname';
    this.incharge = 'incharge';
    this.students = 'students';

    class Manage{
      constructor(){}
      async handleSettings(user,teacher,body,classroom){
        return;
      }
    }
    this.manage = new Manage()
  }

  async manageClassroom(user,body,teacher,classroom){
    switch(body.action){
      case "create":return await this.createClassroom(user,body);
      case "update":return await this.updateClassroom(user,teacher,body,classroom);
      case "delete":return;
      case "receive":return await this.getClassroom(user,classroom);
      case "manage": return await this.manage.handleSettings(user,body,teacher,classroom);
    }
  }

  async createClassroom(user,teacher,body){
    switch(body.specific){
      case "newclass":{
        const data = {
          classname:body.classname,
          incharge:teacher.teacherID,
          students:[]
        }
        const classdoc = await Institute.findOneAndUpdate({uiid:user.uiid},{
          $push:{
            [this.path]:data
          }
        })
        return code.event(classdoc?code.inst.CLASSES_CREATED:code.inst.CLASSES_CREATION_FAILED);
      }
    }
  }
  async updateClassroom(user,teacher,body,classroom){
    switch(body.specific){
      case "addstudent":{

      }
      case "removestudent":{

      }
    }
  }
  
  async getClassroom(user,classroom){
    const classdoc = await Institute.findOne({
      uiid:user.uiid,"users.classes":{$elemMatch:{"classname":classroom.classname}}
    },{projection:{"users.classes.$":1}});
    if(!classdoc) return {teacher:teacher,classroom:false}
    return {classroom :classdoc.users.classes[0]}
  }

  async handleInvitation(user,body,teacher,classroom){
    switch(body.action){
      case "create":return await this.createStudentInviteLink();
      case "accept":return await this.acceptStudentRequest();
      case "reject":return await this.rejectStudentRequest();
    }
    return;
  }

  async createStudentInviteLink(){

  }
  async acceptStudentRequest(){

  }
  async rejectStudentRequest(){

  }

}

const clog = (m) =>console.log(m);
module.exports = new TeacherWorker();