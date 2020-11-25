const {ObjectId} = require("mongodb"),{client,stringIsValid,validType} = require("../../public/script/codes");

/**
 * For inspection of data received by client.
 */
class Inspector{
    constructor(){}
    /**
     * Checks auth token validity
     * @param {JSON} token The masked session token
     * @param {String} clientType The global client type.
     */
    tokenValid(token,clientType){
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

    emailValid=(emailstring)=>stringIsValid(emailstring,validType.email)

    passValid =(passstring)=>stringIsValid(passstring,validType.password)
}

module.exports = new Inspector();
