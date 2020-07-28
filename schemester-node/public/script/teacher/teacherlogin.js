class TeacherLogin{
  constructor(){
    this.back = getElement("backFromLogin");
    this.back.addEventListener(click,_=> {showLoader();relocate(locate.homepage)});
    hide(getElement("previous"));
    hide(getElement("useremailfield"));
    hide(getElement("userpasswordfield"));
    this.logInLoader = getElement("loginLoader");
    this.proceed = getElement("proceed");
    this.loader(false);
    new UIID();
  }
  
  loader=(show=true)=>{
    visibilityOf(this.logInLoader, show);
    visibilityOf(this.proceed, !show);
  }
  

  handleAuthResult=(result)=>{
    switch (result.event) {
      case code.auth.AUTH_SUCCESS:{
        this.emailField.showValid();
        this.passField.showValid();
        this.uiidField.showValid();
        saveUserLocally(result.user);

        relocate(locate.adminDashPage,{
          u:result.uid,
          target:result.target
        });
      }break;
      case code.auth.WRONG_PASSWORD:{
        this.passField.showError(constant.nothing);
        show(this.forgotPassword);
        this.proceed.innerHTML = "Retry";
      }break;
      case code.auth.WRONG_UIID:{
        this.uiidField.showError("Incorrect UIID.");
      }break;
      case code.auth.REQ_LIMIT_EXCEEDED:{
        snackBar("Too many unsuccessfull attempts, try again after a while.","Hide",actionType.negative);
        this.proceed.textContent = "Disabled";
      }break;
      case code.auth.USER_NOT_EXIST:{
        this.emailField.showError("Account not found.");
        this.proceed.textContent = "Retry";
        snackBar("Try registering a new account?","Create Account",true,_=>{registrationDialog(true,this.emailField.getInput(),this.uiidField.getInput())})
      }break;
      case code.auth.EMAIL_INVALID:{
        validateTextField(this.emailField,validType.email);
      }break;
      case code.auth.ACCOUNT_RESTRICTED:{
        this.proceed.textContent = "Retry";
        snackBar("This account has been disabled. You might want to contact us directly.","Help",false,_=> {feedBackBox(true,getLogInfo(result.event,"This account has been disabled. You might want to contact us directly."),true)});
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
    this.rememberuiid = new Checkbox("rememberuiidcontainer",'rememberuiidtext','rememberuiidcheck');
    this.rememberuiid.show();
    this.saveuiid = false;
    this.rememberuiid.onCheckChange(_=>{
      this.saveuiid = true;
      this.uiidField.onTextInput(_=>{
        localStorage.setItem('uiid',this.uiidField.getInput());  
      })
      localStorage.setItem('uiid',this.uiidField.getInput());
    },_=>{
      this.saveuiid = false
      localStorage.removeItem('uiid')
    });
    this.rememberuiid.setLabel("Remember UIID");
    if(localStorage.getItem('uiid')){
      if(!back){
        this.rememberuiid.check();
        this.uiidField.setInput(localStorage.getItem('uiid'));
        sessionStorage.setItem('uiid',this.uiidField.getInput());
        this.uiidField.activate();
        this.uiidField.disableInput();
        return new Email();
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
    postData(post.teacher.login,{type:'uiid',uiid:uiid}).then(response=>{
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
        new Email();
      } else {
        this.uiidField.showError('No such institution');
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
    return sessionStorage.getItem('uiid');
  }
  
  emailIDProcedure(emailid){
    postData(post.teacher.login,{
      type:'email',
      email:emailid,
      uiid:this.getUIID()
    }).then(response=>{
      clog("email respnse");
      clog(response);
      switch(response.event){
        case code.auth.USER_NOT_EXIST:{
          this.emailField.showError("Account not found.");
          this.proceed.textContent = "Retry";
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

    this.forgotPassword.addEventListener(click, _=>{resetPasswordDialog(true,getEmail())}, false);
    this.previous.onclick = _=>{
      this.passField.hide();
      new Email();
    };
    this.proceed.onclick =_=>{
      if(!this.passField.isValid()){
        return this.passField.validateNow();
      }
      this.loader();
      this.passwordProcedure(this.passField.getInput());
    };
  }
  passwordProcedure(password){
    postData(post.teacher.login,{
      type:'password',
      email:this.getEmail(),
      uiid:this.getUIID(),
      password:password,
      target:this.target
    }).then(response=>{
      clog(response);
      if(response.event == code.auth.AUTH_SUCCESS){
        clog("uess");
      }
      //save response.teacher values to localstorage.
      //show verification dialog if not verified (response.teacher.verified), and proceed further, and only after verfication,
      //take the user to dashboard(today schedule page for teachers), if schedule exists in teacherschedule (for users.teachers),
      // else redirect/relocate to schedule filler, so user itself shall add their schedule, and after fulfilling total week schedule
      //proceed towards session today/fullweek view etc.
      this.loader(false);
    }).catch(e=>{
      snackBar(e,null,false);
    })
  }
  getEmail(){
    return sessionStorage.getItem('useremail');
  }
  getUIID(){
    return sessionStorage.getItem('uiid');
  }
  loader=(show=true)=>{
    visibilityOf(this.logInLoader, show);
    visibilityOf(this.proceed, !show);
  }
}

window.onload =_=> window.app = new TeacherLogin();

