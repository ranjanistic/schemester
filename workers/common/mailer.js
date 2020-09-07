const nodemailer = require("nodemailer"),
    ejs = require("ejs"),
    path = require("path"),
    { code, client, clog } = require("../../public/script/codes");

class Mailer {
  constructor() {
  }
  async sendVerificationEmail(body) {
    let data = await ejs.renderFile(path.join(__dirname+"/../../views/mail/verification.ejs"), { username: body.username,email:body.to,link:body.link });
    return await Promise.resolve(sendEmail(body.to,'Schemester Account Verification',data));
  }
  sendInvitationEmail(invitee, data) {
    switch (invitee) {
      case client.admin:{
        }
        break;
      case client.teacher:{
        }
        break;
      case client.student:{
        }
        break;
    }
  }
}

async function sendEmail(to, subject, html) {
  var transporter = nodemailer.createTransport({
    host: "smtp.office365.com",
    secureConnection: false,
    port: 587,
    auth: {
      user: "schemester@outlook.in",
      pass: "#schememail<outlook.web.password/>",
    },
    starttls: {
      ciphers: "SSLv3",
    },
  });

  var mailOptions = {
    from: "schemester@outlook.in",
    to: to,
    subject: subject,
    html: html,
  };

  let doc = transporter.sendMail(mailOptions).then(info=>{
    console.log("Email sent: " + info.response);
    return code.event(code.mail.MAIL_SENT);
  }).catch(error=>{
    console.log(error);
    return code.event(code.mail.ERROR_MAIL_NOTSENT);
  });
  clog(doc);
  return doc;
}

module.exports = new Mailer();
