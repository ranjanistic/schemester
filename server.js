const express = require("express"),
  bodyParser = require("body-parser"),
  {client,view,clog} = require("./public/script/codes"),
  server = express();
const mongo = require('./config/db');
server.set("view engine", "ejs");
server.use(express.static("public"));
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());

// const clog = (msg) => console.log(msg);

mongo.connectToServer(( err )=>{
  if (err) console.log(err);
  clog(`Connected to ${mongo.getDb().databaseName}`);
  server.use(`/${client.admin}`, require("./routes/admin"));
  server.use(`/${client.teacher}`, require("./routes/teacher"));
  server.use(`/${client.student}`, require("./routes/student"));

  server.get("/", (req, res) => {
    res.render(view.loader, { data:{ client: req.query.client ? req.query.client : null }});
  });
  server.get("/testmail*",(_,res)=>{
    res.render("mail/verification.ejs",{link:"/auth",username:"ranjanistc",email:"email@te"});
  })
  server.get("/home", (_req, res) => {
    res.render(view.homepage);
  });

  server.get("/plans", (_request, res) => {
    res.render(view.plans);
  });

  server.get("/404", (_req, _res, next) => {
    next();
  });
  server.get("/403", (_req, _res, next) => {
    next();
  });
  server.get("/500", (req, res, next) => {
    next();
  });

  server.use((req, res, next) => {
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

  server.use((err, req, res) => {
    res.status(err.status || 500);
    res.render(view.servererror, { error: err });
  });
  const server_port = process.env.PORT|| 3000 || 80;
  const server_host = '0.0.0.0' || 'localhost';
  server.listen(server_port, server_host, ()=>{ clog(`listening on ${server_port}`)})
});
