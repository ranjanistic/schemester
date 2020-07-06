const mongoose = require('mongoose');
const Admins = require('../modelschema/Admins.js');
const code = require('../hardcodes/events.js');

//'mongodb+srv://ranjanistic:ggD2zo319tfQ6M8f@realmcluster.njdl8.mongodb.net/Schools?retryWrites=true&w=majority'
const adminurl = 'mongodb+srv://tempdbuser:sz58UgReMdMoDdBd@cluster0.zspfk.mongodb.net/Admins?retryWrites=true&w=majority';
const localadminurl = 'mongodb://localhost/Admins';
mongoose.connect(localadminurl, { useNewUrlParser: true , useUnifiedTopology: false });
const adb = mongoose.connection;

console.log(dboperate(_=>{console.log('ADB opened success');}))

module.exports.loginAdmin =(email,password,uiid)=>{
    dboperate(_ => {
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
    });    
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

function dboperate(action){
    adb.once('open',_=>{
        action();
    })
    adb.on('error', err => {
        return code.server.DATABASE_ERROR + err;
    });
}