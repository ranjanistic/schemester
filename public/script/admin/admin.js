const showadminregistration = (isShowing = true, email = null, uiid = null) => {
  loadingBox();
  checkSessionValidation(
    client.admin,
    (_) => {
      const confirmLogout = new Dialog();
      getSessionUserData(client.admin).then((data) => {
        confirmLogout.setDisplay(
          "Already Logged In.",
          `You are currently logged in as <b class="active">${data.username} (${data.id})</b>.
         You need to log out before creating a new account. Confirm log out?`
        );
        confirmLogout.createActions(
          ["Stay logged in", "Log out"],
          [actionType.positive, actionType.negative]
        );
        confirmLogout.onButtonClick(
          [
            () => {
              confirmLogout.hide();
            },
            () => {
              confirmLogout.loader();
              finishSession(client.admin, (_) => {
                showadminregistration(true);
              });
            }
          ]
        );
        confirmLogout.show();
      });
    },
    (_) => {
      const regDial = new Dialog();
      regDial.setDisplay(
        "Create Admin Account",
        "Create a new account with a working email address (individual or institution).",
        '/graphic/illustrations/adminview.svg'

      );
      regDial.createActions(
        ["Next", "Cancel"],
        [actionType.positive, actionType.negative]
      );
      regDial.createInputs(
        [
          "Your name",
          "Email Address",
          "New Password",
          "Unique Institution ID - UIID"
        ],
        [
          "Shravan Kumar, or something?",
          "youremail@example.domain",
          "Strong password",
          "A unique ID for your institution"
        ],
        ["text", "email", "password", "text"],
        [
          validType.name,
          validType.email,
          validType.password,
          validType.username
        ],
        [null, email, null, uiid],
        ["name", "email", "new-password", "username"],
        [true, false, false, false],
        ["words", "off", "off", "off"],
      );

      regDial.validate(0, (_) => {
        regDial.getInput(1).focus();
      });
      regDial.validate(1, (_) => {
        regDial.getInput(2).focus();
      });
      regDial.validate(2, (_) => {
        regDial.getInput(3).focus();
      });
      regDial.validate(3);
      regDial.onButtonClick(
        [
          () => {
            if (!regDial.allValid()) {
              regDial.validateNow(0, (_) => {
                regDial.getInput(1).focus();
              });
              regDial.validateNow(1, (_) => {
                regDial.getInput(2).focus();
              });
              regDial.validateNow(2, (_) => {
                regDial.getInput(3).focus();
              });
              regDial.validateNow(3);
            } else {
              regDial.normalize();
              regDial.loader();
              createAccount(
                regDial,
                regDial.getInputValue(0).trim(),
                regDial.getInputValue(1).trim(),
                regDial.getInputValue(2),
                regDial.getInputValue(3).trim()
              );
            }
          },
          () => {
            regDial.hide();
          }
        ]
      );
      regDial.existence(isShowing);
    }
  );
};

const createAccount = (dialog, adminname, email, password, uiid) => {
  postJsonData(post.admin.auth, {
    action: "signup",
    username: adminname,
    email: email,
    password: password,
    uiid: uiid,
  })
    .then((result) => {
      if (result.event == code.auth.ACCOUNT_CREATED) {
        clog(result);
        saveDataLocally(result.user);
        return relocate(locate.admin.session, {
          u: result.user.uid,
          target: locate.admin.target.register,
        });
      }
      dialog.loader(false);
      switch (result.event) {
        case code.auth.USER_EXIST: {
          dialog.inputField[1].showError("Account already exists.");
          return snackBar("Try signing in?", "Login", true, (_) => {
            refer(locate.admin.login, { email: email, uiid: uiid });
          });
        }
        case code.server.UIID_TAKEN:
          return dialog.inputField[3].showError(
            "This UIID is not available. Try something different."
          );
        case code.auth.EMAIL_INVALID:
          return dialog.inputField[1].showError("Invalid email address.");
        //todo: check invalidity and show suggesstions
        case code.auth.PASSWORD_INVALID:
          return dialog.inputField[2].showError(
            "Weak password, try something better."
          );
        case code.auth.NAME_INVALID:
          return dialog.inputField[0].showError(
            "This doesn't seem like a name."
          );
        default:
          return snackBar(`${result.event}:${result.msg}`, "Report");
      }
    })
    .catch((error) => {
      dialog.loader(false);
      clog(error);
      snackBar(error, "Report");
    });
};

function linkGenerator(target) {
  clog("link generator");
  loadingBox(
    true,
    "Generating Link",
    `A link is being created for your to share with ${target}s of ${localStorage.getItem(
      "uiid"
    )} institute`
  );
  postData(post.admin.manage, {
    type: "invitation",
    action: "create",
    target: target,
  })
    .then((response) => {
      clog("link generate response");
      clog(response);
      if (
        response.event == code.invite.LINK_EXISTS ||
        response.event == code.invite.LINK_CREATED
      ) {
        clog("link generated box");
        let linkdialog = new Dialog();
        linkdialog.setDisplay(
          "Invitation Link",
          `<center><a href="${response.link}">${response.link}</a>
            <br/>This Link will automatically expire on <b>${getProperDate(
              String(response.exp)
            )}</b><br/><br/>
            <div class="switch-view" id="teachereditschedulecontainer">
              <span class="switch-text positive">Allow new teachers to add schedule?</span>
              <label class="switch-container">
                <input type="checkbox" id="teachereditschedulei">
                <span class="switch-positive" id="teachereditscheduleview"></span>
              </label>
          </div>
          </center>`
        );
        this.allowteacherschedule = new Switch("teachereditschedulei");
        postJsonData(post.admin.manage, {
          type: "preferences",
          action: "get",
          specific: "allowTeacherAddSchedule",
        }).then((allowTeacherAddSchedule) => {
          clog(allowTeacherAddSchedule);
          clog("yeas");
          this.allowteacherschedule.turn(allowTeacherAddSchedule);
        });
        this.allowteacherschedule.onTurnChange(
          (_) => {
            postJsonData(post.admin.manage, {
              type: "preferences",
              action: "set",
              specific: "allowTeacherAddSchedule",
              allow: true,
            }).then((resp) => {
              this.allowteacherschedule.turn(resp.event == code.OK);
            });
          },
          (_) => {
            postJsonData(post.admin.manage, {
              type: "preferences",
              action: "set",
              specific: "allowTeacherAddSchedule",
              allow: false,
            }).then((resp) => {
              this.allowteacherschedule.turn(resp.event != code.OK);
            });
          }
        );
        linkdialog.createActions(
          ["Disable Link", "Copy", "Done"],
          [actionType.negative, actionType.positive, actionType.neutral]
        );
        linkdialog.onButtonClick(
          [
            (_) => {
              this.revokeLink(target);
            },
            (_) => {
              navigator.clipboard
                .writeText(response.link)
                .then((_) => {
                  snackBar("Link copied to clipboard.");
                })
                .catch((err) => {
                  snackBar(
                    "Failed to copy, please do it manually.",
                    null,
                    false
                  );
                });
            },
            (_) => {
              linkdialog.hide();
            }
          ]
        );
        linkdialog.show();
      }
      switch (response.event) {
        case code.invite.LINK_EXISTS:
          return snackBar("This link already exists and can be shared.");
        case code.invite.LINK_CREATED:
          return snackBar("Share this with teachers of your institution.");
        case code.invite.LINK_CREATION_FAILED:
          return snackBar(`Unable to generate link:${response.msg}`, "Report");
        default:
          return snackBar(`Error:${response.event}:${response.msg}`, "Report");
      }
    })
    .catch((error) => {
      clog(error);
      snackBar(error);
    });
}

function revokeLink(target) {
  clog("revoke link");
  postData(post.admin.manage, {
    type: "invitation",
    action: "disable",
    target: target,
  })
    .then((response) => {
      if (response.event == code.invite.LINK_DISABLED) {
        clog("link disabled");
        snackBar("All links are inactive now.", null, false);
        let nolinkdialog = new Dialog();
        nolinkdialog.setDisplay(
          "Generate Link",
          `Create a link to share with ${target}s of ${localStorage.getItem(
            "uiid"
          )} institute, 
          so that they can access and take part in schedule management.`
        );
        nolinkdialog.createActions(
          ["Create Link", "Abort"],
          [actionType.positive, actionType.negative],
        );
        nolinkdialog.onButtonClick(
          [
            (_) => {
              nolinkdialog.hide();
              this.linkGenerator(target);
            },
            (_) => {
              nolinkdialog.hide();
            }
          ]
        );
        nolinkdialog.show();
      } else {
        clog("disabled:false");
        snackBar(`Link couldn't be disabled.`, "Try again", false, (_) => {
          this.revokeLink(target);
        });
      }
    })
    .catch((error) => {
      snackBar(error);
    });
}