const { client ,code} = require("../public/script/codes");
const mailer = require("./common/mailer");

const cpass = require("../config/config.js").db.cpass,
    Admin = require("../config/db").getAdmin(cpass),
    Institute = require("../config/db").getInstitute(cpass),
    Oauth = require("../config/db").getOauth(cpass),
    adminworker = require("./adminworker"),
    inspect = require("./common/inspector"),
    {ObjectId} = require("mongodb");

class OAuth{
    async getDomainDetails(domid){
        if(!inspect.isValidObjectID(domid)){
            return false;
        }
        const domdata = await Oauth.findOne({_id:ObjectId(domid)})
        return domdata||false;
    }

    async hasUserAllowedDomain(user,domain){
        switch(user.client){
            case client.admin:{
                const adm = await adminworker.self.account.getAccount(user);
                return adm&&adm.oauth&&adm.oauth.includes(domain);
            }
            default:return false;
        }
    }

    async getUserData(user){
        switch(user.client){
            case client.admin:
                return await adminworker.self.account.getAccount(user);
            default:return false;
        }
    }

    async addUserAuthDomain(user,domain){
        const already = await this.hasUserAllowedDomain(user,domain);
        if(already) return true;
        switch(user.client){
            case client.admin:{
                const done = await Admin.findOneAndUpdate({_id:ObjectId(user.id)},{
                    $push:{
                        "oauth":domain
                    }
                });
                if(done.value){
                    mailer.sendAlertMail(code.mail.ACCOUNT_AUTHORIZATION,{
                        to:done.value.email,
                        username:done.value.username,
                        client:user.client,
                        oauthdomain:domain,
                    });
                }
                return done.value?true:false;
            }
        }
    }

    async removeUserAuthDomain(user,domain){
        const already = await this.hasUserAllowedDomain(user,domain);
        if(!already) return true;
        switch(user.client){
            case client.admin:{
                const done = await Admin.findOneAndUpdate({_id:ObjectId(user.id)},{
                    $pull:{
                        "oauth":domain
                    }
                });
                return done.value?true:false;
            }
        }
    }
}

module.exports = new OAuth();