const code = require("../../public/script/codes"),
  time = require("./timer"),
  share = require("./sharedata"),
  { ObjectId } = require("mongodb"),
  Institute = require("../../config/db").getInstitute(),
  Admin = require("../../config/db").getAdmin();

/**
 * For user account verification purposes, including and limited to:
 * Administrator: in a seperate collection, individual documents.
 * Teachers & Students: in their own institution's document.
 */
class Verification {
  constructor() {
    this.type = "verification";
    this.target = new Target();
    this.domain = code.domain;
    this.defaultValidity = 15; //min
  }

  /**
   * Generates a new verification link based on given parameters.
   * @param {String} target The target group for which verificaiton link is to be generated, can be passed from Verification().target.
   * @param {JSON} data The data to be attached with link, must be specific for specific targets.
   * @param {Number} validity Number of minutes this link will be valid for. Defaults to 15.
   * @returns {JSON} Returns expiry time according to SGT notation, and the generated link, as key value pairs
   *  of exp,link.
   */
  generateLink = async (target, data = {}, validity = this.defaultValidity) => {
    const exp = time.getTheMomentMinute(validity);
    let link = String();
    switch (target) {
      case this.target.admin:{
          const admin = await Admin.findOneAndUpdate(
            { _id: ObjectId(data.uid) },{
              $set: {
                vlinkexp: exp,
              },
            }
          );
          if(!admin) return false;
          link = `${this.domain}/${target}/external?type=${this.type}&u=${data.uid}`;
      }break;
      case this.target.teacher:{
        const teacherdoc = await Institute.findOneAndUpdate({_id:ObjectId(data.instID),"users.teachers":{$elemMatch:{"_id":ObjectId(data.uid)}}},{
          $set:{
            "users.teachers.$.vlinkexp":exp
          }
        });
        clog(teacherdoc);
        if(!teacherdoc.value){
          const pseudodoc = await Institute.findOneAndUpdate({_id:ObjectId(data.instID),"pseudousers.teachers":{$elemMatch:{"_id":ObjectId(data.uid)}}},{
            $set:{
              "pseudousers.teachers.$.vlinkexp":exp
            }
          });
          clog("pseduo");
          clog(pseudodoc);
          if(!pseudodoc.value) return false;
        }
        link = `${this.domain}/${target}/external?type=${this.type}&in=${data.instID}&u=${data.uid}`;
      }break;

      case this.target.student:{
        clog(data);
        const studdoc = await Institute.updateOne({
          _id:ObjectId(data.instID),
          "users.classes":{$elemMatch:{"_id":ObjectId(data.cid)}}
        },{
          $set:{
            "users.classes.$.students.$[outer].vlinkexp":exp
          }
        },{
          arrayFilters:[{"outer._id":ObjectId(data.uid)}]
        });
        clog("studd");
        clog(studdoc.result.nModified);
        if(!studdoc.result.nModified){
          const classdoc = await Institute.findOne({
            _id:ObjectId(data.instID),
            "users.classes":{$elemMatch:{"_id":ObjectId(data.cid)}}
          },{
            projection:{
              "users.classes.$.classname":1
            }
          });
          const pseudodoc = await Institute.updateOne({
            _id:ObjectId(data.instID),
            "pseudousers.classes":{$elemMatch:{"classname":classdoc.users.classes[0].classname}}
          },{
            $set:{
              "pseudousers.classes.$.students.$[outer1].vlinkexp":exp
            }
          },{
            arrayFilters:[{"outer1._id":ObjectId(data.uid)}]
          });
          clog("pseudo");
          clog(pseudodoc.result);
          if(!pseudodoc.result.nModified) return false;
        }
        link = `${this.domain}/${target}/external?type=${this.type}&in=${data.instID}&c=${data.cid}&u=${data.uid}`;
      }break;
    }
    return {
      exp: exp,
      link: link,
    };
  };

  /**
   * If given time parameter is still greater than the current time, in SGT notation.
   * @param expiryTime The time to be checked valid in SGT notation.
   * @returns A boolean value, if valid, true, otherwise false.
   */
  isValidTime(expiryTime) {
    return time.getTheMomentMinute() < Number(expiryTime);
  }

  /**
   * Handles the query of given verification link, and the target client to be verified.
   * @param {JSON} query The query of link (usually request.query of express GET method).
   * @param {String} clientType The target client to be checked for link validation, can be derived from Verfication().target.
   * @returns {Promise} If query and clientType are in accordance with each other, returns JSON object of user key, and if link is valid, verifies the given client,
   *  and returns additional data of given client.
   */
  handleVerification = async (query, clientType) => {
    switch (clientType) {
      case this.target.admin:
        {
          if (!query.u) return false;
          try {
            const admin = await Admin.findOne({ _id: ObjectId(query.u) });
            if (!admin || !admin.vlinkexp) return false;
            if (!this.isValidTime(admin.vlinkexp))
              return { user: { expired: true } };
            const doc = await Admin.findOneAndUpdate(
              { _id: ObjectId(query.u) },
              { $set: { verified: true }, $unset: { vlinkexp: null } },
              { returnOriginal: false }
            );
            clog(doc);
            if (!doc) return false;
            return { user: share.getAdminShareData(doc.value) };
          } catch (e) {
            clog(e);
            return false;
          }
        }
        break;
      case this.target.teacher:{
          if (!(query.u && query.in)) return false;
          try {
            clog("in teacher vtry");
            let teacherdoc = await Institute.findOne(
              {
                _id: ObjectId(query.in),
                "users.teachers": { $elemMatch: { _id: ObjectId(query.u) } },
              },
              {
                projection: {
                  _id: 0,
                  "users.teachers.$": 1,
                },
              }
            );
            if (!teacherdoc){ //check if pseudo user
              let pseudodoc = await Institute.findOne(
                {
                  _id: ObjectId(query.in),
                  "pseudousers.teachers": { $elemMatch: { _id: ObjectId(query.u) } },
                },
                {
                  projection: {
                    _id: 0,
                    "pseudousers.teachers.$": 1,
                  },
                }
              );
              if(!pseudodoc) return false;
              let teacher = pseudodoc.pseudousers.teachers[0];
              if(!teacher || !teacher.vlinkexp) return false;
              if (!this.isValidTime(teacher.vlinkexp)) return { user: { expired: true } };
              clog("valid tiime");
              const doc = await Institute.findOneAndUpdate(
                {
                  _id: ObjectId(query.in),
                  "pseudousers.teachers": { $elemMatch: { _id: ObjectId(query.u) } },
                },
                {
                  $set: {
                    "pseudousers.teachers.$.verified": true,
                  },
                  $unset: {
                    "pseudousers.teachers.$.vlinkexp": null,
                  },
                }
              );
              if (!doc) return false;
              teacherdoc = await Institute.findOne({
                  _id: ObjectId(query.in),
                  "pseudousers.teachers": { $elemMatch: { _id: ObjectId(query.u) } },
              },{
                projection: {
                  "pseudousers.teachers.$": 1,
                },
              });
              if (!teacherdoc) return false;
              return { user: share.getPseudoTeacherShareData(teacherdoc.pseudousers.teachers[0]) };
            };
            const teacher = teacherdoc.users.teachers[0];
            if (!teacher || !teacher.vlinkexp) return false;
            clog("found vlinkexp");
            if (!this.isValidTime(teacher.vlinkexp))
              return { user: { expired: true } };
              clog("valid tiime");
            const doc = await Institute.findOneAndUpdate(
              {
                _id: ObjectId(query.in),
                "users.teachers": { $elemMatch: { _id: ObjectId(query.u) } },
              },
              {
                $set: {
                  "users.teachers.$.verified": true,
                },
                $unset: {
                  "users.teachers.$.vlinkexp": null,
                },
              }
            );
            if (!doc) return false;
            teacherdoc = await Institute.findOne(
              {
                _id: ObjectId(query.in),
                "users.teachers": { $elemMatch: { _id: ObjectId(query.u) } },
              },
              {
                projection: {
                  "users.teachers.$": 1,
                },
              }
            );
            if (!teacherdoc) return false;
            return { user: share.getTeacherShareData(teacherdoc.users.teachers[0]) };
          } catch (e) {
            clog(e);
            return false;
          }
        }
        break;
      case this.target.student: {
        if (!(query.u && query.in && query.c)) return false;
        clog("link honest");
        try {
          let classdoc = await Institute.findOne({
              _id: ObjectId(query.in),
              "users.classes": { $elemMatch: { _id: ObjectId(query.c) } },
          },{
            projection: {
              _id: 0,
              "users.classes.$": 1,
            },
          });
          clog(classdoc);
          if (!classdoc) return false;
          let student;
          let found = classdoc.users.classes[0].students.some((stud) => {
            if(String(stud._id) == String(query.u)){
              student = stud;
              return true;
            }
          });
          if (!found){  //pseudo
            let pclassdoc = await Institute.findOne({
                _id: ObjectId(query.in),
                "pseudousers.classes": { $elemMatch: { classname: classdoc.users.classes[0].classname } },
            },{
              projection: {
                _id: 0,
                "pseudousers.classes.$": 1,
              },
            });
            clog(pclassdoc);
            if (!pclassdoc) return false;
            let found = pclassdoc.pseudousers.classes[0].students.some((stud) => {
              if(String(stud._id) == String(query.u)){
                student = stud;
                return true;
              }
            });
            clog(found)
            if(!found) return false;
            if (!this.isValidTime(student.vlinkexp)) return { user: { expired: true } };
            clog("valid time");
            const doc = await Institute.updateOne({
              _id: ObjectId(query.in),
              "pseudousers.classes": { $elemMatch: { classname: pclassdoc.pseudousers.classes[0].classname } },
            },{
              $set: {
                "pseudousers.classes.$.students.$[outer1].verified": true,
              },
              $unset: {
                "pseudousers.classes.$.students.$[outer1].vlinkexp": null,
              },
            },{
              arrayFilters: [{ "outer1._id": ObjectId(query.u) }],
            });
            clog(doc.result.nModified);
            if (!doc.result.nModified) return false;
            pclassdoc = await Institute.findOne({
              _id: ObjectId(query.in),
              "pseudousers.classes": { $elemMatch: { classname: pclassdoc.pseudousers.classes[0].classname } },
            },{
              projection: {
                "pseudousers.classes.$": 1,
              },
            });
            clog(pclassdoc);
            if (!pclassdoc) return false;
            found = pclassdoc.pseudousers.classes[0].students.some((stud) => {
              if(String(stud._id) == String(query.u)){
                student = share.getPseudoStudentShareData(stud);
                return true;
              }
            });
            clog(found);
            return found ? { user: student } : false;
          }
          if (!this.isValidTime(student.vlinkexp))
            return { user: { expired: true } };

          const doc = await Institute.updateOne({
              _id: ObjectId(query.in),
              "users.classes": { $elemMatch: { _id: ObjectId(query.c) } },
          },{
            $set: {
              "users.classes.$.students.$[outer1].verified": true,
            },
            $unset: {
              "users.classes.$.students.$[outer1].vlinkexp": null,
            },
          },{
            arrayFilters: [{ "outer1._id": ObjectId(query.u) }],
          });
          if (!doc.result.nModified) return false;
          classdoc = await Institute.findOne({
              _id: ObjectId(query.in),
              "users.classes": { $elemMatch: { _id: ObjectId(query.c) } },
            },
            {
              projection: {
                "users.classes.$": 1,
              },
            }
          );
          if (!classdoc) return false;
          found = classdoc.users.classes[0].students.some((stud) => {
            if(String(stud._id) == String(query.u)){
              student = share.getStudentShareData(stud);
              return true;
            }
          });
          return found ? { user: student } : false;
        } catch {
          clog("catched");
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

let clog = (msg) => console.log(msg);

module.exports = new Verification();
