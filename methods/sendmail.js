const cpath = "config/config.json";
const nodemailer = require("nodemailer"),
  config = require(`../${cpath}`),
  readline = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout,
  }),
  { token } = require("./../workers/common/inspector");

console.log(`\nUsing config from ${cpath}.\n`);

readline.question("Receipent: ", (receipent) => {
  const to = receipent.trim();
  if (!to) return process.exit(0);
  readline.question("Subject: (Schemester Test Mail)", (subject) => {
    const sub = subject ? subject.trim() : "Schemester Test Mail";
    readline.question(
      "Body: (This email was sent during schemester server emailing process test. Ignore.)",
      (body) => {
        let text = body
          ? body.trim()
          : "This email was sent during schemester server emailing process test. Ignore.";
        if (body) text += "\nThis is a test email, ignore.";
        readline.question("Confirm to send? (y/n): ", (conf = "n") => {
          if (conf.toLowerCase() !== "y") {
            return process.exit(0);
          }
          console.log("Sending...");
          try {
            nodemailer
              .createTransport({
                host: token.verify(config.mail.host),
                secureConnection: config.mail.secureConnection,
                port: config.mail.port,
                auth: {
                  user: token.verify(config.mail.auth.user),
                  pass: token.verify(config.mail.auth.pass),
                },
                starttls: {
                  ciphers: token.verify(config.mail.starttls.ciphers),
                },
              })
              .sendMail({
                from: token.verify(config.email),
                to: to,
                subject: sub,
                text: text,
              })
              .then((info) => {
                console.log(info);
                if (info.accepted.includes(to)) {
                  console.log(
                    "Email sent successfully to: " +
                      to +
                      ", from:" +
                      token.verify(config.email)
                  );
                } else console.log("Email sending failed :" + to);
                process.exit(0);
              })
              .catch((error) => {
                console.log("Failed!");
                console.log(error);
                process.exit(0);
              });
          } catch (e) {
            if (String(e).includes("invalid signature")) {
              console.log("INVALID SSH");
            } else console.log(e);
            process.exit(0);
          }
        });
      }
    );
  });
});
