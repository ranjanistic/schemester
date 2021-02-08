require("dotenv").config({ silent: process.env.NODE_ENV == 'production' });
const fs = require("fs");
const path = require("path");

const env = process.env;
const genConfig = (_) => {
  let file = {
    appname: env.APP_NAME,
    email: env.EMAIL,
    site: env.SITE,
    db: {
      username: env.DBUSER,
      pass: env.DBPASS,
      name: env.DBNAME,
      admin_collection: env.ADMIN_COL,
      institute_collection: env.INST_COL,
      session_collection: env.SESS_COL,
      alert_collection:env.ALERT_COL,
      oauth_collection: env.OAUTH_COL,
      dpass: env.DPASS,
      cpass: env.CPASS,
    },
    pusher: {
      appId: env.PUSH_ID,
      key: env.PUSH_KEY,
      secret: env.PUSH_SEC,
      cluster: env.PUSH_CLUS,
      useTLS: true,
    },
    mail: {
      host: env.MAIL_HOST,
      secureConnection: false,
      port: env.MAIL_PORT,
      auth: {
        user: env.MAILUSER,
        pass: env.MAILPASS,
      },
      starttls: {
        ciphers: env.MAILCIPHER,
      },
    },
    session: {
      publickey: env.SESSPUBKEY,
      adminkey: env.SESSADMIN,
      teacherkey: env.SESSTEACH,
      studentkey: env.SESSSTUD,
    },
  };
  fs.writeFile(
    path.join(__dirname + "/fileName.json"),
    JSON.stringify(file, null, 2),
    (err) => {
      if (err) return console.log(err);
      console.log("config.json generated from env vars.")
    }
  );
};

if(env.NODE_ENV === 'production'){
    genConfig();
} else {
  console.log("This command should be used to automatically generate config.json in production environment.\nUse `npm run newconfig` to generate your local config.json. Then use the values from this file to set you environment variables in local .env file or production server env variables as per .sample.env.\n");
}