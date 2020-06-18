const appName="Schemester", baseColor = "#216bf3",errorBaseColor = "#c40c0c",
 click = 'click', input = 'input',change='change', nothing = '',space = ' ',tab = '   ',hide = 'none',show = 'block';

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

class ResetInputBox{
    id = 'passResetBox';
    inputFieldId = 'resetemail_fieldset';
    inputId = 'resetemailAdmin';
    inputErrorId = 'resetemailError';
    confirmId = 'getLinkButton';
    cancelID = 'cancelResetMenu';
    constructor(){
        this.box = document.getElementById(this.id);
        this.field = document.getElementById(this.inputFieldId);
        this.input = document.getElementById(this.inputId);
        this.inputError = document.getElementById(this.inputErrorId);
        this.confirm = document.getElementById(this.confirmId);
        this.cancel = document.getElementById(this.cancelID);
    }
}

function showSnackBar(text = String(),buttonText = String(), isNormal = true,hasAction = false){
    var snack = new Snackbar();
    snack.text.textContent = text;
    snack.button.textContent = buttonText;
    setDefaultBackground(snack.bar,isNormal);
    visibilityOf(snack.button,hasAction);
    replaceClass(snack.bar,'fmt-animate-bottom-off','fmt-animate-bottom')
    visibilityOf(snack.bar,true);
}

function hideSnackBar(){
    var snack = new Snackbar();
    replaceClass(snack.bar,'fmt-animate-bottom','fmt-animate-bottom-off')
    visibilityOf(snack.bar,false);
}

function setFieldSetof(fieldset,isNormal,errorField = null,errorMsg = nothing){
    if(errorField!=null){
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

function showElement(elements,index){
    for(var k = 0,j=0;k<elements.length;k++,j++){
        visibilityOf(elements[k],k==index);
    }
}

function replaceClass(element,class1,class2,replaceC1){
    if(replaceC1!=null){
        if(replaceC1){
            element.classList.replace(class1,class2);
        } else {
            element.classList.replace(class2,class1);
        }
    } else {
        element.classList.replace(class1,class2);
    }
}

function sendPassResetLink(snackBtn){
    snackBtn.onclick = function(){
        hideSnackBar();
    }
    if(resetMailValidation()){
        hideResetBox();
        showSnackBar("A link has been sent at your provided email address. Reset your password from there.",'Got it',true,true);
    }
}
function resetMailValidation(){
    var reset = new ResetInputBox();
    if(!isEmailValid(reset.input.value)){
        setFieldSetof(reset.field,false,reset.inputError,"Invalid email address.");
        reset.input.oninput = function(){
            setFieldSetof(reset.field,resetMailValidation(),reset.inputError);
            visibilityOf(reset.confirm,resetMailValidation());
        }
        return false;
    } else {
        setFieldSetof(reset.field,true);
    }
    return true
}

function showResetBox(snackBtn){
    var reset = new ResetInputBox();
    setFieldSetof(reset.field,true,reset.inputError)
    replaceClass(reset.box,'fmt-animate-opacity-off','fmt-animate-opacity');
    visibilityOf(reset.box,true);
    //this
    reset.input.onchange = function(){
        visibilityOf(reset.confirm,resetMailValidation());
    }
    reset.cancel.addEventListener(click,hideResetBox,false);
    reset.confirm.addEventListener(click,function(){sendPassResetLink(snackBtn)},false);

}
function hideResetBox(){
    var reset = new ResetInputBox();
    replaceClass(reset.box,'fmt-animate-opacity','fmt-animate-opacity-off');
}

function setDefaultBackground(element,isNormal){
    if(isNormal!=null){
        if(isNormal){
            element.style.backgroundColor = baseColor;
        } else {
            element.style.backgroundColor = errorBaseColor;
        }
    } else {
        element.style.backgroundColor = baseColor;
    }
}

function showLoader(){
    visibilityOf(document.getElementById('navLoader'),true);
}

function visibilityOf(element,visible = Boolean()){
    if(visible){
        element.style.display = show
    } else {
        element.style.display = hide
    }
}

function isEmailValid(emailValue){
    const emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(String(emailValue).toLowerCase());
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
