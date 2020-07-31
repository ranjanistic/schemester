class Active {
  constructor(data) {
    this.nameField = new TextInput(
      "usernamefield",
      "username",
      "usernameerror",
      validType.nonempty
    );
    this.emailField = new TextInput(
      "usermailfield",
      "usermail",
      "usermailerror",
      validType.email
    );
    this.passField = new TextInput(
      "userpassfield",
      "userpass",
      "userpasserror",
      validType.password
    );
    this.passConfirmField = new TextInput(
      "userpassconffield",
      "userconfpass",
      "userconfpasserror",
      validType.match
    );

    this.nameField.validate((_) => {
      this.emailField.inputFocus();
    });
    this.emailField.validate((_) => {
      this.passField.inputFocus();
    });
    this.passField.validate((_) => {
      this.passConfirmField.inputFocus();
    });
    this.passConfirmField.validate((_) => {}, this.passField);

    this.acceptinvite = getElement("acceptInvitation");
    this.rejectinvite = getElement("rejectInvitation");
    this.loader = getElement("inviteloader");
    hide(this.loader);

    this.acceptinvite.addEventListener(click, (_) => {
      this.acceptInvitation(data);
    });
    this.rejectinvite.addEventListener(click, (_) => {
      this.rejectInvitation(data);
    });
  }
  acceptInvitation(data) {
    if (
      !(
        this.nameField.isValid() &&
        this.emailField.isValid() &&
        this.passField.isValid() &&
        this.passConfirmField.isValid(this.passField.getInput())
      )
    ) {
      this.passConfirmField.validateNow((_) => {}, this.passField);
      this.passField.validateNow((_) => {
        this.passConfirmField.inputFocus();
      });
      this.emailField.validateNow((_) => {
        this.passField.inputFocus();
      });
      this.nameField.validateNow((_) => {
        this.emailField.inputFocus();
      });
      return;
    }

    //this.load();
    const username = this.nameField.getInput();
    const usermail = this.emailField.getInput();
    const userpass = this.passField.getInput();
    clog(data.target);
    sessionStorage.setItem("username", username);
    sessionStorage.setItem("useremail", usermail);
    sessionStorage.setItem("instname", data.instName);
    sessionStorage.setItem("uiid", data.uiid);
    postData(`/${data.target}/find`, {
      email: sessionStorage.getItem("useremail"),
      uiid: sessionStorage.getItem("uiid")
    }).then((response) => {
      if (response.event == code.auth.USER_EXIST) {
        this.emailField.showError("Account already exists");
      } else {
        clog("posting");
        postData(`/${data.target}/auth/signup`, {
          username: username,
          email: usermail,
          password: userpass,
          uiid: data.uiid,
        }).then((response) => {
            clog("response");
            clog(response);
            switch (response.event) {
              case code.auth.ACCOUNT_CREATED:{
                if(data.target == 'teacher'){
                  relocate(locate.teacher.session, {
                    u:response.user.uid,
                    target: locate.teacher.target.addschedule
                  });
                }
              }
                break;
              default: {
                if (!navigator.onLine) {
                  snackBar("Network error", null, false);
                } else {
                  snackBar(response.event);
                }
              }
            }
            this.load(false);
        }).catch(e=>{
          clog(e);
          this.load(false);
        })
      }
    });
  }

  rejectInvitation(data) {
    getElement("inputview").innerHTML = `<div class="fmt-center fmt-padding">
            <button class="positive-button" id="continueinvite">See details</button>
        </div>`;
    getElement("continueinvite").onclick = (_) => {
      getElement(
        "inputview"
      ).innerHTML = `    <fieldset class="text-field fmt-row" id="usernamefield">
            <legend class="field-caption" >Your name</legend>
            <input class="text-input" required spellcheck="false" autocomplete="name" placeholder="Visible to people at ${data.instName}" type="text" id="username" name="username">
            <span class="fmt-right error-caption" id="usernameerror"></span>
        </fieldset>
        <fieldset class="text-field fmt-row" id="usermailfield">
            <legend class="field-caption" >Your email address</legend>
            <input class="text-input" required spellcheck="false" autocomplete="email" placeholder="youremail@example.domain" type="email" id="usermail" name="useremail">
            <span class="fmt-right error-caption" id="usermailerror"></span>
        </fieldset>
        <fieldset class="text-field fmt-row" id="userpassfield">
            <legend class="field-caption" >Create your password</legend>
            <input class="text-input" required autocomplete="new-password" placeholder="A strong password" type="password" id="userpass" name="userpassword">
            <span class="fmt-right error-caption" id="userpasserror"></span>
        </fieldset>
        <fieldset class="text-field fmt-row" id="userpassconffield">
            <legend class="field-caption" >Type again to confirm</legend>
            <input class="text-input" required autocomplete="new-password" placeholder="Confirm password" type="password" id="userconfpass" name="confuserpassword">
            <span class="fmt-right error-caption" id="userconfpasserror"></span>
        </fieldset>
        <br/>
        <div class="fmt-row">
            <button class="active-button fmt-right" id="acceptInvitation">Accept & Join</button>
            <button class="negative-button fmt-right" id="rejectInvitation">Reject Invitation</button>
            <img class="fmt-spin-fast fmt-right" width="50" style="display:none" src="/graphic/blueLoader.svg" id="inviteloader"/>
        </div>`;
      new Active(data);
    };
  }
  load(show = true) {
    visibilityOf(this.acceptinvite, !show);
    visibilityOf(this.rejectinvite, !show);
    visibilityOf(this.loader, show);
  }
}

let emailVerification = (email, afterVerfied = (_) => {}) => {
  let verify = new Dialog();
  verify.setDisplay(
    "Verification Required",
    `We need to verify you. A link will be sent at <b>${email}</b>, you need to verify your account there. Confirm to send link?`
  );
  verify.createActions(
    Array("Send link", "Cancel"),
    Array(actionType.positive, actionType.negative)
  );
  
  verify.onButtonClick(Array( () => {
    verify.loader();
    //replace with email sender
    setTimeout(() => {
      verify.loader(false);
      verify.setDisplay(
        "Waiting for verification",
        `A link has been sent. Check your email box at 
            <b>${email}</b>, verify your account there, and then click continue here.`
      );
      verify.createActions(
        Array("Verified, now continue", "Abort"),
        Array(actionType.positive, actionType.negative)
      );
      
      verify.onButtonClick(Array( () => {
        verify.loader();
        //check if verified;
        afterVerfied();
      }, () => {
        verify.loader();
        sessionStorage.clear();
        verify.hide();
      }));
      verify.show();
    }, 3 * 1000);
  }, () => {
    verify.loader();
    sessionStorage.clear();
    verify.hide();
  }));
  verify.show();
};

class Expired {
  constructor(data) {
    clog(sessionStorage.getItem("requestsent"));
    if (sessionStorage.getItem("requestsent") == "true") {
      this.mailsentView(data);
    } else {
      this.view = getElement("userinvitationexpired");
      this.useremailfield = new TextInput(
        "requsermailfield",
        "requsermail",
        "requsermailerror",
        validType.email
      );
      this.usermessage = new TextInput(
        "usermessagefield",
        "usermessage",
        "usermessageerror"
      );

      this.useremailfield.validate();
      this.request = getElement("requestInvitation");
      this.request.onclick = (_) => {
        this.requestInviteAction(data);
      };
      this.loader = getElement("inviteloader");
      this.load(false);
    }
  }
  requestInviteAction(data) {
    if (!this.useremailfield.isValid()) {
      return this.useremailfield.validateNow();
    }
    this.load();
    let useremail = this.useremailfield.getInput();
    //todo: send request email, then change view.
    sendEmail().then((event) => {
      if (event == code.mail.MAIL_SENT) {
        sessionStorage.setItem("requestsentfrom", useremail);
        sessionStorage.setItem("requestsent", true);
        this.mailsentView(data);
      }
    });
    this.load(false);
  }
  mailsentView(data) {
    getElement("expinputview").innerHTML = `<br/>
                <div class="questrial active fmt-center">
                    Your request has been delivered for ${
                      data.instName
                    }.<br/>You'll receive an email at <span class="positive">${sessionStorage.getItem(
      "requestsentfrom"
    )}</span>, when the administrator accepts your request.
                    <br/><br/>
                    <button class="positive-button" onclick="relocate(locate.root)">Explore Schemester</button>
                </div>`;
  }
  load(show = true) {
    visibilityOf(this.request, !show);
    visibilityOf(this.loader, show);
  }
}

class ReceivedInfo {
  constructor() {
    this.adminname = getElement("adminname").innerHTML;
    this.adminemail = getElement("adminemail").innerHTML;
    this.uiid = getElement("uiid").innerHTML;
    this.target = getElement("target").innerHTML;
    this.expiresAt = getElement("exp").innerHTML;
    this.instName = getElement("instname").innerHTML;
    if (getElement("expireat")) {
      getElement("expireat").innerHTML = getProperDate(String(this.expiresAt));
    }
  }
}

class Invitation {
  constructor() {
    this.data = new ReceivedInfo();
    try {
      window.fragment = new Expired(this.data);
    } catch {
      window.fragment = new Active(this.data);
    }
  }
}

window.onload = (_) => (window.app = new Invitation());
