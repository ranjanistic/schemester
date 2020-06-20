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
    actionPositiveId = 'dialogPositive';
    actionNegativeId = 'dialogNegative';
}

class Dialog extends DialogID{
    constructor(totalInputs = this.inputFieldId.length,largeTextArea = false,radios = false){
        super(DialogID);
        this.view = document.getElementById(this.viewId);
        this.box = document.getElementById(this.boxId);

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
        }
        if(totalInputs>this.inputFieldId.length){
            console.log('Input Field limit exceeded');
            throw Error("DILE:Dialog Input Limit Excession");
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
        this.actionPositive = document.getElementById(this.actionPositiveId);
        this.actionNegative = document.getElementById(this.actionNegativeId);
    }
    
    setImage(source){
        this.image.src = source;
    }
    setDisplay(head, body){
        this.heading.textContent = head;
        this.subHeading.textContent = body;
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
        this.actionPositive.textContent = positive;
        this.actionNegative.textContent = negative;
    }

    setOptions(optionTextArray,defaultCheck){
        for(var k = 0;k<this.optionsRadioId.length;k++){
            //this.optionsRadioLabel[k].textContent = optionTextArray[k];
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
    existence(show = true){
        elementFadeVisibility(this.view,show);
    }
}



//TODO: add isShowing like Dialog boxes
function snackBar(isShowing,text = String(),hasAction = false,actionText = String(),isNormal = true){
    var snack = new Snackbar();
    if(isShowing){
        snack.text.textContent = text;
        if(hasAction){
            snack.button.textContent = actionText;
        }
        setDefaultBackground(snack.bar,isNormal);
        visibilityOf(snack.button,hasAction);
        replaceClass(snack.bar,'fmt-animate-bottom-off','fmt-animate-bottom')
    } else {
        replaceClass(snack.bar,'fmt-animate-bottom','fmt-animate-bottom-off')
    }
    visibilityOf(snack.bar,isShowing);
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
        resetDialog.setImage('/static/graphic/icons/schemester512.png');
        resetDialog.setDisplay('Reset password','Provide us your email address and we\'ll help you to reset your password via an email.');
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
                snackBar(true,"A link has been sent at your provided email address. Reset your password from there.",true,'Got it');
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



function feedBackBox(isShowing = true){
    var feedback = new Dialog(1,true,true);
    feedback.setDisplay('Contact Developers','Are you facing any problem? Or want a feature that helps you in some way? Explain everything that here. '
        +'We are always eager to listen from you.');
    feedback.setImage('/static/graphic/blueLoader.svg');
    feedback.inputParams('Your email address','To help or thank you directly ;)','email','Invalid');
    feedback.largeTextArea('Describe everything','Start typing your experience here','Can\'t be empty');
    feedback.setButtonText('Submit','Abort');
    feedback.setOptions(Array('Feedback','Bug'),0);
    feedback.getInput(0).onchange = function(){
        if(verficationValidEmail()){
            feedback.textInput.focus();
        }
    }
    feedback.textInput.onchange = function(){
        verificationValidFeedback();
    }
    function verficationValidEmail(){
        var valid = isEmailValid(feedback.input[0].value);
        setFieldSetof(feedback.inputField[0],valid,feedback.inputError[0],'Invalid email address');
        visibilityOf(feedback.positiveAction(),valid);
        feedback.getInput(0).oninput = function(){
            setFieldSetof(feedback.inputField[0],isEmailValid(feedback.input[0].value),feedback.inputError[0],'Invalid email address');
            visibilityOf(feedback.positiveAction(),isEmailValid(feedback.input[0].value));    
        }
        return isEmailValid(feedback.input[0].value);
    }
    function verificationValidFeedback(){
        var valid = isNotEmpty(feedback.textInput.value)
        setFieldSetof(feedback.textField,valid,feedback.textInputError,'This can\'t be empty');
        visibilityOf(feedback.positiveAction(),valid);
        feedback.textInput.oninput = function(){
            setFieldSetof(feedback.textField,isNotEmpty(feedback.textInput.value),feedback.textInputError,'This can\'t be empty');
            visibilityOf(feedback.positiveAction(),isNotEmpty(feedback.textInput.value));    
        }
        return isNotEmpty(feedback.textInput.value);
    }
    feedback.positiveAction().onclick = function(){
        if(verficationValidEmail()){
            if(verificationValidFeedback()){
                snackBar(true,"Thanks for the interaction. We'll look forward to that.",true,'Hide');
                var snack = new Snackbar();
                snack.button.onclick = function(){snackBar(false);}
                feedback.existence(false);
            }
        }
    }
    feedback.optionsRadio[0].onclick = function(){
        setDefaultBackground(feedback.view,true);
    }
    feedback.optionsRadio[1].onclick = function(){
        setDefaultBackground(feedback.view,false);
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
function hideLoader(){
    visibilityOf(document.getElementById('navLoader'),false);
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
