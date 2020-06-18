const click = 'click', nothing = '',space = ' ',tab = '   ',hide = 'none',show = 'block';

class Snackbar{
    constructor(bar,text,button){
        this.bar = bar;
        this.text = text;
        this.button = button;
    }

}


function showSnackBar(text = String(),buttonText = String(), isNormal = true,hasAction = false){
    var snack = new Snackbar(
        document.getElementById('snackBar'),document.getElementById('snackText'),
        document.getElementById('snackButton')
    );
    snack.text.textContent = text;
    snack.button.textContent = buttonText;
    if(!isNormal){
        snack.bar.style.backgroundColor = "#c40c0c"
    } else {
        snack.bar.style.backgroundColor = "#216bf3ff"
    }
    if(!hasAction){
        snack.button.style.display = 'none';
    } else {
        snack.button.style.display = 'block';
    }
    snack.bar.classList.replace('fmt-animate-bottom-off','fmt-animate-bottom');
    snack.bar.style.display = 'block';
}
function hideSnackBar(){
    var snack = new Snackbar(
        document.getElementById('snackBar'),document.getElementById('snackText'),
        document.getElementById('snackButton')
    );
    snack.bar.classList.replace('fmt-animate-bottom','fmt-animate-bottom-off');
    snack.bar.style.display = 'none';
}

function visibilityOf(element,visible = Boolean()){
    if(visible){
        element.style.display = show
    } else {
        element.style.display = hide
    }
}

function setFieldSetof(fieldset,isNormal,errorField,errorMsg = nothing){
    if(errorField!=null){
        errorField.innerHTML = errorMsg;
    }
    if(isNormal){
        fieldset.className = "text-field";
        if(errorField!=null){
            errorField.innerHTML = nothing;
        }
    } else {
        fieldset.className = "text-field-error";
    }
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
    if(!isEmailValid(document.getElementById('resetemailAdmin').value)){
        setFieldSetof(document.getElementById('resetemail_fieldset'),false,
            document.getElementById('resetemailError'),"Invalid email address."
        );
        document.getElementById('resetemailAdmin').oninput = function(){
            resetMailValidation();
        }
        return false;
    } else {
        setFieldSetof(document.getElementById('resetemail_fieldset'),true,document.getElementById('resetemailError'));
    }
    return true
}
function showLoader(){
    visibilityOf(document.getElementById('navLoader'),true);
}
function showResetBox(snackBtn){
    setFieldSetof(document.getElementById('resetemail_fieldset'),true,document.getElementById('resetemailError'))
    document.getElementById('passResetBox').classList.replace('fmt-animate-opacity-off','fmt-animate-opacity');
    visibilityOf(document.getElementById('passResetBox'),true);
    document.getElementById('cancelResetMenu').addEventListener(click,hideResetBox,false);
    document.getElementById('getLinkButton').addEventListener(click,function(){sendPassResetLink(snackBtn)},false);

}
function hideResetBox(){
    document.getElementById('passResetBox').classList.replace('fmt-animate-opacity','fmt-animate-opacity-off');
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