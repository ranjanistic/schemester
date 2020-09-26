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

    this.acceptinvite.onclick= (_) => {
      this.acceptInvitation(data);
    };
    this.rejectinvite.onclick= (_) => {
      this.rejectInvitation(data);
    };
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
    let posturl,postaction;
    if(data.target == client.teacher){
      posturl = post.teacher.auth;
      postaction = post.teacher.action.signup;
    }else if(data.target == client.student){
      posturl = post.student.auth;
      postaction = post.student.action.signup;
    }
    postJsonData(posturl, {
      action: postaction,
      username: this.nameField.getInput().trim(),
      email: this.emailField.getInput().trim(),
      password: this.passField.getInput().trim(),
      pseudo:!data.personal,
      uiid: data.uiid,
      classname:data.classname
    }).then((response) => {
        if (response.event == code.auth.ACCOUNT_CREATED) {
          if (data.target == client.teacher) {
            relocate(locate.teacher.session, {
              u: response.user.uid,
              target: locate.teacher.target.dash,
            });
          } else if (data.target == client.student) {
            relocate(locate.student.session, {
              u: response.user.uid,
              target: locate.student.target.dash,
            });
          }
          return;
        }
        this.load(false);
        switch (response.event) {
          case code.auth.USER_EXIST:{
            snackBar('Try signing in?','Sign In',true,_=>{
              refer(data.target==client.teacher?locate.teacher.login:locate.student.login,{
                email:this.emailField.getInput()
              });
            })
            return this.emailField.showError("Account already exists");}
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
    const previoushtml = getElement("inputview").innerHTML;
    getElement("inputview").innerHTML = `<div class="fmt-center fmt-padding">
            <button class="positive-button" id="continueinvite">See details</button>
        </div>`;
    getElement("continueinvite").onclick = (_) => {
      getElement(
        "inputview"
      ).innerHTML = previoushtml;
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
      if(data.target == client.teacher)
        showTeacherRegistration(true)
      else if(data.target == client.student)
        showStudentRegistration(true)
    };
    this.loader = getElement("inviteloader");
    
  }
}

class ReceivedInfo {
  constructor() {
    this.personal = getElement("personal").innerHTML?true:false;
    this.invitor = getElement("invitorName").innerHTML;
    this.invitorID = getElement("invitorID").innerHTML;
    this.uiid = getElement("uiid").innerHTML;
    this.target = getElement("target").innerHTML;
    this.instName = getElement("instname").innerHTML;
    try{
      if(this.target == client.student) this.classname = getElement("classname").innerHTML;
      this.expiresAt = getElement("expireat").innerHTML;
      getElement("expireat").innerHTML = getProperDate(String(this.expiresAt));
    }catch{

    }
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
