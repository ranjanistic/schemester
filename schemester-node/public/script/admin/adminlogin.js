//The admin login page script
class AdminLogin{
  constructor(){
    this.emailField = new TextInput("email_fieldset","adminemail","emailError");
    this.passField = new TextInput("password_fieldset","adminpassword");
    this.uiidField = new TextInput("uiid_fieldset","uiid");

    this.forgotPassword = getElement("forgotpasswordButton");
    visibilityOf(this.forgotPassword, false);

    this.logInButton = getElement("loginAdminButton");
    this.logInLoader = getElement("loginLoader");
    this.back = getElement("backFromLogin");

    this.back.addEventListener(click,_=> {showLoader();relocate(root);});
    this.logInButton.addEventListener(click, this.logInAdministrator, false);

    this.emailField.onTextDefocus(_=>{validateTextField(this.emailField,inputType.email,_=>{this.passField.input.focus()})});
    this.passField.onTextDefocus(_=>{validateTextField(this.passField,null,_=>{this.uiidField.input.focus()})});

    this.passField.onTextInput(_=>{
      setFieldSetof(this.passField.fieldset, true);
      visibilityOf(this.forgotPassword, false);
    });
    this.forgotPassword.addEventListener(click, _=>{resetPasswordDialog();}, false);
  }

  focusToNext =_=>{
    if (!isEmailValid(this.emailField.getInput())) {
      if (this.emailField.getInput() != nothing) {
        validateTextField(this.emailField,inputType.email);
      }
      this.emailField.input.focus();
    } else {
      if (this.passField.getInput() == nothing) {
        this.passField.input.focus();
      } else if (this.uiidField.getInput() == nothing) {
        this.uiidField.input.focus();
      }
    }
  };

  logInAdministrator=_=>{
    visibilityOf(this.logInLoader, true);
    visibilityOf(this.logInButton, false);
    setFieldSetof(this.emailField.fieldset, true);
    setFieldSetof(this.passField.fieldset, true);
    snackBar(null)
    fetch('/admin/auth/login',{
      method: "post",
      headers: {
        "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
      },
      body: `email=${this.emailField.getInput()}&password=${this.passField.getInput()}&uiid=${this.uiidField.getInput()}`
    })
    .then((res) =>res.json())
    .then((res)=>{ 
      visibilityOf(logInLoader, false);
      visibilityOf(logInButton, true);
      clog(res);
    }).catch((error)=>{
      clog(error);
    });
  };
  
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
