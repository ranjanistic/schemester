
class AdminLogin{
  constructor(){
    value.backbluecovered = true;
    this.view = getElement("workbox");
    this.emailField = new TextInput("email_fieldset","adminemail","emailError",validType.email);
    this.passField = new TextInput("password_fieldset","adminpassword","passError",validType.nonempty);
    this.uiidField = new TextInput("uiid_fieldset","uiid","uiidError",validType.nonempty);

    this.logInButton = getElement("loginAdminButton");
    this.logInLoader = getElement("loginLoader");
    this.back = getElement("backFromLogin");
    this.forgotPassword = getElement("forgotpasswordButton");
    hide(this.forgotPassword);

    this.target = String(getElement('target').innerHTML);
    if(!stringIsValid(this.target,validType.nonempty)){
      this.target = 'dashboard';
    }
    
    this.back.addEventListener(click,_=> {showLoader();relocate(locate.homepage)});
    this.emailField.validate(_=>{this.passField.inputFocus()});
    this.passField.validate(_=>{this.uiidField.inputFocus()});
    this.uiidField.validate();

    this.passField.onTextInput(_=>{
      this.passField.normalize();
      hide(this.forgotPassword);
    });
    if (Number(sessionStorage.getItem("linkin")) > 0) {
      opacityOf(this.forgotPassword, 0.5);
      let time = Number(sessionStorage.getItem("linkin"));
      const timer = setInterval(() => {
        time--;
        sessionStorage.setItem("linkin", time);
        this.forgotPassword.innerHTML = `Try again in ${time} seconds.`;
        if (Number(sessionStorage.getItem("linkin")) == 0) {
          clearInterval(timer);
          this.forgotPassword.innerHTML = "Get password link";
          opacityOf(this.forgotPassword, 1);
          this.forgotPassword.onclick = (_) => {this.linkSender()};
        }
      }, 1000);
    } else {
      this.forgotPassword.onclick = (_) => {this.linkSender()};
    }
    this.logInButton.addEventListener(click,_=>{this.loginAdmin(this.emailField.getInput(),this.passField.getInput(),this.uiidField.getInput())},false);
    
  }
  linkSender(){
    if(!this.emailField.isValid()) return this.emailField.showError('Please provide your email address to help us reset your password.');
    snackBar('To reset your password, a link will be sent to your provided email address.','Send Link',true,_=>{
      postJsonData(post.admin.manage,{
        external:true,
        type:"resetpassword",
        action:"send",
        email:this.emailField.getInput()
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
  loader=(show=true)=>{
    visibilityOf(this.logInLoader, show);
    visibilityOf(this.logInButton, !show);
    opacityOf(this.view,show?0.5:1);
  }
  loginAdmin =(email,password, uiid)=>{
    if(!(stringIsValid(email,validType.email)&&stringIsValid(password)&&stringIsValid(uiid))){
      this.emailField.validateNow(_=>{this.passField.inputFocus()});
      this.passField.validateNow(_=>{this.uiidField.inputFocus()});
      this.uiidField.validateNow();
    } else{
      this.loader();
      hide(this.forgotPassword);
      this.emailField.normalize();
      this.passField.normalize();
      this.uiidField.normalize();
      postData(post.authlogin,{
        email:String(this.emailField.getInput()).trim(),
        password:this.passField.getInput(),
        uiid:String(this.uiidField.getInput()).trim(),
        target:this.target
      })
      .then((result) => {
        this.handleAuthResult(result);
      }).catch((error)=>{
        snackBar(error,'Report',false);
      });
    }
  }
  

  handleAuthResult=(result)=>{
    switch (result.event) {
      case code.auth.AUTH_SUCCESS:{
        this.emailField.showValid();
        this.passField.showValid();
        this.uiidField.showValid();
        saveDataLocally(result.user);
        return relocate(locate.admin.session,{
          u:result.user.uid,
          target:result.target
        });
      }
      case code.auth.WRONG_PASSWORD:{
        this.passField.showError(constant.nothing);
        show(this.forgotPassword);
        this.logInButton.innerHTML = "Retry";
      }break;
      case code.auth.WRONG_UIID:{
        this.uiidField.showError("Incorrect UIID.");
      }break;
      case code.auth.REQ_LIMIT_EXCEEDED:{
        snackBar("Too many unsuccessfull attempts, try again after a while.","Hide",actionType.negative);
        this.logInButton.textContent = "Disabled";
      }break;
      case code.auth.USER_NOT_EXIST:{
        this.emailField.showError("Account not found.");
        this.logInButton.textContent = "Retry";
        snackBar("Try registering a new account?","Create Account",true,_=>{registrationDialog(true,this.emailField.getInput(),this.uiidField.getInput())})
      }break;
      case code.auth.EMAIL_INVALID:{
        validateTextField(this.emailField,validType.email);
      }break;
      case code.auth.ACCOUNT_RESTRICTED:{
        this.logInButton.textContent = "Retry";
        snackBar("This account has been disabled. You might want to contact us directly.","Help",false,_=> {feedBackBox(true,getLogInfo(result.event,"This account has been disabled. You might want to contact us directly."),true)});
      }break;
      case code.auth.AUTH_REQ_FAILED:{
        this.logInButton.textContent = "Retry";
        snackBar("Request failed.", null, false);
      }break;
      default: {
        this.logInButton.textContent = "Retry";
        show(this.forgotPassword);
        snackBar(result.event+':'+result.msg, "Help", false, _=> {feedBackBox(true,result.event,true)});
      }
    }
    this.loader(false);
  }
}


window.onload =_=> window.app = new AdminLogin();

