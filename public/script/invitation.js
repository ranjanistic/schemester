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

    this.load();
    clog(data.target);
    clog("posting");
    let posturl,postaction;
    if(data.target == 'teacher'){
      posturl = post.teacher.auth;
      postaction = post.teacher.action.signup;
    }else if(data.target == 'student'){
      posturl = post.student.auth;
      postaction = post.student.action.signup;
    }
    postData(posturl, {
      action: postaction,
      username: this.nameField.getInput().trim(),
      email: this.emailField.getInput().trim(),
      password: this.passField.getInput().trim(),
      uiid: data.uiid,
      classname:data.classname
    }).then((response) => {
        clog("response");
        clog(response);
        if (response.event == code.auth.ACCOUNT_CREATED) {
          if (data.target == "teacher") {
            relocate(locate.teacher.session, {
              u: response.user.uid,
              target: locate.teacher.target.addschedule,
            });
          } else if (data.target == "student") {
            relocate(locate.student.session, {
              u: response.user.uid,
              target: locate.student.target.dash,
            });
          }
          return;
        }
        this.load(false);
        switch (response.event) {
          case code.auth.USER_EXIST:
            return this.emailField.showError("Account already exists");
          default: {
            if (!navigator.onLine) {
              snackBar("Network error", null, false);
            } else {
              snackBar(response.event);
            }
          }
        }
      })
      .catch((e) => {
        clog(e);
        this.load(false);
      });
  }

  rejectInvitation(data) {
    getElement("inputview").innerHTML = `<div class="fmt-center fmt-padding">
            <button class="positive-button" id="continueinvite">See details</button>
        </div>`;
    getElement("continueinvite").onclick = (_) => {
      getElement(
        "inputview"
      ).innerHTML = `<div class="caption fmt-center questrial positive">Provide your details before accepting.</div>
      <fieldset class="text-field fmt-row" id="usernamefield">
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

class Expired {
  constructor(data) {
    this.view = getElement("userinvitationexpired");
    this.register = getElement("registerbutton");
    this.register.onclick = (_) => {
      if(data.target == 'teacher')
        showTeacherRegistration(true)
      else if(data.target == 'student')
        showStudentRegistration(true)
    };
    this.loader = getElement("inviteloader");
    
  }
}

class ReceivedInfo {
  constructor() {
    this.invitor = getElement("invitorName").innerHTML;
    this.invitorID = getElement("invitorID").innerHTML;
    this.uiid = getElement("uiid").innerHTML;
    this.target = getElement("target").innerHTML;
    this.instName = getElement("instname").innerHTML;
    try{
      if(this.target == 'student') this.classname = getElement("classname").innerHTML;
      this.expiresAt = getElement("expireat").innerHTML;
      getElement("expireat").innerHTML = getProperDate(String(this.expiresAt));
    }catch{}
  }
}

class Invitation {
  constructor() {
    this.data = new ReceivedInfo();
    try {
      new Expired(this.data);
    } catch {
      new Active(this.data);
    }
  }
}

window.onload = (_) => new Invitation();
