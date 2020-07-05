//The admin login page script
var emailFieldSet,
  emailError,
  passwordFieldset,
  forgotPassword,
  emailInput,
  passwordInput,
  uiidInput,
  logInButton,
  logInLoader,
  back;

let initializeElements = () => {
  emailFieldSet = getElement("email_fieldset");
  passwordFieldset = getElement("password_fieldset");
  puiidFieldSet = getElement("puiid_fieldset");
  forgotPassword = getElement("forgotpasswordButton");
  emailError = getElement("emailError");
  emailInput = getElement("adminemail");
  passwordInput = getElement("adminpassword");
  uiidInput = getElement("uiid");
  logInButton = getElement("loginAdminButton");
  logInLoader = getElement("loginLoader");
  back = getElement("backFromLogin");

  back.addEventListener(
    click,
    () => {
      showLoader();
      relocate(root);
    },
    false
  );
  logInButton.addEventListener(click, logInAdministrator, false);
  passwordInput.addEventListener(
    input,
    () => {
      setFieldSetof(passwordFieldset, true);
      visibilityOf(forgotPassword, false);
    },
    false
  );
  emailInput.addEventListener(change, focusToNext, false);
  passwordInput.addEventListener(change, focusToNext, false);
  visibilityOf(forgotPassword, false);
  forgotPassword.addEventListener(click, resetPasswordDialog, false);
  uiidInput.addEventListener(change, focusToNext, false);
};

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

let logInAdministrator = () => {
  visibilityOf(logInLoader, true);
  visibilityOf(logInButton, false);
  setFieldSetof(emailFieldSet, true);
  setFieldSetof(passwordFieldset, true);
  new Snackbar().hide();
  // if (firebase.auth().currentUser) {
  //   firebase.auth().signOut();
  // }

  fetch('/adminlogin',{
    method: "post",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    //make sure to serialize your JSON body
    body: JSON.stringify({
      email: [emailInput.value],
      password: [passwordInput.value]
    })
  })
  .then( (response) => { 
    visibilityOf(logInLoader, false);
    visibilityOf(logInButton, true);
     if(response.ok){
       console.log(response.json);
     } else {

     }
  }).catch((error)=>{
    console.log(error);
  });
};

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

let validateEmailID = (email, field, error) => {
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
      validateEmailID(emailInput, emailFieldSet, emailError);
    };
  }
};

let focusToNext = () => {
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
window.onload = function () {
  initializeElements();
//  loginAuthStateListener();
};
