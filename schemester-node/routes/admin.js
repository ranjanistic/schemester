const express = require("express"),
  router = express.Router(),
  fetch = require("node-fetch"),
  cookieParser = require('cookie-parser'),
  bcrypt = require("bcryptjs"),
  jwt = require("jsonwebtoken"),
  code = require("../hardcodes/events"),
  view = require("../hardcodes/views"),
  {check, validationResult} = require("express-validator");

const sessionsecret = "schemesterSecret2001";
const sessionKey = 'bailment';  //bailment ~ amaanat
const sessionID = "id";
const sessionUID = "uid";
const Admin = require("../modelschema/Admins");
router.use(cookieParser(sessionsecret));

router.get("/", function (req, res) {
  let token = req.signedCookies(sessionKey);
  jwt.verify(token,sessionsecret,(err,decode)=>{
    if(err){
      res.redirect("/admin/auth/login?target=dashboard");
    } else{
      res.redirect(`/admin/session?u=${decode.user.id}&target=dashboard`);
    }
  })

});

router.get("/session/register*", (_request, res) => {
  view.render(res, view.adminsetup);
});

router.get("/auth/login*", (req, res) => {
  let token = req.signedCookies[sessionKey];
  jwt.verify(token,sessionsecret,(err,decode)=>{
    if(err){
      let autofill = req.query;
      res.render(view.adminlogin,{autofill});
    } else{
      let link = req.query.target!=null?`/admin/session?u=${decode.user.id}&target=${req.query.target}`:`/admin/session?u=${decode.user.id}&target=dashboard`;
      res.redirect(link);
    }
  })
});

router.get("/session*", (req, res) => {
  let token = req.signedCookies[sessionKey];
  let target = req.query.target!=null?req.query.target:`dashboard`;
  jwt.verify(token,sessionsecret,(err,decode)=>{
    if(err){
      res.redirect(`/admin/auth/login?target=${target}`);
    } else{
      if(req.query.u==decode.user.id){
        try{
          let _id = req.query.u;
          let user = Admin.findOne({_id});
          if(user){
            console.log("dash:"+user.email);
            switch(target){
              case 'manage':{
                res.render(view.adminsettings);
              }break;
              case 'dashboard':{
                res.render(view.admindash);   
              }break;
              default:{
                target = 'dashboard';
                res.redirect(`/admin/auth/login?target=${target}`);
              }
            }
          }else{
            throw Error(code.auth.USER_NOT_EXIST);
          }
        }catch(e){
          console.log(e);
          res.clearCookie(sessionKey);
          res.redirect(`/admin/auth/login?target=${target}`);
        }
      }else{
        res.render(view.notfound);
      }
    }
  })
});

//for account settings
router.post("/account/action*",(req,res)=>{
  switch(req.body.type){
    case code.action.CHANGE_PASSWORD:{}break;
  }
})

router.post('/session/validate',(req,res)=>{
  let result;
  let token = req.signedCookies[sessionKey];
  jwt.verify(token,sessionsecret,(err,decoded)=>{
    console.log(err);
    result = err?{event:code.auth.SESSION_INVALID,destination:'/admin/auth/login'}:{event:code.auth.SESSION_VALID,destination:req.body.destination};
    console.log(decoded);
  })
  return res.json({result});
})

router.post("/auth/signup",
 [   
   check("username",code.auth.NAME_INVALID).not().isEmpty(),
   check("email", code.auth.EMAIL_INVALID).isEmail(),
   check("password", code.auth.PASSWORD_INVALID).isAlphanumeric().isLength({min:6}),
   check("uiid",code.auth.UIID_INVALID).not().isEmpty()
 ],
async (req, res) => {
  const errors = validationResult(req);
  let result;
  if (!errors.isEmpty()) {    
    result = {event: errors.array()[0].msg}
    res.json({result});
    return;
  }
  const {username, email, password, uiid} = req.body;
  try {
    let user = await Admin.findOne({email});
    if (user) {
      result = {event:code.auth.USER_EXIST}
      res.json({result});
      return;
    } else{
      let inst = await Admin.findOne({uiid});
      if (inst) {
        result = {event:code.server.UIID_TAKEN}
        res.json({result});
        return;
      }
    }

    user = new Admin({username,email,password,uiid});

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();//account created

    const payload = {
      user: {id: user.id}
    };
    jwt.sign(
      payload,
      sessionsecret,
      {
        expiresIn: 2*1440 //min
      },
      (err, token) => {
        if (err) throw err;
        res.cookie(sessionKey,token,{signed:true})
        result = {event:code.auth.AUTH_SUCCESS,[sessionUID]:user.id,[sessionID]:email}
        console.log(result);
        res.json({result});
      }
    );
  } catch (err) {
    result = {event:code.auth.ACCOUNT_CREATION_FAILED, msg:err.message}
    console.log(result);
    res.status(500).json({result});
    return;
  }
});

router.post('/auth/logout',(req,res)=>{
  res.clearCookie(sessionKey);
  let result = {event:code.auth.LOGGED_OUT};
  res.json({result});
})

let lastMail = null;
let loginFailCount = 0;
router.post("/auth/login", 
[
  check("email", code.auth.EMAIL_INVALID).isEmail(),
  check("password",code.auth.PASSWORD_INVALID).not().isEmpty(),
  check("uiid",code.auth.UIID_INVALID).not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  let result;
  if (!errors.isEmpty()) {    
    result = {event: errors.array()[0].msg}
    res.json({result});
    return;
  }
  const { email, password, uiid , target} = req.body;
  try {
    let user = await Admin.findOne({email});
    if (!user) {
      result = {event:code.auth.USER_NOT_EXIST}
      return res.json({result});
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch){
      if(lastMail == email){
        loginFailCount++;
      }else{
        lastMail = email;
        loginFailCount = 0;
      }
      result = {event:code.auth.WRONG_PASSWORD}
      return res.json({result});
    } else {
      if(uiid!=user.uiid){
        if(lastMail == email){
          loginFailCount++;
        }else{
          lastMail = email;
          loginFailCount = 0;
        }
        result = {event:code.auth.WRONG_UIID}
        res.json({result});
        return;
      }
    }
    const payload = {
      user: {id: user.id}
    };

    jwt.sign(
      payload,
      sessionsecret,
      {
        expiresIn: 28*1440  //min
      },
      (err, token) => {
        if (err) throw err;
        res.cookie(sessionKey,token,{signed:true})
        result = {event:code.auth.AUTH_SUCCESS,[sessionUID]:user.id,[sessionID]:email,target:target}
        console.log(result);
        res.json({result});
      }
    );
  } catch (err) {
    result = {event:code.auth.AUTH_REQ_FAILED, msg:err.message};
    console.log("error:"+result);
    res.status(500).json({result});
  }

});

router.post("/createInstitution", (req, res) => {
  const register = require("../workers/registration.js");
  res.send(register.createInstitutionDefaults(req.body));
});

router.post("/external/*", (req, response) => {
  switch (req.query.type) {
    case "invitation":
      {
        //todo: Generate only if expired. Check getMoment()<lastlinkdate equality from database.
        //also check if user has disabled previous link, in {req.query.revoked}, then create and send new link as follows.
        //var prevlinkData = getPreviousInviteLink();
        //prevlinkData.time;
        if(req.query.target == "teacher"){
            var linkdata = createInviteLink(
            "priyanshuranjan88@gmail.com", //use session id
            "mvmnoidab64b", //use session uiid
            "teacher"
            );
            console.log("new link:" + linkdata);
            response.json({ linkdata });
        }else {
            response.render(view.notfound);      
        }
      }
      break;
    case "action":{
        if (req.body.accepted) {
          res.render(view.adminsettings);
        } else {
          res.render(view.loader);
        }
      }
      break;
    default:
      response.send(404);
  }
});

router.get("/external/*", (req, response) => {
  console.log(req.query);
  switch (req.query.type) {
    case "invitation":{
        if(req.query.target == "teacher"){
            var invite = getInviteLinkData(req.query);
            if (invite == null) {
                response.render(view.notfound);
            } else {
                response.render(view.userinvitaion, { invite });
            }
        }else{
            response.render(view.notfound);
        }
      }
      break;
    default:
      response.render(view.notfound);
  }
});

var getPreviousInviteLinkData = (_) => {
  //read from database;
  adb.collection(testInstitute);
  let expfromdb;
  let valid = getTheMoment(false) < expfromdb;
  return {
    adminName: "Admin kumar",
    adminEmail: [email], //from session
    active: [valid],
    uiid: [query.uiid], //for creation of user email object in users document of institution, for teacher schedule.
    instituteName: "Institution of Example",
    exp: [query.exp],
  };
};

var createInviteLink = (email, uiid, target) => {
  let id = String(email).split("@", 1);
  let dom = String(email).split("@")[1];
  let exp = getTheMoment(true, 7); // set exp time one week later
  return JSON.stringify({
    link: `http://localhost:3000/admin/external/?type=invitation&target=${target}&id=${id}&dom=${dom}&uiid=${uiid}&exp=${exp}`,
    time: [exp],
  });
};
var getInviteLinkData = (query) => {
  let email = `${query.id}@${query.dom}`;
  console.log(getTheMoment(false) + "<" + parseInt(query.exp));
  let valid = getTheMoment(false) < parseInt(query.exp);
  if (isInvalidQuery(query)) {
    return null;
  }
  //todo: let admin = getAdminNameFromDB(email); //admin name to be shown
  //match exp from server, return null if conflict.
  return {
    adminName: "Admin kumar",
    adminEmail: [email], //for user to contact admin if !active, and other verification purposes if active.
    active: [valid],
    uiid: [query.uiid], //for creation of user email object in users document of institution, for teacher schedule.
    instituteName: "Institution of Example",
    target:[query.target],
    exp: [query.exp],
  };
};
var getTheMoment = (stringForm = true, dayincrement = 0) => {
  let d = new Date();
  let year = d.getFullYear();
  let month = d.getMonth() + 1;
  let date = d.getDate();
  let incrementedDate = date + dayincrement;
  if (daysInMonth(month, year) - incrementedDate < 0) {
    incrementedDate = incrementedDate - daysInMonth(month, year);
    if (12 - (month + 1) < 0) {
      month = 13 - month;
      year++;
    } else {
      month++;
    }
  }
  incrementedDate =
    incrementedDate < 10 ? `0${incrementedDate}` : incrementedDate;
  month = month < 10 ? `0${month}` : month;
  let hour = d.getHours() < 10 ? `0${d.getHours()}` : d.getHours();
  let min = d.getMinutes() < 10 ? `0${d.getMinutes()}` : d.getMinutes();
  let insts = d.getSeconds();
  let secs = insts < 10 ? `0${insts}` : insts;
  let instm = d.getMilliseconds();
  let milli = instm < 10 ? `00${instm}` : instm < 100 ? `0${instm}` : instm;
  if (stringForm) {
    return (
      String(year) +
      String(month) +
      String(incrementedDate) +
      String(hour) +
      String(min) +
      String(secs) +
      String(milli)
    );
  } else {
    return parseInt(
      String(year) +
        String(month) +
        String(incrementedDate) +
        String(hour) +
        String(min) +
        String(secs) +
        String(milli)
    );
  }
};

var daysInMonth = (month, year) => new Date(year, month, 0).getDate();
var isInvalidQuery = (query) =>
  query.id == null ||
  query.dom == null ||
  query.exp == null ||
  query.uiid == null ||
  query.id == "" ||
  query.dom == "" ||
  query.exp == "" ||
  query.uiid == ""|| String(parseInt(query.exp)).length<getTheMoment(true).length;

let isValidEmail = (emailValue) => {
  const emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return emailRegex.test(String(emailValue).toLowerCase());
};

module.exports = router;
