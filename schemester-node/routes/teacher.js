const express = require("express"),
  router = express.Router(),
  cookieParser = require("cookie-parser"),
  { check, validationResult } = require("express-validator"),
  code = require("../hardcodes/events"),
  view = require("../hardcodes/views"),
  session = require("../workers/session"),
  Institute = require("../modelschema/Institutions");

const sessionsecret = session.teachersessionsecret;
router.use(cookieParser(sessionsecret));
router.get("/", function (req, res) {
    res.redirect("/teacher/auth/login?target=dashboard");
});

router.get("/auth/login*", (req, res) => {
  session.verify(req, res, sessionsecret).then((response) => {
    if (session.valid(response)) {
      let link =
        req.query.target
          ? `/teacher/session?u=${response.user.id}&target=${req.query.target}`
          : `/teacher/session?u=${response.user.id}&target=dashboard`;
      res.redirect(link);
    } else {
      let autofill = req.query;
      res.render(view.teacher.login, { autofill });
    }
  });
});

router.post("/auth/login",
  // [
  //   check("email", code.auth.EMAIL_INVALID).isEmail(),
  //   check("password", code.auth.PASSWORD_INVALID).not().isEmpty(),
  //   check("uiid", code.auth.UIID_INVALID).not().isEmpty(),
  // ],
  async (req,res)=>{
    let result;
    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //   result = { event: errors.array()[0].msg };
    //   return res.json({ result });
    // }
    session.login(req,res,sessionsecret,Teacher).then(response=>{
      result = response;
      return res.json({result});
    }).catch(error=>{
      result = { event: code.auth.AUTH_REQ_FAILED, msg: error };
      clog("t post login:" + jstr(result));
      return res.json({ result });
    })
  }
);

router.post("/auth/signup",(req,res)=>{
  session.signup(req,res,sessionsecret,Institute).then(response=>{
    clog("t signup response");
    clog(response);
    result = response;
    return res.json({result});
  }).catch(error=>{
    clog('t signup error');
    clog(error);
    result = { event: code.auth.ACCOUNT_CREATION_FAILED, msg: error };
    return res.status(500).json({ result });
  });
});



router.get("/session*", (req, res) => {
  session.verify(req, res, sessionsecret)
    .then(async (response) => {
      clog(response);
      if (session.valid(response)) {
        clog("teacher session valid:"+response.event);
      } else {
        clog("teachers session invalid:"+response.event)
      }
      res.sendStatus(404);
    })
    .catch((error) => {
      clog("teacher session errror:"+error);
    });
});

module.exports = router;
let clog = (msg) => console.log(msg);