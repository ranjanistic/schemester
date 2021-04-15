const express = require("express"),
  helmet = require("helmet"),
  { client, view, get } = require("./public/script/codes"),
  server = express(),
  cors = require("cors"),
  { render } = require("./workers/common/inspector"),
  { search } = require("./workers/common/indices"),
  { connectToDB } = require("./config/db"),
  https = require("https"),
  fs = require("fs"),
  rateLimit = require("express-rate-limit");

server.use(helmet());
server.set("view engine", "ejs");
server.set("trust proxy", 1);
server.use(express.static("public"));
server.use(express.urlencoded({ extended: true }));
server.use(express.json());
server.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    handler: (_, res) => {
      render(res, view.ratelimited);
    },
    skipFailedRequests: true,
  })
);

connectToDB(require("./config/config.js").db.dpass, (err, dbname) => {
  if (err)
    return console.error(
      err.code == 8000
        ? "DB CREDS MISMATCH"
        : err +
            `\nIf you don't have local mongodb server running at port 27017, then set up that first.`
    );
  console.log(`Connected to ${dbname}`);
  const alert = require("./workers/common/alerts");
  server.use(`/${client.admin}`, require(`./routes/${client.admin}`));
  server.use(`/${client.teacher}`, require(`./routes/${client.teacher}`));
  server.use(`/${client.student}`, require(`./routes/${client.student}`));
  server.use("/oauth", cors(), require("./routes/oauth"));

  server.get(get.root, (req, res) => {
    render(res, view.loader, { data: { client: req.query.client } });
  });
  server.get(get.home, async (_, res) => {
    render(res, view.homepage, {
      alerts: await alert.globalAlerts(),
    });
  });
  server.get(get.tour, (_, res) => {
    render(res, view.tour, { filename: "slide", total: 7 });
  });
  server.get(get.search, (req, res) => {
    render(res, view.search, {
      query: req.query.q,
      results: search(req.query.q),
    });
  });

  server.get(get.offline, (_, res) => {
    render(res, view.offline);
  });

  server.get(get.notfound, (__, _, next) => {
    next();
  });
  server.get(get.forbidden, (__, _, next) => {
    next();
  });
  server.get(get.servererror, (__, _, next) => {
    next();
  });
  server.use((req, res, _) => {
    res.status(404);
    res.format({
      html: () => {
        render(res, view.notfound, { url: req.url });
      },
      json: () => {
        res.json({ error: "Not found" });
      },
      default: () => {
        res.type("txt").send("Not found");
      },
    });
  });

  server.use((err, _, res) => {
    res.status(err.status || 500);
    render(res, view.servererror, { error: err });
  });

  const server_port = process.env.PORT || 3000 || 80;
  const server_host = "0.0.0.0" || "localhost";

  try {
    //for local https dev server
    const key = fs.readFileSync("./localhost-key.pem");
    const cert = fs.readFileSync("./localhost.pem");
    https
      .createServer({ key: key, cert: cert }, server)
      .listen(server_port, server_host, () => {
        console.log(`listening on ${server_port} (https)`);
      });
  } catch (e) {
    //for cloud server
    server.listen(server_port, server_host, () => {
      console.log(`listening on ${server_port}`);
      if (server_port == 3000 && e.errno == -4058) {
        console.log(
          "\x1b[33m",
          "Warning:Server hosted via non-https protocol."
        );
        console.log("\x1b[31m", "Session will fail.");
        console.log(
          "\x1b[47m",
          "See https://github.com/ranjanistic/schemester-web/README.md#generate-localhost-certificate to supress this warning."
        );
        console.log("\x1b[0m");
      }
    });
  }
});
