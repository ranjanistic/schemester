const code = require("../../public/script/codes"),
  time = require("./timer"),
  share = require("./sharedata"),
  { ObjectId } = require("mongodb"),
  Institute = require("../../config/db").getInstitute(),
  Admin = require("../../config/db").getAdmin();

class PasswordReset {
  constructor() {
    this.type = "resetpassword";
    this.target = new Target();
    this.domain = "http://localhost:3000";
    this.defaultValidity = 15; //min
  }
  generateLink = async(target, data = {}, validity = this.defaultValidity)=>{
    const exp = time.getTheMomentMinute(validity);
    let link = String();
    switch (target) {
      case this.target.admin:{
          const admin = await Admin.findOneAndUpdate(
            { _id: ObjectId(data.uid) },
            {
              $set: {
                rlinkexp: exp,
              },
            }
          );
          if(!admin) return false;
          link = `${this.domain}/${target}/external?type=${this.type}&u=${data.uid}&exp=${exp}`;
      }
        break;
        case this.target.teacher:{
          const teacherdoc = await Institute.findOneAndUpdate({_id:ObjectId(data.instID),"users.teachers":{$elemMatch:{"_id":ObjectId(data.uid)}}},{
            $set:{
              "users.teachers.$.rlinkexp":exp
            }
          });
          clog(teacherdoc);
          if(!teacherdoc.value){
            const pseudodoc = await Institute.findOneAndUpdate({_id:ObjectId(data.instID),"pseudousers.teachers":{$elemMatch:{"_id":ObjectId(data.uid)}}},{
              $set:{
                "pseudousers.teachers.$.rlinkexp":exp
              }
            });
            clog("pseduo");
            clog(pseudodoc);
            if(!pseudodoc.value) return false;
          }
          link = `${this.domain}/${target}/external?type=${this.type}&in=${data.instID}&u=${data.uid}`;
        }break;
        case this.target.student:{
          clog("hersdfe");
          clog(data);
          const studdoc = await Institute.updateOne({_id:ObjectId(data.instID)},{
            $set:{
              "users.classes.$[outer].students.$[outer1].rlinkexp":exp
            }
          },{
            arrayFilters:[{"outer._id":ObjectId(data.cid)},{"outer1._id":ObjectId(data.uid)}]
          });
          clog(studdoc.result);
          if(!studdoc.result.nModified){
            const pseudodoc = await Institute.updateOne({_id:ObjectId(data.instID)},{
              $set:{
                "pseudousers.classes.$[outer].students.$[outer1].rlinkexp":exp
              }
            },{
              arrayFilters:[{"outer._id":ObjectId(data.cid)},{"outer1._id":ObjectId(data.uid)}]
            });
            clog(pseudodoc.result);
            if(!pseudodoc.result.nModified) return false;
          }
          link = `${this.domain}/${target}/external?type=${this.type}&in=${data.instID}&c=${data.cid}&u=${data.uid}`;
          clog(link);
        }break;
    }
    clog(link);
    return {
      exp: exp,
      link: link,
    };
  }
  /**
   * If given time parameter is still greater than the current time, in SGT notation.
   * @param expiryTime The time to be checked valid in SGT notation.
   * @returns A boolean value, if valid, true, otherwise false.
   */
  isValidTime=(expiryTime)=> time.getTheMomentMinute() < Number(expiryTime);
  
  handlePasswordResetLink = async (query, clientType) => {
    switch (clientType) {
      case this.target.admin: {
        if (!query.u && !query.exp) return false;
        try {
          const admin = await Admin.findOne({ '_id': ObjectId(query.u) });
          if (!admin || !admin.rlinkexp) return false;
          if(Number(query.exp) != Number(admin.rlinkexp)) return false;
          if (!this.isValidTime(admin.rlinkexp)){
            const doc = await Admin.findOneAndUpdate({'_id':ObjectId(query.u)},{$unset:{rlinkexp:null}});
            return { user: { expired: true } };
          }
          return {user:share.getAdminShareData(admin)}
        }catch(e){
            return false;
        }
      }break;
      case this.target.teacher: {
        if (!(query.u && query.in)) return false;
        try {
            let teacherdoc = await Institute.findOne(
              {
                "_id": ObjectId(query.in),
                "users.teachers": { $elemMatch: { "_id": ObjectId(query.u) } },
              },
              {
                projection: {
                  "_id":0,
                  "uiid":1,
                  "users.teachers.$": 1,
                },
              }
              );
              if (!teacherdoc){
              const pseudodoc = await Institute.findOne({
                  _id: ObjectId(query.in),
                  "pseudousers.teachers": { $elemMatch: { _id: ObjectId(query.u) } },
              },{
                projection: {
                    _id: 0,
                    "uiid":1,
                  "pseudousers.teachers.$": 1,
                },
              });
              if(!pseudodoc) return false;
              let teacher = pseudodoc.pseudousers.teachers[0];
              if(!teacher || !teacher.rlinkexp) return false;
              if (!this.isValidTime(teacher.rlinkexp)) return { user: { expired: true } };
              return { user: share.getPseudoTeacherShareData(teacher) , uiid:pseudodoc.uiid};
            }
            const teacher = teacherdoc.users.teachers[0];
            if (!teacher || !teacher.rlinkexp) return false;
            if (!this.isValidTime(teacher.rlinkexp)) return { user: { expired: true } };
            return {user:share.getTeacherShareData(teacher),uiid:teacherdoc.uiid};
        } catch (e) {
            clog(e);
            return false;
        }
      } break;
      case this.target.student:{
        if (!(query.u && query.in && query.c)) return false;
        try {
            let studclass = await Institute.findOne({
              '_id':ObjectId(query.in),
              'users.classes':{$elemMatch:{'_id':ObjectId(query.c)}}
            },{
              projection:{
                '_id':0,
                "uiid":1,
                'users.classes.$':1
              }
            });
            if(!studclass) return false;
            let student;
            let found = studclass.users.classes[0].students.some((stud)=>{
              if(String(stud._id) == String(query.u)){
                student = stud
                return true
              }
            });
            if(!found){
              studclass = await Institute.findOne({
                '_id':ObjectId(query.in),
                'pseudousers.classes':{$elemMatch:{'classname':studclass.users.classes[0].classname}}
              },{
                projection:{
                  '_id':0,
                  "uiid":1,
                  'users.classes.$':1
                }
              });
              found = studclass.users.classes[0].students.some((stud)=>{
                if(String(stud._id) == String(query.u)){
                  student = stud
                  return true
                }
              });
              if(!found) return false;
              if(!this.isValidTime(student.rlinkexp)) return {user:{expired:true}};
              return {user:share.getPseudoStudentShareData(student),uiid:studclass.uiid,classname:studclass.users.classes[0].classname};
            }
            if(!this.isValidTime(student.rlinkexp)) return {user:{expired:true}};
            return {user:share.getStudentShareData(student),uiid:studclass.uiid,classname:studclass.users.classes[0].classname};
        }catch{
          return false;
        }
      }
    }
  };
}  

/**
 * For target groups in different methods of verification purposes.
 */
class Target {
  constructor() {
    this.admin = "admin";
    this.teacher = "teacher";
    this.student = "student";
  }
}

module.exports = new PasswordReset();
const clog =(m)=>console.log(m);