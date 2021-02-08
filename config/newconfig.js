require("dotenv").config({ silent: process.env.NODE_ENV == "production" });
const path = require("path");

const readline = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout,
  }),
  jwt = require("jsonwebtoken");

const token = {
  sign: (value) => {
    return jwt.sign(value, process.env.SSH);
  },
};
const fs = require("fs");
const fileName = "/config.json";
let file;
try {
  file = require(`.${fileName}`);
} catch {
  file = {
    appname: "",
    email: "",
    site: "",
    db: {
      username: "",
      pass: "",
      name: "",
      admin_collection: "",
      institute_collection: "",
      session_collection: "",
      dpass: "",
      cpass: "",
    },
    pusher: {
      appId: "",
      key: "",
      secret: "",
      cluster: "",
      useTLS: true,
    },
    mail: {
      host: "",
      secureConnection: false,
      port: 0,
      auth: {
        user: "",
        pass: "",
      },
      starttls: {
        ciphers: "",
      },
    },
    session: {
      publickey: "",
      adminkey: "",
      teacherkey: "",
      studentkey: "",
    },
  };
  fs.writeFile(
    path.join(__dirname + fileName),
    JSON.stringify(file, null, 2),
    (err) => {
      if (err) return console.log(err);
    }
  );
}

function ex(final = false) {
  console.log("saving...");
  fs.writeFile(
    path.join(__dirname + fileName),
    JSON.stringify(file, null, 2),
    (err) => {
      if (err) return console.log(err);
      console.log(
        final
          ? "All keys updated at config/config.json."
          : "Except this one and all remaining, above keys updated at config/config.json."
      );
      console.log(
        "\nDon't forget to update your changed keys at your environment variables in production, or anywhere you've set, too."
      );
      process.exit(0);
    }
  );
}
((_) => {
  if (!process.env.SSH) {
    console.log(
      "Create a .env file at root of this project, and set SSH = <YOUR_SUPER_SECRET_KEY> in it. Then run this script."
    );
    return process.exit(0);
  }
  readline.question("Proceed to update configuration keys [y/n]:", (value) => {
    value = value.trim().toLowerCase();
    if (value == "n" || value != "y") {
      return process.exit(0);
    }
    console.log("\nInstructions: x -> save & exit anytime, enter -> skip\n");
    readline.question("appname:", (V) => {
      file.appname = V == "x" ? ex() : V == "" ? file.appname : V;
      readline.question("email:", (V) => {
        file.email = V == "x" ? ex() : V == "" ? file.email : token.sign(V);
        readline.question("website:", (V) => {
          file.site = V == "x" ? ex() : V == "" ? file.site : V;
          console.log("\nFor MongoDB database access.");
          readline.question("db.username:", (V) => {
            file.db.username =
              V == "x" ? ex() : V == "" ? file.db.username : token.sign(V);
            readline.question("db.pass:", (V) => {
              file.db.pass =
                V == "x" ? ex() : V == "" ? file.db.pass : token.sign(V);

              readline.question("db.name (Database name):", (V) => {
                file.db.name = V == "x" ? ex() : V == "" ? file.db.name : V;
                readline.question(
                  "db.admin_collection (Admin collection name):",
                  (V) => {
                    file.db.admin_collection =
                      V == "x" ? ex() : V == "" ? file.db.admin_collection : V;
                    readline.question(
                      "db.institute_collection (Institute collection name):",
                      (V) => {
                        file.db.institute_collection =
                          V == "x"
                            ? ex()
                            : V == ""
                            ? file.db.institute_collection
                            : V;
                        readline.question(
                          "db.session_collection (Session collection name):",
                          (V) => {
                            file.db.session_collection =
                              V == "x"
                                ? ex()
                                : V == ""
                                ? file.db.session_collection
                                : V;
                            readline.question(
                              "db.alert_collection (Alert collection name):",
                              (V) => {
                                file.db.alert_collection =
                                  V == "x"
                                    ? ex()
                                    : V == ""
                                    ? file.db.alert_collection
                                    : V;
                                readline.question(
                                  "db.oauth_collection (Oauth collection name):",
                                  (V) => {
                                    file.db.oauth_collection =
                                      V == "x"
                                        ? ex()
                                        : V == ""
                                        ? file.db.oauth_collection
                                        : V;

                                    readline.question(
                                      "db.dpass (database method access password):",
                                      (V) => {
                                        file.db.dpass =
                                          V == "x"
                                            ? ex()
                                            : V == ""
                                            ? file.db.dpass
                                            : token.sign(V);
                                        readline.question(
                                          "db.cpass (collection(s) method access password):",
                                          (V) => {
                                            file.db.cpass =
                                              V == "x"
                                                ? ex()
                                                : V == ""
                                                ? file.db.cpass
                                                : token.sign(V);
                                            console.log(
                                              "\nFor Pusher API service."
                                            );
                                            readline.question(
                                              "pusher.appId:",
                                              (V) => {
                                                file.pusher.appId =
                                                  V == "x"
                                                    ? ex()
                                                    : V == ""
                                                    ? file.pusher.appId
                                                    : V;
                                                readline.question(
                                                  "pusher.key:",
                                                  (V) => {
                                                    file.pusher.key =
                                                      V == "x"
                                                        ? ex()
                                                        : V == ""
                                                        ? file.pusher.key
                                                        : token.sign(V);
                                                    readline.question(
                                                      "pusher.secret:",
                                                      (V) => {
                                                        file.pusher.secret =
                                                          V == "x"
                                                            ? ex()
                                                            : V == ""
                                                            ? file.pusher.secret
                                                            : token.sign(V);
                                                        readline.question(
                                                          "pusher.cluster:",
                                                          (V) => {
                                                            file.pusher.cluster =
                                                              V == "x"
                                                                ? ex()
                                                                : V == ""
                                                                ? file.pusher
                                                                    .cluster
                                                                : V;
                                                            readline.question(
                                                              "pusher.useTLS (Boolean):",
                                                              (V) => {
                                                                file.pusher.useTLS =
                                                                  V == "x"
                                                                    ? ex()
                                                                    : V == ""
                                                                    ? file
                                                                        .pusher
                                                                        .useTLS
                                                                    : V ==
                                                                      "true";
                                                                console.log(
                                                                  "\nFor server mailing service."
                                                                );
                                                                readline.question(
                                                                  "mail.host:",
                                                                  (V) => {
                                                                    file.mail.host =
                                                                      V == "x"
                                                                        ? ex()
                                                                        : V ==
                                                                          ""
                                                                        ? file
                                                                            .mail
                                                                            .host
                                                                        : token.sign(
                                                                            V
                                                                          );
                                                                    readline.question(
                                                                      "mail.secureConnection (Boolean):",
                                                                      (V) => {
                                                                        file.mail.secureConnection =
                                                                          V ==
                                                                          "x"
                                                                            ? ex()
                                                                            : V ==
                                                                              ""
                                                                            ? file
                                                                                .mail
                                                                                .secureConnection
                                                                            : V ==
                                                                              "true";
                                                                        readline.question(
                                                                          "mail.port (Integer):",
                                                                          (
                                                                            V
                                                                          ) => {
                                                                            file.mail.port =
                                                                              V ==
                                                                              "x"
                                                                                ? ex()
                                                                                : V ==
                                                                                  ""
                                                                                ? file
                                                                                    .mail
                                                                                    .port
                                                                                : Number(
                                                                                    V
                                                                                  );
                                                                            readline.question(
                                                                              "mail.auth.user (mail address):",
                                                                              (
                                                                                V
                                                                              ) => {
                                                                                file.mail.auth.user =
                                                                                  V ==
                                                                                  "x"
                                                                                    ? ex()
                                                                                    : V ==
                                                                                      ""
                                                                                    ? file
                                                                                        .mail
                                                                                        .auth
                                                                                        .user
                                                                                    : token.sign(
                                                                                        V
                                                                                      );
                                                                                readline.question(
                                                                                  "mail.auth.pass (raw password):",
                                                                                  (
                                                                                    V
                                                                                  ) => {
                                                                                    file.mail.auth.pass =
                                                                                      V ==
                                                                                      "x"
                                                                                        ? ex()
                                                                                        : V ==
                                                                                          ""
                                                                                        ? file
                                                                                            .mail
                                                                                            .auth
                                                                                            .pass
                                                                                        : token.sign(
                                                                                            V
                                                                                          );
                                                                                    readline.question(
                                                                                      "mail.starttls.ciphers:",
                                                                                      (
                                                                                        V
                                                                                      ) => {
                                                                                        file.mail.starttls.ciphers =
                                                                                          V ==
                                                                                          "x"
                                                                                            ? ex()
                                                                                            : V ==
                                                                                              ""
                                                                                            ? file
                                                                                                .mail
                                                                                                .starttls
                                                                                                .ciphers
                                                                                            : token.sign(
                                                                                                V
                                                                                              );
                                                                                        console.log(
                                                                                          "\nFor session management."
                                                                                        );
                                                                                        readline.question(
                                                                                          "session.publickey:",
                                                                                          (
                                                                                            V
                                                                                          ) => {
                                                                                            file.session.publickey =
                                                                                              V ==
                                                                                              "x"
                                                                                                ? ex()
                                                                                                : V ==
                                                                                                  ""
                                                                                                ? file
                                                                                                    .session
                                                                                                    .publickey
                                                                                                : V;
                                                                                            readline.question(
                                                                                              "session.adminkey (secret):",
                                                                                              (
                                                                                                V
                                                                                              ) => {
                                                                                                file.session.adminkey =
                                                                                                  V ==
                                                                                                  "x"
                                                                                                    ? ex()
                                                                                                    : V ==
                                                                                                      ""
                                                                                                    ? file
                                                                                                        .session
                                                                                                        .adminkey
                                                                                                    : token.sign(
                                                                                                        V
                                                                                                      );
                                                                                                readline.question(
                                                                                                  "session.teacherkey (secret):",
                                                                                                  (
                                                                                                    V
                                                                                                  ) => {
                                                                                                    file.session.teacherkey =
                                                                                                      V ==
                                                                                                      "x"
                                                                                                        ? ex()
                                                                                                        : V ==
                                                                                                          ""
                                                                                                        ? file
                                                                                                            .session
                                                                                                            .teacherkey
                                                                                                        : token.sign(
                                                                                                            V
                                                                                                          );
                                                                                                    readline.question(
                                                                                                      "session.studentkey (secret):",
                                                                                                      (
                                                                                                        V
                                                                                                      ) => {
                                                                                                        file.session.studentkey =
                                                                                                          V ==
                                                                                                          "x"
                                                                                                            ? ex()
                                                                                                            : V ==
                                                                                                              ""
                                                                                                            ? file
                                                                                                                .session
                                                                                                                .studentkey
                                                                                                            : token.sign(
                                                                                                                V
                                                                                                              );
                                                                                                        if (
                                                                                                          V !=
                                                                                                          "x"
                                                                                                        )
                                                                                                          ex(
                                                                                                            true
                                                                                                          );
                                                                                                      }
                                                                                                    );
                                                                                                  }
                                                                                                );
                                                                                              }
                                                                                            );
                                                                                          }
                                                                                        );
                                                                                      }
                                                                                    );
                                                                                  }
                                                                                );
                                                                              }
                                                                            );
                                                                          }
                                                                        );
                                                                      }
                                                                    );
                                                                  }
                                                                );
                                                              }
                                                            );
                                                          }
                                                        );
                                                      }
                                                    );
                                                  }
                                                );
                                              }
                                            );
                                          }
                                        );
                                      }
                                    );
                                  }
                                );
                              }
                            );
                          }
                        );
                      }
                    );
                  }
                );
              });
            });
          });
        });
      });
    });
  });
})();
