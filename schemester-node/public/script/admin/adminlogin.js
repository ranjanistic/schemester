//The admin login page script
class AdminLogin{
  constructor(){
    this.emailFieldSet = getElement("email_fieldset");
    this.passwordFieldset = getElement("password_fieldset");
    this.puiidFieldSet = getElement("puiid_fieldset");
    this.forgotPassword = getElement("forgotpasswordButton");
    this.emailError = getElement("emailError");
    this.emailInput = getElement("adminemail");
    this.passwordInput = getElement("adminpassword");
    this.uiidInput = getElement("uiid");
    this.logInButton = getElement("loginAdminButton");
    this.logInLoader = getElement("loginLoader");
    this.back = getElement("backFromLogin");

    this.back.addEventListener(click,_=> {
      showLoader();
      relocate(root);
    });
    this.logInButton.addEventListener(click, this.logInAdministrator, false);
    this.passwordInput.addEventListener(input,_=>{
      setFieldSetof(this.passwordFieldset, true);visibilityOf(this.forgotPassword, false);
    });
    this.emailInput.addEventListener(change, this.focusToNext);
    this.passwordInput.addEventListener(change, this.focusToNext);
    visibilityOf(forgotPassword, false);
    this.forgotPassword.addEventListener(click, resetPasswordDialog, false);
    this.uiidInput.addEventListener(change, focusToNext, false);
  }

  validateEmailID(email, field, error){
    setFieldSetof(
      field,
      isEmailValid(email.value),
      error,
      "Invalid email address."
    );
    if (!isEmailValid(email.value)) {
      email.focus();
      email.oninput = () => {
        setFieldSetof(field, true);
        validateEmailID(this.emailInput, this.emailFieldSet, this.emailError);
      };
    }
  };

  focusToNext = () => {
    if (!isEmailValid(emailInput.value)) {
      if (emailInput.value != nothing) {
        validateEmailID(emailInput, emailFieldSet, emailError);
      }
      emailInput.focus();
    } else {
      if (passwordInput.value == nothing) {
        passwordInput.focus();
      } else if (uiidInput.value == nothing) {
        uiidInput.focus();
      }
    }
  };

  logInAdministrator(){
    visibilityOf(this.logInLoader, true);
    visibilityOf(this.logInButton, false);
    setFieldSetof(this.emailFieldSet, true);
    setFieldSetof(this.passwordFieldset, true);
    snackBar(null)
    // if (firebase.auth().currentUser) {
    //   firebase.auth().signOut();
    // }
  
    fetch('/admin/auth/login',{
      method: "post",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: [emailInput.value],
        password: [passwordInput.value]
      })
    })
    .then((response) => { 
      visibilityOf(logInLoader, false);
      visibilityOf(logInButton, true);
       if(response.ok){
         console.log(response.json());
       } else {
  
       }
    }).catch((error)=>{
      console.log(error);
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
//                   if(uiidInput == lcursor.value.uiid){
//                       relocate(adminDashPage);
//                   } else {
//                       clog('uiidinput didn\'t match');
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
    .signInWithEmailAndPassword(emailInput.value, passwordInput.value)
    .catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;
      clog(errorCode);
      switch (errorCode) {
        case "auth/wrong-password":
          {
            setFieldSetof(passwordFieldset, false);
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
            validateEmailID(emailInput, emailFieldSet, emailError);
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
