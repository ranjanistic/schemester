const {key} = require("../../public/script/codes");
class ShareData {
  constructor() {
    this.uid = key.uid;
    this.id = key.id;
  }

  /**
   * Returns peronal data of client type - admin, after extracting from passed admin user data from database, except confidential ones.
   * @param {JSON} data The data of an admin from database.
   * @returns {JSON} Filters confidential values from given data, and returns in shareable form.
   */
  getAdminShareData(data = {},uiid) {
    return data?{
      isAdmin: true,
      [this.uid]: data._id,
      username: data.username,
      [this.id]: data.email,
      uiid: uiid?uiid:data.uiid,
      createdAt: data.createdAt,
      verified: data.verified,
      vlinkexp: data.vlinkexp,
      prefs:data.prefs
    }:null;
  }

  /**
   * Returns peronal data of client type - teacher, after extracting from passed teacher user data from database, except confidential ones.
   * @param {JSON} data The data of a teacher from database.
   * @returns {JSON} Filters confidential values from given personal data, and returns in shareable form.
   */
  getTeacherShareData(data = {},uiid = null) {
    return data?{
      isTeacher: true,
      uiid:uiid,
      [this.uid]: data._id,
      username: data.username,
      [this.id]: data.teacherID,
      createdAt: data.createdAt,
      verified: data.verified,
    }:null;
  }
  getPseudoTeacherShareData(data = {},uiid = null) {
    return data?{
      isTeacher: true,
      pseudo:true,
      uiid:uiid,
      [this.uid]: data._id,
      username: data.username,
      [this.id]: data.teacherID,
      createdAt: data.createdAt,
      verified: data.verified,
    }:null;
  }

  /**
   * Returns peronal data of client type - student, after extracting from passed student user data from database, except confidential ones.
   * @param {JSON} data The data of a student from database.
   * @returns {JSON} Filters confidential values from given personal data, and returns in shareable form.
   */
  getStudentShareData(data = {},uiid = null) {
    return data?{
      isStudent: true,
      uiid:uiid,
      [this.uid]: data._id,
      username: data.username,
      [this.id]: data.studentID,
      createdAt: data.createdAt,
      verified: data.verified,
    }:null;
  }
  getPseudoStudentShareData(data = {},uiid = null) {
    return data?{
      isStudent: true,
      pseudo:true,
      uiid:uiid,
      [this.uid]: data._id,
      username: data.username,
      [this.id]: data.studentID,
      createdAt: data.createdAt,
      verified: data.verified,
    }:null;
  }
}

module.exports = new ShareData();