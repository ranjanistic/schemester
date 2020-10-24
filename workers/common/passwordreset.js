const { code, client, clog } = require("../../public/script/codes"),
  time = require("./timer"),
  share = require("./sharedata"),
  { ObjectId } = require("mongodb"),
  Institute = require("../../config/db").getInstitute(),
  Admin = require("../../config/db").getAdmin();

class PasswordReset {
  constructor() {
    this.type = "resetpassword";
    this.domain = code.domain;
    this.defaultValidity = 15; //min
  }
  generateLink = async (target, data = {}, validity = this.defaultValidity) => {
    const exp = time.getTheMomentMinute(validity);
    let link = String();
    let to;
    let username;
    switch (target) {
      case client.admin:
        {
          const admin = await Admin.findOneAndUpdate(
            { _id: ObjectId(data.uid) },
            {
              $set: {
                rlinkexp: exp,
              },
            },
            {
              returnOriginal: false,
            }
          );
          if (!admin.value) return false;
          username = admin.value.username;
          to = admin.value.email;
          link = `${this.domain}/${target}/external?type=${this.type}&u=${data.uid}&exp=${exp}`;
        }
        break;
      case client.teacher:
        {
          const teacherdoc = await Institute.findOneAndUpdate(
            {
              _id: ObjectId(data.instID),
              "users.teachers": { $elemMatch: { _id: ObjectId(data.uid) } },
            },
            {
              $set: {
                "users.teachers.$.rlinkexp": exp,
              },
            },
            {
              returnOriginal: false,
            }
          );
          if (!teacherdoc.value) {
            const pseudodoc = await Institute.findOneAndUpdate(
              {
                _id: ObjectId(data.instID),
                "pseudousers.teachers": {
                  $elemMatch: { _id: ObjectId(data.uid) },
                },
              },
              {
                $set: { "pseudousers.teachers.$.rlinkexp": exp },
              },
              { returnOriginal: false }
            );
            if (!pseudodoc.value) return false;
            const teacher = pseudodoc.value.pseudousers.teachers.find(
              (teacher) => String(teacher._id) == String(data.uid)
            );
            to = teacher.teacherID;
            username = teacher.username;
          } else {
            const teacher = teacherdoc.value.users.teachers.find(
              (teacher) => String(teacher._id) == String(data.uid)
            );
            to = teacher.teacherID;
            username = teacher.username;
          }
          link = `${this.domain}/${target}/external?type=${this.type}&in=${data.instID}&u=${data.uid}&exp=${exp}`;
        }
        break;
      case client.student:
        {
          const studentdoc = await Institute.findOneAndUpdate(
            {
              _id: ObjectId(data.instID),
              "users.students": { $elemMatch: { _id: ObjectId(data.uid) } },
            },
            {
              $set: {
                "users.students.$.rlinkexp": exp,
              },
            },
            {
              returnOriginal: false,
            }
          );
          let student;
          if (!studentdoc.value) {
            const pseudodoc = await Institute.findOneAndUpdate(
              {
                _id: ObjectId(data.instID),
                "pseudousers.students": {
                  $elemMatch: { _id: ObjectId(data.uid) },
                },
              },
              {
                $set: { "pseudousers.students.$.rlinkexp": exp },
              },
              { returnOriginal: false }
            );
            if (!pseudodoc.value) return false;
            student = pseudodoc.value.pseudousers.students.find(
              (stud) => String(stud._id) == String(data.uid)
            );
          } else {
            student = studentdoc.value.users.students.find(
              (stud) => String(stud._id) == String(data.uid)
            );
          }
          to = student.studentID;
          username = student.username;
          link = `${this.domain}/${target}/external?type=${this.type}&in=${data.instID}&u=${data.uid}&exp=${exp}`;
        }
        break;
    }
    return {
      exp: exp,
      link: link,
      to: to,
      username: username,
    };
  };
  /**
   * If given time parameter is still greater than the current time, in SGT notation.
   * @param expiryTime The time to be checked valid in SGT notation.
   * @returns A boolean value, if valid, true, otherwise false.
   */
  isValidTime = (expiryTime) => time.getTheMomentMinute() < Number(expiryTime);

  handlePasswordResetLink = async (query, clientType) => {
    switch (clientType) {
      case client.admin:
        {
          if (!query.u && !query.exp) return false;
          try {
            const admin = await Admin.findOne({ _id: ObjectId(query.u) });
            if (
              !admin ||
              !admin.rlinkexp ||
              String(admin.rlinkexp) != String(query.exp)
            )
              return false;
            if (!this.isValidTime(admin.rlinkexp)) {
              const doc = await Admin.findOneAndUpdate(
                { _id: ObjectId(query.u) },
                { $unset: { rlinkexp: null } }
              );
              return { user: { expired: true } };
            }
            return { user: share.getAdminShareData(admin) };
          } catch (e) {
            return false;
          }
        }
        break;
      case client.teacher:
        {
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
                  uiid: 1,
                  "users.teachers.$": 1,
                },
              }
            );
            if (!teacherdoc) {
              const pseudodoc = await Institute.findOne(
                {
                  _id: ObjectId(query.in),
                  "pseudousers.teachers": {
                    $elemMatch: { _id: ObjectId(query.u) },
                  },
                },
                {
                  projection: {
                    _id: 0,
                    uiid: 1,
                    "pseudousers.teachers.$": 1,
                  },
                }
              );
              if (!pseudodoc) return false;
              let teacher = pseudodoc.pseudousers.teachers[0];
              if (
                !teacher ||
                !teacher.rlinkexp ||
                String(teacher.rlinkexp) != String(query.exp)
              )
                return false;
              if (!this.isValidTime(teacher.rlinkexp))
                return { user: { expired: true } };
              return {
                user: share.getPseudoTeacherShareData(teacher),
                uiid: pseudodoc.uiid,
              };
            }
            const teacher = teacherdoc.users.teachers[0];
            if (
              !teacher ||
              !teacher.rlinkexp ||
              String(teacher.rlinkexp) != String(query.exp)
            )
              return false;
            if (!this.isValidTime(teacher.rlinkexp))
              return { user: { expired: true } };
            return {
              user: share.getTeacherShareData(teacher),
              uiid: teacherdoc.uiid,
            };
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
                uiid: 1,
                "users.students.$": 1,
              },
            }
          );
          if (!studentdoc) {
            const pseudodoc = await Institute.findOne(
              {
                _id: ObjectId(query.in),
                "pseudousers.students": {
                  $elemMatch: { _id: ObjectId(query.u) },
                },
              },
              {
                projection: {
                  _id: 0,
                  uiid: 1,
                  "pseudousers.students.$": 1,
                },
              }
            );
            if (!pseudodoc) return false;
            let student = pseudodoc.pseudousers.students[0];
            if (
              !student ||
              !student.rlinkexp ||
              String(student.rlinkexp) != String(query.exp)
            )
              return false;
            if (!this.isValidTime(student.rlinkexp))
              return { user: { expired: true } };
            return {
              user: share.getPseudoStudentShareData(student),
              uiid: pseudodoc.uiid,
            };
          }
          const student = studentdoc.users.students[0];
          if (
            !student ||
            !student.rlinkexp ||
            String(student.rlinkexp) != String(query.exp)
          )
            return false;
          if (!this.isValidTime(student.rlinkexp))
            return { user: { expired: true } };
          return {
            user: share.getStudentShareData(student),
            uiid: studentdoc.uiid,
          };
        } catch (e) {
          clog(e);
          return false;
        }
      }
    }
  };
}

module.exports = new PasswordReset();
