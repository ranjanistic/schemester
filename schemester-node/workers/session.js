const adb = require('./dbadmin');
const admins = require('../modelschema/Admins.js');
const code = require('../hardcodes/events.js');

console.log(dboperate(_=>{
    console.log('ADB opened success');
}))

module.exports.loginAdmin =(email,password,uiid)=>{
    

        //check and return
         code.auth.EMAIL_INVALID
        //if doesn't exist, return with particular code.
         code.auth.USER_NOT_EXIST;
        //check and return
         code.auth.WRONG_PASSWORD
         //else
        //set active:true in this admin collection, return with institution uiid, and set active in localDB {indexedDB} too,
            //if uiid !exist, show registration page,
            //else show dashboard.
        //if set active failed return 
            code.auth.AUTH_FAILED
}

module.exports.logoutAdmin = (email)=>{
    dboperate(_ => {
        //set active:false in this admin collection, and return 
        code.auth.LOGGED_OUT;
    });
}

module.exports.createAdmin = (email,password)=>{
    dboperate(_=>{
        //if email invalid
        //code.auth.EMAIL_INVALID;
        //if collection exists, return 
        //code.auth.USER_EXIST;
        //if password weak
        //code.auth.WEAK_PASSWORD;
        //else create collection, set active:true, store ip address in server.js, return
        return code.auth.ACCOUNT_CREATED;
        //and proceed to payment or registration
    });
}

module.exports.isLoggedIn = (email)=>{
    dboperate(()=>{
        //check in email collection, return active;
    })
}

class Session{
    constructor(){
        this.uid = null;
        this.password = null;
        this.name = null;
        this.uiid = null;
        this.ipaddress = null;
        this.event = code.auth.LOGGED_OUT;
    }
    login = (email,pass,uiid,ip)=>{
        //login from admins schema
        this.event = code.auth.AUTH_SUCCESS;
        this.uid = email;
        this.password = pass;
        this.uiid = uiid;
        this.ipaddress = ip;
        return this.getResult(this.event,this.uid,this.name,this.uiid);

    };
    getResult=(event=null,uid=null,name=null,uiid=null)=> JSON.stringify({
        event:[event],
        email:[uid],
        name:[name],
        uiid:[uiid]
    });
}

//adb.once('open',_=>{
var session = new Session();
module.exports = session;//try superclass for local session


function dboperate(action){
    adb.once('open',_=>{
        action();
    })
    adb.on('error', err => {
        return code.server.DATABASE_ERROR + err;
    });
}