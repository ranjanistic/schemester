var nodeoutlook = require("nodejs-nodemailer-outlook");
var code = require('../hardcodes/events.js');
var testhtml =  '<div style=\"background-color:#216bf3;text-size:44px; text-align:center;width:100%;color:white\">Hey there</div><div style=\"background-color:white;color:black\"><p>This is a test verification email to check the functioning of nodemailer.</p><br/><p>Regards<br/>Schemester Devs.</p></div>';

module.exports = sendMail = (receipent,type)=>{
    switch(type){
        case code.mail.ACCOUNT_VERIFICATION:{
            
            return true;
        }
        default:return code.mail.ERROR_MAIL_NOTSENT;
    }
}

nodemailSend = (receiver,subject,htmlbody,attachment = null)=>{
    nodeoutlook.sendEmail({
    auth: {
        user: "schemester@outlook.in",
        pass: "********",
    },
    from: "schemester@outlook.com",
    to: [receiver],
    subject: [subject],
    html: [htmlbody],
    replyTo: "schemester@outlook.in",
    onError: (e) => console.log(e),
    onSuccess: (i) => console.log(i),
    });
}
