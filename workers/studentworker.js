const Admin = require("../config/db").getAdmin(),
Institute = require("../config/db").getInstitute(),
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
    this.institute = new Institution();
    this.schedule = new Schedule();
    this.classes = new Classroom();
    this.comms = new Comms();
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
        // this.getClassesByStudentID = new Classroom().getClassesByStudentID;
        this.classpath = classpath;
        this.pseudoclasspath = pseudoclasspath;
        this.studentsclasspath = studentsclasspath;
        this.pseudostudentsclasspath = pseudostudentsclasspath;
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
      //todo:send feedback emails

      /**
       * Returns the student account associated with current user session.
       * @param {JSON} user The session user object.
       * @param {Boolean} raw If true, will return exact account data (including password, encrypted), else will return through sharedata methods. Defaults to false.
       * @returns {JSON} If account exists, returns account object (if raw=false,returns filtered account object via sharedata module), else returns false.
       */
      async getAccount(user,raw = false){
        let student = await this.getStudentById(user.uiid,user.id);
        if(student)
          return raw?student:share.getStudentShareData(student,user.uiid);
        student = await this.getStudentById(user.uiid,user.id,true);
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

      /**
       * This will add student to the given class of instiution, and will be shown as a requestee student to join the classroom if pseudo = true (default).
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

        const classroom = await new Classroom().getClassesByStudentID(user.uiid,student.studentID,true);
        
        //updating username in pseudousers.classes
        let res = await Promise.all(
          classroom.pseudoclasses.map((pclass)=>{
            return new Promise(async(resolve)=>{
              const doc = await Institute.findOneAndUpdate({uiid:user.uiid},{
                $set:{
                  [`${pseudoclasspath}.$[theclass].students.$[thestudent].${this.username}`]:body.newname
                }
              },{
                arrayFilters:[{[`theclass.${this.classname}`]:pclass},{[`thestudent.${this.studentID}`]:student.studentID}]
              })
              resolve(doc);
            })
          })
        );
        if(pseudo) return code.event(code.OK);

        //updating username in users.classes
        res = await Promise.all(
          classroom.classes.map((Class)=>{
            return new Promise(async(resolve)=>{
              const doc = await Institute.findOneAndUpdate({uiid:user.uiid},{
                $set:{
                  [`${classpath}.$[theclass].students.$[thestudent].${this.username}`]:body.newname
                }
              },{
                arrayFilters:[{[`theclass.${this.classname}`]:Class},{[`thestudent.${this.studentID}`]:student.studentID}]
              })
              resolve(doc);
            })
          })
        );
        return code.event(code.OK);
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
        const accdoc = await Institute.findOneAndUpdate({
          uiid:user.uiid,
          [pseudo?pseudostudentspath:studentspath]:{$elemMatch:{[this.uid]:ObjectId(user.id)}}
        },{
          $set:{
            [pseudo
              ? `${pseudostudentspath}.$.${this.studentID}`
              : `${studentspath}.$.${this.studentID}`]:body.newemail,
            [pseudo
              ? `${pseudostudentspath}.$.${this.verified}`
              : `${studentspath}.$.${this.verified}`]: false
          }
        }); //updating in student account
        if(!accdoc.value) return code.event(code.NO);

        const classroom = await new Classroom().getClassesByStudentID(user.uiid,student.studentID,true);

        //updating studentID in pseudousers.classes
        let res = await Promise.all(
          classroom.pseudoclasses.map((pclass)=>{
            return new Promise(async(resolve)=>{
              const doc = await Institute.findOneAndUpdate({uiid:user.uiid},{
                $set:{
                  [`${pseudoclasspath}.$[theclass].students.$[thestudent].${this.studentID}`]:body.newemail
                }
              },{
                arrayFilters:[{[`theclass.${this.classname}`]:pclass},{[`thestudent.${this.studentID}`]:student.studentID}]
              })
              resolve(doc);
            })
          })
        );
        if(pseudo) return code.event(code.OK);

        //updating studentID in users.classes
        res = await Promise.all(
          classroom.classes.map((Class)=>{
            return new Promise(async(resolve)=>{
              const doc = await Institute.findOneAndUpdate({uiid:user.uiid},{
                $set:{
                  [`${classpath}.$[theclass].students.$[thestudent].${this.studentID}`]:body.newemail
                }
              },{
                arrayFilters:[{[`theclass.${this.classname}`]:Class},{[`thestudent.${this.studentID}`]:student.studentID}]
              })
              resolve(doc);
            })
          })
        );
        return code.event(code.OK);
      };

      /**
       * Delete student account, and remove from all occurrences.
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
        const classroom = await new Classroom().getClassesByStudentID(user.uiid,student.studentID,true);

        //removing student from pseudousers.classes
        let res = await Promise.all(
          classroom.pseudoclasses.map((pclass)=>{
            return new Promise(async(resolve)=>{
              const doc = await Institute.findOneAndUpdate({uiid:user.uiid},{
                $pull:{
                  [`${pseudoclasspath}.$[theclass].students`]:{[this.studentID]:student.studentID}
                }
              },{
                arrayFilters:[{[`theclass.${this.classname}`]:pclass}]
              })
              resolve(doc);
            })
          })
        );
        if(pseudo) return code.event(code.OK);

        //removing student from users.classes
        res = await Promise.all(
          classroom.classes.map((Class)=>{
            return new Promise(async(resolve)=>{
              const doc = await Institute.findOneAndUpdate({uiid:user.uiid},{
                $pull:{
                  [`${classpath}.$[theclass].students`]:{[this.studentID]:student.studentID}
                }
              },{
                arrayFilters:[{[`theclass.${this.classname}`]:Class}]
              })
              resolve(doc);
            })
          })
        );

        //deleting personal rooms.
        const singlerooms = await new Comms().get1to1RoomsofPerson(user.uiid,student.studentID);
        if(singlerooms)
          res = await Promise.all(
            singlerooms.map((room)=>{
              return new Promise(async(resolve)=>{
                const doc = await Institute.findOneAndUpdate({uiid:user.uiid},{
                  $pull:{
                    [`comms`]:{[this.uid]:ObjectId(room._id)}
                  }
                })
                resolve(doc);
              })
            })
          );

        //removing from chatrooms
        const list = await new Comms().getRoomAndCallList(user);
        if(list)
          res = await Promise.all(
            list.rooms.map((room)=>{
              return new Promise(async(resolve)=>{
                const doc = await Institute.findOneAndUpdate({uiid:user.uiid},{
                  $pull:{
                    [`comms.$[theroom].people`]:{"id":student.studentID}
                  }
                },{
                  arrayFilters:[{[`theroom.${this.uid}`]:ObjectId(room._id)}]
                })
                resolve(doc);
              })
            })
          )
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
      case action.set:
        return await this.prefs.setPreference(user, body);
      case action.get:
        return await this.prefs.getPreference(user, body);
    }
  };
  handleVerification = async (user, body) => {
    switch (body.action) {
      case action.send: {
        const inst = await Institute.findOne({uiid:user.uiid},{projection:{[this.uid]:1}});
        if(!inst) return code.event(code.inst.INSTITUTION_NOT_EXISTS);
        const linkdata = await verify.generateLink(client.student, {
          uid: user.id,
          instID: inst._id,
        });
        if(!linkdata) return code.event(code.mail.ERROR_MAIL_NOTSENT);
        return await mailer.sendVerificationEmail(linkdata);
      } break;
      case action.check: {
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
      case action.send:{
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

class Institution{
  constructor(){

  }
  async getDefaultsWithAdminPrefs(user){
    const inst = await Institute.findOne({uiid:user.uiid},{projection:{"default":1}});
    await Promise.all(
      inst.default.admin.map((admin,a)=>{
        return new Promise(async(resolve)=>{
          const useradmin = await Admin.findOne({"email":admin.email});
          inst.default.admin[a]['phonevisible'] = useradmin.prefs.showphonetostudent
          inst.default.admin[a]['emailvisible'] = useradmin.prefs.showemailtostudent
          resolve(inst);
        })
      })
    );
    return inst.default;
  }
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
    this.account = new Self().account;
    this.classname = "classname";
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
        [this.account.classpath]:1,
        [this.account.pseudoclasspath]:1
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

  async getClassByClassname(uiid,classname,pseudo = false){
    const doc = await Institute.findOne({uiid:uiid,[pseudo?this.account.pseudoclasspath:this.account.classpath]:{$elemMatch:{[this.classname]:classname}}},{projection:{[pseudo?`${this.account.pseudoclasspath}.$`:`${this.account.classpath}.$`]:1}});
    return doc?pseudo?doc.pseudousers.classes[0]:doc.users.classes[0]:false;
  }

  async removeStudentFromClass(uiid,classname,studentID,pseudo = true){
    const doc = await Institute.findOneAndUpdate({
      uiid:uiid,
      [pseudo?this.account.pseudoclasspath:this.account.classpath]:{$elemMatch:{classname:classname}}
    },{
      $pull:{
        [pseudo?this.account.pseudostudentsclasspath:this.account.studentsclasspath]:{[this.account.studentID]:studentID}
      }
    });
    return code.event(doc.value ? code.OK : code.NO); 
  }


  async joinPseudoClass(user,classname){
    const student = await this.account.getAccount(user);
    if(!student) return code.event(code.auth.USER_NOT_EXIST);
    const pseudoclassdoc = await Institute.findOne({uiid:user.uiid,[this.account.pseudoclasspath]:{$elemMatch:{[this.account.classname]:classname}}});
    if(!pseudoclassdoc) return code.event(code.inst.CLASS_NOT_FOUND);
    const classrooms = await this.getClassesByStudentID(user.uiid,student.id,true);
    if(classrooms){
      if(classrooms.classes.includes(classname)||classrooms.pseudoclasses.includes(classname))  //already in the request class.
        return code.event(code.inst.CLASS_EXISTS);
    }
    return await this.account.addStudentToClass(user.uiid,classname,{username:student.username,studentID:student.id});
  }

  async removePseudoRequest(user,classname){
    const student = await this.account.getAccount(user);
    if(!student) return code.event(code.auth.USER_NOT_EXIST);
    return await this.removeStudentFromClass(user.uiid,classname,student.id);
  }

  async handleClassRequest(user,body){
    switch(body.specific){
      case "join":return await this.joinPseudoClass(user,body.classname);
      case "withdraw": return await this.removePseudoRequest(user,body.classname);
    }
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

  async getRoomAndCallList(user){
    const student = await this.account.getAccount(user);
    const inst = await Institute.findOne({uiid:user.uiid},{
      projection:{[this.comms]:1,"users.classes":1}
    });
    let rooms = [];
    let calls = [];
    let calltimes = [];
    inst.comms.forEach((room)=>{
      if(room.people.find((person)=>person.id==student.id)){
        rooms.push({
          [this.id]:room._id,
          [this.roomname]:room.roomname,
          [this.people]:room.people,
          [this.chats]:room.chats
        });
        room.voicecalls.forEach((call)=>{
          calltimes.push(call.time);
        });
      }
    });
    calltimes.sort();
    inst.comms.forEach((room)=>{
      if(room.people.find((person)=>person.id==student.id)){
        calltimes.forEach((time)=>{
          if(room.voicecalls.find((call)=>call.time==time)){
            calls.push(room.voicecalls);
            if(room.roomname) return calls[calls.length-1][this.roomname] = room.roomname;
            room.people.forEach((person)=>{
              if(person.id!=student.id){
                calls[calls.length-1][this.roomname] += `${person.username}, `;
              }
            });
            calls[calls.length-1][this.roomname] = calls[calls.length-1][this.roomname].trim()
            calls[calls.length-1][this.roomname] = calls[calls.length-1][this.roomname].substr(0,calls[calls.length-1][this.roomname].length-2);
          }
        })
      }
    });

    //No non-existent rooms to be shown. Classrooms to be shown only if the room in comms exist. (to be only created by incharge,involuntarily)
    const classroom = await this.classes.getClassesByStudentID(user.uiid,student.id);
    if(classroom){
      classroom.classes.forEach((Class)=>{
        if(!rooms.find((room)=>String(room[this.id])==String(Class[this.id]))){
          if(inst.comms.find((room)=>String(room[this.id])==String(Class[this.id]))?true:false){
            rooms.push({
              [this.roomname]:Class.classname,
            });
          }
        }
      })
    }
    return rooms.length?{rooms:rooms,calls:calls}:false;
  }

  async getRoom(user,roomdata){
    const student = await this.account.getAccount(user);
    let room;
    if(roomdata.rid) room = await this.getRoomByID(user.uiid,roomdata.rid);
    else if(roomdata.roomname) {
      room = await this.getRoomByName(user.uiid,roomdata.roomname)
      if(room){
        if(!room.people.find((person)=>person.id==student.id)){ //checking if student is in the room, pushing if not
          const classrooms = await this.classes.getClassesByStudentID(user.uiid,student.id,true);
          if(classrooms.classes.includes(roomdata.roomname)){
            const res = await this.addStudentToRoom(user,room._id);
            if(res.event != code.OK) room = false;
            else room = await this.getRoomByID(user.uiid,room._id);
          }
        }
      }
      //Student cannot create a room for their classroom. Only incharge can do that, involuntarily.
    } else if(roomdata.personid){
      room = await this.getSinglePersonRoom(user.uiid,roomdata.personid);
      if(!room){
        const person = await this.account.getStudentById(user.uiid,roomdata.personid);
        if(person&&person.studentID!=student.id){
          room = await this.createNewRoom(user,[{
            username:person.username,
            id:person.studentID
          }]);
        }
      }
    } else return false;
    if(!room) return false;
    if(!room.people.find((person)=>person.id==student.id)) return code.event(code.comms.ROOM_ACCESS_DENIED);
    if(room.blocked.includes(student.id)) return code.event(code.comms.BLOCKED_FROM_ROOM);
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
    const room = roomdoc.comms.find((room)=>
      (room.people.length == 2) && (room.people.find((person)=>person.id==personid))?true:false
    );
    return room?room:false;
  }

  async get1to1RoomsofPerson(uiid,personid){
    const roomdoc = await Institute.findOne({uiid:uiid},{
      projection:{[`${this.comms}`]:1}
    });
    if(!roomdoc) return false;
    let rooms = [];
    roomdoc.comms.forEach((room)=>{
      if((room.people.find((person)=>person.id==personid))?true:false&&(room.people.length == 2)){
        rooms.push(room);
      }
    });
    return rooms.length?rooms:false;
  }

  async addStudentToRoom(user,roomID){
    const student = await this.account.getAccount(user);
    const doc = await Institute.findOneAndUpdate({uiid:user.uiid},{
      $push:{
        "comms.$[theroom].people":{
          username:student.username,
          id:student.id
        }
      }
    },{
      arrayFilters:[{"theroom._id":ObjectId(roomID)}]
    });
    return code.event(doc.value?code.OK:code.NO);
  }

  async chatroom(){

  }
  async voicecalling(){

  }
  async videocalling(){

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
