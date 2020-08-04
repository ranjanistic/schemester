const code = require("../public/script/codes");
const { ObjectId } = require("mongodb");
const Institute = require("../collections/Institutions");
const Admin = require("../collections/Admins");
const session  = require("../workers/session");
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
  generateLink(target, data = {}, validity = this.defaultValidity) {
    const exp = getTheMoment(validity);
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
  isValidTime(expiryTime) {
    expiryTime = Number(expiryTime);
    return getTheMoment() < expiryTime;
  }
  isValid(response) {
    return response.event == code.verify.LINK_VALID;
  }
  isExpired(response) {
    return response.event == code.verify.LINK_EXPIRED;
  }
  isInvalid(response) {
    return response.event == code.verify.LINK_INVALID;
  }
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
          if (!doc) return res.render(view.notfound);
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
      }break;
    }
  };
}

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
 * Gets current date time in numeric format.
 * @param {Number} minuteIncrement The number of minutes incrementation in returned timing. (default=0)
 * @returns {Number} A number showing the current date in the pattern: YYYYMMDDHHMMssmmm
 */
const getTheMoment = (minuteIncrement = 0) => {
  let d = new Date();
  let year = d.getFullYear();
  let month = d.getMonth() + 1;
  let date = d.getDate();
  let hour = d.getHours();
  let min = d.getMinutes();
  let incrementMin = min + minuteIncrement;
  if (incrementMin > 59) {
    incrementMin = incrementMin - 60;
    if (24 < hour + 1) {
      //if next hour is next day
      date++;
      if (daysInMonth(month, year) < date) {
        date = date - daysInMonth(month, year);
        if (12 < month + 1) {
          month = 13 - month;
          year++;
        } else {
          month++;
        }
      }
    } else {
      hour++;
    }
  }
  month = month < 10 ? `0${month}` : month;
  date = date < 10 ? `0${date}` : date;
  hour = hour < 10 ? `0${hour}` : hour;
  incrementMin = incrementMin < 10 ? `0${incrementMin}` : incrementMin;

  let insts = d.getSeconds();
  let secs = insts < 10 ? `0${insts}` : insts;
  let instm = d.getMilliseconds();
  let milli = instm < 10 ? `00${instm}` : instm < 100 ? `0${instm}` : instm;
  return Number(
    String(year) +
      String(month) +
      String(date) +
      String(hour) +
      String(incrementMin) +
      String(secs) +
      String(milli)
  );
};
const daysInMonth = (month, year) => new Date(year, month, 0).getDate();

class Target {
  constructor() {
    this.admin = "admin";
    this.teacher = "teacher";
    this.student = "student";
  }
}
let clog = (msg) => console.log(msg);

module.exports = new Verification();
