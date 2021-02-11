const nodemailer = require("nodemailer"),
  ejs = require("ejs"),
  path = require("path"),
  { appname, email, mail } = require("../../config/config.js"),
  {token,emailValid} = require("./inspector"),
  shared = require("./sharedata"),
  { code } = require("../../public/script/codes");

class Mailer {
  constructor() {
    this.type = {
      alert:"alert",
      action:"action"
    }
  }

  async sendMail(type,mail){
    mail['appname'] = appname;
    const data = await ejs.renderFile(path.join(__dirname + `/../../views/mail/${type}.ejs`),{mail:mail});
    return await Promise.resolve(
      sendEmail(mail.for, mail.title, data)
    );
  }

  async sendAlertMail(alert,body){
    return await this.sendMail(this.type.alert,shared.getAlertMailData(alert,{
      receiver:body.to,
      client:body.client,
      greet: shared.getGreet(action,body.username),
      text:shared.getStartTextByMailType(alert,body),
    }))
  }

  async sendActionMail(action,body){
    return await this.sendMail(this.type.action,shared.getActionMailData(action,{
      receiver:body.to,
      title:shared.getTitleByMailType(action,body),
      actions:shared.getActionByMailType(action,body),
      greet: shared.getGreet(action,body.username),
      starttext:shared.getStartTextByMailType(action,body)
    }));
  }

  async sendVerificationEmail(body) {
    return await this.sendActionMail(code.mail.ACCOUNT_VERIFICATION,body);
  }
  async sendPasswordResetEmail(body) {
    return await this.sendActionMail(code.mail.RESET_PASSWORD,body);
  }
  async sendInvitationEmail(invitee, body) {
    body['invitee'] = invitee;
    return await this.sendActionMail(code.mail.INSTITUTION_INVITATION,body);
  }
}

async function sendEmail(to, subject, html) {
  if(!emailValid(to)) return code.eventmsg(code.mail.ERROR_MAIL_NOTSENT, code.auth.EMAIL_INVALID);
  const doc = nodemailer
    .createTransport({
      host: token.verify(mail.host),
      secureConnection: mail.secureConnection,
      port: mail.port,
      auth: {
        user: token.verify(mail.auth.user),
        pass: token.verify(mail.auth.pass),
      },
      starttls: {
        ciphers: token.verify(mail.starttls.ciphers),
      },
    })
    .sendMail({
      from: token.verify(email),
      to: to,
      subject: subject,
      html: html,
    })
    .then((info) => {
      return code.event(
        info.accepted.includes(to)
          ? code.mail.MAIL_SENT
          : code.mail.ERROR_MAIL_NOTSENT
      );
    })
    .catch((error) => {
      return code.eventmsg(code.mail.ERROR_MAIL_NOTSENT, error);
    });
  return doc;
}

module.exports = new Mailer();
