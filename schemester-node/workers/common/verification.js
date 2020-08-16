const code = require("../../public/script/codes"),
  time = require("./timer"),
  { ObjectId } = require("mongodb"),
  Institute = require("../../collections/Institutions"),
  Admin = require("../../collections/Admins"),
  session  = require("./session");

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
  generateLink(target, data = {}, validity = this.defaultValidity) {
    const exp = time.getTheMomentMinute(validity);
    let link = String();
    switch (target) {
      case this.target.admin:
        {
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
  }

  /**
   * If given time parameter is still greater than the current time, in SGT notation.
   * @param expiryTime The time to be checked valid in SGT notation.
   * @returns A boolean value, if valid, true, otherwise false.
   */
  isValidTime(expiryTime) {
    expiryTime = Number(expiryTime);
    return time.getTheMomentMinute() < expiryTime;
  }

  /**
   * Checks if given response is valid for link validation.
   * @param {JSON} response This should contain a key 'event' with some link validity code value.
   * @returns A boolean value, if valid, true, otherwise false.
   * @note This method does NOT check if time is valid or not. For time validation purposes, see isValidTime() method of Verification class.
   */
  isValid(response) {
    return response.event == code.verify.LINK_VALID;
  }

  /**
   * Checks if given response is expired for link validation.
   * @param {JSON} response This should contain a key 'event' with some link validity code value.
   * @returns A boolean value, if expired, true, otherwise false.
   * @note This method does NOT check if time is expired or not. For time validation purposes, see isValidTime() method of Verification class.
   */
  isExpired(response) {
    return response.event == code.verify.LINK_EXPIRED;
  }

  /**
   * Checks if given response is invalid for link validation.
   * @param {JSON} response This should contain a key 'event' with some link validity code value.
   * @returns A boolean value, if invalid, true, otherwise false.
   * @note This method does NOT check if time is invalid or not. For time validation purposes, see isValidTime() method of Verification class.
   */
  isInvalid(response) {
    return response.event == code.verify.LINK_INVALID;
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
      case this.target.admin: {
        if (!query.u) return false;
        try {
          const admin = await Admin.findOne({ _id: ObjectId(query.u) });
          if (!admin || !admin.vlinkexp) return false;
          if (!this.isValidTime(admin.vlinkexp)) return { user: { expired: true } };
          const doc = await Admin.findOneAndUpdate(
            { _id: ObjectId(query.u) },
            { $set: { verified: true }, $unset: { vlinkexp: null } },
            { returnOriginal: false }
          );
          clog(doc);
          if (!doc) return false;
          return {user: getAdminShareData(doc.value)};
        } catch (e) {
          clog(e);
          return false;
        }
      }break;
      case this.target.teacher: {
        if (!(query.u && query.in)) return false;
        try {
          let teacherinst = await Institute.findOne(
            {
              "_id": ObjectId(query.in),
              "users.teachers": { $elemMatch: { "_id": ObjectId(query.u) } },
            },
            {
              projection: {
                "_id":0,
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
          teacher = getTeacherShareData(teacherinst.users.teachers[0]);
          return { user: teacher };
        } catch (e) {
          clog(e);
          return false;
        }
      }
    }
  };
}

/**
 * Returns peronal data of client type - admin, after extracting from passed admin user data from database, except confidential ones.
 * @param {JSON} data The data of an admin from database.
 * @returns {JSON} Filters confidential values from given data, and returns in shareable form.
 */
const getAdminShareData = (data = {}) => {
    return {
      isAdmin: true,
      [session.sessionUID]: data._id,
      username: data.username,
      [session.sessionID]: data.email,
      uiid: data.uiid,
      createdAt: data.createdAt,
      verified: data.verified,
      vlinkexp: data.vlinkexp,
    };
};

/**
 * Returns peronal data of client type - teacher, after extracting from passed teacher user data from database, except confidential ones.
 * @param {JSON} data The data of a teacher from database.
 * @returns {JSON} Filters confidential values from given personal data, and returns in shareable form.
 */
const getTeacherShareData = (data = {}) => {
    return {
      isTeacher: true,
      [session.sessionUID]: data._id,
      username: data.username,
      [session.sessionID]: data.teacherID,
      createdAt: data.createdAt,
      verified: data.verified,
    };
};

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
