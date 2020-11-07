class TeacherLogin{
  constructor(){
    value.backbluecovered = true;
    this.back = getElement("backFromLogin");
    this.back.addEventListener(click,_=> {showLoader();relocate(locate.homepage)});
    hide(getElement("previous"));
    hide(getElement("useremailfield"));
    hide(getElement("userpasswordfield"));
    this.logInLoader = getElement("loginLoader");
    this.proceed = getElement("proceed");
    this.loader(false);
    new ThemeSwitch('darkmode');
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
        localStorage.setItem(key.teacher.rememberuiid,this.uiidField.getInput());
      })
      localStorage.setItem(key.teacher.rememberuiid,this.uiidField.getInput());
    },_=>{
      this.saveuiid = false
      localStorage.removeItem(key.teacher.rememberuiid)
    })
    
    if(localStorage.getItem(key.teacher.rememberuiid)&&localStorage.getItem(key.teacher.rememberuiid)!='null'){
      if(!back){
        this.rememberuiid.on();
        this.uiidField.setInput(localStorage.getItem(key.teacher.rememberuiid));
        sessionStorage.setItem(key.uiid,this.uiidField.getInput());
        this.uiidField.activate();
        this.uiidField.disableInput();
        return new Email();
      }
    }
    
    this.uiidField.validate();
    this.uiidCheck();
    this.proceed.onclick =_=>{
      if(!this.uiidField.isValid()){
        return this.uiidField.validateNow();
      }
      this.loader();
      this.uiidProcedure(this.uiidField.getInput());
    };
  }
   uiidProcedure(uiid){
    postJsonData(post.teacher.auth,{
      action:post.teacher.action.login,
      type:key.uiid,
      uiid:uiid
    }).then(response=>{
      this.uiidCheck(response.event == code.inst.INSTITUTION_EXISTS?response.uiid:null);
      if(response.event == code.inst.INSTITUTION_EXISTS){
        this.uiidField.activate();
        this.uiidField.disableInput();
        if(this.saveuiid){
          localStorage.setItem(key.teacher.rememberuiid, uiid);
        }
        sessionStorage.setItem(key.uiid,uiid);
        new Email();
      } else {
        this.uiidField.showError('No such institution');
        clearLocalData();
      }
      this.loader(false);
    }).catch(e=>{
      this.loader(false);
    });
  }
  uiidCheck(checkeduiid = null){
    checkeduiid?sessionStorage.setItem(key.uiid,checkeduiid):sessionStorage.removeItem(key.uiid);
  }  
  loader(show=true){
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
      new UIID(true);
    };
  }
  getUIID(){
    return sessionStorage.getItem(key.uiid);
  }
  
  emailIDProcedure(emailid){
    postJsonData(post.teacher.auth,{
      action:post.teacher.action.login,
      type:'email',
      email:emailid,
      uiid:this.getUIID()
    }).then(response=>{
      switch(response.event){
        case code.auth.USER_NOT_EXIST:{
          this.emailField.showError("Account not found.");
          this.proceed.textContent = "Retry";
          snackBar("Try registering yourself?","Signup",true,_=>{
            showTeacherRegistration(true,this.emailField.getInput(),this.getUIID());
          })
        }break;
        case code.auth.USER_EXIST:{
          this.emailField.activate();
          this.emailField.disableInput();
          this.emailCheck(emailid);
          new Password();
        }break;
        default:{
          snackBar(response.event,null,false);
        }
      }
      this.loader(false);
    }).catch(e=>{
      this.loader(false);
    })

  }
  emailCheck(checkedEmail = null){
    sessionStorage.setItem(key.email,checkedEmail);
  }
  isEmailChecked(){
    return sessionStorage.getItem(key.email);
  }
  loader(show=true){
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
    this.target = stringIsValid(this.target,validType.nonempty)?this.target:locate.teacher.target.today
    this.passField = new TextInput("userpasswordfield","userpassword","userpassworderror",validType.nonempty,"userpasswordcaption");
    this.passField.show();
    this.passField.enableInput();
    this.forgotPassword = getElement("forgotpasswordButton");
    hide(this.forgotPassword);
    this.passField.validate(_=>{hide(this.forgotPassword)});

    resumeElementRestriction(this.forgotPassword,key.teacher.forgotpassword,_=>{
      this.forgotPassword.onclick = (_) => {this.linkSender()};
    });

    this.previous.onclick=_=>{
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
    postJsonData(post.teacher.auth,{
      action:post.teacher.action.login,
      type:'password',
      email:this.getEmail(),
      uiid:this.getUIID(),
      password:password,
      target:this.target
    }).then(response=>{
      this.handleAuthResult(response);
    }).catch(e=>{
      this.loader(false);
    })
  }
  getEmail(){
    return sessionStorage.getItem(key.email);
  }
  getUIID(){
    return sessionStorage.getItem(key.uiid);
  }
  loader(show=true){
    visibilityOf(this.logInLoader, show);
    visibilityOf(this.proceed, !show);
    opacityOf(this.view,show?0.5:1);
  }

  linkSender(){
    if(!stringIsValid(this.getEmail(),validType.email)){ this.previous.click(); return snackBar('Provide your valid email address');}
    snackBar(`To reset your password, a link will be sent to your provided ${this.getEmail()} address.`,'Send Link',true,_=>{
      this.forgotPassword.onclick = (_) => {};
      snackBar(`Sending link to ${this.getEmail()}...`);
      postJsonData(post.teacher.manage,{
        external:true,
        type:"resetpassword",
        action:"send",
        uiid:this.getUIID(),
        email:this.getEmail()
      }).then((resp)=>{
        if(resp.event== code.mail.ERROR_MAIL_NOTSENT){
          this.forgotPassword.onclick = (_) => {this.linkSender()};
          return snackBar('An error occurred','Report');
        }
        snackBar(
          "If your email address was correct, you'll receive an email from us in a few moments.",'Hide'
        );
        restrictElement(this.forgotPassword,120,key.teacher.forgotpassword,_=>{
          this.forgotPassword.onclick = (_) => {this.linkSender()};
        });
      })
    })
  }

  handleAuthResult(result){
    if(result.event == code.auth.AUTH_SUCCESS){
      saveDataLocally(result.user);
      return relocate(locate.teacher.session,{
        u:result.user.uid,
        target:result.target
      });
    }
    this.loader(false);
    switch (result.event) {
      case code.auth.WRONG_PASSWORD:{
        this.passField.showError(constant.nothing);
        show(this.forgotPassword);
        return this.proceed.innerHTML = "Retry";
      }
      case code.inst.INSTITUTION_NOT_EXISTS:{
        clearLocalData();
        return location.reload();
      }
      case code.auth.EMAIL_INVALID:{
        return this.previous.click();
      }
      case code.auth.REQ_LIMIT_EXCEEDED:{
        snackBar("Too many unsuccessfull attempts, try again after a while.","Hide",actionType.negative);
        return this.proceed.textContent = "Disabled";
      }
      case code.auth.ACCOUNT_RESTRICTED:{
        this.proceed.textContent = "Retry";
        return snackBar("This account has been disabled. You might want to contact us directly.","Help",false,_=> {feedBackBox(true,getLogInfo(result.event,"This account has been disabled. You might want to contact us directly."),true)
      });
      }
      case code.auth.AUTH_REQ_FAILED:{
        this.proceed.textContent = "Retry";
        return snackBar("Request failed.", null, false);
      }
      default: {
        this.proceed.textContent = "Retry";
        show(this.forgotPassword);
        return snackBar(result.event+':'+result.msg, "Report", false);
      }
    }
  }
}

window.onload =_=> new TeacherLogin();

