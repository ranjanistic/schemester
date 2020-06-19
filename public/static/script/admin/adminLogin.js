//The admin login page script
var emailFieldSet, emailError, passwordFieldset, forgotPassword, emailInput,passwordInput,logInButton,logInLoader
,back;

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
    visibilityOf(forgotPassword,false);
    forgotPassword.addEventListener(click,function(){
        resetPasswordBox(true,'Tell us your email address and we\'ll send you a link to help you reset your password.',
        '/static/graphic/icons/schemester512.svg','Your email address','someone@example.domain','Invalid email address','Send link','Cancel');
    },false);
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
                showSnackBar('Too many unsuccessfull attempts, try again after a while.',false,nothing,false);
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
                showSnackBar("This account has been disabled. You might want to contact us directly.",true,"Help",false);
            };break;
            case "auth/network-request-failed":{
                logInButton.textContent = "Retry";
                showSnackBar('No internet connection',false,nothing,false);
            };break;
            default: {
                logInButton.textContent = "Retry";
                visibilityOf(forgotPassword,true);
                showSnackBar(errorCode+':'+errorMessage,true,'Help',false);
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
            setFieldSetof(field,true);
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
