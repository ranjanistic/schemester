
class AdminLogin{
  constructor(){
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
    
    this.forgotPassword.addEventListener(click, _=>{resetPasswordDialog(true,this.emailField.getInput());}, false);
    this.logInButton.addEventListener(click,_=>{this.loginAdmin(this.emailField.getInput(),this.passField.getInput(),this.uiidField.getInput())},false);
  }
  loader=(show=true)=>{
    visibilityOf(this.logInLoader, show);
    visibilityOf(this.logInButton, !show);
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
        saveUserLocally(result.user);

        relocate(locate.adminDashPage,{
          u:result.uid,
          target:result.target
        });
      }break;
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

