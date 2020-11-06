const nodemailer = require("nodemailer"),
  config = require("../config/config.json"),
  readline = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout,
  }),
  jwt = require("jsonwebtoken");

readline.question("Receipent (press enter to use default):", (receipent) => {
  const to = receipent ? receipent.trim() : "priyanshuranjan88@gmail.com";
  readline.question("Subject (press enter to use default):", (subject) => {
    const sub = subject ? subject.trim() : "Schemester Test Mail";
    readline.question("Body (press enter to use default):", (body) => {
      let text = body
        ? body.trim()
        : "This email was sent during schemester server emailing process test. Ignore.";
      if (body) text += "\nThis is a test email, ignore.";
      console.log("Sending...");
      nodemailer
        .createTransport({
          host: config.mail.host,
          secureConnection: config.mail.secureConnection,
          port: config.mail.port,
          auth: {
            user: config.mail.auth.user,
            pass: jwt.verify(config.mail.auth.pass, config.ssh),
          },
          starttls: config.mail.starttls,
        })
        .sendMail({
          from: config.email,
          to: to,
          subject: sub,
          text: text,
        })
        .then((info) => {
          console.log(info);
          if (info.accepted.includes(to)) {
            console.log(
              "Email sent successfully to: " + to + ", from:" + config.email
            );
          } else console.log("Email sending failed :" + to);
          process.exit(0);
        })
        .catch((error) => {
          console.log("Failed!");
          console.log(error);
          process.exit(0);
        });
    });
  });
});
