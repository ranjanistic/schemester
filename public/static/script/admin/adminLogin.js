//The admin login page script
var emailFieldSet, emailError, passwordFieldset, forgotPassword, emailInput,passwordInput,logInButton,logInLoader
,snackButton,navLoader; 
const nothing = '',hide = "none", show = "block",click='click';

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
    navLoader = document.getElementById('navLoader');
    logInButton.addEventListener(click, adminLogin, false);
}

function initAuthStateListener() {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            window.location.replace("../");
        } else {
            emailInput.focus();
        }
    });
}

function adminLogin() {
    if (firebase.auth().currentUser) {
        firebase.auth().signOut();
    }
    hideSnackBar();
    emailFieldSet.className = "text-field";
    passwordFieldset.className = "text-field";
    emailError.innerHTML = nothing;
    logInButton.style.display = hide;
    logInLoader.style.display = show;
        firebase.auth().signInWithEmailAndPassword(emailInput.value, passwordInput.value).catch(function(error) {
            var errorCode = error.code;
            var errorMessage = error.message;
            switch(errorCode){
                case "auth/wrong-password":{
                    logInLoader.style.display = hide;
                    passwordFieldset.className = "text-field-error";
                    logInButton.style.display = show
                    logInButton.textContent = "Retry";
                    forgotPassword.style.display = show
                };break;
                case "auth/too-many-requests":{
                    logInLoader.style.display = hide;
                    logInButton.style.display = show
                    logInButton.textContent = "Disabled";
                    showSnackBar('Too many unsuccessfull attempts, try again after a while.','',false);
                };break;
                case "auth/user-not-found":{
                    emailFieldSet.className = "text-field-error";
                    emailError.innerHTML = "Account not found.";
                    logInLoader.style.display = hide;
                    emailInput.focus();
                    logInButton.style.display = show
                    logInButton.textContent = "Retry";
                };break;
                case "auth/invalid-email":{
                    logInLoader.style.display = hide;
                    logInButton.style.display = show;
                    validateEmailID(emailInput,emailFieldSet,emailError);
                };break;
                case "auth/user-disabled":{
                    snackButton.onclick = function(){
                        navLoader.style.display = show;
                        window.location.href = "help.html";
                    }
                    logInLoader.style.display = hide;
                    logInButton.style.display = show;
                    logInButton.textContent = "Retry";
                    showSnackBar("This account has been disabled. You might want to contact us directly.","Help",false,true);
                };break;
                case "auth/network-request-failed":{
                    logInLoader.style.display = hide;
                    logInButton.style.display = show
                    logInButton.textContent = "Retry";
                    showSnackBar('No internet connection','',false);
                };break;
                default: {
                    logInLoader.style.display = hide;
                    logInButton.style.display = show
                    logInButton.textContent = "Retry";
                    forgotPassword.style.display = show
                    console.log(errorCode+'/'+errorMessage);
                    alert(errorMessage+' '+errorCode);
                }
            }
        });
}
function validateEmailID(email,field,error){
    if(!isEmailValid(email.value)){
        field.className = "text-field-error";
        if(email.value!=nothing){
            error.innerHTML = "Invalid email address.";
        } else {
            error.innerHTML = "Need an email address here.";
        }
        email.focus()
        email.oninput = function(){
            validateEmailID(emailInput,emailFieldSet,emailError);
        }
    } else {
        field.className = "text-field";
        error.innerHTML = nothing;
    }
}

function focusToNext(){
    if(!isEmailValid(emailInput.value)){
        validateEmailID(emailInput,emailFieldSet,emailError);
        emailInput.focus();
    } else {
        if(passwordInput.value == nothing){
            passwordInput.focus();
        } else if(puiidInput.value == nothing){
            puiidInput.focus();
        }
    }
}
function passwordFieldNormal(){
    forgotPassword.style.display = hide;
    passwordFieldset.className = "text-field";
}
function sendPassResetLink(){
    snackButton.onclick = function(){
        hideSnackBar();
    }
    if(resetMailValidation()){
        hideResetBox();
        showSnackBar("A link has been sent at your provided email address. Reset your password from there.",'Got it',true,true);
    }
}
function resetMailValidation(){
    if(!isEmailValid(document.getElementById('resetemailAdmin').value)){
        document.getElementById('resetemail_fieldset').className = "text-field-error";
        document.getElementById('resetemailError').textContent = "Invalid email address.";
        document.getElementById('resetemailAdmin').oninput = function(){
            resetMailValidation();
        }
        return false;
    } else {
        document.getElementById('resetemail_fieldset').className = "text-field";
        document.getElementById('resetemailError').textContent = nothing;
    }
    return true
}
function showResetBox(){
    document.getElementById('resetemail_fieldset').className = "text-field";
    document.getElementById('resetemailError').textContent = nothing;
    document.getElementById('passResetBox').classList.replace('fmt-animate-opacity-off','fmt-animate-opacity');
    document.getElementById('passResetBox').style.display = show;

}
function hideResetBox(){
    document.getElementById('passResetBox').classList.replace('fmt-animate-opacity','fmt-animate-opacity-off');
}

function isEmailValid(emailValue){
    const emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(String(emailValue).toLowerCase());
}
