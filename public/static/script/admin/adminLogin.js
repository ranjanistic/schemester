//The admin login page script
var emailFieldSet, emailError, passwordFieldset, forgotPassword, emailInput,passwordInput,logInButton,logInLoader,
 nothing = '',hide = "none", show = "block";
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
}

function initAuthStateListener() {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            window.location.replace("../");
        } else {
            emailInput.focus();
        }
    });
    logInButton.addEventListener('click', adminLogin, false);
}

function adminLogin() {
    if (firebase.auth().currentUser) {
        firebase.auth().signOut();
    } 
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
                    logInButton.textContent = "Retry";
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
                    logInButton.style.display = show
                    validateEmailID();
                };break;
                default: {
                    logInLoader.style.display = hide;
                    logInButton.style.display = show
                    logInButton.textContent = "Retry";
                    forgotPassword.style.display = show
                    alert(errorMessage);
                }
            }
        });
}
function validateEmailID(){
    if(!isEmailValid(emailInput.value)){
        emailFieldSet.className = "text-field-error";
        if(emailInput.value!=nothing){
            emailError.innerHTML = "Invalid email address.";
        } else {
            emailError.innerHTML = "Need an email address here.";
        }
        emailInput.focus()
        emailInput.oninput = function(){
            validateEmailID();
        }
    } else {
        emailFieldSet.className = "text-field";
        emailError.innerHTML = nothing;
    }
}

function focusToNext(){
    if(!isEmailValid(emailInput.value)){
        validateEmailID();
        emailInput.focus();
    } else {
        if(passwordInput.value == nothing){
            passwordInput.focus();
        } else if(puiidInput.value == nothing){
            puiidInput.focus();
        }
    }
}

function isEmailValid(emailValue){
    const emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(String(emailValue).toLowerCase());
}
