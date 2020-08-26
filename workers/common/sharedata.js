class ShareData {
  constructor() {
    this.uid = 'uid';
    this.id = 'id';
  }

  /**
   * Returns peronal data of client type - admin, after extracting from passed admin user data from database, except confidential ones.
   * @param {JSON} data The data of an admin from database.
   * @returns {JSON} Filters confidential values from given data, and returns in shareable form.
   */
  getAdminShareData(data = {}) {
    return {
      isAdmin: true,
      [this.uid]: data._id,
      username: data.username,
      [this.id]: data.email,
      uiid: data.uiid,
      createdAt: data.createdAt,
      verified: data.verified,
      vlinkexp: data.vlinkexp,
      prefs:data.prefs
    };
  }

  /**
   * Returns peronal data of client type - teacher, after extracting from passed teacher user data from database, except confidential ones.
   * @param {JSON} data The data of a teacher from database.
   * @returns {JSON} Filters confidential values from given personal data, and returns in shareable form.
   */
  getTeacherShareData(data = {}) {
    return {
      isTeacher: true,
      [this.uid]: data._id,
      username: data.username,
      [this.id]: data.teacherID,
      createdAt: data.createdAt,
      verified: data.verified,
    };
  }
  getPseudoTeacherShareData(data = {}) {
    return {
      isTeacher: true,
      pseudo:true,
      [this.uid]: data._id,
      username: data.username,
      [this.id]: data.teacherID,
      createdAt: data.createdAt,
      verified: data.verified,
    };
  }

  /**
   * Returns peronal data of client type - student, after extracting from passed student user data from database, except confidential ones.
   * @param {JSON} data The data of a student from database.
   * @returns {JSON} Filters confidential values from given personal data, and returns in shareable form.
   */
  getStudentShareData(data = {}) {
    return {
      isStudent: true,
      [this.uid]: data._id,
      username: data.username,
      [this.id]: data.studentID,
      createdAt: data.createdAt,
      verified: data.verified,
    };
  }
  getPseudoStudentShareData(data = {}) {
    return {
      isStudent: true,
      [this.uid]: data._id,
      username: data.username,
      [this.id]: data.studentID,
      createdAt: data.createdAt,
      verified: data.verified,
    };
  }
}

module.exports = new ShareData();