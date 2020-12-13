class StudentLogin{
  constructor(){
    backHistory();
    backRoot();
    hide(getElement("previous"));
    hide(getElement("userclassfield"))
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
    this.uiidField = new TextInput("uiidfield","UIID","Your institution's unique ID",validType.nonempty);
    this.uiidField.show();
    this.uiidField.enableInput();
    this.rememberuiid = new Switch('rememberuiidcheck');
    this.saveuiid = false;
    this.rememberuiid.onTurnChange(_=>{
      this.saveuiid = true;
      this.uiidField.onTextInput(_=>{
        localStorage.setItem(key.student.rememberuiid,this.uiidField.getInput());  
      })
      localStorage.setItem(key.student.rememberuiid,this.uiidField.getInput());
    },_=>{
      this.saveuiid = false
      localStorage.removeItem(key.student.rememberuiid)
    })
    if(localStorage.getItem(key.student.rememberuiid)&&localStorage.getItem(key.student.rememberuiid)!='null'){
      if(!back){
        this.rememberuiid.turn();
        this.uiidField.setInput(localStorage.getItem(key.student.rememberuiid));
        sessionStorage.setItem(key.uiid,this.uiidField.getInput());
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
    postJsonData(post.student.auth,{action:action.login,type:key.uiid,uiid:uiid}).then(response=>{
      this.uiidCheck(response.event == code.inst.INSTITUTION_EXISTS?response.uiid:null);
      if(response.event == code.inst.INSTITUTION_EXISTS){
        this.uiidField.activate();
        this.uiidField.disableInput();
        if(this.saveuiid){
          localStorage.setItem(key.student.rememberuiid, uiid);
          localStorage.setItem(key.uiid, uiid);
        }
        sessionStorage.setItem(key.uiid,uiid);
        new Classname();
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
    sessionStorage.setItem(key.uiid,checkeduiid);
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
    this.classField = new TextInput("userclassfield","Classname","Your base class",validType.nonempty);
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
    return sessionStorage.getItem(key.uiid);
  }
  classnameProcedure(classname){
    postJsonData(post.student.auth,{
      action:action.login,
      type:'classname',
      classname:classname,
      uiid:this.getUIID()
    }).then(response=>{
      switch(response.event){
        case code.auth.CLASS_NOT_EXIST:{
          this.classField.showError("Class not found.");
          this.proceed.textContent = "Retry";
        };break;
        case code.auth.CLASS_EXISTS:{
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
    }).catch(e=>{
      this.loader(false);
    })

  }
  classCheck(checkedEmail = null){
    sessionStorage.setItem(key.classroom,checkedEmail);
  }
  isClassChecked(){
    return sessionStorage.getItem(key.classroom);
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
    this.emailField = new TextInput("useremailfield","Email address","youremail@example.domain",validType.email);
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
    return sessionStorage.getItem(key.uiid);
  }
  getClassname(){
    return sessionStorage.getItem(key.classroom);
  }
  emailIDProcedure(emailid){
    postJsonData(post.student.auth,{
      action:action.login,
      type:'email',
      classname:this.getClassname(),
      email:emailid,
      uiid:this.getUIID()
    }).then(response=>{    
      switch(response.event){
        case code.auth.USER_NOT_EXIST:{
          this.emailField.showError("Account not found.");
          this.proceed.textContent = "Retry";
          snackBar("Try registering yourself?","Signup",true,_=>{
            showStudentRegistration(true,emailid,this.getUIID(),this.getClassname());
          });
        };break;
        case code.auth.USER_EXIST:{
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
    this.passField = new TextInput("userpasswordfield","Password","Your account password",validType.nonempty,true);
    this.passField.show();
    this.passField.enableInput();
    hide(this.passField.forgot);
    this.passField.validate(_=>{hide(this.passField.forgot)});

    resumeElementRestriction(this.passField.forgot,key.student.forgotpassword,_=>{
      this.passField.forgot.onclick = (_) => {this.linkSender()};
    });

    this.previous.onclick = _=>{
      this.passField.hide();
      new Email();
    };
    this.proceed.onclick =_=>{
      this.passField.validateNow();
      if(!this.passField.isValid())return;
      hide(this.passField.forgot);
      this.loader();
      this.passwordProcedure(this.passField.getInput());
    };
  }
  passwordProcedure(password){
    postJsonData(post.student.auth,{
      action:action.login,
      type:'password',
      classname:this.getClassname(),
      email:this.getEmail(),
      uiid:this.getUIID(),
      password:password,
      target:this.target
    }).then(response=>{
      this.handleAuthResult(response);
    }).catch(e=>{
      this.loader(false);
    });
  }
  getUIID(){
    return sessionStorage.getItem(key.uiid);
  }
  getClassname(){
    return sessionStorage.getItem(key.classroom);
  }
  getEmail(){
    return sessionStorage.getItem(key.email);
  }
  loader=(show=true)=>{
    visibilityOf(this.logInLoader, show);
    visibilityOf(this.proceed, !show);
    opacityOf(this.view,show?0.5:1);
  }

  linkSender(){
    if(!stringIsValid(this.getEmail(),validType.email)){ this.previous.click(); return snackBar('Provide your valid email address');}
    snackBar(`To reset your password, a link will be sent to your provided ${this.getEmail()} address.`,'Send Link',true,_=>{
      this.passField.forgot.onclick = (_) => {};
      snackBar(`Sending link to ${this.getEmail()}`);
      this.passField.forgot.innerHTML = 'Sending...';
      postJsonData(post.student.manage,{
        external:true,
        type:"resetpassword",
        action:action.send,
        uiid:this.getUIID(),
        classname:this.getClassname(),
        email:this.getEmail()
      }).then((resp)=>{
        if(resp.event== code.mail.ERROR_MAIL_NOTSENT){
          this.passField.forgot.onclick = (_) => {this.linkSender()};
          return snackBar('An error occurred','Report');
        }
        snackBar(
          "If your email address was correct, you'll receive an email from us in a few moments.",'Hide'
        );
        restrictElement(this.passField.forgot,120,key.student.forgotpassword,_=>{
          this.passField.forgot.innerHTML = 'Forgot?';
          this.passField.forgot.onclick = (_) => {this.linkSender()};
        });
      })
    })
  }

  handleAuthResult=(result)=>{
    if(result.event == code.auth.AUTH_SUCCESS){
      saveDataLocally(result.user);
      return relocate(locate.student.session,{
        u:result.user.uid,
        target:result.target
      });
    }
    this.loader(false);
    switch (result.event) {
      case code.auth.WRONG_PASSWORD:{
        this.passField.showError(constant.nothing);
        show(this.passField.forgot);
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
        show(this.passField.forgot);
        return snackBar(result.event+':'+result.msg, "Report");
      }
    }
  }
}

window.onload =_=>{
  theme.setNav();

   new StudentLogin();
  }

