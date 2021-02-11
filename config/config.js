require("dotenv").config();
const env = process.env;

module.exports = {
  SSH: env.SSH,
  NODE_ENV: env.NODE_ENV,
  isDev: env.NODE_ENV!=='production',
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
    alert_collection: env.ALERT_COL,
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
