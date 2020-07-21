const click = "click",
  input = "input",
  nothing = "";
class Codes {
  constructor() {
    class Servercodes {
      constructor() {
        this.DATABASE_ERROR = "server/database-error:";
        this.INSTITUTION_EXISTS = "server/institution-exists";
        this.INSTITUTION_CREATED = "server/institution-created";
        this.UIID_TAKEN = "server/uiid-already-taken";
        this.UIID_AVAILABLE = "server/uiid-available";
      }
    }
    class Clientcodes {
      constructor() {
        this.NETWORK_FAILURE = "client/network-error";
        this.NOT_SIGNED_IN = "client/not-signed-in";
      }
    }

    class Authcodes {
      constructor() {
        this.WRONG_PASSWORD = "auth/wrong-password";
        this.WEAK_PASSWORD = "auth/weak-password";
        this.USER_NOT_EXIST = "auth/no-user-found";
        this.USER_EXIST = "auth/user-found";
        this.AUTH_FAILED = "auth/authentication-failed";
        this.SESSION_VALID = "auth/user-logged-in";
        this.SESSION_INVALID = "auth/user-not-logged-in";
        this.EMAIL_INVALID = "auth/invalid-email";
        this.PASSWORD_INVALID = "auth/invalid-password";
        this.LOGGED_OUT = "auth/logged-out";
        this.ACCOUNT_CREATED = "auth/account-created";
        this.NAME_INVALID = "auth/invalid-name";
        this.ACCOUNT_CREATION_FAILED = "auth/account-not-created";
        this.AUTH_SUCCESS = "auth/sign-in-success";
        this.ACCOUNT_RESTRICTED = "auth/account-disabled";
        this.AUTH_REQ_FAILED = "auth/request-failed";
        this.REQ_LIMIT_EXCEEDED = "auth/too-many-requests";
        this.UIID_INVALID = "auth/invalid-uiid";
        this.WRONG_UIID = "auth/wrong-uiid";
      }
    }

    class InstitutionCodes{
      constructor(){
          this.INVALID_ADMIN_PHONE = "inst/invalid-phone-number";
          this.INVALID_ADMIN_EMAIL = "inst/invalid-email-address";
          this.INVALID_ADMIN_NAME = "inst/invalid-name";
  
          this.INVALID_INST_NAME = "inst/invalid-institution-name";
          this.INVALID_INST_UIID = "inst/invalid-institution-uiid";
          this.INVALID_INST_PHONE = "inst/invalid-institution-phone";
  
          this.INVALID_TIME = "inst/invalid-time-value";
          this.INVALID_TIME_START = "inst/invalid-start-time";
          this.INVALID_TIME_END = "inst/invalid-end-time";
          this.INVALID_TIME_BREAKSTART = "inst/invalid-breakstart-time";
  
          this.INVALID_DURATION = "inst/invalid-duration";
          this.INVALID_DURATION_PERIOD = "inst/invalid-period-duration";
          this.INVALID_DURATION_BREAK = "inst/invalid-break-duration";
          this.INVALID_WORKING_DAYS = "inst/invalid-working-days";
          this.INVALID_PERIODS = "inst/invalid-periods-a-day";
  
          this.INVALID_DATE = "inst/invalid-date-value";
          this.INVALID_DAY = "inst/invalid-day-name";
          this.INVALID_PERIOD = "inst/invalid-period";
          this.INVALID_CLASS = "inst/invalid-class-name";
          this.INVALID_SECTION = "inst/invalid-section-name";
          
          this.INSTITUTION_NOT_EXISTS = 'inst/institution-not-exists';
          this.INSTITUTION_EXISTS = 'inst/institution-exists';
          this.INSTITUTION_CREATED = 'inst/institution-created';
          this.INSTITUTION_CREATION_FAILED = 'inst/institution-not-created';

          this.INSTITUTION_DEFAULTS_SET = 'inst/institution-defaults-saved';
        this.INSTITUTION_DEFAULTS_UNSET = 'inst/institution-defaults-not-saved';
      }
  }

    class ActionCodes {
      constructor() {
        this.ACCOUNT_DELETE = "action/delete-account";
        this.CHANGE_PASSWORD = "action/change-password";
        this.CHANGE_UID = "action/change-uid-email";
        this.SEND_INVITE = "action/send-invitation";
        this.ACCOUNT_VERIFY = "action/verify-account";
      }
    }

    class Mailcodes {
      constructor() {
        this.ACCOUNT_VERIFICATION = "mail/account-verification";
        this.RESET_PASSWORD = "mail/reset-password";
        this.PASSWORD_CHANGED = "mail/password-changed";
        this.EMAIL_CHANGED = "mail/email-address-changed";
        this.ACCOUNT_DELETED = "mail/account-deleted";
        this.INSTITUTION_INVITATION = "mail/invite-to-institution";
        this.ERROR_MAIL_NOTSENT = "mail/email-not-sent";
      }
    }
    this.auth = new Authcodes();
    this.client = new Clientcodes();
    this.server = new Servercodes();
    this.mail = new Mailcodes();
    this.action = new ActionCodes();
    this.inst = new InstitutionCodes();
  }
}
const code = new Codes();

class Constant {
  constructor() {
    this.appName = "Schemester";
    this.hide = "none";
    this.show = "block";
    this.nothing = "";
    this.space = " ";
    this.tab = "  ";
    this.post = "post";
    this.get = "get";
    this.put = "put";
    this.backbluecovered = false;
    this.fetchContentType = "application/x-www-form-urlencoded; charset=UTF-8";
    this.emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    this.passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#()])[A-Za-z\d@$!%*?&#()]{8,}$/;
    this.sessionID = "id";
    this.sessionUID = "uid";
    this.weekdays = Array(
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday"
    );
    this.months = Array(
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    );
  }
}
const value = new Constant();
const constant = new Constant();

class Locations {
  constructor() {
    this.adminLoginPage = "/admin/auth/login";
    this.adminDashPage = "/admin/session";
    this.homepage = "/home";
    this.root = "/";
    this.registrationPage = "/admin/session";
    this.planspage = "/plans";
    this.adminSettings = "/admin/session";
  }
}
const locate = new Locations();

class Posts{
  constructor(){
    this.sessionValidate = '/admin/session/validate';
    this.authlogin = '/admin/auth/login';
    this.authlogout = '/admin/auth/logout';
    this.authsignup = '/admin/auth/signup';
  }
}
const post = new Posts();
class Colors {
  constructor() {
    this.base = "#216bf3";
    this.positive = this.base;
    this.error = "#c40c0c";
    this.active = "green";
    this.white = "#ffffff";
    this.black = "#000000";
    this.transparent = "#00000056";
  }
  getColorByType(type) {
    switch (type) {
      case actionType.positive:
        return this.positive;
      case actionType.negative:
        return this.error;
      case actionType.neutral:
        return this.white;
      case actionType.active:
        return this.active;
      case actionType.nothing: {
        return this.transparent;
      }
      default: {
        return type == false
          ? this.getColorByType(actionType.negative)
          : this.getColorByType(actionType.positive);
      }
    }
  }
}
var colors = new Colors();

class InputType {
  constructor() {
    this.name = "name";
    this.email = "email";
    this.password = "password";
    this.nonempty = "nonempty";
    this.match = "matching";
    this.username = "username";
    this.phone = "phone";
  }
}
let validType = new InputType();

class TextInput {
  constructor(
    fieldId = String(),
    inputId = String(),
    errorId = String(),
    type = null,
    captionId = null
  ) {
    this.fieldset = getElement(fieldId);
    this.caption = captionId ? getElement(captionId) : null;
    this.input = getElement(inputId);
    this.error = errorId != nothing && errorId != null ? getElement(errorId) : null;
    this.type = type;
    this.normalize();
  }
  normalize(isNormal = true, errormsg = null) {
    setFieldSetof(this.fieldset, isNormal, this.error, errormsg);
  }
  setFieldCaption(caption) {
    this.caption.textContent = caption;
  }
  inputFocus() {
    this.input.focus();
  }
  validateNow(validAction = _=>{},ifmatchfield = null){ 
    validateTextField(this,this.type,validAction,ifmatchfield);
  }
  validate(validAction = _=>{},ifmatchfield = null){
    this.onTextDefocus(_=>{
      validateTextField(this,this.type,validAction,ifmatchfield);
    });
  }
  isValid(matchfieldvalue = null){
    return stringIsValid(this.getInput(),this.type,matchfieldvalue);
  }
  strictValidate(validAction = _=>{},ifmatchfield = null){
    this.onTextInput(_=>{
      validateTextField(this,this.type,validAction,ifmatchfield);
    });
  }
  onTextInput(action = (_) => {}) {
    this.input.oninput = () => {
      action();
    };
  }
  onTextDefocus(action) {
    this.input.onchange = () => {
      action();
    };
  }
  showValid(){
    setClassName(this.fieldset,actionType.getFieldStyle(bodyType.active));
  }
  showError(errorMsg = null, inputfocus = true) {
    setFieldSetof(this.fieldset, errorMsg == null, this.error, errorMsg);
    if (inputfocus) {
      this.input.focus();
    }
    this.onTextInput((_) => {
      this.normalize();
    });
  }
  setInputAttrs(hint = null, type = null, defaultValue = null) {
    if (hint != null) {
      this.input.placeholder = hint;
    }
    if (type != null) {
      this.input.type = type;
    }
    if (defaultValue != null) {
      this.input.value = defaultValue;
    }
  }
  getInput() {
    return this.input.value;
  }
  setInput(value){
    this.input.value = value;
  }
}

class Snackbar {
  id = "snackBar";
  textId = "snackText";
  buttonId = "snackButton";
  constructor() {
    this.bar = getElement(this.id);
    this.text = getElement(this.textId);
    this.button = getElement(this.buttonId);
    this.button.innerHTML = null;
    hide(this.button);
    this.text.innerHTML = null;
    hide(this.bar);
  }

  createSnack(text, type) {
    this.text.innerHTML = text;
    setDefaultBackground(this.bar, type);
  }
  displayType(type) {
    if (!value.backbluecovered) {
      setClassName(
        this.bar,
        bodyType.getSnackStyle(bodyType.positive),
        bodyType.getSnackStyle(bodyType.negative),
        type,
        bodyType.getSnackStyle(bodyType.warning),
        bodyType.getSnackStyle(bodyType.active)
      );
      setClassName(
        this.button,
        actionType.getButtonStyle(actionType.neutral),
        actionType.getButtonStyle(actionType.neutral),
        type,
        actionType.getButtonStyle(actionType.neutral),
        actionType.getButtonStyle(actionType.neutral)
      );
    } else {
      setClassName(
        this.bar,
        bodyType.getSnackStyle(bodyType.neutral),
        bodyType.getSnackStyle(bodyType.negative),
        type,
        bodyType.getSnackStyle(bodyType.warning),
        bodyType.getSnackStyle(bodyType.active)
      );
      setClassName(
        this.button,
        actionType.getButtonStyle(actionType.positive),
        actionType.getButtonStyle(actionType.neutral),
        type,
        actionType.getButtonStyle(actionType.neutral),
        actionType.getButtonStyle(actionType.neutral)
      );
    }
  }
  createButton(buttontext, action = null) {
    this.button.innerHTML = buttontext;
    if (action != null) {
      this.button.onclick = (_) => {
        action();
      };
    } else {
      this.button.onclick = (_) => {
        this.hide();
      };
    }
    show(this.button);
  }
  existence(exist = true) {
    elementRiseVisibility(this.bar, exist);
  }
  show() {
    replaceClass(
      this.bar,
      "fmt-animate-bottom-off",
      "fmt-animate-bottom",
      true
    );
  }
  hide() {
    replaceClass(
      this.bar,
      "fmt-animate-bottom-off",
      "fmt-animate-bottom",
      false
    );
    hide(this.bar);
  }
}

var snackBar = (
  text = String(),
  actionText = String(),
  isNormal = actionType.positive,
  action = () => {
    new Snackbar().hide();
  }
) => {
  var snack = new Snackbar();
  snack.hide();
  if (text != nothing) {
    snack.text.innerHTML = text;
    if (actionText != null && actionText != nothing) {
      if(actionText == "Report"){
        isNormal = actionType.negative;
      };
      snack.createButton(actionText, (_) => {
        if (actionText == "Report") {
          feedBackBox(true, text, true);
        } else {
          action();
        }
        new Snackbar().hide();
      });
      setTimeout((_) => {
        new Snackbar().hide();
      }, text.length * 3 * 1000); //lengthwise timer.
    } else {
      setTimeout((_) => {
        new Snackbar().hide();
      }, text.length * (3 / 2) * 1000); //lengthwise timer for non action snackbar.
    }
    snack.displayType(isNormal);
  }
  snack.existence(text != nothing && text != null);
};

class DialogID {
  viewId = "dialogView";
  boxId = "dialogBox";
  imageId = "dialogImage";
  contentId = "dialogContent";
  headingId = "dialogHeading";
  subHeadId = "dialogSubHeading";
  inputs = "inputFields";
  dialogInputFieldID(index) {
    return "dialogInputField" + index;
  }
  dialogFieldCaptionID(index) {
    return "dialogFieldCaption" + index;
  }
  dialogInputID(index) {
    return "dialogInput" + index;
  }
  dialogInputErrorID(index) {
    return "dialogInputError" + index;
  }
  textFieldId = "dialogInputAreaField";
  textFieldCaptionId = "dialogAreaFieldCaption";
  textInputAreaId = "dialogInputArea";
  textInputErrorId = "dialogInputAreaError";

  optionsId = "dialogOpts";
  dialogChipLabel(index) {
    return "dialogChipLabel" + index;
  }
  dialogChip(index) {
    return "dialogChip" + index;
  }
  actionsId = "dialogButtons";
  actionLoader = "dialogLoader";
  dialogButton(index) {
    return "dialogButton" + index;
  }
  basicDialogContent = `<img class="fmt-col fmt-quarter fmt-center fmt-padding" id="dialogImage" style="width: 80;"/>
    <div class="fmt-col fmt-threequarter" id="dialogContent">
      <div class="fmt-row" id="dialogHeading"></div>
      <div class="fmt-row" id="dialogSubHeading"></div>
      <div id="inputFields"></div>
      <fieldset class="fmt-row text-field" id="dialogInputAreaField">
        <legend class="field-caption" id="dialogAreaFieldCaption"></legend>
        <textarea class="text-input" rows="5" id="dialogInputArea"></textarea>
        <span class="fmt-right error-caption" id="dialogInputAreaError"></span>
      </fieldset>
      <div class="fmt-row" id="dialogActions">
        <span id="dialogOpts" class="fmt-padding fmt-left fmt-twothird"></span>
        <span id="dialogButtons" class="fmt-half fmt-right"></span>
      </div>
    </div>`;
  getloaderContent(heading = "Please wait", subheading) {
    return `<div class="fmt-col" id="dialogContent">
    <div class="fmt-row" id="dialogHeading">${heading}</div>
    <div class="fmt-row fmt-center" id="dialogSubHeading">${subheading}</div>
    <br/>
    <div class="fmt-center fmt-display-center">
    <img class="fmt-spin-fast" src="/graphic/blueLoader.svg"/>
    </div><br/></div>`;
  }
}

class ViewType {
  constructor() {
    this.neutral = "neutral";
    this.positive = "positive";
    this.negative = "negative";
    this.warning = "warning";
    this.active = "active";
    this.nothing = "nothing";
  }
  getButtonStyle(type) {
    switch (type) {
      case this.neutral:
        return "neutral-button";
      case this.positive:
        return "positive-button";
      case this.negative:
        return "negative-button";
      case this.warning:
        return "warning-button";
      case this.active:
        return "active-button";
      default:
        return "positive-button";
    }
  }
  getFieldStyle(type) {
    switch (type) {
      case this.neutral:
        return "text-field";
      case this.positive:
        return "text-field";
      case this.negative:
        return "text-field-error";
      case this.warning:
        return "text-field-warn";
      case this.active:
        return "text-field-active";
      default:
        return "text-field";
    }
  }
  getSnackStyle(type) {
    switch (type) {
      case this.neutral:
        return "snack-neutral";
      case this.positive:
        return "snack-positive";
      case this.negative:
        return "snack-negative";
      case this.warning:
        return "snack-warn";
      case this.active:
        return "snack-active";
      default:
        return "snack-positive";
    }
  }
}
const actionType = new ViewType();
const bodyType = new ViewType();

class Dialog extends DialogID {
  constructor() {
    super(DialogID);
    this.view = getElement(this.viewId);
    setDefaultBackground(this.view);
    this.box = getElement(this.boxId);
    opacityOf(this.box, 1);
    this.setBoxHTML(this.basicDialogContent); //sets default dialog html (left image, right heading, subheading, inputs, actions)
    this.image = getElement(this.imageId);
    this.content = getElement(this.contentId);

    this.heading = getElement(this.headingId);
    this.subHeading = getElement(this.subHeadId);
    this.inputFields = getElement(this.inputs);

    hide(this.inputFields);
    this.options = getElement(this.optionsId);
    hide(this.options);
    this.textField = getElement(this.textFieldId);
    hide(this.textField);
  }
  setBoxHTML(htmlcontent) {
    this.box.innerHTML = htmlcontent;
  }
  createInputs(
    captions,
    hints,
    types,
    validateTypes = null,
    contents = null,
    autocompletes = null,
    spellChecks = null,
    autocaps = null
  ) {
    let total = captions.length;
    let fieldSet = String();
    for (var i = 0; i < total; i++) {
      fieldSet += getInputField(
        this.dialogInputFieldID(i),
        this.dialogFieldCaptionID(i),
        this.dialogInputID(i),
        this.dialogInputErrorID(i)
      );
    }
    this.inputFields.innerHTML = fieldSet;
    visibilityOf(this.inputFields, total > 0);
    this.inputField = Array(total);
    for (var k = 0; k < total; k++) {

      this.inputField[k] = new TextInput(
        this.dialogInputFieldID(k),
        this.dialogInputID(k),
        this.dialogInputErrorID(k),
        validateTypes?validateTypes[k]:null,
        this.dialogFieldCaptionID(k)
      );
    }

    for (var k = 0; k < total; k++) {
      this.inputField[k].caption.textContent = captions[k];
      this.inputField[k].setInputAttrs(hints[k], types[k]);
      this.inputField[k].input.value =
        contents != null && contents[k] != null && contents[k] != nothing
          ? contents[k]
          : value.nothing;
      this.inputField[k].input.autocomplete =
        autocompletes != null ? autocompletes[k] : value.nothing;
      this.inputField[k].input.spellcheck =
        spellChecks != null ? spellChecks[k] : true;
      this.inputField[k].input.autocapitalize =
        autocaps != null ? autocaps[k] : "none";
    }
  }
  createRadios(labels, clicked) {
    let total = labels.length;
    visibilityOf(this.options, this.radioVisible);
    let radioSet = String();
    for (var i = 0; i < total; i++) {
      radioSet += getRadioChip(
        this.dialogChipLabel(i),
        labels[i],
        this.dialogChip(i)
      );
    }
    this.options.innerHTML = radioSet;
    visibilityOf(this.options, total > 0);
    this.optionsRadio = Array(total);
    this.optionsRadioLabel = Array(total);
    for (var k = 0; k < total; k++) {
      this.optionsRadioLabel[k] = getElement(this.dialogChipLabel(k));
      this.optionsRadio[k] = getElement(this.dialogChip(k));
    }
    this.optionsRadioLabel[labels.indexOf(clicked)].click();
  }

  createActions(labels, types) {
    let total = labels.length;
    this.actions = getElement(this.actionsId);
    let actionSet = String();
    for (var i = total - 1; i >= 0; i--) {
      actionSet += getDialogButton(
        actionType.getButtonStyle(types[i]),
        this.dialogButton(i),
        labels[i]
      );
    }
    actionSet += getDialogLoaderSmall(this.actionLoader);

    this.actions.innerHTML = actionSet;
    this.dialogButtons = Array(total);
    for (var k = total - 1; k >= 0; k--) {
      this.dialogButtons[k] = getElement(this.dialogButton(k));
    }
    this.loading = getElement(this.actionLoader);
    this.loader(false);
  }

  validate(inputFieldIndex,validateAction =_=>{}){
      this.inputField[inputFieldIndex].validate(_=>{validateAction()})    
  }
  validateNow(inputFieldIndex,validateAction =_=>{}){
    this.inputField[inputFieldIndex].validateNow(_=>{validateAction()})    
}
  setDisplay(head, body = null, imgsrc = null) {
    this.heading.textContent = head;
    this.subHeading.innerHTML = body;
    visibilityOf(this.image, imgsrc != null);
    if (imgsrc == null) {
      this.content.classList.remove("fmt-threequarter");
    } else {
      this.content.classList.add("fmt-threequarter");
      this.image.src = imgsrc;
    }
    replaceClass(
      this.content,
      "fmt-padding-small",
      "fmt-padding",
      imgsrc == null
    );
  }

  loader(show = true) {
    visibilityOf(this.loading, show);
    for (var k = 0; k < this.dialogButtons.length; k++) {
      visibilityOf(this.dialogButtons[k], !show);
    }
    if (show) {
      opacityOf(this.box, 0.5);
    } else {
      opacityOf(this.box, 1);
    }
  }

  largeTextArea(caption, hint) {
    this.largeTextField = new TextInput(
      this.textFieldId,
      this.textInputAreaId,
      this.textInputErrorId,
      validType.nonempty,
      this.textFieldCaptionId
    );
    this.largeTextField.normalize();
    this.largeTextField.setInputAttrs(hint);
    this.largeTextField.caption.textContent = caption;
    show(this.largeTextField.fieldset);
  }

  getInput(index) {
    return this.inputField[index].input;
  }
  getInputValue(index) {
    return this.inputField[index].getInput();
  }
  getDialogChip(index) {
    return this.optionsRadio[index];
  }
  getDialogButton(index) {
    return this.dialogButtons[index];
  }
  onChipClick(index, action) {
    this.optionsRadio[index].onclick = () => {
      action();
    };
  }
  onButtonClick(index, action) {
    this.dialogButtons[index].onclick = () => {
      action();
    };
  }
  normalize() {
    this.inputField.forEach((field) => {
      field.normalize();
    });
  }
  setBackgroundColorType(type = bodyType.positive) {
    setDefaultBackground(this.view,type);
  }
  setBackgroundColor(color = colors.base){
    this.view.style.backgroundColor = color;
  }
  setDialogColorType(type = bodyType.neutral){
    setDefaultBackground(this.box,type);
  }
  setDialogColor(color = colors.white){
    this.box.style.backgroundColor = color;
  }
  setHeadingColor(color = colors.base){
    this.heading.style.color = color;
  }
  setSubheadingColor(color = colors.black){
    this.subHeading.style.color = color;
  }
  show(){
    value.backbluecovered = true;
    elementFadeVisibility(this.view, true);
  }
  hide(){
    value.backbluecovered = false;
    elementFadeVisibility(this.view, false);
  }
  existence(show = true) {
    value.backbluecovered = show;
    elementFadeVisibility(this.view, show);
  }
}

let clog = (msg) => {
  console.log(msg);
};


let sendPassResetLink = () => {
  snackBar(
    "A link has been sent at your provided email address. Reset your password from there.",
    "Got it"
  );
};

//todo: modify Dialog.createinputs method for direct call, instead of DIalog.inputparams.
let adminloginDialog = (isShowing = true, sensitive = true) => {
  var loginDialog = new Dialog();
  if (isShowing) {
    loginDialog.setDisplay(
      "Authentication Required",
      "You are about to perform a sensitive action. Please provide your login credentials."
    );
    loginDialog.createInputs(
      Array("Email address", "Password"),
      Array("youremail@example.com", "Your password"),
      Array("email", "password"),
      Array(validType.email,validType.password)
    );
    loginDialog.createActions(
      Array("Continue", "Cancel"),
      Array(actionType.neutral, actionType.positive)
    );
    if (sensitive) {
      loginDialog.setBackgroundColorType(bodyType.negative);
    }
    loginDialog.input
    loginDialog.getInput(0).onchange = (_) => {
      validateTextField(loginDialog.inputField[0], validType.email, (_) => {
        loginDialog.inputField[1].input.focus();
      });
    };
    loginDialog.getInput(1).onchange = (_) => {
      validateTextField(loginDialog.inputField[1], validType.password);
    };
    loginDialog.onButtonClick(0, (_) => {
      if (
        !(
          stringIsValid(loginDialog.getInputValue(0), validType.email) &&
          stringIsValid(loginDialog.getInputValue(1))
        )
      ) {
        validateTextField(
          loginDialog.inputField[1],
          validType.password,
          (_) => {
            loginDialog.inputField[0].input.focus();
          }
        );
        validateTextField(loginDialog.inputField[0], validType.email, (_) => {
          loginDialog.inputField[1].input.focus();
        });
      } else {
        snackBar("TBD");
        //todo: authenticate
      }
    });
    loginDialog.onButtonClick(1, (_) => {
      loginDialog.existence(false);
    });
  }
  loginDialog.existence(isShowing);
};

let resetPasswordDialog = (isShowing = true, inputvalue = null) => {
  var resetDialog = new Dialog();
  if (isShowing) {
    resetDialog.setDisplay(
      "Reset password",
      "Provide us your email address and we'll help you to reset your password via an email.",
      "/graphic/icons/schemester512.png"
    );
    resetDialog.createInputs(
      Array("Your email address"),
      Array("you@example.domain"),
      Array("email"),
      Array(validType.email),
      Array(inputvalue)
    );
    resetDialog.createActions(
      Array("Send Link", "Cancel"),
      Array(actionType.positive, actionType.negative)
    );

    resetDialog.validate(0);

    resetDialog.onButtonClick(0, () => {
      if (!stringIsValid(resetDialog.getInputValue(0), validType.email)) {
        validateTextField(resetDialog.inputField[0], validType.email);
        return;
      }
      sendPassResetLink(); //todo
      resetDialog.existence(false);
      snackBar(
        "You'll receive a link if your email address was correct. Reset your password from there.",
        "Got it"
      );
    });

    resetDialog.onButtonClick(1, () => {
      resetDialog.existence(false);
    });
  }
  resetDialog.existence(isShowing);
};

let changeEmailBox = (isShowing = true) => {
  var mailChange = new Dialog();
  mailChange.setDisplay(
    "Change Email Address",
    "You need to verify yourself, and then provide your new email address. You'll be logged out after successful change.",
    "/graphic/icons/schemester512.png"
  );
  mailChange.createInputs(
    Array(
      "Existing Account password",
      "Existing email address",
      "New email address"
    ),
    Array(
      "Current password",
      "youremail@example.domain",
      "someone@example.com"
    ),
    Array("password", "email", "email"),
    Array(validType.nonempty,validType.email,validType.email)
  );
  mailChange.createActions(
    Array("Change Email ID", "Abort"),
    Array(actionType.negative, actionType.positive)
  );

  mailChange.validate(0, (_) => {mailChange.getInput(1).focus()});
  mailChange.validate(1, (_) => {mailChange.getInput(2).focus()});
  mailChange.validate(2);
  
  mailChange.onButtonClick(0, () => {
    if (
      !(
        stringIsValid(mailChange.getInputValue(0)) &&
        stringIsValid(mailChange.getInputValue(1), validType.email) &&
        stringIsValid(mailChange.getInputValue(2), validType.email)
      )
    ) {
      mailChange.validateNow(0, (_) => {mailChange.getInput(1).focus()});
      mailChange.validateNow(1, (_) => {mailChange.getInput(2).focus()});
      mailChange.validateNow(2);
      return;
    }
    //todo: changeadmniemail
    mailChange.existence(false);
    snackBar(
      "Your email id has been changed to " + mailChange.getInputValue(2),
      "Okay",
      () => {
        snackBar("You need to login again");
      }
    );
  });
  mailChange.onButtonClick(1, () => {
    mailChange.existence(false);
  });
  mailChange.existence(isShowing);
};



let registrationDialog = (isShowing = true, email = null, uiid = null) => {
  loadingBox();
  receiveSessionData(_=>{
    var confirmLogout = new Dialog();
    var data;
    getUserLocally().then(adata=>{
      data = adata;
      confirmLogout.setDisplay(
        "Already Logged In.",
        `You are currently logged in as <b>${data.id}</b>.
         You need to log out before creating a new account. Confirm log out?`
      );
      confirmLogout.createActions(
        Array("Stay logged in", "Log out"),
        Array(actionType.positive, actionType.negative)
      );
      confirmLogout.onButtonClick(0, () => {
        confirmLogout.existence(false);
      });
      confirmLogout.onButtonClick(1, () => {
        confirmLogout.loader();
        finishSession(_=>{registrationDialog(true)});
      });
      confirmLogout.existence(true);
    });
  },_=>{
    var regDial = new Dialog();
    regDial.setDisplay(
      "Create Admin Account",
      "Create a new account with a working email address (individual or institution)."
    );
    regDial.createActions(
      Array("Next", "Cancel"),
      Array(actionType.positive, actionType.negative)
    );
    regDial.createInputs(
      Array(
        "Your name",
        "Email Address",
        "New Password",
        "Unique Institution ID - UIID"
      ),
      Array(
        "Shravan Kumar, or something?",
        "youremail@example.domain",
        "Strong password",
        "A unique ID for your institution"
      ),
      Array("text", "email", "password", "text"),
      Array(validType.name,validType.email,validType.password,validType.username),
      Array(null, email, null, uiid),
      Array("name", "email", "new-password", "username"),
      Array(true, false, false, false),
      Array("words", "off", "off", "off")
    );

    regDial.onButtonClick(1, () => {
      regDial.existence(false);
    });

    regDial.validate(0,(_) => {regDial.getInput(1).focus()});
    regDial.validate(1,(_) => {regDial.getInput(2).focus()});
    regDial.validate(2,(_) => {regDial.getInput(3).focus()});
    regDial.validate(3);
    
    regDial.onButtonClick(0, () => {
      if (!(
          stringIsValid(regDial.getInputValue(0), validType.name) &&
          stringIsValid(regDial.getInputValue(1), validType.email) &&
          stringIsValid(regDial.getInputValue(2), validType.password) &&
          stringIsValid(regDial.getInputValue(3), validType.username))
      ) {
        regDial.validateNow(0,(_) => {regDial.getInput(1).focus()});
        regDial.validateNow(1,(_) => {regDial.getInput(2).focus()});
        regDial.validateNow(2,(_) => {regDial.getInput(3).focus()});
        regDial.validateNow(3);

      } else {
        regDial.normalize();
        regDial.loader();
        createAccount(
          regDial,
          String(regDial.getInputValue(0)).trim(),
          String(regDial.getInputValue(1)).trim(),
          regDial.getInputValue(2),
          String(regDial.getInputValue(3)).trim()
        );
      }
    });
    regDial.existence(isShowing);
  })
};

let saveUserLocally = (data = {})=>{
  for (var key in data) {
    if (data.hasOwnProperty(key)) {
      localStorage.setItem(key,data[key]);
    }
  }
}

let hasAnyKeyNull = (data={})=>{
  if(data == null){
    return true;
  }
  if(data == {}){
    return true;
  }
  for (var key in data) {
    if (data.hasOwnProperty(key)) {
      if(data[key]==null||data[key]==constant.nothing){
        return true;
      }
    }
  }
  return false;
}

let getUserLocally = async ()=>{
  let data =  {
    [constant.sessionID]:localStorage.getItem(constant.sessionID),
    [constant.sessionUID]:localStorage.getItem(constant.sessionUID),
    username:localStorage.getItem('username'),
    uiid:localStorage.getItem('uiid'),
    createdAt:localStorage.getItem('createdAt'),
  };
  clog("the data");
  clog(data);
  if(!hasAnyKeyNull(data)){
    clog("here nonull key");
    clog(data);
    return data;
  }else{
    clog("locally esle post");
    postData(post.sessionValidate,{
      getuser:true
    }).then((response)=>{
      clog("the response");
        clog(response);
      if(response.event == code.auth.SESSION_INVALID){
        finishSession(_=>{relocate(locate.root)});
      } else {
        data = response;
        saveUserLocally(data);
      }
      data
    }).finally((data)=>{
      return data;
    })
  }
}

let createAccount = (dialog, adminname, email, password, uiid) => {
  postData(post.authsignup, {
    username: adminname,
    email: email,
    password: password,
    uiid: uiid,
  })
    .then((result) => {
      //let result = res.result;
      dialog.loader(false);
      clog(result.event);
      switch (result.event) {
        case code.auth.ACCOUNT_CREATED:{
          //loadingBox();
          clog(result.user);
          saveUserLocally(result.user);
          if(!result.user.verified){
            accountVerificationDialog(true);
          }
        }break;
        case code.auth.USER_EXIST:
          {
            dialog.inputField[1].showError("Account already exists.");
            snackBar("Try signing in?", "Login", true, (_) => {
              refer(locate.adminLoginPage, { email: email, uiid: uiid });
            });
          }
          break;
        case code.server.UIID_TAKEN:
          {
            dialog.inputField[3].showError(
              "This UIID is not available. Try something different."
            );
          }
          break;
        case code.auth.EMAIL_INVALID:
          {
            dialog.inputField[1].showError("Invalid email address.");
          }
          break;
        case code.auth.PASSWORD_INVALID:
          {
            //todo: check invalidity and show suggesstions
            dialog.inputField[2].showError(
              "Invalid password, try something better."
            );
          }
          break;
        case code.auth.NAME_INVALID:
          {
            dialog.inputField[0].showError("This doesn't seem like a name.");
          }
          break;
        default: {
          clog("in default");
          dialog.existence(false);
          snackBar(`${result.event}:${result.msg}`, "Report", false);
        }
      }
    })
    .catch((error) => {
      clog(error);
      snackBar(error, "Report", false);
    });
};

let accountVerificationDialog = (isShowing = true, emailSent = false) => {
  loadingBox();
  var verify = new Dialog();
  getUserLocally().then((data)=>{
    if (emailSent) {
      verify.setDisplay(
        "Waiting for verification",
        `A link has been sent. Check your email box at 
        <b>${data.id}</b>, verify your account there, and then click continue here.`
      );
      verify.createActions(
        Array("Verified, now continue", "Abort"),
        Array(actionType.positive, actionType.negative)
      );
      verify.onButtonClick(1, () => {
        verify.loader();
        localStorage.clear();
        verify.existence(false);
      });
      verify.onButtonClick(0, () => {
        verify.loader();
        verify.existence(false);
        loadingBox(true,'Checking','This may take a few seconds');
        setTimeout(() => {
          localStorage.setItem('verified',true);
          relocate(locate.registrationPage,{
            u:data.uid,
            target:'registration',
          })
        }, 4*1000);
      });
    } else {
      verify.setDisplay(
        "Verification Required",
        `We need to verify you. A link will be sent at <b>${data.id}</b>, you need to verify your account there. Confirm to send link?`
      );
      verify.createActions(
        Array("Send link", "Cancel"),
        Array(actionType.positive, actionType.negative)
      );
      verify.onButtonClick(1, () => {
        verify.loader();
        localStorage.clear();
        verify.existence(false);
      });
      verify.onButtonClick(0, () => {
        verify.loader();
        loadingBox(true,'Sending',`A link is being prepared for ${data.id}.`);
        //replace with email sender
        setTimeout(() => {
          accountVerificationDialog(true,true);
        }, 3*1000);
      });
    }
    verify.existence(isShowing);
  });
};

let silentLogin = (email, password, action) => {
  //todo: login without relocation
};
let feedBackBox = (isShowing = true, defaultText = String(), error = false) => {
  var feedback = new Dialog();
  feedback.setDisplay(
    "Contact Developers",
    "Are you facing any problem? Or want a feature that helps you in some way? Explain everything that here. " +
      "We are always eager to listen from you.",
    "/graphic/icons/schemester512.png"
  );
  feedback.createInputs(
    Array("Your email address"),
    Array("To help or thank you directly ;)"),
    Array("email"),
    Array(validType.email),
    null,
    Array("email")
  );
  feedback.largeTextArea(
    "Describe everything",
    "Start typing your experience here"
  );
  feedback.createRadios(
    Array("Feedback", "Error"),
    error ? "Error" : "Feedback"
  );

  feedback.setBackgroundColorType(!error);

  feedback.createActions(
    Array("Submit", "Abort"),
    Array(actionType.positive, actionType.negative)
  );
  feedback.onChipClick(0, (_) => {
    feedback.setBackgroundColorType();
  });
  feedback.onChipClick(1, (_) => {
    feedback.setBackgroundColorType(bodyType.negative);
  });

  feedback.largeTextField.input.value = defaultText;

  feedback.validate(0,(_) => {feedback.largeTextField.inputFocus()});
  feedback.largeTextField.validate();

  feedback.onButtonClick(0, () => {
    if (
      !(
        stringIsValid(feedback.getInputValue(0), validType.email) &&
        stringIsValid(feedback.largeTextField.getInput())
      )
    ) {
      feedback.largeTextField.validateNow();
      feedback.inputField[0].validateNow((_) => {feedback.largeTextField.inputFocus()});
      
    } else {
      refer(mailTo("schemester@outlook.in"), {
        subject: `From ${feedback.getInputValue(0)}`,
        body: feedback.largeTextField.getInput(),
      });
      feedback.existence(false);
      snackBar(
        "Thanks for the interaction. We'll look forward to that.",
        "Hide"
      );
    }
  });
  feedback.onButtonClick(1, () => {
    feedback.existence(false);
  });
  feedback.existence(isShowing);
};

let loadingBox = (
  visible = true,
  title = "Please wait",
  subtitle = constant.nothing,
  bodytype = bodyType.positive
) => {
  let load = new Dialog();
  load.setBoxHTML(load.getloaderContent(title, subtitle));
  load.setBackgroundColorType(bodytype);
  load.existence(visible);
};

let checkSessionValidation=(validAction =_=>{relocate(locate.root)}, invalidAction =_=>relocate(locate.adminLoginPage))=>{
  postData(post.sessionValidate).then((result) => {
    clog(result.event);
    if(result.event == code.auth.SESSION_INVALID){
      invalidAction();
    }else{
      validAction();
    }
  }).catch(error=>{
    snackBar(getLogInfo(code.auth.AUTH_REQ_FAILED,jstr(error)),"Report",false);
  })
}


let receiveSessionData=(validAction =_=>{}, invalidAction =_=>{})=>{
  postData(post.sessionValidate,{
    getuser:true
  }).then((result) => {
    console.log(result);
    if (result.event == code.auth.SESSION_INVALID) {
      invalidAction();
    } else {
      if(result == getUserLocally()){
        clog("match")
      }else{
        saveUserLocally(result);
      }
      validAction();
    }
  }).catch(error=>{
    clog('in catch sessionvalidation:'+error);
    clog(navigator.onLine);
    if(navigator.onLine){
      postData(post.sessionValidate).then((response)=>{
        if(response.event == code.auth.SESSION_INVALID){
          invalidAction();
        } else {
          validAction();
        }
      })
    }else{
      let data = getUserLocally();
      if(hasAnyKeyNull(data)){
        clog("haskeynull");
        snackBar('Couldn\'t connect to the network','Try again',false,_=>{receiveSessionData(_=>{validAction()},_=>{invalidAction()})});
      } else {
        clog("haskeynullnot");
        validAction();
      }
      clog("locally:"+jstr(data));
    }
  });
}

let validateTextField = (
  textfield = new TextInput(),
  type = validType.nonempty,
  afterValidAction = (_) => {},
  ifmatchField = null
) => {
  var error,
    matcher = constant.nothing;
  switch (type) {
    case validType.name:
      {
        error = "There has to be a name.";
      }
      break;
    case validType.email:
      {
        error = "Invalid email address.";
      }
      break;
    case validType.match:
      {
        error = "This one is different.";
        matcher = ifmatchField.getInput();
      }
      break;
    default: {
      error = "This can't be empty";
    }
  }

  textfield.showError(error);
  if (!stringIsValid(textfield.getInput(), type, matcher)) {
    textfield.inputFocus();
    textfield.onTextInput((_) => {
      textfield.normalize();
      if (textfield.getInput() != nothing) {
        validateTextField(textfield, type, (_) => {
          afterValidAction();
        });
      } else {
        textfield.onTextInput((_) => {
          textfield.normalize();
        });
        textfield.onTextDefocus((_) => {
          if (stringIsValid(textfield.getInput(), type, matcher)) {
            afterValidAction();
          } else {
            textfield.showError(error);
            validateTextField(textfield, type, (_) => {
              afterValidAction();
            });
          }
        });
      }
    });
  } else {
    textfield.normalize();
    textfield.onTextDefocus((_) => {
      if (stringIsValid(textfield.getInput(), type, matcher)) {
        afterValidAction();
      } else {
        textfield.showError(error);
        validateTextField(textfield, type, (_) => {
          afterValidAction();
        });
      }
    });
  }
};

let finishSession =(afterfinish = ()=>{relocate(locate.root)})=>{
  postData(post.authlogout).then(res=>{
    if(res.event == code.auth.LOGGED_OUT){
      localStorage.clear();
      sessionStorage.clear();
      afterfinish();
    } else{
      snackBar('Failed to logout','Try again',false,_=>{finishSession()});
    }
  })
}

let setFieldSetof = (
  fieldset,
  isNormal = true,
  errorField = null,
  errorMsg = null
) => {
  if (errorField != null && errorMsg != null) {
    errorField.innerHTML = errorMsg;
  }
  if (isNormal && errorField != null) {
    errorField.innerHTML = nothing;
  }
  setClassName(
    fieldset,
    bodyType.getFieldStyle(bodyType.positive),
    bodyType.getFieldStyle(bodyType.negative),
    isNormal
  );
};

let setClassName = (
  element,
  normalClass,
  errorClass,
  condition = actionType.positive,
  warnClass,
  activeClass
) => {
  switch (condition) {
    case actionType.positive:
      {
        element.className = normalClass;
      }
      break;
    case actionType.negative:
      {
        element.className = errorClass;
      }
      break;
    case actionType.warning:
      {
        element.className = warnClass;
      }
      break;
    case actionType.active:
      {
        element.className = activeClass;
      }
      break;
    default: {
      if (condition == false) {
        element.className = errorClass;
      } else {
        element.className = normalClass;
      }
    }
  }
};


let showElement = (elements, index) => {
  for (var k = 0, j = 0; k < elements.length; k++, j++) {
    visibilityOf(elements[k], k == index);
  }
};

let elementFadeVisibility = (element, isVisible) => {
  replaceClass(
    element,
    "fmt-animate-opacity-off",
    "fmt-animate-opacity",
    isVisible
  );
  visibilityOf(element, isVisible);
};

let elementRiseVisibility = (element, isVisible) => {
  replaceClass(
    element,
    "fmt-animate-bottom-off",
    "fmt-animate-bottom",
    isVisible
  );
  visibilityOf(element, isVisible);
};

let setDefaultBackground = (element, type = actionType.positive) => {
  element.style.backgroundColor = colors.getColorByType(type);
  switch (type) {
    case actionType.neutral:
      element.style.color = colors.black;
      break;
    default:
      element.style.color = colors.white;
  }
};

let replaceClass = (element, class1, class2, replaceC1 = true) =>
  replaceC1
    ? element.classList.replace(class1, class2)
    : element.classList.replace(class2, class1);

let showLoader = (_) => show(getElement("navLoader"));
let hideLoader = (_) => hide(getElement("navLoader"));
let opacityOf = (element, value = 1) => (element.style.opacity = String(value));
let visibilityOf = (element, visible = true) =>
  (element.style.display = visible ? constant.show : constant.hide);
let hide = (element = new HTMLElement()) => visibilityOf(element, false);
let show = (element = new HTMLElement()) => visibilityOf(element, true);

let stringIsValid = (
  value = String,
  type = validType.nonempty,
  ifMatchValue = String
) => {
  switch (type) {
    case validType.name:
      return stringIsValid(String(value).trim());
    case validType.email:
      return constant.emailRegex.test(String(value).toLowerCase());
    //todo: case inputType.password: return constant.passRegex.test(String(passValue));
    case validType.username: return stringIsValid(String(value).trim());
    case validType.match:
      return value === ifMatchValue;
    default:
      return value != null && value != constant.nothing;
  }
};

let getDayName = (dIndex = Number) =>
  dIndex < constant.weekdays.length ? constant.weekdays[dIndex] : null;
let getMonthName = (mIndex = Number) =>
  mIndex < constant.months.length ? constant.months[mIndex] : null;
let getElement = (id) => document.getElementById(id);

let relocate = (path, data = null) => {
  if (data != null) {
    let i = 0;
    for (var key in data) {
      if (data.hasOwnProperty(key)) {
        path =
          i > 0 ? `${path}&${key}=${data[key]}` : `${path}?${key}=${data[key]}`;
        i++;
      }
    }
  }
  window.location.replace(path);
};

let postData = async (url = String, data = {}) => {
  const response = await fetch(url, {
    method: constant.post,
    mode: "same-origin",
    headers: { "Content-type": constant.fetchContentType },
    body: getRequestBody(data, true),
  });
  let res = await response.json();
  return await res.result;
};

let refer = (href, data = null) => {
  href += data != null ? getRequestBody(data) : constant.nothing;
  clog(String(href).indexOf('?'));
  window.location.href = href;
};

let getRequestBody = (data = {}, isPost = false) => {
  let i = 0;
  let body = constant.nothing;
  for (var key in data) {
    if (data.hasOwnProperty(key)) {
      clog(key + ":" + data[key]);
      if (isPost) {
        body =
          i > 0 ? `${body}&${key}=${data[key]}` : `${body}${key}=${data[key]}`;
      } else {
        body =
          i > 0 ? `${body}&${key}=${data[key]}` : `${body}?${key}=${data[key]}`;
      }
      i++;
    }
  }
  clog(body);
  return body;
};

let mailTo = (to) => `mailto:${to}`;

let idbSupported = () => {
  if (!window.indexedDB) {
    clog("IDB:0");
    snackBar(
      "This browser is outdated for Schemester to work. Switch to Chrome/Edge/Safari/Firefox, or any modern browser.",
      "Learn more",
      actionType.negative,
      (_) => {
        refer("https://google.com/search", {
          q: "modern+browsers",
        });
      }
    );
  }
  return window.indexedDB;
};

let addNumberSuffixHTML = (number) => {
  var str = String(number);
  switch (number) {
    case 1:
      return number + "<sup>st</sup>";
    case 2:
      return number + "<sup>nd</sup>";
    case 3:
      return number + "<sup>rd</sup>";
    default: {
      if (number > 9) {
        if (str.charAt(str.length - 2) == "1") {
          return number + "<sup>th</sup>";
        } else {
          switch (str.charAt(str.length - 1)) {
            case "1":
              return number + "<sup>st</sup>";
            case "2":
              return number + "<sup>nd</sup>";
            case "3":
              return number + "<sup>rd</sup>";
            default:
              return number + "<sup>th</sup>";
          }
        }
      } else {
        return number + "<sup>th</sup>";
      }
    }
  }
};

let setTimeGreeting =(element = new HTMLElement())=> {
  var today = new Date();
  if (today.getHours() < 4) {
    element.innerHTML = "Good night!";
  } else if (today.getHours() < 11) {
    element.innerHTML = "Good morning!";
  } else if (today.getHours() < 15) {
    element.innerHTML = "Good afternoon";
  } else if (today.getHours() < 20) {
    element.innerHTML = "Good evening";
  } else {
    element.innerHTML = "Schemester";
  }
}

let getProperDate = (dateTillMillis = String()) => {
  let year = dateTillMillis.substring(0, 4);
  let month = dateTillMillis.substring(4, 6);
  let date = dateTillMillis.substring(6, 8);
  let hour = dateTillMillis.substring(8, 10);
  let min = dateTillMillis.substring(10, 12);
  let sec = dateTillMillis.substring(12, 14);
  
  clog(dateTillMillis.substring(6, 8));
  return `${getMonthName(
    month - 1
  )} ${date}, ${year} at ${hour}:${min} hours ${sec} seconds`;
};

let getLogInfo = (code, message) => `type:${code}\ninfo:${message}\n`;

let getRadioChip = (labelID, label, radioID) =>
  `<label class="radio-container" id="${labelID}">${label}<input type="radio" name="dialogChip" id="${radioID}"><span class="checkmark"></span></label>`;
let getInputField = (fieldID, captionID, inputID, errorID) =>
  `<fieldset class="fmt-row text-field" id="${fieldID}"> 
  <legend class="field-caption" id="${captionID}"></legend> 
  <input class="text-input" id="${inputID}">
  <span class="fmt-right error-caption" id="${errorID}"></span></fieldset>`;
let getDialogButton = (buttonClass, buttonID, label) =>
  `<button class="${buttonClass} fmt-right" id="${buttonID}">${label}</button>`;
let getDialogLoaderSmall = (loaderID) =>
  `<img class="fmt-spin-fast fmt-right" width="50" src="/graphic/blueLoader.svg" id="${loaderID}"/>`;
  let jstr = (obj)=> JSON.stringify(obj);