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
    

    this.nameField.validate((_) => {
      this.emailField.inputFocus();
    });
    this.emailField.validate((_) => {
      this.passField.inputFocus();
    });
    this.passField.validate();

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
        this.passField.isValid()
      )
    ) {
      this.passField.validateNow();
      this.emailField.validateNow((_) => {
        this.passField.inputFocus();
      });
      this.nameField.validateNow((_) => {
        this.emailField.inputFocus();
      });
      return;
    }
    this.load();
    let posturl;
    if(data.target == client.teacher){
      posturl = post.teacher.auth;
    }else if(data.target == client.student){
      posturl = post.student.auth;
    } else if(data.target == client.admin){
      posturl = post.admin.auth;
    }
    postJsonData(posturl, {
      action: action.signup,
      username: this.nameField.getInput().trim(),
      email: this.emailField.getInput().trim(),
      password: this.passField.getInput(),
      uiid: data.uiid,
      isinvite:true,
      pseudo:!data.personal,
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
          } else if(data.target == client.admin){
            relocate(locate.admin.session, {
              u: response.user.uid,
              target: locate.admin.target.dash,
            });
          }
          return;
        } else if(response.event == code.OK){
          relocate(locate.student.session, {
            target: locate.student.target.dash,
            fragment:locate.student.target.fragment.classroom
          });
        }
        this.load(false);
        switch (response.event) {
          case code.invite.LINK_INVALID:{
            return window.parent.location.reload();
          }
          case code.auth.USER_EXIST:{
            if(data.target == client.admin){
              this.emailField.showError("Already an admin");
              return snackBar(`This account already has access to ${data.instName}.`,'Sign In',true,_=>{
                refer(locate.admin.login,{
                  email:this.emailField.getInput(),
                  uiid:data.uiid
                });
              })
            }
            snackBar('Try signing in?','Sign In',true,_=>{
              refer(data.target==client.teacher?locate.teacher.login:locate.student.login,{
                email:this.emailField.getInput()
              });
            })
            return this.emailField.showError("Account already exists");
          }
          case code.auth.WRONG_PASSWORD:{            
            this.passField.showError(`${getButton('forgotpass','Forgot',actionType.active)}`);
            return getElement('forgotpass').onclick=_=>{
              snackBar(`Please attempt a login with your existing ${data.target==client.student?'classroom':'institution'} to proceed for your password reset.`,'Login',true,_=>{
                referTab(data.target==client.admin?locate.admin.login:locate.student.login,{
                  email:this.emailField.getInput(),
                  uiid:data.target==client.student?data.uiid:constant.nothing,
                });
              })
            }
          }
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
    new ThemeSwitch('darkmode');
    try {
      new Expired(this.data);
    } catch {
      new Active(this.data);
    }
  }
}

window.onload = (_) => new Invitation();
