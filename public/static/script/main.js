const appName="Schemester", baseColor = "#216bf3",errorBaseColor = "#c40c0c",
 click = 'click', input = 'input',change='change', nothing = '',space = ' ',tab = '   ',hide = 'none',show = 'block',
 adminLoginPage = '/admin/admin_login.html',adminDashPage = '/admin/admin_dash.html',homepage = '/home.html',root = '/',
 adminSettings = '/admin/management.html';
var cred = Array(2);
class Snackbar{
    id = 'snackBar';
    textId = 'snackText';
    buttonId = 'snackButton';
    constructor(){
        this.bar = document.getElementById(this.id);
        this.text = document.getElementById(this.textId);
        this.button = document.getElementById(this.buttonId);
    }
}

function snackBar(isShowing,text = String(),hasAction = false,actionText = String(),isNormal = true){
    var snack = new Snackbar();
    if(isShowing){
        snack.text.textContent = text;
        if(hasAction){
            snack.button.textContent = actionText;
        }
        setDefaultBackground(snack.bar,isNormal);
        visibilityOf(snack.button,hasAction);   
    }
    replaceClass(snack.bar,'fmt-animate-bottom-off','fmt-animate-bottom',isShowing)
    visibilityOf(snack.bar,isShowing);
}

class DialogID{
    viewId = 'dialogView';
    boxId = 'dialogBox';
    imageId = 'dialogImage';
    contentId  = 'dialogContent';
    headingId = 'dialogHeading';
    subHeadId = 'dialogSubHeading';
    inputFieldId = Array('dialogInputField1','dialogInputField2');
    fieldCaptionId = Array('dialogFieldCaption1','dialogFieldCaption2');
    inputId = Array('dialogInput1','dialogInput2');
    inputErrorId = Array('dialogInputError1','dialogInputError2');
    textFieldId = 'dialogInputAreaField';
    textFieldCaptionId = 'dialogAreaFieldCaption';
    textInputAreaId = 'dialogInputArea';
    textInputErrorId = 'dialogInputAreaError';
    optionsId = 'dialogOpts';
    optionsRadioLabelId = Array('dialogChipLabel1','dialogChipLabel2');
    optionsRadioId = Array('dialogChip1','dialogChip2');
    actionsId = 'dialogActions';
    actionLoader = 'dialogLoader';
    actionPositiveId = 'dialogPositive';
    actionNegativeId = 'dialogNegative';
}
class ConfirmID{
    viewId = 'confirmView';
    boxId = 'confirmBox';
    headingId = 'confirmHeading';
    subHeadId = 'confirmSubHeading';
    actionsId = 'confirmActions';
    actionLoader = 'confirmLoader';
    actionPositiveId = 'confirmPositive';
    actionNegativeId = 'confirmNegative';
}
class Dialog extends DialogID{
    constructor(totalInputs = this.inputFieldId.length,largeTextArea = false,radios = false){
        super(DialogID);
        try{
            if(totalInputs>this.inputFieldId.length){
                throw Error("DILE:Dialog Input Limit Excession");
            }
        }catch{
            snackBar(true,'Internal Error.',true,'Report',false);
            new Snackbar().button.onclick = function(){
                feedBackBox();
                snackBar(false);
            }
        }
        this.view = document.getElementById(this.viewId);
        setDefaultBackground(this.view,true);
        this.box = document.getElementById(this.boxId);
        opacityOf(this.box,'1');
        this.image = document.getElementById(this.imageId);
        this.content = document.getElementById(this.contentId);

        this.heading = document.getElementById(this.headingId);
        this.subHeading = document.getElementById(this.subHeadId);
        this.actions = document.getElementById(this.actionsId);

        this.inputField = Array(totalInputs);
        this.inputCaption = Array(totalInputs);
        this.input = Array(totalInputs);
        this.inputError = Array(totalInputs); 

        for(var k = 0;k<this.inputFieldId.length;k++){
            this.inputField[k] = document.getElementById(this.inputFieldId[k])
            this.inputCaption[k] = document.getElementById(this.fieldCaptionId[k]);
            this.input[k] = document.getElementById(this.inputId[k]);
            this.inputError[k] = document.getElementById(this.inputErrorId[k]);
            this.input[k].value = null;
            setFieldSetof(this.inputField[k],true,this.inputError[k]);
        }
        
        for(var k = 0;k<totalInputs;k++){
            visibilityOf(this.inputField[k],true);
        }
        for(var j = totalInputs;j<this.inputFieldId.length;j++){
            visibilityOf(this.inputField[j],false);
        }

        this.textField = document.getElementById(this.textFieldId);
        visibilityOf(this.textField,largeTextArea);
        if(largeTextArea){
            this.textFieldCaption = document.getElementById(this.textFieldCaptionId);
            this.textInput = document.getElementById(this.textInputAreaId);
            this.textInputError = document.getElementById(this.textInputErrorId);
        }
        setFieldSetof(this.textField,true,this.textInputError);
    
        this.options = document.getElementById(this.optionsId);
        visibilityOf(this.options,radios);
        this.optionsRadio = Array(this.optionsRadioId.length);
        this.optionsRadioLabel = Array(this.optionsRadioId.length);
        if(radios){
            for(var k = 0;k<this.optionsRadioId.length;k++){
                this.optionsRadio[k] = document.getElementById(this.optionsRadioId[k]);
                this.optionsRadioLabel[k] = document.getElementById(this.optionsRadioLabelId[k]);
            }
        }
        this.loading = document.getElementById(this.actionLoader);
        this.actionPositive = document.getElementById(this.actionPositiveId);
        this.actionNegative = document.getElementById(this.actionNegativeId);
        visibilityOf(this.loading,false);
        visibilityOf(this.actionPositive,true);
        visibilityOf(this.actionNegative,true);
    }
    
    setDisplay(head, body,imgsrc = null){
        this.heading.textContent = head;
        this.subHeading.textContent = body;
        visibilityOf(this.image,imgsrc != null)
        if(imgsrc == null){
            this.content.classList.remove('fmt-threequarter');
        }else {
            this.content.classList.add('fmt-threequarter');
        }
        replaceClass(this.content,'fmt-padding-small','fmt-padding',imgsrc == null);
        this.image.src = imgsrc;
    }
    loader(show = true){
        visibilityOf(this.loading,show);
        visibilityOf(this.actionPositive,!show);
        visibilityOf(this.actionNegative,!show);
        if(show){
            opacityOf(this.box,"0.5")
        }else{
            opacityOf(this.box,"1")
        }
    }
    inputParams(caption,hint,type){
        this.inputCaption[0].textContent = caption;
        this.input[0].placeholder = hint;
        this.input[0].type = type;
    }
    inputParamsMulti(captions,hints,types){
        for(var k = 0;k<this.inputFieldId.length;k++){
            this.inputCaption[k].textContent = captions[k];
            this.input[k].placeholder = hints[k];
            this.input[k].type = types[k];
        }
    }
    largeTextArea(caption,hint){
        this.textFieldCaption.textContent = caption;
        this.textInput.placeholder = hint;
    }
    setButtonText(positive,negative){
        visibilityOf(this.actionPositive,positive != null)
        visibilityOf(this.actionNegative,negative != null)
        this.actionPositive.textContent = positive;
        this.actionNegative.textContent = negative;
    }

    setOptions(optionTextArray,defaultCheck){
        for(var k = 0;k<this.optionsRadioId.length;k++){
            //TODO: this.optionsRadioLabel[k].textContent = optionTextArray[k];
        }
        this.optionsRadio[defaultCheck].checked = true;
    }
    getInput(index){
        return this.input[index];
    }
    getRadio(index){
        return this.optionsRadio[index];
    }
    positiveAction(){
        return this.actionPositive;
    }
    negativeAction(){
        return this.actionNegative;
    }
    setBackgroundColor(color = baseColor){
        elementFadeVisibility(this.view,false);
        this.view.style.backgroundColor = color;
        elementFadeVisibility(this.view,true);
    }
    existence(show = true){
        elementFadeVisibility(this.view,show);
    }
}

class ConfirmDialog extends ConfirmID{
    constructor(){
        super(ConfirmID);
        this.view = document.getElementById(this.viewId);
        setDefaultBackground(this.view,true);
        this.box = document.getElementById(this.boxId);
        opacityOf(this.box,'1');
        this.heading = document.getElementById(this.headingId);
        this.subHeading = document.getElementById(this.subHeadId);
        this.actions = document.getElementById(this.actionsId);
        this.loading = document.getElementById(this.actionLoader);
        this.actionPositive = document.getElementById(this.actionPositiveId);
        this.actionNegative = document.getElementById(this.actionNegativeId);
        visibilityOf(this.loading,false);
        visibilityOf(this.actionPositive,true);
        visibilityOf(this.actionNegative,true);
    }
    setDisplay(head, body){
        this.heading.textContent = head;
        this.subHeading.innerHTML = body;
    }
    loader(show = true){
        visibilityOf(this.loading,show);
        visibilityOf(this.actionPositive,!show);
        visibilityOf(this.actionNegative,!show);
        if(show){
            opacityOf(this.box,"0.5")
        }else{
            opacityOf(this.box,"1")
        }
    }
    setButtonText(positive,negative){
        this.actionPositive.textContent = positive;
        this.actionNegative.textContent = negative;
    }
    positiveAction(){
        return this.actionPositive;
    }
    negativeAction(){
        return this.actionNegative;
    }
    setBackgroundColor(color = baseColor){
        elementFadeVisibility(this.view,false);
        this.view.style.backgroundColor = color;
        elementFadeVisibility(this.view,true);
    }
    existence(show = true){
        elementFadeVisibility(this.view,show);
    }
}

function sendPassResetLink(){
    var snack = new Snackbar()
    snack.button.onclick = function(){
        snackBar(false);
    }
    snackBar(true,"A link has been sent at your provided email address. Reset your password from there.",true,'Got it');
}

function resetPasswordDialog(isShowing = true){
    var resetDialog = new Dialog(1);
    if(isShowing){            
        resetDialog.setDisplay('Reset password','Provide us your email address and we\'ll help you to reset your password via an email.'
        ,'/static/graphic/icons/schemester512.png');
        resetDialog.inputParams('Your email address','someone@example.domain','email','Invalid email address');
        resetDialog.setButtonText('Send Link','Cancel');
        resetDialog.getInput(0).onchange = function(){
            verificationValid();
        }
        function verificationValid(){
            var valid = isEmailValid(resetDialog.input[0].value);
            setFieldSetof(resetDialog.inputField[0],valid,resetDialog.inputError[0],'Invalid email address');
            visibilityOf(resetDialog.positiveAction(),valid);
            resetDialog.getInput(0).oninput = function(){
                setFieldSetof(resetDialog.inputField[0],isEmailValid(resetDialog.input[0].value),resetDialog.inputError[0],'Invalid email address');
                visibilityOf(resetDialog.positiveAction(),isEmailValid(resetDialog.input[0].value));
            }
            return isEmailValid(resetDialog.input[0].value);
        }
        resetDialog.positiveAction().onclick = function(){
            if(verificationValid()){
                sendPassResetLink();
                snackBar(true,"You'll receive a link if your email address was correct. Reset your password from there.",true,'Got it');
                var snack = new Snackbar();
                snack.button.onclick = function(){snackBar(false);}
                resetDialog.existence(false);
            }
        }
        resetDialog.negativeAction().onclick = function(){
            resetDialog.existence(false);
        }
    }
    
    resetDialog.existence(isShowing);
}

function changeEmailBox(isShowing = true){
    var mailChange = new Dialog(2);
    mailChange.setDisplay('Change Email Address','You need to verify yourself, and then provide your new email address. You\'ll be logged out after successful change.'
    ,'/static/graphic/icons/schemester512.png');
    mailChange.inputParamsMulti(Array('Account password','New email address'),Array('Current password','someone@example.domain'),Array('password','email'));
    mailChange.setButtonText('Change Email ID','Abort');

    mailChange.getInput(0).oninput = function(){
        visibilityOf(mailChange.positiveAction(),runEmptyCheck(mailChange.getInput(0),mailChange.inputField[0],mailChange.inputError[0]));
    }
    mailChange.getInput(0).onchange = function(){
        visibilityOf(mailChange.positiveAction(),runEmptyCheck(mailChange.getInput(0),mailChange.inputField[0],mailChange.inputError[0]));
    }
    mailChange.getInput(1).oninput = function(){
        visibilityOf(mailChange.positiveAction(),isEmailValid(mailChange.getInput(1)));
    }
    mailChange.getInput(1).onchange = function(){
        visibilityOf(mailChange.positiveAction(),runEmailCheck(mailChange.getInput(1),mailChange.inputField[1],mailChange.inputError[1]));
    }
    mailChange.positiveAction().onclick = function(){
        if(runEmptyCheck(mailChange.getInput(0),mailChange.inputField[0],mailChange.inputError[0])){
            if(runEmailCheck(mailChange.getInput(1),mailChange.inputField[1],mailChange.inputError[1])){
                snackBar(true,"Your email id has been changed to "+mailChange.getInput(1).value,true,'okay');
                var snack = new Snackbar();
                snack.button.onclick = function(){
                    snackBar(true,"You need to login again");
                    logoutUser(false);
                }
                mailChange.existence(false);
                firebase.auth().signOut();
            }
        }
    }
    mailChange.negativeAction().onclick = function(){mailChange.existence(false);}
    mailChange.existence(isShowing);
}

function registrationDialog(isShowing = true){
    var user = firebase.auth().currentUser;
    if (user) {
            var confirmLogout = new ConfirmDialog();
            confirmLogout.setBackgroundColor('#216bf353');
            confirmLogout.setDisplay('Already Logged In.','You are currently logged in as <b>' + user.email +'</b>. You need to log out before creating a new account. Confirm log out?');
            confirmLogout.setButtonText('Stay logged in','Log out');
            confirmLogout.positiveAction().onclick = function(){
            confirmLogout.existence(false);
            }
            confirmLogout.negativeAction().onclick = function(){
            confirmLogout.loader();
            logoutUser();
            }
            confirmLogout.existence(true);
    } else {
        var regDial = new Dialog(2);
        regDial.setDisplay('Create Admin Account','Create a new account with a working email address (individual or institution).');
        regDial.setButtonText('Next','Cancel');
        regDial.inputParamsMulti(Array('Email Address','New Password'),Array('someone@example.domain','Strong password'),Array('email','password'));
        regDial.negativeAction().onclick = function(){regDial.existence(false);snackBar(false);}
        regDial.getInput(0).onchange = function(){
            if( runEmailCheck(regDial.getInput(0),regDial.inputField[0],regDial.inputError[0])){
                regDial.getInput(1).focus();
            }
        }
        regDial.getInput(1).onchange = function(){
            //runPasswordCheck(regDial.getInput(1),regDial.inputField[1],regDial.inputError[1]);
        }
        regDial.positiveAction().onclick = function(){
            regDial.loader();
            snackBar(false);
            if(isEmailValid(regDial.getInput(0).value)){
                if(true){//isPasswordValid(regDial.getInput(1).value)){
                    createAccount(regDial,regDial.getInput(0).value ,regDial.getInput(1).value)
                } else{
                    runPasswordCheck(regDial.getInput(1),regDial.inputField[1],regDial.inputError[1]);
                    regDial.loader(false);
                }
            } else{
                runEmailCheck(regDial.getInput(0),regDial.inputField[0],regDial.inputError[0]);
                regDial.loader(false);
            }
        }
        regDial.existence(isShowing);
    }
}
function clog(msg){
    console.log(msg);
}
//TODO: this
function createAccount(dialog,email,password){
    firebase.auth().createUserWithEmailAndPassword(email, password).then(function(){
        clog('true account creations');
        cred = Array(email,password);
        snackBar(false);
        dialog.loader(false);
        dialog.existence(false);
        accountVerificationDialog(true);
    }).catch(function(error) {
        clog('inside account creations error');
        var errorCode = error.code;
        var errorMessage = error.message;
        switch(errorCode){
            case 'auth/invalid-email': snackBar(true,'Email address was invalid',false,nothing,false);break;
            case 'auth/weak-password': snackBar(true,'Weak password',false,nothing,false);break;
            case 'auth/email-already-in-use':{snackBar(true,'This email address is already being used by another institution.',true,'Login',false);
            new Snackbar().button.onclick = function(){
                window.location.href = '/admin/admin_login.html';
            }
            }break;
            case 'auth/account-exists-with-different-credential':{
                snackBar(true,'This account already exists.',true,'Login');
                new Snackbar().button.onclick = function(){
                    window.location.href = '/admin/admin_login.html';
                }
            }break;
            case 'auth/timeout':{
                snackBar(true,'Connection timed out.',false,nothing,false);
            }break;
            case 'auth/operation-not-allowed':{
                snackBar(true,'Server error',true,'Report',false);
                new Snackbar().button.onclick = function(){
                    feedBackBox();
                    snackBar(false);
                }
            }break;
            default:{
                snackBar(true,errorMessage,true,'Report',false);
                new Snackbar().button.onclick = function(){
                    feedBackBox();
                    snackBar(false);
                }
            }
        }
        dialog.loader(false);
    });
}

function accountVerificationDialog(isShowing = true,emailSent = false){
    var verify = new ConfirmDialog();
    var user = firebase.auth().currentUser;
    if(emailSent){
        verify.setDisplay('Waiting for verification','A link has been sent. Check your email box at <b>'+user.email+'</b>, verify your account there, and then click continue here.');
        verify.setButtonText('Verify & Continue','Abort');
        verify.negativeAction().onclick = function(){
            verify.loader();
            user.delete().then(function() {
                verify.existence(false);
                snackBar(true,'Your account was not created.',false,nothing,false);
            }).catch(function(error) {
                verify.loader(false);
                snackBar(true,error,true,'Report',false);
            });
        }
        verify.positiveAction().onclick = function(){
            if(silentLogin(cred[0],cred[1])){
                user = firebase.auth().currentUser;
                if(user.emailVerified){
                    window.location.replace('/registration.html');
                } else {
                    snackBar(true,'Not yet verified',false,nothing,false);
                    verify.loader(false);
                }
            } else {
                snackBar(true,'Unable to verify',false,nothing,false);   
            }
        }
    } else {
        verify.setDisplay('Verification Required','We need to verify you. A link will be sent at <b>'+user.email+'</b>, you need to verify your account there. Confirm to send link?');
        verify.setButtonText('Send link','Cancel');
        verify.negativeAction().onclick = function(){
            verify.loader();
            user.delete().then(function() {
                verify.existence(false);
                snackBar(true,'Your account was not created.',false,nothing,false);
            }).catch(function(error) {
                verify.loader(false);
                snackBar(true,error,true,'Report',false);
            });
        }
        verify.positiveAction().onclick = function(){
            verify.loader();
            user.sendEmailVerification().then(function() {
                snackBar(true,'Email sent');
                accountVerificationDialog(true,true);
                verify.loader(false);
            }).catch(function(error) {
                snackBar(true,error,true,'Report',false);
                clog(error);
                verify.loader(false);
            // An error happened.
            });
        }
    }
    verify.existence(isShowing);
}
function logoutUser(sendHome = true){
    if(sendHome){
        window.location.replace("/");
    } else {
        window.location.replace("/admin/admin_login.html");
    }
    firebase.auth().signOut();
}
function silentLogin(email,password){
    firebase.auth().signInWithEmailAndPassword(email,password).then(function(){
        return true;
    }).catch(function(error) {
        return false;    
    });
}
function feedBackBox(isShowing = true){
    var feedback = new Dialog(1,true,true);
    feedback.setDisplay('Contact Developers','Are you facing any problem? Or want a feature that helps you in some way? Explain everything that here. '
        +'We are always eager to listen from you.',
        '/static/graphic/icons/schemester512.png');
    feedback.inputParams('Your email address','To help or thank you directly ;)','email','Invalid');
    feedback.largeTextArea('Describe everything','Start typing your experience here','Can\'t be empty');
    feedback.setButtonText('Submit','Abort');
    feedback.setOptions(Array('Feedback','Bug'),0);
    feedback.getInput(0).onchange = function(){
        visibilityOf(feedback.positiveAction(),runEmailCheck(feedback.getInput(0),feedback.inputField[0],feedback.inputError[0]));
        if(isEmailValid(feedback.getInput(0).value)){
            feedback.textInput.focus();
        }
    }
    feedback.textInput.oninput = function(){
        visibilityOf(feedback.positiveAction(),runEmptyCheck(feedback.textInput,feedback.textField,feedback.textInputError));
    }
    feedback.textInput.onchange = function(){
        visibilityOf(feedback.positiveAction(),runEmptyCheck(feedback.textInput,feedback.textField,feedback.textInputError));
    }

    feedback.positiveAction().onclick = function(){
        if(runEmailCheck(feedback.getInput(0),feedback.inputField[0],feedback.inputError[0])){
            if(runEmptyCheck(feedback.textInput,feedback.textField,feedback.textInputError)){
                window.location.href = "mailto:schemester@outlook.in?subject=From "+feedback.getInput(0).value+"&body="+feedback.textInput.value;
                snackBar(true,"Thanks for the interaction. We'll look forward to that.",true,'Hide');
                var snack = new Snackbar();
                snack.button.onclick = function(){snackBar(false);}
                feedback.existence(false);
            }
        }
    }
    feedback.optionsRadio[0].onclick = function(){
        feedback.setBackgroundColor();
    }
    feedback.optionsRadio[1].onclick = function(){
        feedback.setBackgroundColor(errorBaseColor);
    }
    feedback.negativeAction().onclick = function(){
        feedback.existence(false);
    }
    feedback.existence(isShowing);
}

function setFieldSetof(fieldset,isNormal = true,errorField = null,errorMsg = null){
    if(errorField!=null && errorMsg!=null){
        errorField.innerHTML = errorMsg;
    }
    if(isNormal && errorField!=null){
        errorField.innerHTML = nothing;
    }
    setClassName(fieldset,'text-field','text-field-error',isNormal);
}

function setClassName(element,normalClass,eventClass,condition){
    if(condition!=null){
        if(condition){
            element.className = normalClass;
        } else {
            element.className = eventClass;
        }
    } else {
        element.className = normalClass;
    }
}

function runEmailCheck(input,fieldset,error){
    setFieldSetof(fieldset,isEmailValid(input.value),error,'Invalid email address');
    input.oninput = function(){
        setFieldSetof(fieldset,isEmailValid(input.value),error,'Invalid email address');
    }
    return isEmailValid(input.value);
}

function runPasswordCheck(input,fieldset,error){
    setFieldSetof(fieldset,isPasswordValid(input.value),error,'Password should atleast contain:\n'+
    '· Uppercase and lowercase letters\n· Numbers\n· Special charecters');
    input.oninput = function(){
        setFieldSetof(fieldset,input.value.length>=8,error,'Password should be atleast 8 charecters long');
        setFieldSetof(fieldset,isPasswordValid(input.value),error,'Password should atleast contain:\n'+
            '· Uppercase and lowercase letters\n· Numbers\n· Special charecters');
    }
}

function runEmptyCheck(input,fieldset,error){
    setFieldSetof(fieldset,isNotEmpty(input.value),error,'This can\'t be empty');
    input.oninput = function(){
        setFieldSetof(fieldset,isNotEmpty(input.value),error,'This can\'t be empty');
    }
    return isNotEmpty(input.value);
}

function showElement(elements,index){
    for(var k = 0,j=0;k<elements.length;k++,j++){
        visibilityOf(elements[k],k==index);
    }
}

function replaceClass(element,class1,class2,replaceC1 = true){
    replaceC1?element.classList.replace(class1,class2):element.classList.replace(class2,class1);
}

function elementFadeVisibility(element,isVisible){
    replaceClass(element,'fmt-animate-opacity-off','fmt-animate-opacity',isVisible);
    visibilityOf(element,isVisible);
}

function setDefaultBackground(element,isNormal = true){
        if(isNormal){
            element.style.backgroundColor = baseColor;
        } else {
            element.style.backgroundColor = errorBaseColor;
        }
}

function showLoader(){
    visibilityOf(document.getElementById('navLoader'),true);
}
function hideLoader(){
    visibilityOf(document.getElementById('navLoader'),false);
}

function opacityOf(element,value){
    element.style.opacity = value;
}

function visibilityOf(element,visible = Boolean()){
    if(visible){
        element.style.display = show
    } else {
        element.style.display = hide
    }
}

function isNotEmpty(text){
    return text!=null&&text!=nothing&& text.length>0&&text.trim()!=null
}

function isEmailValid(emailValue){
    const emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(String(emailValue).toLowerCase());
}
function isPasswordValid(passValue){
    const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#()])[A-Za-z\d@$!%*?&#()]{8,}$/
    return passRegex.test(String(passValue));
}
function getDayName(dIndex){
    switch(dIndex){
        case 0: return "Sunday";
        case 1: return "Monday";
        case 2: return "Tuesday";
        case 3: return "Wednesday";
        case 4: return "Thursday";
        case 5: return "Friday";
        case 6: return "Saturday";
        default:return "Error";
    }
}
function getMonthName(mIndex){
    switch(mIndex){
        case 0: return "January";
        case 1: return "February";
        case 2: return "March";
        case 3: return "April";
        case 4: return "May";
        case 5: return "June";
        case 6: return "July";
        case 7: return "August";
        case 8: return "September";
        case 9: return "October";
        case 10: return "November";
        case 11: return "December";
        default: return "Error";
    }
}

let getElement = function(id){
    return document.getElementById(id);
}