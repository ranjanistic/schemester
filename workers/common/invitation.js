const code = require("../../public/script/codes"),
  Institute = require("../../config/db").getInstitute(),
  Admin = require("../../config/db").getAdmin(),
  time = require("./timer");
class Invitation {
  constructor() {
    this.type = "invitation";
    this.target = new Target();
    this.domain = "http://localhost:3000";  //todo
    this.defaultValidity = 7;
  }

/**
   * Generates a new invitation link based on given parameters.
   * @param {String} adminID The id of admin for which institution verificaiton link is to be generated, can be passed from Invitaiton().target.
   * @param {String} instID The id of institution in which invitation is to be generated.
   * @param {String} target The target group for which invitation link is to be generated (teachers by admin, students by teacher incharges).
   * @param {Number} validdays The number of days this link remains valid for. Defaults to 7.
   * @returns {JSON} Returns expiry and creation time according to SGT notation, and the generated link, as key value pairs
   *  of link,create,exp.
   */
  generateLink = async (
    adminID,
    instID,
    target,
    validdays = this.defaultValidity
  ) => {
    let creationTime = time.getTheMoment(false);
    let expiryTime = time.getTheMoment(false, validdays);
    let link = `${this.domain}/${target}/external?type=${this.type}&in=${instID}&ad=${adminID}&t=${creationTime}`;
    clog("generated");
    clog(link);
    return {
      link: link,
      create: creationTime,
      exp: expiryTime,
    };
  };

  /**
   * Returns dummy link for given parameters.
   * @param adminID The id of admin to be inserted.
   * @param instID The institution id to be inserted.
   * @param target The target group for which link is to be generated.
   * @param createdAt The creation time to be inserted in the link.
   * @returns The produced link identical to actual invitation link.
   * @note This method does not generate an actual invitation link. For invitation purposes, see generateLink() method of Invitation class.
   */
  getTemplateLink(adminID, instID, target, createdAt) {
    return `${this.domain}/${target}/external?type=${this.type}&in=${instID}&ad=${adminID}&t=${createdAt}`;
  }

  /**
   * Checks validity of invitation link queries, by given params.
   * @param creation The creation time in SGT notation.
   * @param expiration The expiration time in SGT notation.
   * @param linktime The given creation time of link in the link in SGT notation.(to check if link has been tampered.)
   */
  checkTimingValidity(creation, expiration, linktime){
    let current = time.getTheMoment(false);
    clog("times of link");
    let t = Number(linktime);
    clog(linktime);
    clog(t);
    clog(creation);
    clog(current);
    clog(expiration);
    clog(linktime == String(creation));
    if (
      creation == 0 ||
      expiration == 0 ||
      linktime != String(creation) ||
      current < creation
    ) {
      clog("first invalid");
      return code.event(code.invite.LINK_INVALID);
    }
    if (current > expiration) {
      return code.event(code.invite.LINK_EXPIRED);
    }
    if (current <= expiration && current >= creation) {
      return code.event(code.invite.LINK_ACTIVE);
    }
    return code.event(code.invite.LINK_INVALID);
  };

  
  /**
   * Checks if given response is active for link validation.
   * @param {JSON} response This should contain a key 'event' with some link validity code value.
   * @returns A boolean value, if active, true, otherwise false.
   * @note This method does NOT check if invitation is active or not. For invitaiton validation purposes, see checkTimingValidity() method of Verification class.
   */
  isActive(response) {
    return response.event == code.invite.LINK_ACTIVE;
  }

  /**
   * Checks if given response is expired for link validation.
   * @param {JSON} response This should contain a key 'event' with some link validity code value.
   * @returns A boolean value, if expired, true, otherwise false.
   * @note This method does NOT check if invitation is expired or not. For invitaiton validation purposes, see checkTimingValidity() method of Verification class.
   */
  isExpired(response) {
    return response.event == code.invite.LINK_EXPIRED;
  }
  
  /**
   * Checks if given response is invalid for link validation.
   * @param {JSON} response This should contain a key 'event' with some link validity code value.
   * @returns A boolean value, if invalid, true, otherwise false.
   * @note This method does NOT check if invitation is invalid or not. For invitaiton validation purposes, see checkTimingValidity() method of Verification class.
   */
  isInvalid(response) {
    return response.event == code.invite.LINK_INVALID;
  }
}

class Target {
  constructor() {
    this.teacher = "teacher";
    this.student = "student";
  }
}

let clog = (msg) => console.log(msg);
module.exports = new Invitation();
