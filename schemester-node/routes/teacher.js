const express = require("express"),
  router = express.Router(),
  cookieParser = require("cookie-parser"),
  { check, validationResult } = require("express-validator"),
  code = require("../hardcodes/events"),
  view = require("../hardcodes/views"),
  session = require("../workers/session"),
  Institute = require("../modelschema/Institutions");

const sessionsecret = session.teachersessionsecret;

router.get("/", function (req, res) {
    res.redirect("/teacher/auth/login?target=dashboard");
});

router.get("/auth/login*", (req, res) => {
  session.verify(req, res, sessionsecret).then((response) => {
    if (session.valid(response)) {
      let link =
        req.query.target != null
          ? `/teacher/session?u=${response.user.id}&target=${req.query.target}`
          : `/teacher/session?u=${response.user.id}&target=dashboard`;
      res.redirect(link);
    } else {
      let autofill = req.query;
      res.render(view.teacher.login, { autofill });
    }
  });
});

router.post("/auth/login", async (req,res)=>{
    //todo: session.login(req,res,sessionsecret,Teacher)
});

router.get("/session*", (req, res) => {
  session.verify(req, res, sessionsecret)
    .then((response) => {
      if (session.valid(response)) {
      }
    })
    .catch((error) => {});
});

module.exports = router;
