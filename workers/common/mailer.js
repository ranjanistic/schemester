const nodemailer = require("nodemailer"),
    ejs = require("ejs"),
    path = require("path"),
    { code, client, clog } = require("../../public/script/codes");

class Mailer {
  constructor() {}
  async sendVerificationEmail(body) {
    const data = await ejs.renderFile(path.join(__dirname+"/../../views/mail/verification.ejs"), { username: body.username,email:body.to,link:body.link });
    return await Promise.resolve(sendEmail(body.to,'Schemester Account Verification',data));
  }
  async sendPasswordResetEmail(body){
    const data = await ejs.renderFile(path.join(__dirname+"/../../views/mail/passreset.ejs"), { username: body.username,email:body.to,link:body.link });
    return await Promise.resolve(sendEmail(body.to,'Schemester Password Reset',data));
  }
  async sendInvitationEmail(invitee, body) {
    switch (invitee) {
      case client.teacher:{
        const data = await ejs.renderFile(path.join(__dirname+"/../../views/mail/invitation.ejs"), { institute:body.institute, invitor:body.invitor, email:body.to,link:body.link,usertype:invitee });
        return await Promise.resolve(sendEmail(body.to,`${body.institute} Teacher Invitation | Schemester`,data));
      }break;
      case client.student:{}break;
      case client.admin:{}break;
    }
  }
}

async function sendEmail(to, subject, html) {
  const transporter = nodemailer.createTransport({
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

  const mailOptions = {
    from: "schemester@outlook.in",
    to: to,
    subject: subject,
    html: html,
  };

  const doc = transporter.sendMail(mailOptions).then(info=>{
    clog("Email sent: " + info.response);
    return code.event(code.mail.MAIL_SENT);
  }).catch(error=>{
    clog(error);
    return code.event(code.mail.ERROR_MAIL_NOTSENT);
  });
  clog(doc);
  return doc;
}

module.exports = new Mailer();
