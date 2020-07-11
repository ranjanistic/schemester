const express = require("express"),
  router = express.Router(),
  code = require("../hardcodes/events"),
  view = require("../hardcodes/views"),
  auth = require("../workers/session"),
  session = require("../workers/session"),
  { check, validationResult} = require("express-validator"),
  bcrypt = require("bcryptjs"),
  jwt = require("jsonwebtoken");

const Admin = require("../modelschema/Admins");
router.get("/", function (req, res) {
  res.redirect("/admin/dash");
});

router.get("/register", (_request, res) => {
  view.render(res, view.adminsetup);
});

router.get("/auth/login", (req, res) => {
  view.render(res, view.adminlogin);
});
router.get("/dash", (_request, res) => {
  view.render(res, view.admindash);
});

router.get("/manage", (_request, res) => {
  view.render(res, view.adminsettings);
});

router.post("/auth/signup",
[   
  check("username","Your name is required").not().isEmpty(),
  check("email", code.auth.EMAIL_INVALID).isEmail(),
  check("password", code.auth.PASSWORD_INVALID).isLength({min: 6})
],
async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(req.body);
    console.log("oof")
    console.log(errors);
    return res.status(400).json({
      errors: errors.array()
    });
  }
  const {username, email, password } = req.body;
  console.log(email);
  try {
    let user = await Admin.findOne({email});
    console.log(user);
    if (user) {
      let result = {
        event:code.auth.USER_EXIST
      }
      res.json({result});
      return;
    }
    user = new Admin({
      username,
      email,
      password
    });

    const salt = await bcrypt.genSalt(10);
    console.log("salt"+salt);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const payload = {
      user: {
        id: user.id
      }
    };
    console.log("payl"+payload);

    jwt.sign(
      payload,
      "schemesterAdminSecret2001",
      {
        expiresIn: 10000
      },
      (err, token) => {
        if (err){
          console.log(err.message);
          throw err;
        }
        console.log("tok:"+token);
        res.status(200).json({
          token
        });
      }
    );
  } catch (err) {
    console.log(err.message);
    res.status(500).json({event:[code.auth.ACCOUNT_CREATION_FAILED]});
  }
});


router.post("/auth/login", 
[
  check("email", code.auth.EMAIL_INVALID).isEmail(),
  check("password",code.auth.PASSWORD_INVALID).not().isEmpty()
],
async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array()
    });
  }

  const { email, password } = req.body;
  try {
    let user = await Admin.findOne({
      email
    });
    if (!user)
      return res.status(400).json({
        event: [code.auth.USER_NOT_EXIST]
      });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({
        event: [code.auth.WRONG_PASSWORD]
      });

    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      "schemesterAdminSecret2001",
      {
        expiresIn: 3600
      },
      (err, token) => {
        if (err) throw err;
        res.status(200).json({
          token
        });
      }
    );
  } catch (e) {
    console.error(e);
    res.status(500).json({
      event: [code.auth.AUTH_REQ_FAILED]
    });
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
