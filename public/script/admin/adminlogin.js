class AdminLogin {
  constructor() {
    backHistory();
    backRoot();
    this.view = getElement("workbox");
    new ThemeSwitch("darkmode");
    this.emailField = new TextInput(
      "email_fieldset",
      "Email Address",
      "youremail@example.domain",
      validType.email
    );
    this.passField = new TextInput(
      "password_fieldset",
      "Password",
      "Your account password",
      validType.nonempty,
      true
    );
    this.uiidField = new TextInput(
      "uiid_fieldset",
      "UIID",
      "Your institution's identifier",
      validType.nonempty
    );
    getElement("createaccount").onclick = (_) => {
      showadminregistration(
        true,
        this.emailField.getInput(),
        this.uiidField.getInput()
      );
    };
    this.logInButton = getElement("loginAdminButton");
    this.logInLoader = getElement("loginLoader");

    this.target = String(getElement("target").innerHTML);
    if (!stringIsValid(this.target, validType.nonempty)) {
      this.target = locate.admin.target.dashboard;
    }
    this.section = String(getElement("section").innerHTML);
    if (!stringIsValid(this.section, validType.nonempty)) {
      this.section = locate.admin.section.account;
    }
    this.nexturl = getElement("nexturl").innerHTML || false;
    this.emailField.validate((_) => {
      this.passField.inputFocus();
    });
    this.passField.validate((_) => {
      this.uiidField.inputFocus();
    });
    this.uiidField.validate();

    this.passField.onTextInput((_) => {
      this.passField.normalize();
      hide(this.passField.forgot);
    });
    resumeElementRestriction(
      this.passField.forgot,
      key.admin.forgotpassword,
      (_) => {
        this.passField.forgot.onclick = (_) => {
          this.linkSender();
        };
      }
    );
    this.logInButton.onclick = (_) => {
      this.loginAdmin();
    };
  }
  linkSender() {
    if (!this.emailField.isValid())
      return this.emailField.showError(
        "Please provide your valid email address to help us reset your password."
      );
    snackBar(
      "To reset your password, a link will be sent to your provided email address.",
      "Send Link",
      true,
      (_) => {
        this.passField.forgot.onclick = (_) => {};
        this.passField.forgot.innerHTML = "Sending...";
        snackBar(`Sending link to ${this.emailField.getInput()}...`);
        postJsonData(post.admin.manage, {
          external: true,
          type: "resetpassword",
          action: action.send,
          email: this.emailField.getInput(),
        }).then((resp) => {
          if (resp.event == code.mail.ERROR_MAIL_NOTSENT) {
            this.passField.forgot.onclick = (_) => {
              this.linkSender();
            };
            return snackBar("An error occurred", "Report");
          }
          snackBar(
            "If your email address was correct, you'll receive an email from us in a few moments.",
            "Hide"
          );
          restrictElement(
            this.passField.forgot,
            120,
            key.admin.forgotpassword,
            (_) => {
              this.passField.forgot.innerHTML = "Forgot?";
              this.passField.forgot.onclick = (_) => {
                this.linkSender();
              };
            }
          );
        });
      }
    );
  }
  loader = (show = true) => {
    visibilityOf(this.logInLoader, show);
    visibilityOf(this.logInButton, !show);
    opacityOf(this.view, show ? 0.5 : 1);
  };
  loginAdmin() {
    if (
      !(
        this.emailField.isValid() &&
        this.passField.isValid() &&
        this.uiidField.isValid()
      )
    ) {
      this.emailField.validateNow((_) => {
        this.passField.inputFocus();
      });
      this.passField.validateNow((_) => {
        this.uiidField.inputFocus();
      });
      this.uiidField.validateNow();
    } else {
      this.loader();
      hide(this.passField.forgot);
      postJsonData(post.admin.auth, {
        action: action.login,
        email: String(this.emailField.getInput()).trim(),
        password: this.passField.getInput(),
        uiid: String(this.uiidField.getInput()).trim(),
        target: this.target,
        section: this.section,
        nexturl: this.nexturl,
      })
        .then((result) => {
          this.handleAuthResult(result);
        })
        .catch((error) => {
          this.loader(false);
        });
    }
  }

  handleAuthResult = (result) => {
    if (result.event == code.auth.AUTH_SUCCESS) {
      saveDataLocally(result.user);
      if (result.nexturl) {
        return relocate(result.nexturl);
      }
      return relocate(locate.admin.session, {
        u: result.user.uid,
        target: result.target,
        section: result.section,
      });
    }
    this.loader(false);
    switch (result.event) {
      case code.auth.WRONG_PASSWORD: {
        this.passField.showError(constant.nothing);
        show(this.passField.forgot);
        return (this.logInButton.innerHTML = "Retry");
      }
      case code.auth.WRONG_UIID: {
        return this.uiidField.showError("Incorrect UIID.");
      }
      case code.auth.REQ_LIMIT_EXCEEDED: {
        snackBar(
          "Too many unsuccessfull attempts, try again after a while.",
          "Hide",
          actionType.negative
        );
        return (this.logInButton.innerHTML = "Disabled");
      }
      case code.auth.USER_NOT_EXIST: {
        this.emailField.showError("Account not found.");
        this.logInButton.textContent = "Retry";
        return snackBar(
          "Try registering a new account?",
          "Create Account",
          true,
          (_) => {
            showadminregistration(
              true,
              this.emailField.getInput(),
              this.uiidField.getInput()
            );
          }
        );
      }
      case code.auth.EMAIL_INVALID: {
        return validateTextField(this.emailField, validType.email);
      }
      case code.auth.ACCOUNT_RESTRICTED: {
        this.logInButton.textContent = "Retry";
        return snackBar(
          "This account has been disabled. You might want to contact us directly.",
          "Help",
          false,
          (_) => {
            feedBackBox(
              true,
              getLogInfo(
                result.event,
                "This account has been disabled. You might want to contact us directly."
              ),
              true
            );
          }
        );
      }
      case code.auth.AUTH_REQ_FAILED: {
        this.logInButton.textContent = "Retry";
        return snackBar("Request failed.", null, false);
      }
      default: {
        this.logInButton.textContent = "Retry";
        show(this.passField.forgot);
        return snackBar(result.event + ":" + result.msg, "Help", false, (_) => {
          feedBackBox(true, result.event, true);
        });
      }
    }
  };
}

window.onload = (_) => {
  theme.setNav();
  new AdminLogin();
};
