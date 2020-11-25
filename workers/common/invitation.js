const {code,client,clog} = require("../../public/script/codes"),
  cpass = require("../../config/config.json").db.cpass,
  Admin = require("../../config/db").getAdmin(cpass),
  Institute = require("../../config/db").getInstitute(cpass),
  share = require("./sharedata"),
  time = require("./timer"),
  { ObjectId } = require("mongodb");

class Invitation {
  constructor() {
    this.type = "invitation";
    this.personalType = "personalinvite";
    this.domain = code.domain;
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
  generateLink = async (target, data, validdays = this.defaultValidity) => {
    switch (target) {
      case client.admin:{
        const instdoc = await Institute.findOne(
          { _id: ObjectId(data.instID) },
          { projection: { invite: 1 } }
        );
        if (instdoc.invite[target].active == true) {
          if (
            this.isActive(
              this.checkTimingValidity(
                instdoc.invite[target].createdAt,
                instdoc.invite[target].expiresAt,
                instdoc.invite[target].createdAt
              )
            )
          ) {
            return {
              event: code.invite.LINK_EXISTS,
              link: this.getTemplateLink(
                target,
                data,
                instdoc.invite[target].createdAt
              ),
              exp: instdoc.invite[target].expiresAt,
            };
          }
        }
      }break;
      case client.teacher:{
          const instdoc = await Institute.findOne(
            { _id: ObjectId(data.instID) },
            { projection: { invite: 1 } }
          );
          if (instdoc.invite[target].active == true) {
            if (
              this.isActive(
                this.checkTimingValidity(
                  instdoc.invite[target].createdAt,
                  instdoc.invite[target].expiresAt,
                  instdoc.invite[target].createdAt
                )
              )
            ) {
              return {
                event: code.invite.LINK_EXISTS,
                link: this.getTemplateLink(
                  target,
                  data,
                  instdoc.invite[target].createdAt
                ),
                exp: instdoc.invite[target].expiresAt,
              };
            }
          }
        }
        break;
      case client.student:
        {
          const classdoc = await Institute.findOne(
            {
              _id: ObjectId(data.instID),
              "users.classes": { $elemMatch: { _id: ObjectId(data.cid) } },
            },
            {
              projection: { "users.classes.$": 1 },
            }
          );
          if (!classdoc) return code.inst.CLASS_NOT_FOUND;
          const Class = classdoc.users.classes[0];
          if (Class.invite[target].active == true) {
            if (
              this.isActive(
                this.checkTimingValidity(
                  Class.invite[target].createdAt,
                  Class.invite[target].expiresAt,
                  Class.invite[target].createdAt
                )
              )
            ) {
              let link = this.getTemplateLink(
                target,
                data,
                Class.invite[target].createdAt
              );
              return {
                event: code.invite.LINK_EXISTS,
                link: link,
                exp: Class.invite[target].expiresAt,
              };
            }
          }
        }
        break;
    }
    //creating new link
    const creationTime = time.getTheMoment(false);
    const expiryTime = time.getTheMoment(false, validdays);
    switch (target) {
      case client.admin:{
        const document = await Institute.findOneAndUpdate(
          { _id: ObjectId(data.instID) },
          {
            $set: {
              [`invite.${target}`]: {
                active: true,
                createdAt: creationTime,
                expiresAt: expiryTime,
              },
            },
          }
        );
        return document.value
          ? {
              event: code.invite.LINK_CREATED,
              link: this.getTemplateLink(target, data, creationTime),
              exp: expiryTime,
            }
          : code.event(code.invite.LINK_CREATION_FAILED);
      }
      break;
      case client.teacher:
        {
          const document = await Institute.findOneAndUpdate(
            { _id: ObjectId(data.instID) },
            {
              $set: {
                [`invite.${target}`]: {
                  active: true,
                  createdAt: creationTime,
                  expiresAt: expiryTime,
                },
              },
            }
          );
          return document.value
            ? {
                event: code.invite.LINK_CREATED,
                link: this.getTemplateLink(target, data, creationTime),
                exp: expiryTime,
              }
            : code.event(code.invite.LINK_CREATION_FAILED);
        }
        break;
      case client.student: {
        const document = await Institute.updateOne(
          {
            _id: ObjectId(data.instID),
            "users.classes": { $elemMatch: { _id: ObjectId(data.cid) } },
          },
          {
            $set: {
              [`users.classes.$.invite.${target}`]: {
                active: true,
                createdAt: creationTime,
                expiresAt: expiryTime,
              },
            },
          }
        );
        return document.result.nModified
          ? {
              event: code.invite.LINK_CREATED,
              link: this.getTemplateLink(target, data, creationTime),
              exp: expiryTime,
            }
          : code.event(code.invite.LINK_CREATION_FAILED);
      }
    }
  };

  async disableInvitation(target, data) {
    switch (target) {
      case client.admin:{
        const path = `invite.${target}`;
        const doc = await Institute.findOneAndUpdate(
          { _id: ObjectId(data.instID) },
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
        return doc.value
          ? code.event(code.invite.LINK_DISABLED)
          : code.event(code.invite.LINK_DISABLE_FAILED);
      }break;
      case client.teacher: {
        const path = `invite.${target}`;
        const doc = await Institute.findOneAndUpdate(
          { _id: ObjectId(data.instID) },
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
        return doc.value
          ? code.event(code.invite.LINK_DISABLED)
          : code.event(code.invite.LINK_DISABLE_FAILED);
      }
      case client.student: {
        const path = `users.classes.$.invite.student`;
        const doc = await Institute.findOneAndUpdate(
          {
            _id: ObjectId(data.instID),
            "users.classes": { $elemMatch: { _id: ObjectId(data.cid) } },
          },
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
        return doc.value
          ? code.event(code.invite.LINK_DISABLED)
          : code.event(code.invite.LINK_DISABLE_FAILED);
      }
    }
  }

  async handleInvitation(query, target) {
    switch (target) {
      case client.admin:{
        if (!(query.in && query.t && query.ad)) return false;
        const inst = await Institute.findOne(
          { _id: ObjectId(query.in) },
          { projection: { [`invite.${target}`]: 1, default: 1, uiid: 1 } }
        );
        if (!inst) return false;
        if (!inst.invite.admin.active) return false;
        const expires = inst.invite.admin.expiresAt;
        if (!this.isActive(this.checkTimingValidity(
          inst.invite.admin.createdAt,
          expires,
          query.t
        ))) return false;
        const invitor = await Admin.findOne({_id:ObjectId(query.ad)})
        return {
          invite: {
            valid: true,
            uiid: inst.uiid,
            invitorID: invitor.email,
            invitorName: invitor.username,
            instname: inst.default.institute.instituteName,
            expireAt: expires,
            target: target,
          },
        };
      }break;
      case client.teacher: {
        if (!(query.in && query.t)) return false;
        const inst = await Institute.findOne(
          { _id: ObjectId(query.in) },
          { projection: { [`invite.${target}`]: 1, default: 1, uiid: 1 } }
        );
        if (!inst) return false;
        if (!inst.invite.teacher.active)
          return {
            invite: {
              valid: false,
              uiid: inst.uiid,
              adminemail: inst.default.admin.email,
              adminName: inst.default.admin.username,
              expireAt: inst.invite.teacher.expiresAt,
              instname: inst.default.institute.instituteName,
              target: target,
            },
          };

        const expires = inst.invite.teacher.expiresAt;
        const validity = this.checkTimingValidity(
          inst.invite.teacher.createdAt,
          expires,
          query.t
        );
        if (this.isInvalid(validity)) return false;
        return {
          invite: {
            valid: this.isActive(validity),
            uiid: inst.uiid,
            invitorID: inst.default.admin.email,
            invitorName: inst.default.admin.username,
            instname: inst.default.institute.instituteName,
            expireAt: expires,
            target: target,
          },
        };
      }break;
      case client.student:{
        if(!(query.in && query.c && query.t)) return false;
        const classdoc = await Institute.findOne({"_id":ObjectId(query.in),"users.classes":{$elemMatch:{"_id":ObjectId(query.c)}}},{
          projection:{uiid:1,"users.classes.$":1,default:1}
        });
        if(!classdoc) return false;
        const Class = classdoc.users.classes[0];
        if(!Class) return false;
        const teacherdoc = await Institute.findOne({uiid:classdoc.uiid,"users.teachers":{$elemMatch:{"teacherID":Class.inchargeID}}},{
          projection:{"users.teachers.$":1}
        });
        if(!teacherdoc) return false;
        const incharge = share.getTeacherShareData(teacherdoc.users.teachers[0]);
        const expires = Class.invite.student.expiresAt;
        if(!Class.invite.student.active)
          return {
            invite:{
              valid:false,
              uiid: classdoc.uiid,
              classname:Class.classname,
              invitorID: incharge.id,
              invitorName: incharge.username,
              expireAt: expires,
              instname: classdoc.default.institute.instituteName,
              target: client.student, 
            }
          }
        
        const validity = this.checkTimingValidity(
          Class.invite.student.createdAt,
          expires,
          query.t
        );
        if (this.isInvalid(validity)) return false;
        return {
          invite: {
            valid: this.isActive(validity),
            uiid: classdoc.uiid,
            invitorID: incharge.id,
            invitorName: incharge.username,
            classname:Class.classname,
            instname: classdoc.default.institute.instituteName,
            expireAt: expires,
            target: client.student,
          },
        };
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
  getTemplateLink(target, data, createdAt) {
    switch (target) {
      case client.admin:
        return `${this.domain}/${target}/external?type=${this.type}&in=${data.instID}&ad=${data.uid}&t=${createdAt}`;
      case client.teacher:
        return `${this.domain}/${target}/external?type=${this.type}&in=${data.instID}&ad=${data.uid}&t=${createdAt}`;
      case client.student:
        return `${this.domain}/${target}/external?type=${this.type}&in=${data.instID}&c=${data.cid}&t=${createdAt}`;
    }
  }
  
  getPersonalInviteLink(target,data){
    switch (target) {
      case client.admin:
        return `${this.domain}/${target}/external?type=${this.personalType}&in=${data.instID}&ad=${data.uid}&id=${data.to}`;
      case client.teacher:
        return `${this.domain}/${target}/external?type=${this.personalType}&in=${data.instID}&ad=${data.uid}&id=${data.to}`;
      case client.student:
        return `${this.domain}/${target}/external?type=${this.personalType}&in=${data.instID}&c=${data.cid}&id=${data.to}`;
    }
  }

  async handlePersonalInvitation(query,target){
    if(!(query.in&&query.id&&(query.ad||query.c))) return false;
    switch(target){
      case client.admin:{};
      case client.teacher:{
        const admin = await Admin.findOne({"_id":ObjectId(query.ad)});
        if(!admin) return false;
        const inst = await Institute.findOne({"_id":ObjectId(query.in),"schedule.teachers":{$elemMatch:{"teacherID":query.id}}},{
          projection:{
            "uiid":1,
            "default":1,
          }
        });
        if(!inst) return false;
        const teacherdoc = await Institute.findOne({"_id":ObjectId(query.in),"users.teachers":{$elemMatch:{"teacherID":query.id}}});
        if(teacherdoc) return false;
        return {
          invite:{
            valid: true,
            personal:true,
            email:query.id,
            uiid: inst.uiid,
            invitorID: admin.email,
            invitorName: admin.username,
            instname: inst.default.institute.instituteName,
            expireAt: false,
            target: target,
          }
        }
      }break;
      case client.student:{};
    }
  }

  /**
   * Checks validity of invitation link queries, by given params.
   * @param {Number} creation The creation time in SGT notation.
   * @param {Number} expiration The expiration time in SGT notation.
   * @param {Number} linktime The given creation time of link in the link in SGT notation.(to check if link has been tampered.)
   * @returns {JSON} event code.
   * @see [SGT notation](https://github.com/ranjanistic/schemester-web/blob/master/DOCUMENTATION.md#sgt-notation)
   */
  checkTimingValidity(creation, expiration, linktime) {
    const now = time.getTheMoment(false);
    if (
      creation == 0 ||
      expiration == 0 ||
      linktime != creation ||
      now < creation
    ) {
      return code.event(code.invite.LINK_INVALID);
    }
    if (now > expiration) {
      return code.event(code.invite.LINK_EXPIRED);
    }
    if (now <= expiration && now >= creation) {
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

module.exports = new Invitation();
