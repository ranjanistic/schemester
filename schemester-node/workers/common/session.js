const { ObjectId } = require("mongodb");

const code = require("../../public/script/codes"),
  jwt = require("../../node_modules/jsonwebtoken"),
  bcrypt = require("../../node_modules/bcryptjs"),
  Admin = require("../../collections/Admins"),
  Institute = require("../../collections/Institutions"),
  sessionID = "id",
  sessionUID = "uid";

class Session {
  constructor() {
    this.adminsessionsecret = "adminschemesterSecret2001";
    this.teachersessionsecret = "teacherschemesterSecret2001";
    this.studentsessionsecret = "studentschemesterSecret2001";
    this.sessionID = "id",
    this.sessionUID = "uid";
    this.sessionKey = "bailment"; //bailment ~ amaanat
    this.expiresIn = 7 * 86400;//days*seconds/day
  }
  verify = async (request, secret) => {
    const token = request.signedCookies[this.sessionKey];
    try {
      if (!token) return code.event(code.auth.SESSION_INVALID);
      return jwt.verify(token, secret);
    } catch (e) {
      return code.eventmsg(code.auth.SESSION_INVALID,e);
    }
  };

  finish = async (response) => {
    await response.clearCookie(this.sessionKey);
    return code.event(code.auth.LOGGED_OUT);
  };

  login = async (request, response, secret) => {
    const body = request.body;
    switch (secret) {
      case this.adminsessionsecret: { //admin login
        const { email, password, uiid, target } = body;
        const admin = await Admin.findOne({email:email});
        if (!admin) return code.event(code.auth.USER_NOT_EXIST)
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) return code.event(code.auth.WRONG_PASSWORD);
        if (uiid != admin.uiid) return code.event(code.auth.WRONG_UIID);
        const payload = {
          user: {
            id: admin._id,
            uiid: admin.uiid,
          },
        };
        const token = jwt.sign(payload, secret, {expiresIn: this.expiresIn,});
        response.cookie(this.sessionKey, token, { signed: true });
        return {
          event: code.auth.AUTH_SUCCESS,
          user: getAdminShareData(admin),
          target: target
        };
      }
      case this.teachersessionsecret:{ //teacher login
        const inst = await Institute.findOne({uiid:body.uiid});
        switch (body.type) {
          case "uiid": {
            return inst
              ? code.event(code.inst.INSTITUTION_EXISTS)
              : code.event(code.inst.INSTITUTION_NOT_EXISTS);
          }
          default:{
            if (!inst) return code.event(code.inst.INSTITUTION_NOT_EXISTS);
            const userInst = await Institute.findOne({uiid:body.uiid,"users.teachers":{$elemMatch:{"teacherID":body.email}}},
              {projection:{"_id":0,"users.teachers.$":1}}
            );
            switch(body.type){
              case "email":
                return userInst?code.event(code.auth.USER_EXIST):code.event(code.auth.USER_NOT_EXIST);
              case "password": {
                const { password, uiid, target } = body;
                if(!userInst) return code.event(code.auth.USER_NOT_EXIST);
                const teacher = userInst.users.teachers[0];
                const isMatch = await bcrypt.compare(password, teacher.password);
                if (!isMatch) return code.event(code.auth.WRONG_PASSWORD);
                const payload = {user: {id: teacher._id,uiid: uiid}};
                const token = jwt.sign(payload, secret, {
                  expiresIn: this.expiresIn,
                });
                response.cookie(this.sessionKey, token, { signed: true });
                return {
                  event: code.auth.AUTH_SUCCESS,
                  user: getTeacherShareData(teacher),
                  target: target,
                };
              }
              default:return code.event(code.auth.AUTH_REQ_FAILED);
            }
          }
        }
      }
      case this.studentsessionsecret:{
        const inst = await Institute.findOne({uiid:body.uiid});
        switch (body.type) {
          case "uiid": {
            return inst
              ? code.event(code.inst.INSTITUTION_EXISTS)
              : code.event(code.inst.INSTITUTION_NOT_EXISTS);
          }
          default:{
            if (!inst) return code.event(code.inst.INSTITUTION_NOT_EXISTS);
            const userInst = await Institute.findOne({uiid:body.uiid,"users.students":{$elemMatch:{"studentID":body.email}}},
              {projection:{"_id":0,"users.students.$":1}}
            );
            switch(body.type){
              case "email":
                return userInst?code.event(code.auth.USER_EXIST):code.event(code.auth.USER_NOT_EXIST);
              case "password": {
                const { password, uiid, target } = body;
                if(!userInst) return code.event(code.auth.USER_NOT_EXIST);
                const student = userInst.users.students[0];
                const isMatch = await bcrypt.compare(password, student.password);
                if (!isMatch) return code.event(code.auth.WRONG_PASSWORD);
                const payload = {user: {id: student._id,uiid: uiid}};
                const token = jwt.sign(payload, secret, {
                  expiresIn: this.expiresIn,
                });
                response.cookie(this.sessionKey, token, { signed: true });
                return {
                  event: code.auth.AUTH_SUCCESS,
                  user: getStudentShareData(student),
                  target: target,
                };
              }
              default:return code.event(code.auth.AUTH_REQ_FAILED);
            }
          }
        }
      }
      default:
        return code.event(code.auth.AUTH_REQ_FAILED);
    }
  };

  signup = async (request, response, secret) => {
    switch (secret) {
      case this.adminsessionsecret:{
          const { username, email, password, uiid } = request.body;
          const admin = await Admin.findOne({ email:email });
          if (admin) return code.event(code.auth.USER_EXIST);
          const inst = await Admin.findOne({ uiid:uiid });
          if (inst) return code.event(code.server.UIID_TAKEN);
          clog("checks cleared");
          const salt = await bcrypt.genSalt(10);
          const epassword = await bcrypt.hash(password, salt);
          const newAdminDoc = {
            username:username,
            email:email,
            password:epassword,
            uiid:uiid,
            createAt:Date.now(),
            verified:false,
            prefs:{}
          }
          const result = await Admin.insertOne(newAdminDoc);
          if(result.insertedCount==0) return code.event(code.auth.ACCOUNT_CREATION_FAILED);
          //account created
          clog("result");
          const newadmin = result.ops[0];
          const payload = {
            user: {
              id: newadmin._id,
              uiid: newadmin.uiid,
            },
          };
          const token = jwt.sign(payload, secret, { expiresIn: this.expiresIn });
          response.cookie(this.sessionKey, token, { signed: true });
          return {
            event: code.auth.ACCOUNT_CREATED,
            user: getAdminShareData(newadmin)
          };
        }
      case this.teachersessionsecret:{
          const { username, email, password, uiid } = request.body;
          const inst = await Institute.findOne({ uiid: uiid });
          if (!inst) return code.event(code.inst.INSTITUTION_NOT_EXISTS);
          const userinst = await Institute.findOne({uiid:uiid, "users.teachers":{$elemMatch:{"teacherID":email}}});
          if(userinst) return code.event(code.auth.USER_EXIST);
          clog("checks cleared");
          const salt = await bcrypt.genSalt(10);
          const epassword = await bcrypt.hash(password, salt);
          const doc = await Institute.findOneAndUpdate(
            { uiid: uiid },
            {
              $push: {
                "users.teachers": {
                  _id: new ObjectId(),
                  username: username,
                  teacherID: email,
                  password: epassword,
                  createdAt: Date.now(),
                  verified:false,
                  vacations:[],
                  prefs:{}
                },
              },
            },{
              returnOriginal:false
            }
          );
          clog(doc);
          if(!doc) return code.eventmsg(code.auth.ACCOUNT_CREATION_FAILED, err);
          clog("created?");
          const userInst = await Institute.findOne({uiid:uiid, "users.teachers":{$elemMatch:{"teacherID":email}}},{
            projection:{_id:0,"users.teachers.$":1}
          });
          if(!userInst) return code.event(code.auth.USER_NOT_EXIST);
          const teacher = userInst.users.teachers[0];
          const payload = {
            user: {
              id: teacher._id,
              uiid: uiid
            },
          };
          const token = jwt.sign(payload, secret, {expiresIn: this.expiresIn});
          response.cookie(this.sessionKey, token, { signed: true });
          return {
            event: code.auth.ACCOUNT_CREATED,
            user: getTeacherShareData(teacher),
          };
      }break;
      case this.studentsessionsecret:{
        const { username, email, password, uiid, classname} = request.body;
          const inst = await Institute.findOne({ uiid: uiid });
          if (!inst) return code.event(code.inst.INSTITUTION_NOT_EXISTS);
          let classInst = await Institute.findOne({uiid:uiid, "users.classes":{$elemMatch:{classname:classname}}},
          {projection:{"_id":0,"users.classes.$":1}});
          if(!classInst) return code.event(code.schedule.BATCH_NOT_FOUND);
          const theclass = classInst.users.classes[0];
          let found = theclass.students.some((student,_)=>{
            return student.studentID == email;
          });
          if(found) return code.event(code.auth.USER_EXIST);
          clog("checks cleared");
          const salt = await bcrypt.genSalt(10);
          const epassword = await bcrypt.hash(password, salt);
          const filter = {
            uiid: uiid,
            "users.classes": {
              $elemMatch: { classname: classname },
            }, //existing classname
          };
          const newdocument = {
            $push: { "users.classes.$[outer].students":{
              _id: new ObjectId(),
              username: username,
              studentID: email,
              password: epassword,
              className:classname,
              createdAt: Date.now(),
              verified:false,
              prefs:{}
            }}, //new student push
          };
          const options = {
            arrayFilters: [{ "outer.classname": classname }],
          };
          const doc = await Institute.findOneAndUpdate(
            filter,
            newdocument,
            options
          );
          if(!doc) return code.eventmsg(code.auth.ACCOUNT_CREATION_FAILED, err);
          clog("new student appended?");
          classInst = await Institute.findOne({uiid:uiid, "users.classes":{$elemMatch:{"classname":classname}}},{
            projection:{"_id":0,"users.classes.$":1}
          });
          if(!classInst) return code.event(code.schedule.BATCH_NOT_FOUND);
          let newstudent;
          const newfound = classInst.users.classes[0].students.some((student,_)=>{
            if(student.studentID == email){
              newstudent = student;
              return true;
            }
          });
          if(!newfound) return code.event(code.auth.USER_NOT_EXIST);
          const payload = {
            user: {
              id: newstudent._id,
              uiid: uiid
            },
          };
          const token = jwt.sign(payload, secret, {expiresIn: this.expiresIn});
          response.cookie(this.sessionKey, token, { signed: true });
          return {
            event: code.auth.ACCOUNT_CREATED,
            user: getStudentShareData(newstudent),
          };
      }
      default: return code.event(code.server.DATABASE_ERROR);
    }
  };

  userdata = async (request, secret) => {
    this.verify(request,secret)
    .catch(e=>{
      return code.event(code.auth.AUTH_REQ_FAILED)
    })
    .then(async response=>{
      if(!this.valid(response)) return code.event(code.auth.SESSION_INVALID);
      switch (secret) {
        case this.adminsessionsecret: {
          const admin = await Admin.findOne({ _id:response.user.id});
          return admin?getAdminShareData(admin):code.event(code.auth.USER_NOT_EXIST);
        }
        case this.teachersessionsecret: {
          const userinst = await Institute.findOne({
            uiid:response.user.uiid,
            "users.teachers":{
              $elemMatch:{"_id":response.user.id}
            }
          },{
            $projection:{
              "_id":0,
              "users.teachers.$":1
            }
          });
          return userinst?getTeacherShareData(userinst.users.teachers[0]):code.event(code.auth.USER_NOT_EXIST);
        }
        case this.studentsessionsecret:{
          const userinst = await Institute.findOne({
            uiid:response.user.uiid,
            "users.classes":{
              $elemMatch:{"classname":response.user.classname}
            }
          },{
            $projection:{
              "_id":0,
              "users.classes.$":1
            }
          });
          return userinst?getStudentShareData(userinst.users.classes[0]):code.event(code.auth.USER_NOT_EXIST);
        }
        default: return code.event(code.auth.AUTH_REQ_FAILED);
      }
    });
  };
  valid = (response) => response.event != code.auth.SESSION_INVALID;
}

module.exports = new Session();

const getAdminShareData = (data = {}) => {
  return {
    isAdmin:true,
    [sessionUID]: data._id,
    username: data.username,
    [sessionID]: data.email,
    uiid: data.uiid,
    createdAt: data.createdAt,
    verified: data.verified,
    prefs:data.prefs
  };
};

const getTeacherShareData = (data = {}) => {
  return {
    isTeacher:true,
    [sessionUID]: data._id,
    username: data.username,
    [sessionID]: data.teacherID,
    createdAt: data.createdAt,
    verified: data.verified,
    vacations:data.vacations,
    prefs:data.prefs
  };
};

const getStudentShareData = (data = {}) => {
  return {
    isStudent:true,
    [sessionUID]: data._id,
    username: data.username,
    [sessionID]: data.teacherID,
    createdAt: data.createdAt,
    verified: data.verified,
    prefs:data.prefs
  };
};


let clog = (msg) => console.log(msg);
