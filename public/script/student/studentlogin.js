class StudentLogin{
  constructor(){
    value.backbluecovered = true;
    this.back = getElement("backFromLogin");
    this.back.addEventListener(click,_=> {showLoader();relocate(locate.homepage)});
    hide(getElement("previous"));
    hide(getElement("userclassfield"))
    hide(getElement("useremailfield"));
    hide(getElement("userpasswordfield"));
    this.logInLoader = getElement("loginLoader");
    this.proceed = getElement("proceed");
    this.loader(false);
    this.darkmode = new Switch('darkmode');
    this.darkmode.turn(theme.isDark());
    this.darkmode.onTurnChange(_=>{theme.setDark()},_=>{theme.setLight()});
    new UIID();
  }
  
  loader=(show=true)=>{
    visibilityOf(this.logInLoader, show);
    visibilityOf(this.proceed, !show);
  }
}


class UIID{
  constructor(back = false){
    hide(getElement("previous"));
    this.proceed = getElement("proceed");
    this.proceed.innerHTML = "Proceed";
    this.logInLoader = getElement("loginLoader");
    getElement("subtext").innerHTML = `Please provide the unique ID of your institution to proceed.`;
    this.uiidField = new TextInput("uiidfield","uiid","uiidError",validType.nonempty);
    this.uiidField.show();
    this.uiidField.enableInput();
    this.rememberuiid = new Switch('rememberuiidcheck');
    this.saveuiid = false;
    this.rememberuiid.onTurnChange(_=>{
      this.saveuiid = true;
      this.uiidField.onTextInput(_=>{
        localStorage.setItem('uiid',this.uiidField.getInput());  
      })
      localStorage.setItem('uiid',this.uiidField.getInput());
    },_=>{
      this.saveuiid = false
      localStorage.removeItem('uiid')
    })
    if(localStorage.getItem('uiid')){
      if(!back){
        this.rememberuiid.turn();
        this.uiidField.setInput(localStorage.getItem('uiid'));
        sessionStorage.setItem('uiid',this.uiidField.getInput());
        this.uiidField.activate();
        this.uiidField.disableInput();
        return new Classname();
      }
    }
    
    this.uiidField.validate();
    this.uiidCheck(null);
    this.proceed.onclick =_=>{
      if(!this.uiidField.isValid()){
        return this.uiidField.validateNow();
      }
      this.loader();
      this.uiidProcedure(this.uiidField.getInput());
    };
  }
   uiidProcedure(uiid){
    postData(post.student.auth,{action:post.student.action.login,type:'uiid',uiid:uiid}).then(response=>{
      clog("response");
      clog(response);
      this.uiidCheck(response.event == code.inst.INSTITUTION_EXISTS?response.uiid:null);
      if(response.event == code.inst.INSTITUTION_EXISTS){
        this.uiidField.activate();
        this.uiidField.disableInput();
        if(this.saveuiid){
          localStorage.setItem('uiid', uiid);
        }
        sessionStorage.setItem('uiid',uiid);
        new Classname();
      } else {
        this.uiidField.showError('No such institution');
        clearLocalData();
      }
      this.loader(false);
    }).catch(e=>{
      snackBar(e);
    });
  }
  uiidCheck(checkeduiid = null){
    sessionStorage.setItem('uiid',checkeduiid);
  }  
  loader=(show=true)=>{
    visibilityOf(this.logInLoader, show);
    visibilityOf(this.proceed, !show);
  }
}

class Classname{
  constructor(){
    this.previous = getElement("previous");
    this.proceed = getElement("proceed");
    this.proceed.innerHTML = "Proceed";
    this.logInLoader = getElement("loginLoader");
    getElement("subtext").innerHTML = `Now, provide your class name which you've enrolled with ${this.getUIID()} institute.`;
    this.classField = new TextInput("userclassfield","userclass","classerror",validType.nonempty);
    this.classField.validate();
    this.classCheck(null);
    this.classField.enableInput();
    this.classField.show();
    show(this.previous);
    this.proceed.onclick=_=>{
      if(!this.classField.isValid()){
        return this.classField.validateNow();
      }
      this.loader();
      this.classnameProcedure(String(this.classField.getInput()).trim());
    }
    this.previous.onclick=_=>{
      this.classField.hide();
      new UIID(true);
    };
  }
  getUIID(){
    return sessionStorage.getItem('uiid');
  }
  classnameProcedure(classname){
    postData(post.student.auth,{
      action:post.student.action.login,
      type:'classname',
      classname:classname,
      uiid:this.getUIID()
    }).then(response=>{
      clog("email respnse");
      clog(response);
      switch(response.event){
        case code.auth.CLASS_NOT_EXIST:{
          this.classField.showError("Class not found.");
          this.proceed.textContent = "Retry";
        };break;
        case code.auth.CLASS_EXISTS:{
          clog("claaaaaaaaaaaas");
          this.classField.activate();
          this.classField.disableInput();
          this.classCheck(classname);
          new Email();
        };break;
        default:{
          snackBar(response.event,null,false);
        }
      }
      this.loader(false);
    })

  }
  classCheck(checkedEmail = null){
    sessionStorage.setItem('userclass',checkedEmail);
  }
  isClassChecked(){
    return sessionStorage.getItem('userclass');
  }
  loader=(show=true)=>{
    visibilityOf(this.logInLoader, show);
    visibilityOf(this.proceed, !show);
  }

}

class Email{
  constructor(){
    this.previous = getElement("previous");
    this.proceed = getElement("proceed");
    this.proceed.innerHTML = "Proceed";
    this.logInLoader = getElement("loginLoader");
    getElement("subtext").innerHTML = `Now, provide your email address which you've registered with ${this.getUIID()} institute.`;
    this.emailField = new TextInput("useremailfield","useremail","useremailerror",validType.email);
    this.emailField.validate();
    this.emailCheck(null);
    this.emailField.enableInput();
    this.emailField.show();
    show(this.previous);
    this.proceed.onclick=_=>{
      if(!this.emailField.isValid()){
        return this.emailField.validateNow();
      }
      this.loader();
      this.emailIDProcedure(String(this.emailField.getInput()).trim());
    }
    this.previous.onclick=_=>{
      this.emailField.hide();
      new Classname(true);
    };
  }
  getUIID(){
    return sessionStorage.getItem('uiid');
  }
  getClassname(){
    return sessionStorage.getItem('userclass');
  }
  emailIDProcedure(emailid){
    postData(post.student.auth,{
      action:post.student.action.login,
      type:'email',
      classname:this.getClassname(),
      email:emailid,
      uiid:this.getUIID()
    }).then(response=>{
      clog("email respnse");
      clog(response);
      switch(response.event){
        case code.auth.USER_NOT_EXIST:{
          this.emailField.showError("Account not found.");
          this.proceed.textContent = "Retry";
          snackBar("Try registering yourself?","Signup",true,_=>{
            showStudentRegistration(true,emailid,this.getUIID(),this.getClassname());
          });
        };break;
        case code.auth.USER_EXIST:{
          clog("yaaaaaaaaaaaas");
          this.emailField.activate();
          this.emailField.disableInput();
          this.emailCheck(emailid);
          new Password();
        };break;
        default:{
          snackBar(response.event,null,false);
        }
      }
      this.loader(false);
    })

  }
  emailCheck(checkedEmail = null){
    sessionStorage.setItem('useremail',checkedEmail);
  }
  isEmailChecked(){
    return sessionStorage.getItem('useremail');
  }
  loader=(show=true)=>{
    visibilityOf(this.logInLoader, show);
    visibilityOf(this.proceed, !show);
  }
}

class Password{
  constructor(){
    this.view = getElement("workbox");
    this.previous = getElement("previous");
    this.proceed = getElement("proceed");
    this.logInLoader = getElement("loginLoader");
    this.proceed.innerHTML = "Proceed";
    this.subtext = getElement("subtext");
    this.subtext.innerHTML = `Provide your account password to continue with your schedule.`;
    this.target = String(getElement('target').innerHTML);
    this.target = stringIsValid(this.target,validType.nonempty)?this.target:locate.student.target.today
    this.passField = new TextInput("userpasswordfield","userpassword","userpassworderror",validType.nonempty,"userpasswordcaption");
    this.passField.show();
    this.passField.enableInput();
    this.forgotPassword = getElement("forgotpasswordButton");
    hide(this.forgotPassword);
    this.passField.validate(_=>{hide(this.forgotPassword)});

    if (Number(sessionStorage.getItem("linkin")) > 0) {
      opacityOf(this.forgotPassword, 0.5);
      let time = Number(sessionStorage.getItem("linkin"));
      const timer = setInterval(() => {
        time--;
        sessionStorage.setItem("linkin", time);
        this.forgotPassword.innerHTML = `Try again in ${time} seconds.`;
        if (Number(sessionStorage.getItem("linkin")) == 0) {
          this.forgotPassword.innerHTML = "Get password link";
          opacityOf(this.forgotPassword, 1);
          this.forgotPassword.onclick = (_) => {this.linkSender()};
          clearInterval(timer);
        }
      }, 1000);
    } else {
      this.forgotPassword.onclick = (_) => {this.linkSender()};
    }

    this.previous.onclick = _=>{
      this.passField.hide();
      new Email();
    };
    this.proceed.onclick =_=>{
      this.passField.validateNow();
      if(!this.passField.isValid())return;
      hide(this.forgotPassword);
      this.loader();
      this.passwordProcedure(this.passField.getInput());
    };
  }
  passwordProcedure(password){
    postData(post.student.auth,{
      action:post.student.action.login,
      type:'password',
      classname:this.getClassname(),
      email:this.getEmail(),
      uiid:this.getUIID(),
      password:password,
      target:this.target
    }).then(response=>{
      clog(response);
      this.handleAuthResult(response);
      this.loader(false);
    }).catch(e=>{
      snackBar(e,null,false);
    })
  }
  getUIID(){
    return sessionStorage.getItem('uiid');
  }
  getClassname(){
    return sessionStorage.getItem('userclass');
  }
  getEmail(){
    return sessionStorage.getItem('useremail');
  }
  loader=(show=true)=>{
    visibilityOf(this.logInLoader, show);
    visibilityOf(this.proceed, !show);
    opacityOf(this.view,show?0.5:1);
  }

  linkSender(){
    if(!stringIsValid(this.getEmail(),validType.email)){ this.previous.click(); return snackBar('Provide your valid email address');}
    snackBar(`To reset your password, a link will be sent to your provided ${this.getEmail()} address.`,'Send Link',true,_=>{
      postJsonData(post.student.manage,{
        external:true,
        type:"resetpassword",
        action:"send",
        uiid:this.getUIID(),
        classname:this.getClassname(),
        email:this.getEmail()
      }).then((resp)=>{
        if(resp.event== code.mail.ERROR_MAIL_NOTSENT){
          return snackBar('An error occurred','Report');
        }
        snackBar(
          "If your email address was correct, you'll receive an email from us in a few moments.",'Hide'
        );
        opacityOf(this.forgotPassword, 0.4);
        this.forgotPassword.onclick = (_) => {};
        let time = 120;
        sessionStorage.setItem("linkin", time);
        const timer = setInterval(() => {
          time--;
          sessionStorage.setItem("linkin", time);
          this.forgotPassword.innerHTML = `Try again in ${time} seconds.`;
          if (Number(sessionStorage.getItem("linkin")) == 0) {
            clearInterval(timer);
            this.forgotPassword.innerHTML = "Get password link";
            opacityOf(this.forgotPassword, 1);
          }
        }, 1000);
      })
    })
  }

  handleAuthResult=(result)=>{
    switch (result.event) {
      case code.auth.AUTH_SUCCESS:{
        showLoader();
        saveDataLocally(result.user);
        relocate(locate.student.session,{
          u:result.user.uid,
          target:result.target
        });
      }break;
      case code.auth.WRONG_PASSWORD:{
        this.passField.showError(constant.nothing);
        show(this.forgotPassword);
        this.proceed.innerHTML = "Retry";
      }break;
      case code.inst.INSTITUTION_NOT_EXISTS:{
        clearLocalData();
        location.reload();
      }break;
      case code.auth.EMAIL_INVALID:{
        this.previous.click();
      }break;
      case code.auth.REQ_LIMIT_EXCEEDED:{
        snackBar("Too many unsuccessfull attempts, try again after a while.","Hide",actionType.negative);
        this.proceed.textContent = "Disabled";
      }break;
      case code.auth.ACCOUNT_RESTRICTED:{
        this.proceed.textContent = "Retry";
        snackBar("This account has been disabled. You might want to contact us directly.","Help",false,_=> {feedBackBox(true,getLogInfo(result.event,"This account has been disabled. You might want to contact us directly."),true)
      });
      }break;
      case code.auth.AUTH_REQ_FAILED:{
        this.proceed.textContent = "Retry";
        snackBar("Request failed.", null, false);
      }break;
      default: {
        this.proceed.textContent = "Retry";
        show(this.forgotPassword);
        snackBar(result.event+':'+result.msg, "Help", false, _=> {feedBackBox(true,result.event,true)});
      }
    }
    this.loader(false);
  }

}

window.onload =_=> window.app = new StudentLogin();

