//The admin login page script
class AdminLogin{
  constructor(){
    this.emailField = new TextInput("email_fieldset","adminemail","emailError");
    this.passField = new TextInput("password_fieldset","adminpassword","passError");
    this.uiidField = new TextInput("uiid_fieldset","uiid","uiidError");
    this.logInButton = getElement("loginAdminButton");
    this.logInLoader = getElement("loginLoader");
    this.back = getElement("backFromLogin");

    this.forgotPassword = getElement("forgotpasswordButton");

    this.back.addEventListener(click,_=> {showLoader();relocate(locate.root)});

    this.emailField.onTextDefocus(_=>{validateTextField(this.emailField,inputType.email,_=>{this.passField.input.focus()})});
    this.passField.onTextDefocus(_=>{validateTextField(this.passField,inputType.nonempty,_=>{this.uiidField.input.focus()})});
    this.uiidField.onTextDefocus(_=>{validateTextField(this.uiidField,inputType.nonempty)});

    this.passField.onTextInput(_=>{
      this.passField.normalize();
      hide(this.forgotPassword);
    });
    
    this.forgotPassword.addEventListener(click, _=>{resetPasswordDialog(true,this.emailField.getInput());}, false);
    this.logInButton.addEventListener(click,_=>{this.loginAdmin(this.emailField.getInput(),this.passField.getInput(),this.uiidField.getInput())},false);
    hide(this.forgotPassword);
  }
  loader=(show=true)=>{
    visibilityOf(this.logInLoader, show);
    visibilityOf(this.logInButton, !show);
  }
  loginAdmin =(email,password, uiid)=>{
    if(!(stringIsValid(email,inputType.email)&&stringIsValid(password)&&stringIsValid(uiid))){
      validateTextField(this.uiidField);
      validateTextField(this.passField);
      validateTextField(this.emailField,inputType.email);
    } else{
      this.loader();
      hide(this.forgotPassword);
      this.emailField.normalize();
      this.passField.normalize();
      this.uiidField.normalize();
      postData(post.authlogin,{
        email:String(this.emailField.getInput()).trim(),
        password:this.passField.getInput(),
        uiid:String(this.uiidField.getInput()).trim()
      })
      .then((res) => {
        this.handleAuthResult(res.result);
      }).catch((error)=>{
        this.handleAuthResult(error.result);
      });
    }
  }
  

  handleAuthResult=(result)=>{
    switch (result.event) {
      case code.auth.AUTH_SUCCESS:{
        snackBar("Success");
        window.localStorage.setItem(constant.sessionKey,result.bailment)
        postData(post.sessionValidate,{
          [constant.sessionKey]:window.localStorage.getItem(constant.sessionKey),
          destination:locate.adminDashPage
        }).then((res)=>{
          clog(res.result);
          if(res.result.event == code.auth.SESSION_VALID){
            relocate(res.result.destination);
          } else{
            snackBar("Login again.");
          }
        }).catch((error)=>{
          snackBar(error.msg);
        })
      }break;
      case code.auth.WRONG_PASSWORD:{
        this.passField.normalize(false);
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
        validateTextField(this.emailField,inputType.email);
      }break;
      case code.auth.ACCOUNT_RESTRICTED:{
        this.logInButton.textContent = "Retry";
        snackBar("This account has been disabled. You might want to contact us directly.","Help",false,_=> {feedBackBox()});
      }break;
      case code.auth.AUTH_REQ_FAILED:{
        this.logInButton.textContent = "Retry";
        snackBar("No internet connection", null, false);
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

// let loginAuthStateListener = () => {
//   firebase.auth().onAuthStateChanged((user) => {
//     if (user) {
//       let lrequest = window.indexedDB.open(localDB, 1);
//       lrequest.onerror = () => {
//         clog("L Database failed to open on login");
//         relocate(planspage);
//       };
//       lrequest.onupgradeneeded = (e) => {
//         clog("L Database upgrade on login");
//         lidb = e.target.result;
//         lidb.createObjectStore(objStore.localDataName, {
//             keyPath: objStore.localDBKey,
//         });
//         localTransaction = new Transactions(lidb);
//         relocate(planspage);
//       };
//       lrequest.onsuccess = () => {
//         lidb = lrequest.result;
//         localTransaction = new Transactions(lidb);
//         let lobject = localTransaction.getLocalTx().objectStore(objStore.localDataName);
//         lobject.openCursor().onsuccess = (e) => {
//           let lcursor = e.target.result;
//           if (lcursor) {
//             switch (lcursor.value.type) {
//               case kpath.localUIID:{
//                   if(uiidField.input == lcursor.value.uiid){
//                       relocate(adminDashPage);
//                   } else {
//                       clog('uiidField.input didn\'t match');
//                   }
//                 //openAdminDatabase(lcursor.value.uiid);  //open database of given stored institituion uiid name.
//               }break;
//               default: {
//                 clog("L no local uiid path switch on login");
//                 relocate(registrationPage);
//               }
//             }
//             lcursor.continue();
//           }
//         };
//       };
//     }
//   });
// };

window.onload =_=>{
  postData(post.sessionValidate, {
    [constant.sessionKey]: window.localStorage.getItem(constant.sessionKey),
    destination: locate.adminDashPage,
  }).then((res) => {
    if (res.result.event == code.auth.SESSION_VALID) {
      relocate(locate.adminDashPage)
    } else {
      window.app = new AdminLogin();
    }
  });
}

