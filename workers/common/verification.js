const {code,client,clog} = require("../../public/script/codes"),
  time = require("./timer"),
  share = require("./sharedata"),
  cpass = require("../../config/config.json").db.cpass,
  { ObjectId } = require("mongodb"),
  Institute = require("../../config/db").getInstitute(cpass),
  Admin = require("../../config/db").getAdmin(cpass);

/**
 * For user account verification purposes, including and limited to:
 * Administrator: in a seperate collection, individual documents.
 * Teachers & Students: in their own institution's document.
 */
class Verification {
  constructor() {
    this.type = "verification";
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
  async generateLink (target, data = {}, validity = this.defaultValidity){
    const exp = time.getTheMomentMinute(validity);
    let link = String();
    let to;
    let username;
    switch (target) {
      case client.admin:{
          const admin = await Admin.findOneAndUpdate(
            { _id: ObjectId(data.uid) },{
              $set: {
                vlinkexp: exp,
              },
            },{
              returnOriginal:false
            }
          );
          if(!admin.value) return false;
          username = admin.value.username;
          to = admin.value.email;
          link = `${this.domain}/${target}/external?type=${this.type}&u=${data.uid}&exp=${exp}`;
      }break;
      case client.teacher:{
        const teacherdoc = await Institute.findOneAndUpdate({_id:ObjectId(data.instID),"users.teachers":{$elemMatch:{"_id":ObjectId(data.uid)}}},{
          $set:{
            "users.teachers.$.vlinkexp":exp
          }
        },{
          returnOriginal:false
        });
        if(!teacherdoc.value){
          const pseudodoc = await Institute.findOneAndUpdate({_id:ObjectId(data.instID),"pseudousers.teachers":{$elemMatch:{"_id":ObjectId(data.uid)}}},{
            $set:{
              "pseudousers.teachers.$.vlinkexp":exp
            }
          },{
            returnOriginal:false
          });
          if(!pseudodoc.value) return false;
          const teacher = pseudodoc.value.pseudousers.teachers.find((teacher)=>String(teacher._id)==String(data.uid));
          to = teacher.teacherID;
          username = teacher.username;
        } else{
          const teacher = teacherdoc.value.users.teachers.find((teacher)=>String(teacher._id)==String(data.uid));
          to = teacher.teacherID;
          username = teacher.username;
        }
        link = `${this.domain}/${target}/external?type=${this.type}&in=${data.instID}&u=${data.uid}&exp=${exp}`;
      }break;
      case client.student:{
        const studentdoc = await Institute.findOneAndUpdate({_id:ObjectId(data.instID),"users.students":{$elemMatch:{"_id":ObjectId(data.uid)}}},{
          $set:{
            "users.students.$.vlinkexp":exp
          }
        },{
          returnOriginal:false
        });
        let student;
        if(!studentdoc.value){
          const pseudodoc = await Institute.findOneAndUpdate({_id:ObjectId(data.instID),"pseudousers.students":{$elemMatch:{"_id":ObjectId(data.uid)}}},{
            $set:{
              "pseudousers.students.$.vlinkexp":exp
            }
          },{
            returnOriginal:false
          });
          if(!pseudodoc.value) return false;
          student = pseudodoc.value.pseudousers.students.find((stud)=>String(stud._id)==String(data.uid));
        } else{
          student = studentdoc.value.users.students.find((stud)=>String(stud._id)==String(data.uid));
        }
        to = student.studentID;
        username = student.username;
        link = `${this.domain}/${target}/external?type=${this.type}&in=${data.instID}&u=${data.uid}&exp=${exp}`;
      }break;
    }
    return {
      exp: exp,
      link: link,
      to:to,
      username:username
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
      case client.admin:
        {
          if (!(query.u&&query.exp)) return false;
          try {
            const admin = await Admin.findOne({ _id: ObjectId(query.u) });
            if (!admin || !admin.vlinkexp|| String(admin.vlinkexp)!=String(query.exp)) return false;
            if (!this.isValidTime(admin.vlinkexp))
              return { user: { expired: true } };
            const doc = await Admin.findOneAndUpdate(
              { _id: ObjectId(query.u) },
              { $set: { verified: true }, $unset: { vlinkexp: null } },
              { returnOriginal: false }
            );

            if (!doc.value) return false;
            return { user: share.getAdminShareData(doc.value) };
          } catch (e) {
            clog(e);
            return false;
          }
        }
        break;
      case client.teacher:{
          if (!(query.u && query.in && query.exp)) return false;
          try {
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
              if(!teacher || !teacher.vlinkexp || String(teacher.vlinkexp)!=String(query.exp)) return false;
              if (!this.isValidTime(teacher.vlinkexp)) return { user: { expired: true } };
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
              if (!doc.value) return false;
              teacherdoc = await Institute.findOne({
                  _id: ObjectId(query.in),
                  "pseudousers.teachers": { $elemMatch: { _id: ObjectId(query.u) } },
              },{
                projection: {
                  "pseudousers.teachers.$": 1,
                },
              });
              return teacherdoc?{ user: share.getPseudoTeacherShareData(teacherdoc.pseudousers.teachers[0]) }:false;
            };
            const teacher = teacherdoc.users.teachers[0];
            if (!teacher || !teacher.vlinkexp || String(teacher.vlinkexp)!=String(query.exp)) return false;

            if (!this.isValidTime(teacher.vlinkexp))
              return { user: { expired: true } };
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
            if (!doc.value) return false;
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
            return teacherdoc?{ user: share.getTeacherShareData(teacherdoc.users.teachers[0])}:false;
          } catch (e) {
            clog(e);
            return false;
          }
        }
        break;
      case client.student: {
        if (!(query.u && query.in && query.exp)) return false;
        try {

          let studentdoc = await Institute.findOne(
            {
              _id: ObjectId(query.in),
              "users.students": { $elemMatch: { _id: ObjectId(query.u) } },
            },
            {
              projection: {
                _id: 0,
                "users.students.$": 1,
              },
            }
          );
          if (!studentdoc){ //check if pseudo user
            let pseudodoc = await Institute.findOne(
              {
                _id: ObjectId(query.in),
                "pseudousers.students": { $elemMatch: { _id: ObjectId(query.u) } },
              },
              {
                projection: {
                  _id: 0,
                  "pseudousers.students.$": 1,
                },
              }
            );
            if(!pseudodoc) return false;
            let student = pseudodoc.pseudousers.students[0];
            if(!student || !student.vlinkexp || String(student.vlinkexp)!=String(query.exp)) return false;
            if (!this.isValidTime(student.vlinkexp)) return { user: { expired: true } };
            const doc = await Institute.findOneAndUpdate(
              {
                _id: ObjectId(query.in),
                "pseudousers.students": { $elemMatch: { _id: ObjectId(query.u) } },
              },
              {
                $set: {
                  "pseudousers.students.$.verified": true,
                },
                $unset: {
                  "pseudousers.students.$.vlinkexp": null,
                },
              }
            );
            if (!doc.value) return false;
            studentdoc = await Institute.findOne({
                _id: ObjectId(query.in),
                "pseudousers.students": { $elemMatch: { _id: ObjectId(query.u) } },
            },{
              projection: {
                "pseudousers.students.$": 1,
              },
            });
            return studentdoc?{ user: share.getPseudoStudentShareData(studentdoc.pseudousers.students[0]) }:false;
          };
          const student = studentdoc.users.students[0];
          if (!student || !student.vlinkexp || String(student.vlinkexp)!=String(query.exp)) return false;

          if (!this.isValidTime(student.vlinkexp))
            return { user: { expired: true } };
          const doc = await Institute.findOneAndUpdate(
            {
              _id: ObjectId(query.in),
              "users.students": { $elemMatch: { _id: ObjectId(query.u) } },
            },
            {
              $set: {
                "users.students.$.verified": true,
              },
              $unset: {
                "users.students.$.vlinkexp": null,
              },
            }
          );
          if (!doc.value) return false;
          studentdoc = await Institute.findOne(
            {
              _id: ObjectId(query.in),
              "users.students": { $elemMatch: { _id: ObjectId(query.u) } },
            },
            {
              projection: {
                "users.students.$": 1,
              },
            }
          );
          return studentdoc?{ user: share.getStudentShareData(studentdoc.users.students[0])}:false;
        } catch(e) {
          clog(e)
          return false;
        }
      }
    }
  };
}

module.exports = new Verification();
