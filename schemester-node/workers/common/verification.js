const code = require("../../public/script/codes"),
  time = require("./timer"),
  share = require("./sharedata"),
  { ObjectId } = require("mongodb"),
  Institute = require("../../collections/Institutions"),
  Admin = require("../../collections/Admins");

/**
 * For user account verification purposes, including and limited to:
 * Administrator: in a seperate collection, individual documents.
 * Teachers & Students: in their own institution's document.
 */
class Verification {
  constructor() {
    this.type = "verification";
    this.target = new Target();
    this.domain = "http://localhost:3000";
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
      case this.target.admin:
        {
          const admin = await Admin.findOneAndUpdate(
            { _id: ObjectId(data.uid) },
            {
              $set: {
                vlinkexp: exp,
              },
            }
          );
          if(!admin) return false;
          link = `${this.domain}/${target}/external?type=${this.type}&u=${data.uid}`;
        }
        break;
      default: {
        //same pattern for teacher & student
        link = `${this.domain}/${target}/external?type=${this.type}&in=${data.instID}&u=${data.uid}`;
      }
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
      case this.target.teacher:
        {
          if (!(query.u && query.in)) return false;
          try {
            let teacherinst = await Institute.findOne(
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
            if (!teacherinst) return false;

            let teacher = teacherinst.users.teachers[0];
            if (!teacher || !teacher.vlinkexp) return false;

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
            if (!doc) return false;
            teacherinst = await Institute.findOne(
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
            if (!teacherinst) return false;
            teacher = share.getTeacherShareData(teacherinst.users.teachers[0]);
            return { user: teacher };
          } catch (e) {
            clog(e);
            return false;
          }
        }
        break;
      case this.target.student: {
        if (!(query.u && query.in && query.cls)) return false;
        try {
          let studclass = await Institute.findOne(
            {
              _id: ObjectId(query.in),
              "users.classes": { $elemMatch: { _id: ObjectId(query.cls) } },
            },
            {
              $projection: {
                _id: 0,
                "users.classes.$": 1,
              },
            }
          );
          if (!studclass) return false;
          let thestudent;
          let found = studclass.users.classes[0].students.some((student, _) => {
            thestudent = student;
            return String(student._id) == String(query.u);
          });
          if (!found) return false;
          if (!this.isValidTime(thestudent.vlinkexp))
            return { user: { expired: true } };

          const doc = await Institute.findOneAndUpdate(
            {
              _id: ObjectId(query.in),
              "users.classes": { $elemMatch: { _id: ObjectId(query.cls) } },
            },
            {
              $set: {
                "users.classes.$[outer].students.$[outer1].verified": true,
              },
              $unset: {
                "users.classes.$[outer].students.$[outer1].vlinkexp": null,
              },
            },
            {
              arrayFilters: [
                { "outer._id": ObjectId(query.cls) },
                { "outer1._id": ObjectId(query.u) },
              ],
            }
          );
          if (!doc) return false;
          studclass = await Institute.findOne(
            {
              _id: ObjectId(query.in),
              "users.classes": { $elemMatch: { _id: ObjectId(query.u) } },
            },
            {
              projection: {
                "users.classes.$": 1,
              },
            }
          );
          if (!studclass) return false;
          found = studclass.users.classes[0].students.some((student, _) => {
            thestudent = share.getStudentShareData(student);
            return String(student._id) == String(query.u);
          });
          return found ? { user: thestudent } : false;
        } catch {
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
