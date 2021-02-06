require("dotenv").config({ silent: process.env.NODE_ENV == 'production' });

const {ObjectId} = require("mongodb"),{client,stringIsValid,validType} = require("../../public/script/codes"),
  jwt = require("jsonwebtoken"), timer = require("./timer"),{appname,site,email} = require("./../../config/config.json");

/**
 * For inspection of data received by client.
 */
class Inspector{
    constructor(){
      
      this.token = {
        sign:(value)=>{
          return jwt.sign(value,process.env.SSH)
        },
        verify:(token)=>{
          return jwt.verify(token,process.env.SSH)
        },
      }
      this.isDev = process.env.NODE_ENV != 'production';
    }

    render(response,view,data = {}){
      data['acsrf'] = jwt.sign(timer.getMoment(),process.env.SSH);
      data['appname'] = appname;
      data['site'] = site;
      data['mailto'] = jwt.verify(email,process.env.SSH);
      data['year'] = new Date().getFullYear();
      return response.render(view,data);
    }

    /**
     * Checks auth token validity
     * @param {JSON} token The masked session token
     * @param {String} clientType The global client type.
     */
    sessionTokenValid(token,clientType){
      try{
        if(!ObjectId(token.id)||!token.uiid) return false;
        switch(clientType){
          case client.student:if(!token.classname) return false;
          default:return true;
        }
      } catch(e){
        return false;
      }
    }
    instDocValid(doc){  //validate institute registration doc.
      return true;
    }

    randomCode(length = 6){
      let result = '';
      let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let charactersLength = characters.length;
      for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
      }
      return result;
    }

    emailValid=(emailstring)=>stringIsValid(emailstring,validType.email)
    passValid =(passstring)=>stringIsValid(passstring,validType.password)
}

module.exports = new Inspector();
