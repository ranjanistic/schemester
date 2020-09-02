const express = require("express"),
  bodyParser = require("body-parser"),
  view = require("./hardcodes/views"),
  app = express();

const mongo = require('./config/db');
const clog = (msg) => console.log(msg);
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));


mongo.connectToServer(( err )=>{
  if (err) console.log(err);
  clog(`Connected to ${mongo.getDb().databaseName}`);
  app.use("/admin", require("./routes/admin"));
  app.use("/teacher", require("./routes/teacher"));
  app.use("/student", require("./routes/student"));
  app.get("/", (req, res) => {
    res.render(view.loader, { data:{ client: req.query.client ? req.query.client : null }});
  });

  app.get("/home", (_req, res) => {
    res.render(view.homepage);
  });

  app.get("/plans", (_request, res) => {
    res.render(view.plans);
  });

  app.get("/404", (_req, _res, next) => {
    next();
  });
  app.get("/403", (_req, _res, next) => {
    next();
  });
  app.get("/500", (req, res, next) => {
    next();
  });

  app.use((req, res, next) => {
    res.status(404);
    res.format({
      html: function () {
        res.render(view.notfound, { url: req.url });
      },
      json: function () {
        res.json({ error: "Not found" });
      },
      default: function () {
        res.type("txt").send("Not found");
      },
    });
  });

  app.use((err, req, res) => {
    res.status(err.status || 500);
    res.render(view.servererror, { error: err });
  });

  app.listen(3000,'0.0.0.0'|| process.env.PORT, ()=>{ clog('listening on 3000')})
});
