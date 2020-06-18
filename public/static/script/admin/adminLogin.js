//The admin login page script
var emailFieldSet, emailError, passwordFieldset, forgotPassword, emailInput,passwordInput,logInButton,logInLoader
,snackButton,back;

function initializeElements(){
    emailFieldSet = document.getElementById('email_fieldset');
    passwordFieldset = document.getElementById('password_fieldset');
    puiidFieldSet = document.getElementById("puiid_fieldset")
    forgotPassword = document.getElementById('forgotpasswordButton');
    emailError = document.getElementById("emailError");
    emailInput = document.getElementById('adminemail');
    passwordInput = document.getElementById('adminpassword');
    puiidInput = document.getElementById('puiid');
    logInButton = document.getElementById('loginAdminButton');
    logInLoader = document.getElementById('loginLoader');
    snackButton = document.getElementById('snackButton');
    back = document.getElementById('backFromLogin');

    back.addEventListener(click,function(){
        showLoader();
        window.location.replace('/');
    },false);
    logInButton.addEventListener(click, adminLogin, false);
    passwordInput.addEventListener(input,function(){
        setFieldSetof(passwordFieldset,true);
        visibilityOf(forgotPassword,false);
    },false);
    emailInput.addEventListener(change,focusToNext,false);
    passwordInput.addEventListener(change,focusToNext,false);
    forgotPassword.addEventListener(click,function(){showResetBox(snackButton)},false);
    puiidInput.addEventListener(change,focusToNext(),false);
    
}

function initAuthStateListener() {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            window.location.replace("/");
        }
    });
}

function adminLogin() {
    visibilityOf(logInLoader,true);
    visibilityOf(logInButton,false);
    setFieldSetof(emailFieldSet,true);
    setFieldSetof(passwordFieldset,true);
    hideSnackBar();
    if (firebase.auth().currentUser) {
        firebase.auth().signOut();
    }
    firebase.auth().signInWithEmailAndPassword(emailInput.value, passwordInput.value).catch(function(error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log(errorCode);
        switch(errorCode){
            case "auth/wrong-password":{
                setFieldSetof(passwordFieldset,false);
                visibilityOf(forgotPassword,true);
                logInButton.textContent = "Retry";
            };break;
            case "auth/too-many-requests":{
                showSnackBar('Too many unsuccessfull attempts, try again after a while.','',false);
                logInButton.textContent = "Disabled";
            };break;
            case "auth/user-not-found":{
                setFieldSetof(emailFieldSet,false,emailError,"Account not found.");
                logInLoader.style.display = hide;
                emailInput.focus();
                logInButton.textContent = "Retry";
            };break;
            case "auth/invalid-email":{
                validateEmailID(emailInput,emailFieldSet,emailError);
            };break;
            case "auth/user-disabled":{
                snackButton.onclick = function(){
                    showLoader();
                    window.location.href = "/about.html#userDisabled";
                }
                logInButton.textContent = "Retry";
                showSnackBar("This account has been disabled. You might want to contact us directly.","Help",false,true);
            };break;
            case "auth/network-request-failed":{
                logInButton.textContent = "Retry";
                showSnackBar('No internet connection','',false);
            };break;
            default: {
                logInButton.textContent = "Retry";
                visibilityOf(forgotPassword,true);
                console.log(errorCode+'/'+errorMessage);
                alert(errorMessage+' '+errorCode);
            }
        }
        visibilityOf(logInLoader,false);
        visibilityOf(logInButton,true);
    });
}

function validateEmailID(email,field,error){
    setFieldSetof(field,isEmailValid(email.value),error,"Invalid email address.");
    if(!isEmailValid(email.value)){
        email.focus();
        email.oninput = function(){
            validateEmailID(emailInput,emailFieldSet,emailError);
        }
    }
}

function focusToNext(){
    if(!isEmailValid(emailInput.value)){
        if(emailInput.value != nothing){
            validateEmailID(emailInput,emailFieldSet,emailError);
        }
        emailInput.focus();
    } else {
        if(passwordInput.value == nothing){
            passwordInput.focus();
        } else if(puiidInput.value == nothing){
            puiidInput.focus();
        }
    }
}
