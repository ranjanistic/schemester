const { appname, email,site } = require("../../config/config.json");
const {key,code, client} = require("../../public/script/codes");

const { token } = require("./inspector");

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
      twofactor:data.twofactor,
      vlinkexp: data.vlinkexp,
      prefs:data.prefs,
      oauth:data.oauth,
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

  getHeadingByMailtype(type){
    switch(type){
      case code.mail.ACCOUNT_VERIFICATION: return "Verification";
      case code.mail.RESET_PASSWORD: return "Password";
      case code.mail.TWO_FACTOR_AUTH: return "2FA";
      case code.mail.INSTITUTION_INVITATION: return "Invitation";
      case code.mail.EMAIL_CHANGED:;
      case code.mail.ACCOUNT_DELETED:;
      case code.mail.PASSWORD_CHANGED:return "Account";
      default: return appname;
    }
  }

  getTitleByMailType(type,data = {}){
    switch(type){
      case code.mail.ACCOUNT_VERIFICATION: return `${appname} Account ${this.getHeadingByMailtype(type)}`;
      case code.mail.RESET_PASSWORD: return `${appname} ${this.getHeadingByMailtype(type)} Reset`;
      case code.mail.INSTITUTION_INVITATION: return `${data.institute} ${data.invitee} ${this.getHeadingByMailtype(type)} · ${appname}`;
      case code.mail.EMAIL_CHANGED: return `${appname} Email Alert`;
      case code.mail.TWO_FACTOR_AUTH: return `${appname} 2FA Code`;
      case code.mail.PASSWORD_CHANGED:return `${appname} Password Alert`;
      case code.mail.ACCOUNT_DELETED:return `${appname} Account Alert`;
      default: return this.getHeadingByMailtype();
    }
  }

  getGreet(type,username){
    return username?`Hey ${username}!`:"Hello";
  }

  getStartTextByMailType(type,data = {}){
    switch(type){
      case code.mail.ACCOUNT_VERIFICATION: return `If you expected this email, then click the following button to verify your account (${data.to}) on ${appname}, and after that you'll be able to continue further.`;
      case code.mail.RESET_PASSWORD: return `If you expected this email, then click the following button to reset your password of ${data.to} account on ${appname}.`;
      case code.mail.TWO_FACTOR_AUTH: return `If you expected this email, then following is the 2FA code of your ${data.to} account on ${appname}.`;
      case code.mail.INSTITUTION_INVITATION: return `You have been invited to join ${data.institute} on ${appname}, as ${data.invitee}. You can get further details by clicking the button below.`;
      case code.mail.EMAIL_CHANGED: return `This is to inform you that your ${appname} ${data.client} account email address has been moved to ${data.newmail}. If you do not recognise this act, then login using the new email address and change it back.`;
      case code.mail.PASSWORD_CHANGED: return `This is to inform you that your ${appname} ${data.client} account password has been changed. If you do not recognise this act, then do reset your password again.`;
      case code.mail.ACCOUNT_DELETED: return `This is to inform you that your ${appname} ${data.client} account has been deleted.`;
    }
  }

  getActionByMailType(type,data){
    return [{
      text:this.getActionTextByMailType(type,data),
      link:data.link
    }];
  }

  getActionTextByMailType(type,data={}){
    switch(type){
      case code.mail.ACCOUNT_VERIFICATION: return `Verify Account`;
      case code.mail.RESET_PASSWORD: return `Reset Password`;
      case code.mail.INSTITUTION_INVITATION: return `See invitation`;
      case code.mail.TWO_FACTOR_AUTH:return data.code;
      default: return "Proceed";
    }
  }

  getNoteByMailType(type,data = {}){
    switch(type){
      case code.mail.ACCOUNT_VERIFICATION: return `The link will expire soon.`;
      case code.mail.RESET_PASSWORD: return `The link will expire soon.`;
      case code.mail.INSTITUTION_INVITATION: return `This link can expire anytime.`;
      case code.mail.EMAIL_CHANGED: return `Ignore if you already know this.`;
      case code.mail.PASSWORD_CHANGED: return `Ignore if you already know this.`;
      case code.mail.TWO_FACTOR_AUTH: return `Do not share this code with anyone, even if they say they're from ${appname}.`;
      case code.mail.ACCOUNT_DELETED: return `Good Bye.`;
    }
  }

  getEndTextByMailType(type,data = {}){
    switch(type){
      case code.mail.ACCOUNT_VERIFICATION: return `If you do not recognize this email, then do not click any of the above links, as someone else must be trying to use your email address to gain access to ${appname}.`;
      case code.mail.RESET_PASSWORD: return `If you do not recognize this email, then you don't need to bother about this, as someone else must be trying to gain access to your ${appname} account.`;
      case code.mail.TWO_FACTOR_AUTH: return `If you do not recognize this email, then your password has been compromised. However, your account is still safe. Please immediately change your password, as someone else is trying to gain access to your ${appname} account.`;
      case code.mail.INSTITUTION_INVITATION: return `You can ignore this email if this doesn't seem to be familiar.`;
    }
  }

  getAlertMailData(alert,info= {receiver,client,title,heading,note,rednote,text,greet}){
    return {
      greeting:info.greet||this.getGreet(alert),
      for:info.receiver,
      client:info.client,
      title: info.title||this.getTitleByMailType(alert),
      heading:info.heading||this.getHeadingByMailtype(alert),
      note:info.note||this.getNoteByMailType(alert),
      rednote:info.rednote,
      text:info.text||this.getStartTextByMailType(alert),
      website:site,
      replyto:token.verify(email)
    }
  }

  getActionMailData(action,info = {receiver,actions,title,heading,note,rednote,starttext,endtext,greet}){
    return {
      greeting:info.greet||this.getGreet(action),
      for:info.receiver,
      actions:info.actions,
      title: info.title||this.getTitleByMailType(action),
      heading:info.heading||this.getHeadingByMailtype(action),
      note:info.note||this.getNoteByMailType(action),
      rednote:info.rednote,
      starttext:info.starttext||this.getStartTextByMailType(action),
      endtext:info.endtext||this.getEndTextByMailType(action),
      website:site,
      replyto:token.verify(email)
    }
  }
}

module.exports = new ShareData();