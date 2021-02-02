const path = require("path");

const { token } = require("./../workers/common/inspector"),
  readline = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout,
  });

const fs = require("fs");
const fileName = "./../config/config.json";
const file = require(fileName);

function ex(final = false) {
  console.log("saving...");
  fs.writeFile(
    path.join(__dirname + fileName),
    JSON.stringify(file, null, 2),
    function writeJSON(err) {
      if (err) return console.log(err);
      console.log(
        final
          ? "All masked keys updated"
          : "Except previous one and all remaining, only above keys updated."
      );
      process.exit(0);
    }
  );
}
const keysupdate = (_) => {
  readline.question(
    "Confirm to update all masked config keys [y/n]:",
    (value) => {
      value = value.trim().toLowerCase();
      if (value == "n" || value != "y") {
        return process.exit(0);
      }
      console.log("x -> exit anytime, enter -> skip");
      readline.question("email:", (V) => {
        file.email = V == "x" ? ex() : V == "" ? file.email : token.sign(V);
        readline.question("db.username:", (V) => {
          file.db.username = V == "x" ? ex() : V == "" ? file.db.username : token.sign(V);
          readline.question("db.pass:", (V) => {
            file.db.pass =
              V == "x" ? ex() : V == "" ? file.db.pass : token.sign(V);
            readline.question("db.dpass:", (V) => {
              file.db.dpass =
                V == "x" ? ex() : V == "" ? file.db.dpass : token.sign(V);
              readline.question("db.cpass:", (V) => {
                file.db.cpass =
                  V == "x" ? ex() : V == "" ? file.db.cpass : token.sign(V);
                readline.question("pusher.appId:", (V) => {
                  file.pusher.appId =
                    V == "x" ? ex() : V == "" ? file.pusher.appId : V;
                  readline.question("pusher.key:", (V) => {
                    file.pusher.key = V == "x" ? ex() : V == "" ? file.pusher.key : token.sign(V);
                    readline.question("pusher.secret:", (V) => {
                      file.pusher.secret = V == "x"? ex(): V == ""? file.pusher.secret: token.sign(V);
                      readline.question("pusher.cluster:", (V) => {
                        file.pusher.cluster = V == "x" ? ex() : V == "" ? file.pusher.cluster : V;
                        readline.question("pusher.useTLS:", (V) => {
                          file.pusher.useTLS = V == "x"? ex(): V == ""? file.pusher.useTLS: V == "true";
                          readline.question("mail.host:", (V) => {
                            file.mail.host = V == "x" ? ex() : V == "" ? file.mail.host : token.sign(V);
                            readline.question("mail.secureConnection:", (V) => {
                              file.mail.secureConnection = V == "x"? ex(): V == ""? file.mail.secureConnection: V == "true";
                              readline.question("mail.port:", (V) => {
                                file.mail.port =V == "x"? ex(): V == ""? file.mail.port: Number(V);
                                readline.question("mail.auth.user:", (V) => {
                                  file.mail.auth.user =V == "x"? ex(): V == ""? file.mail.auth.user: token.sign(V);
                                  readline.question("mail.auth.pass:", (V) => {
                                    file.mail.auth.pass =V == "x"? ex(): V == ""? file.mail.auth.pass: token.sign(V);
                                    readline.question("mail.starttls.ciphers:",(V) => {
                                        file.mail.starttls.ciphers =V == "x"? ex(): V == ""? file.mail.starttls.ciphers: token.sign(V);
                                        readline.question("session.adminkey:",(V) => {
                                            file.session.adminkey =V == "x"? ex(): V == ""? file.session.adminkey: token.sign(V);
                                            readline.question("session.teacherkey:",(V) => {
                                                file.session.teacherkey =V == "x"? ex(): V == ""? file.session.teacherkey: token.sign(V);
                                                readline.question("session.studentkey:",(V) => {
                                                    file.session.studentkey = V == "x"? ex(): V == ""? file.session.studentkey: token.sign(V);
                                                    if (V != "x") ex(true);
                                                });
                                            });
                                        });
                                    });
                                  });
                                });
                              });
                            });
                          });
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    }
  );
};

// keysupdate();
console.log('Not supported. Use "npm run newconfig"');
process.exit(0);