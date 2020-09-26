const showStudentRegistration = (
  visible = true,
  email = null,
  uiid = null,
  classname = null
) => {
  loadingBox();
  checkSessionValidation(
    client.student,
    (_) => {
      const confirmLogout = new Dialog();
      getSessionUserData(client.student).then((data) => {
        confirmLogout.setDisplay(
          "Already Logged In.",
          `You are currently logged in as <b class="active">${data.username} (${data.id})</b>.
         You need to log out before creating a new account. Confirm log out?`
        );
        confirmLogout.createActions(
          ["Stay logged in", "Log out"],
          [actionType.positive, actionType.negative]
        );
        confirmLogout.onButtonClick([
          () => {
            confirmLogout.hide();
          },
          () => {
            confirmLogout.loader();
            finishSession(client.student, (_) => {
              showStudentRegistration(true);
            });
          },
        ]);
        confirmLogout.show();
      });
    },
    (_) => {
      const studialog = new Dialog();
      studialog.setDisplay(
        "Registration",
        "Provide your details, including the unique ID of your institute (UIID).",
        '/graphic/illustrations/studentview.svg'
      );
      studialog.createInputs(
        [
          "UIID",
          "Your class's name",
          "Your email address",
          "Your name",
          "Create password",
        ],
        [
          "Your institution's unique ID",
          "Type in the format of your institute.",
          "youremail@example.domain",
          "Sunaina Kapoor, or something.",
          "A strong password.",
        ],
        ["text", "text", "email", "text", "password"],
        [
          validType.nonempty,
          validType.nonempty,
          validType.email,
          validType.name,
          validType.password,
        ],
        [uiid, classname, email, null, null]
      );

      studialog.validate(0, (_) => {
        studialog.getInput(1).focus();
      });
      studialog.validate(1, (_) => {
        studialog.getInput(2).focus();
      });
      studialog.validate(2, (_) => {
        studialog.getInput(3).focus();
      });
      studialog.validate(3);

      studialog.createActions(
        ["Register as Student", "Abort"],
        [bodyType.positive, bodyType.neutral]
      );
      studialog.onButtonClick(
        [
          (_) => {
            if (!studialog.allValid()) {
              studialog.validateNow(0, (_) => {
                studialog.getInput(1).focus();
              });
              studialog.validateNow(1, (_) => {
                studialog.getInput(2).focus();
              });
              studialog.validateNow(2, (_) => {
                studialog.getInput(3).focus();
              });
              studialog.validateNow(3, (_) => {
                studialog.getInput(4).focus();
              });
              studialog.validateNow(4);
            } else {
              studialog.loader();
              postJsonData(post.student.auth, {
                action: post.student.action.signup,
                pseudo: true,
                uiid: studialog.getInputValue(0),
                classname: studialog.getInputValue(1),
                email: studialog.getInputValue(2),
                username: studialog.getInputValue(3),
                password: studialog.getInputValue(4),
              })
                .then((response) => {
                  switch (response.event) {
                    case code.auth.ACCOUNT_CREATED:
                      {
                        saveDataLocally(response.user);
                        relocate(locate.student.session, {
                          u: response.user.uid,
                          target: locate.student.target.dash,
                        });
                      }
                      break;
                    case code.auth.CLASS_NOT_EXIST:
                      {
                        studialog.inputField[1].showError(
                          "No such classroom found."
                        );
                      }
                      break;
                    case code.auth.USER_EXIST:
                      {
                        studialog.inputField[2].showError(
                          "Account already exists."
                        );
                        snackBar("Try signing in?", "Login", true, (_) => {
                          refer(locate.student.login, {
                            email: studialog.getInputValue(2),
                            uiid: studialog.getInputValue(0),
                          });
                        });
                      }
                      break;
                    case code.inst.INSTITUTION_NOT_EXISTS:
                      {
                        studialog.inputField[0].showError(
                          "No institution with this UIID found."
                        );
                      }
                      break;
                    case code.schedule.BATCH_NOT_FOUND:
                      {
                        studialog.inputField[1].showError(
                          "No such class. Don't use any special charecters."
                        );
                      }
                      break;
                    case code.auth.EMAIL_INVALID:
                      {
                        studialog.inputField[2].showError(
                          "Invalid email address."
                        );
                      }
                      break;
                    case code.auth.PASSWORD_INVALID:
                      {
                        //todo: check invalidity and show suggesstions
                        studialog.inputField[4].showError(
                          "Weak password, try something better."
                        );
                      }
                      break;
                    case code.auth.NAME_INVALID:
                      {
                        studialog.inputField[3].showError(
                          "This doesn't seem like a name."
                        );
                      }
                      break;
                    default: {
                      studialog.hide();
                      snackBar(`${response.event}:${response.msg}`, "Report");
                    }
                  }
                  studialog.loader(false);
                })
                .catch((e) => {
                  snackBar(e, "Report");
                  studialog.hide();
                });
            }
          },
          (_) => {
            studialog.hide();
          }
        ]
      );
      studialog.existence(visible);
    }
  );
};
