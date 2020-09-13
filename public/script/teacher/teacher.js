const showTeacherRegistration = (visible = true, email = null, uiid = null) => {
  checkSessionValidation(
    client.teacher,
    (_) => {
      const confirmLogout = new Dialog();
      getSessionUserData(client.teacher).then((data) => {
        confirmLogout.setDisplay(
          "Already Logged In.",
          `You are currently logged in as <b class="active">${data.username} (${data.id})</b>.
         You need to log out before creating a new account. Confirm log out?`
        );
        confirmLogout.createActions(
          ["Stay logged in", "Log out"],
          [actionType.positive, actionType.negative],
        );
        confirmLogout.onButtonClick(
          [
            () => {
              confirmLogout.hide();
            },
            () => {
              confirmLogout.loader();
              finishSession(client.teacher, (_) => {
                showTeacherRegistration(true);
              });
            }
          ]
        );
        confirmLogout.show();
      });
    },
    (_) => {
      const teachdialog = new Dialog();
      teachdialog.setDisplay(
        "Registration",
        "Provide your details, including the unique ID of your institute (UIID).",
        '/graphic/illustrations/teacherview.svg'

      );
      teachdialog.createInputs(
        ["UIID", "Your email address", "Your name", "Create password"],
        [
          "Your institution's unique ID",
          "youremail@example.domain",
          "Sunaina Kapoor, or something.",
          "A strong password."
        ],
        ["text", "email", "text", "password"],
        [
          validType.nonempty,
          validType.email,
          validType.name,
          validType.password
        ],
        [uiid, email, null, null],
        [null, "email", "name", "newpassword"]
      );

      teachdialog.validate(0, (_) => {
        teachdialog.getInput(1).focus();
      });
      teachdialog.validate(1, (_) => {
        teachdialog.getInput(2).focus();
      });
      teachdialog.validate(2, (_) => {
        teachdialog.getInput(3).focus();
      });
      teachdialog.validate(3);

      teachdialog.createActions(
        ["Register as Teacher", "Abort"],
        [bodyType.positive, bodyType.neutral]
      );
      teachdialog.onButtonClick([
          (_) => {
            if (!teachdialog.allValid()) {
              clog("invalid");
              teachdialog.validateNow(0, (_) => {
                teachdialog.getInput(1).focus();
              });
              teachdialog.validateNow(1, (_) => {
                teachdialog.getInput(2).focus();
              });
              teachdialog.validateNow(2, (_) => {
                teachdialog.getInput(3).focus();
              });
              teachdialog.validateNow(3);
            } else {
              teachdialog.loader();
              clog("posting");
              postData(post.teacher.auth, {
                action: post.teacher.action.signup,
                pseudo: true,
                uiid: teachdialog.getInputValue(0),
                email: teachdialog.getInputValue(1),
                username: teachdialog.getInputValue(2),
                password: teachdialog.getInputValue(3),
              })
                .then((response) => {
                  clog(response);
                  if(response.event == code.auth.ACCOUNT_CREATED){
                    clog(response);
                    saveDataLocally(response.user);
                    return relocate(locate.teacher.session, {
                      u: response.user.uid,
                      target: locate.teacher.target.dash,
                    });
                  }
                  teachdialog.loader(false);
                  switch (response.event) {
                    case code.auth.USER_EXIST:{
                        teachdialog.inputField[1].showError(
                          "Account already exists."
                        );
                        return snackBar("Try signing in?", "Login", true, (_) => {
                          refer(locate.teacher.login, {
                            email: teachdialog.getInputValue(1),
                            uiid: teachdialog.getInputValue(0),
                          });
                        });
                    };
                    case code.inst.INSTITUTION_NOT_EXISTS:return teachdialog.inputField[0].showError(
                      "No institution with this UIID found."
                    );
                    case code.auth.EMAIL_INVALID:return teachdialog.inputField[1].showError(
                      "Invalid email address."
                    );
                    //todo: check invalidity and show suggesstions
                    case code.auth.PASSWORD_INVALID:return teachdialog.inputField[3].showError(
                      "Weak password, try something better."
                    );
                    case code.auth.NAME_INVALID:return teachdialog.inputField[3].showError(
                      "This doesn't seem like a name."
                    );
                    default: {
                      clog("in default");
                      teachdialog.hide();
                      return snackBar(`${response.event}:${response.msg}`, "Report");
                    }
                  }
                }).catch((e) => {
                  teachdialog.loader(false);
                  snackBar(e, "Report");
                });
            }
          },
          (_) => {
            teachdialog.hide();
          }
        ]
      );
      teachdialog.existence(visible);
    }
  );
};
