//The admin login page script
class AdminLogin{
  constructor(){
    this.emailField = new TextInput("email_fieldset","adminemail","emailError");
    this.passField = new TextInput("password_fieldset","adminpassword","passError");
    this.uiidField = new TextInput("uiid_fieldset","uiid","uiidError");

    this.forgotPassword = getElement("forgotpasswordButton");
    visibilityOf(this.forgotPassword,false);

    this.logInButton = getElement("loginAdminButton");
    this.logInLoader = getElement("loginLoader");
    this.back = getElement("backFromLogin");

    this.back.addEventListener(click,_=> {showLoader();relocate(root)});

    this.emailField.onTextDefocus(_=>{validateTextField(this.emailField,inputType.email,_=>{this.passField.input.focus()})});
    this.passField.onTextDefocus(_=>{validateTextField(this.passField,inputType.nonempty,_=>{this.uiidField.input.focus()})});
    this.uiidField.onTextDefocus(_=>{validateTextField(this.uiidField,inputType.nonempty,_=>{this.logInAdministrator()})});

    this.passField.onTextInput(_=>{
      this.passField.normalize();
      visibilityOf(this.forgotPassword, false);
    });
    this.forgotPassword.addEventListener(click, _=>{resetPasswordDialog();}, false);
    this.logInButton.addEventListener(click, this.logInAdministrator, false);
  }
  loader=(show=true)=>{
    visibilityOf(this.logInLoader, show);
    visibilityOf(this.logInButton, !show);
  }

  logInAdministrator= async ()=>{
    if(!isEmailValid(this.emailField.getInput())||this.passField.getInput()==nothing||this.uiidField.getInput()==nothing){
      validateTextField(this.uiidField,inputType.nonempty);
      validateTextField(this.passField,inputType.nonempty);
      validateTextField(this.emailField,inputType.email);
      return;
    }
    this.loader();
    this.emailField.normalize();
    this.passField.normalize();
    this.uiidField.normalize();
    await fetch('/admin/auth/login',{
      method: "post",
      headers: {
        "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
      },
      body: `email=${String(this.emailField.getInput()).trim()}&password=${this.passField.getInput()}&uiid=${String(this.uiidField.getInput()).trim()}`
    })
    .then((res) =>res.json())
    .then((res)=>{ 
      this.loader(false);
      this.handleAuthResult(JSON.parse(res.result))
    }).catch((error)=>{
      this.loader(false);
      this.handleAuthResult({event:[error]});
    });
  };

  handleAuthResult=(result)=>{
    switch (String(result.event)) {
      case code.auth.AUTH_SUCCESS:{
        clog('here');
        relocate(root);
      }break;
      case code.auth.WRONG_PASSWORD:{
        this.passField.showError();
        visibilityOf(this.forgotPassword, true);
        this.logInButton.innerHTML = "Retry";
      }break;
      case code.auth.REQ_LIMIT_EXCEEDED:{
        snackBar("Too many unsuccessfull attempts, try again after a while.","Hide",false);
        this.logInButton.textContent = "Disabled";
      }break;
      case code.auth.USER_NOT_EXIST:{
        this.emailField.showError("Account not found.");
        this.logInButton.textContent = "Retry";
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
        visibilityOf(this.forgotPassword, true);
        snackBar(result.event, "Help", false, _=> {feedBackBox()});
      }
    }
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
function clientAuth(){
  firebase
    .auth()
    .signInWithEmailAndPassword(emailInput.value, passField.getInput())
    .catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;
      clog(errorCode);
      switch (errorCode) {
        case "auth/wrong-password":
          {
            setFieldSetof(this.passField.fieldset, false);
            visibilityOf(forgotPassword, true);
            logInButton.textContent = "Retry";
          }
          break;
        case "auth/too-many-requests":
          {
            snackBar(
              "Too many unsuccessfull attempts, try again after a while.",
              null,
              false
            );
            logInButton.textContent = "Disabled";
          }
          break;
        case "auth/user-not-found":
          {
            setFieldSetof(
              emailFieldSet,
              false,
              emailError,
              "Account not found."
            );
            logInLoader.style.display = hide;
            emailInput.focus();
            logInButton.textContent = "Retry";
          }
          break;
        case "auth/invalid-email":
          {
            //validateTextField(emailInput, emailFieldSet, emailError);
          }
          break;
        case "auth/user-disabled":
          {
            logInButton.textContent = "Retry";
            snackBar(
              "This account has been disabled. You might want to contact us directly.",
              "Help",
              false,
              () => {
                feedBackBox();
                new Snackbar().hide();
              }
            );
          }
          break;
        case "auth/network-request-failed":
          {
            logInButton.textContent = "Retry";
            snackBar("No internet connection", null, false);
          }
          break;
        default: {
          logInButton.textContent = "Retry";
          visibilityOf(forgotPassword, true);
          snackBar(errorCode + ":" + errorMessage, "Help", false, () => {
            feedBackBox();
            new Snackbar().hide();
          });
        }
      }
      visibilityOf(logInLoader, false);
      visibilityOf(logInButton, true);
    });
}

window.onload = function () {
  window.app = new AdminLogin();
};
