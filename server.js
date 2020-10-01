const express = require("express"),
  bodyParser = require("body-parser"),
  {client,view,clog,get} = require("./public/script/codes"),
  server = express(),
  mongo = require('./config/db');
  server.set("view engine", "ejs");
  server.use(express.static("public"));
  server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());

//For localhost https env.
// const https = require('https'),
// fs = require('fs'),
// key = fs.readFileSync('./localhost-key.pem'),
// cert = fs.readFileSync('./localhost.pem');

mongo.connectToServer(( err )=>{
  if (err) return clog(err);
  clog(`Connected to ${mongo.getDb().databaseName}`);
  server.use(`/${client.admin}`, require(`./routes/${client.admin}`));
  server.use(`/${client.teacher}`, require(`./routes/${client.teacher}`));
  server.use(`/${client.student}`, require(`./routes/${client.student}`));

  server.get(get.root, (req, res) => {
    res.render(view.loader, { data:{ client: req.query.client }});
  });
  server.get(get.home, (_, res) => {
    res.render(view.homepage);
  });
  server.get(get.offline,(_,res)=>{
    res.render(view.offline)
  });
  server.get(get.notfound, (__, _, next) => {
    next();
  });
  server.get(get.forbidder, (__, _, next) => {
    next();
  });
  server.get(get.servererror, (__, _, next) => {
    next();
  });
  server.use((req, res, _) => {
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

  server.use((err, _, res) => {
    res.status(err.status || 500);
    res.render(view.servererror, { error: err });
  });
  const server_port = process.env.PORT|| 3000 || 80;
  const server_host = '0.0.0.0' || 'localhost';
  // https.createServer({key: key, cert: cert }, server).listen(server_port, server_host, ()=>{ clog(`listening on ${server_port}`)})
  server.listen(server_port, server_host, ()=>{ clog(`listening on ${server_port}`)})
});
