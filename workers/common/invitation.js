const code = require("../../public/script/codes"),
  Institute = require("../../config/db").getInstitute(),
  Admin = require("../../config/db").getAdmin(),
  time = require("./timer"),
  {ObjectId} = require("mongodb");
class Invitation {
  constructor() {
    this.type = "invitation";
    this.target = new Target();
    this.domain = code.domain
    this.defaultValidity = 7;
  }

  /**
   * Generates a new invitation link based on given parameters.
   * @param {String} target The target group for which invitation link is to be generated (teachers by admin, students by teacher incharges).
   * @param {JSON} data The key value pairs according to target.
   * @param {Number} validdays The number of days this link remains valid for. Defaults to 7.
   * @returns {Promise} Returns expiry and creation time according to SGT notation, and the generated link, as key value pairs
   *  of link,create,exp.
   */
  generateLink = async (
    target,
    data,
    validdays = this.defaultValidity
  ) => {
    switch(target){
      case this.target.teacher:{
        const instdoc = await Institute.findOne({"_id":ObjectId(data.instID)},{projection:{"invite":1}});
        if (instdoc.invite[target].active == true) {
          if (this.isActive(this.checkTimingValidity(
            instdoc.invite[target].createdAt,
            instdoc.invite[target].expiresAt,
            instdoc.invite[target].createdAt
            ))) {
              clog("already active");
            let link = this.getTemplateLink(
              target,
              data,
              instdoc.invite[target].createdAt
            );
            clog("templated");
            clog(link);
            clog("returning existing link");
            return {
              event: code.invite.LINK_EXISTS,
              link: link,
              exp: instdoc.invite[target].expiresAt,
            };
          }
        }
      }break;
      case this.target.student:{
        const classdoc = await Institute.findOne({"_id":ObjectId(data.instID),"users.classes":{$elemMatch:{"_id":ObjectId(data.cid)}}},{
          projection:{"users.classes.$.invite":1}
        });
        if(!classdoc) return code.inst.CLASS_NOT_FOUND;
        const Class = classdoc.users.classes[0];
        if(Class.invite[target].active == true){
          if(this.isActive(this.checkTimingValidity(
            Class.invite[target].createdAt,
            Class.invite[target].expiresAt,
            Class.invite[target].createdAt
          ))){
            let link = this.getTemplateLink(
              target,
              data,
              Class.invite[target].createdAt
            );
            clog("templated");
            clog(link);
            clog("returning existing link");
            return {
              event: code.invite.LINK_EXISTS,
              link: link,
              exp: Class.invite[target].expiresAt,
            };
          }
        }
      }break;
    }
    const creationTime = time.getTheMoment(false);
    const expiryTime = time.getTheMoment(false, validdays);
    let link;
    switch (target) {
      case this.target.teacher: {
        const path = `invite.${target}`;
        const document = await Institute.findOneAndUpdate(
          { "_id": ObjectId(data.instID) },
          {
            $set: {
              [path]: {
                active: true,
                createdAt: creationTime,
                expiresAt: expiryTime,
              },
            },
          }
        );
        link = this.getTemplateLink(
          target,
          data,
          creationTime
        );
        clog("generated");
        clog(document);
        clog(link);
        return document.value
        ? {
          event: code.invite.LINK_CREATED,
          link: link,
          exp: expiryTime,
        }: code.event(code.invite.LINK_CREATION_FAILED);
      }break;
      case this.target.student:{
        const path = `users.classes.$.invite.student`;
        const document = await Institute.updateOne(
          { "_id": ObjectId(data.instID) , "users.classes":{$elemMatch:{"_id":ObjectId(data.cid)}}},
          {
            $set: {
              [path]: {
                active: true,
                createdAt: creationTime,
                expiresAt: expiryTime,
              },
            },
          }
        );
        link = this.getTemplateLink(
          target,
          data,
          creationTime
        );
        clog("generated");
        clog(document.result);
        clog(link);
        return document.result.nModified
        ? {
          event: code.invite.LINK_CREATED,
          link: link,
          exp: expiryTime,
        }: code.event(code.invite.LINK_CREATION_FAILED);
      }
    }
  };

  async disableInvitation(target,data){
    switch(target){
      case this.target.teacher:{
        const path = `invite.${target}`;
        const doc = await Institute.findOneAndUpdate(
          { "_id": ObjectId(data.instID) },
          {
            $set: {
              [path]: {
                active: false,
                createdAt: 0,
                expiresAt: 0,
              },
            },
          }
        );
        clog("returning");
        return doc.value
          ? code.event(code.invite.LINK_DISABLED)
          : code.event(code.invite.LINK_DISABLE_FAILED);
      }
      case this.target.student:{
        const path = `users.classes.$.invite.student`;
        const doc = await Institute.findOneAndUpdate(
          { "_id": ObjectId(data.instID),"users.classes":{$elemMatch:{"_id":ObjectId(data.cid)}} },
          {
            $set: {
              [path]: {
                active: false,
                createdAt: 0,
                expiresAt: 0,
              },
            },
          }
        );
        clog("returning");
        return doc.value
          ? code.event(code.invite.LINK_DISABLED)
          : code.event(code.invite.LINK_DISABLE_FAILED);
      }
    }
  }

  /**
   * Returns dummy link for given parameters.
   * @param {String} target The target group for which link is to be generated.
   * @param {JSON} data The key value pairs according to target.
   * @param {any} createdAt The creation time to be inserted in the link.
   * @returns {String} The produced link identical to actual invitation link.
   * @note This method does not generate an actual invitation link. For invitation purposes, see generateLink() method of Invitation class.
   */
  getTemplateLink(target,data, createdAt) {
    switch(target){
      case this.target.teacher:
        return `${this.domain}/${target}/external?type=${this.type}&in=${data.instID}&ad=${data.uid}&t=${createdAt}`;
      case this.target.student:
        return `${this.domain}/${target}/external?type=${this.type}&in=${data.instID}&c=${data.cid}&t=${createdAt}`;
    }
  }

  /**
   * Checks validity of invitation link queries, by given params.
   * @param creation The creation time in SGT notation.
   * @param expiration The expiration time in SGT notation.
   * @param linktime The given creation time of link in the link in SGT notation.(to check if link has been tampered.)
   */
  checkTimingValidity(creation, expiration, linktime) {
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
      return code.event(code.invite.LINK_INVALID);
    }
    if (current > expiration) {
      return code.event(code.invite.LINK_EXPIRED);
    }
    if (current <= expiration && current >= creation) {
      return code.event(code.invite.LINK_ACTIVE);
    }
    return code.event(code.invite.LINK_INVALID);
  }

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
