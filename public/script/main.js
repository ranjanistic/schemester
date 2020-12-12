/**
 * This file maintains the Classes and methods to be used by client side,
 * defining the boilerplate and repetitive codes, so the at the other scripts do not have to 
 * be filled with the same, with Classes for custom made elements which provide useful methods
 * for direct utilization of large code pieces, shortening the code length in other scripts.
 * https://github.com/ranjanistic/schemester-web/blob/master/DOCUMENTATION.md#mainjspublicscriptmainjs
 */

//Sets theme of whole application
localStorage.getItem(theme.key)?document.documentElement.setAttribute("data-theme",localStorage.getItem(theme.key)):localStorage.setItem(theme.key,theme.light);


class Button{
  constructor(buttonid){
    this.button = getElement(buttonid);
  }
  setType(actiontype = actionType.positive){
    appendClass(this.button,actionType.getButtonStyle(actiontype));
  }
  onclick(action=_=>{}){
    this.action = action;
    this.button.onclick=_=>{
      action();
    }
  }
  disable(){
    opacityOf(this.button,0.5);
    this.onclick();
  }
  enable(action=_=>{}){
    opacityOf(this.button,1);
    this.onclick(this.action?this.action:action);
  }
}

/**
 * Class for schemester input field, having several specific methods.
 */
class TextInput {
  constructor(
    fieldId = String(),
    caption = String(),
    placeholder = String(),
    type = null,
    forgotbutton = false,
    required = true,
    isTextArea = false
  ) {
    this.fieldset = getElement(fieldId);
    if(caption!== false){
    this.fieldset.innerHTML = 
    `<legend class="field-caption" id="${fieldId}caption">${caption}</legend>
      <${isTextArea?'textarea':"input"} class="text-input" ${required?'required':''} id="${fieldId}input" placeholder="${placeholder}" type="${caption.toLowerCase().includes(validType.password)?validType.password:validType.getHTMLInputType(type)}">${isTextArea?'</textarea>':''}
      ${getLoader(`${fieldId}loader`,25)}
      <span class="fmt-right error-caption" id="${fieldId}error"></span>
      ${forgotbutton?`<button class="active-button fmt-right" id="${fieldId}forgot">Forgot?</button>`:''}`
      ;
    }

    this.caption = getElement(`${fieldId}caption`);
    this.input = getElement(`${fieldId}input`);
    this.loader = getElement(`${fieldId}loader`);
    this.error = getElement(`${fieldId}error`);
    this.forgot = forgotbutton?getElement(`${fieldId}forgot`):null;
    this.type = type;
    this.forgot?hide(this.forgot):_=>{};
    this.normalize();
  }
  show() {
    show(this.fieldset);
  }
  hide() {
    hide(this.fieldset);
  }
  load(load = true){
    visibilityOf(this.loader,load);
    visibilityOf(this.error,!load);
  }
  visible(isvisible = true) {
    visibilityOf(this.fieldset, isvisible);
  }
  activate() {
    setClass(this.fieldset, bodyType.getFieldStyle(bodyType.active));
  }
  normalize(isNormal = true, errormsg = null) {
    setFieldSetof(this.fieldset, isNormal, this.error, errormsg);
    this.load(false);
  }
  setFieldCaption(caption) {
    this.caption.textContent = caption;
  }
  inputFocus() {
    this.input.focus();
  }
  disableInput() {
    opacityOf(this.fieldset?this.fieldset:this.input,0.5);
    this.input.disabled = true;
  }
  enableInput() {
    opacityOf(this.fieldset?this.fieldset:this.input,1);
    this.input.disabled = false;
  }
  validateNow(validAction = _=>{}, ifmatchfield = null) {
    validateTextField(this, this.type, validAction, ifmatchfield);
  }
  validate(validAction = _=>{}, ifmatchfield = null) {
    this.onTextDefocus((_) => {
      validateTextField(this, this.type, validAction, ifmatchfield);
    });
  }
  stopValidate(){
    this.onTextDefocus(_=>{});
  }
  isValid(matchfieldvalue = null) {
    return stringIsValid(this.getInput(), this.type, matchfieldvalue);
  }
  strictValidate(validAction = _=>{}, ifmatchfield = null) {
    this.onTextInput((_) => {
      validateTextField(this, this.type, validAction, ifmatchfield);
    });
  }
  onTextInput(action = _=>{}) {
    if (this.input) {
      this.input.oninput = () => {
        action();
      };
    }
  }
  getOnTextInput() {
    return this.input.oninput;
  }
  onTextDefocus(action) {
    this.input.onchange = () => {
      action();
    };
  }
  getOnTextDefocus() {
    return this.input.onchange;
  }
  showValid() {
    setClassNames(this.fieldset, actionType.getFieldStyle(bodyType.active));
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
    return this.type == validType.name||this.type == validType.phone
      ?this.input.value.trim()
      :this.input.value;
  }
  setInput(value) {
    this.input.value = value;
  }
  clearInput(){
    this.input.value = null;
  }
}

/**
 * Class for editable input view, with specific methods.
 */
class Editable{
  constructor(viewID,editviewID,textInput = new TextInput(),editID,viewText,saveID,cancelID,loaderID = null){
    this.view = getElement(viewID);
    this.editView = getElement(editviewID);
    this.textInput = textInput;
    this.editButton = getElement(editID);
    this.textView = getElement(viewText);
    this.saveButton = getElement(saveID);
    this.cancelButton = getElement(cancelID);
    this.editButton.onclick=_=>{this.edit()};
    loaderID?this.loader = getElement(loaderID):_=>{};
    this.display();
    this.onCancel();
  }
  edit(){
    hide(this.view);
    show(this.editView);
    this.enableInput();
  }
  load(show=true){
    if(this.loader){
      visibilityOf(this.loader,show);
      visibilityOf(this.saveButton,!show);
      visibilityOf(this.cancelButton,!show);
      show?this.disableInput():this.enableInput();
    }
  }
  display(){
    show(this.view);
    hide(this.editView);
    this.load(false);
    this.disableInput();
  }
  existence(isViewing = Boolean){
    visibilityOf(this.view,isViewing);
    visibilityOf(this.editView,!isViewing);
  }
  onSave(action=_=>{}){
    this.saveButton.onclick=_=>{
      action();
    }
  }
  onCancel(action=_=>{this.display()}){
    this.cancelButton.onclick=_=>{
      action();
    }
  }
  disableInput(){
    this.textInput.disableInput();
  }
  enableInput(){
    this.textInput.enableInput();
  }
  validateInput(){
    this.textInput.validate();
  }
  validateInputNow(){
    this.textInput.validateNow();
  }
  isValidInput(){
    return this.textInput.isValid();
  }
  getInputValue(trim = true){
    return trim?this.textInput.getInput().trim():this.textInput.getInput();
  }
  displayText(){
    return this.textView.innerHTML;
  }
  setDisplayText(text){
    this.textView.innerHTML = text;
  }
  clickCancel(){
    this.cancelButton.click();
  }
}

class Switch{
  constructor(switchID,switchTextID,switchViewID,switchContainerID,viewType = bodyType.positive){
    this.switch = getElement(switchID);
    this.switchText = switchTextID?getElement(switchTextID):null;
    this.switchView = switchViewID?getElement(switchViewID):null;
    this.switchContainer = switchContainerID?getElement(switchContainerID):null;
    this.switchView?this.setViewType(viewType):_=>{};
  }
  setViewType(viewType){
    setClassNames(this.switchView, actionType.getSwitchStyle(viewType));
  }
  setLabel(text = String) {
    this.switchText.innerHTML = text;
  }
  onTurnChange(onAction = _=>{}, offAction = _=>{}) {
    this.switch.addEventListener(change, (_) => {
      if (this.switch.checked) {
        onAction();
      } else {
        offAction();
      }
    });
    this.switchText?this.switchText.onclick=_=>{
      this.change();
      if(this.isOn()){
        onAction();
      }else {
        offAction();
      }
    }:_=>{};
  }
  isOn() {
    return this.switch.checked;
  }
  change(){
    this.turn(!this.isOn());
  }
  turn(on = true) {
    this.switch.checked = on;
  }
  on() {
    this.switch.checked = true;
  }
  off() {
    this.switch.checked = false;
  }
  show() {
    show(this.switchContainer);
  }
  hide() {
    hide(this.switchContainer);
  }
  visible(isvisible = true) {
    visibilityOf(this.switchContainer, isvisible);
  }
}

class ThemeSwitch{
  constructor(switchID,base = false){
    this.darkmode = new Switch(switchID);
    this.darkmode.turn(theme.isDark());
    this.darkmode.onTurnChange(_=>{theme.setDark(base)},_=>{theme.setLight(base)});
  }
}

class Menu{
  constructor(menuID,toggleID){
    this.menu = getElement(menuID);
    this.toggle = toggleID?getElement(toggleID):null;
    hide(this.menu);
    this.hidden = true;
    this.toggle.onclick=_=>{
      this.visible(this.hidden);
    }
  }
  hide(){
    hide(this.menu);
    this.hidden = true;
  }
  show(){
    show(this.menu);
    this.hidden = false;
  }
  visible(show= true){
    visibilityOf(this.menu,show);
    this.hidden = !show;
  }
}

class Snackbar {
  id = "snackBar";
  constructor() {
    this.bar = getElement(this.id);
    this.bar.innerHTML = `<span id="snackText"></span>
    <button id="snackButton"></button>`;
    appendClass(this.bar,'fmt-animate-bottom');
    this.text = getElement("snackText");
    this.button = getElement("snackButton");
    this.button.innerHTML = null;
    hide(this.button);
    this.text.innerHTML = null;
    hide(this.bar);
  }

  createSnack(text, type = bodyType.positive) {
    this.text.innerHTML = text;
    setDefaultBackground(this.bar, type);
  }
  displayType(type) {
    if (!value.backbluecovered) {
      setClassNames(
        this.bar,
        bodyType.getSnackStyle(bodyType.positive),
        bodyType.getSnackStyle(bodyType.negative),
        type,
        bodyType.getSnackStyle(bodyType.warning),
        bodyType.getSnackStyle(bodyType.active)
      );
      setClassNames(
        this.button,
        actionType.getButtonStyle(actionType.neutral),
        actionType.getButtonStyle(actionType.neutral),
        type,
        actionType.getButtonStyle(actionType.neutral),
        actionType.getButtonStyle(actionType.neutral)
      );
    } else {
      setClassNames(
        this.bar,
        bodyType.getSnackStyle(bodyType.neutral),
        bodyType.getSnackStyle(bodyType.negative),
        type,
        bodyType.getSnackStyle(bodyType.warning),
        bodyType.getSnackStyle(bodyType.active)
      );
      setClassNames(
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

const snackBar = (
  text = String(),
  actionText = String(),
  isNormal = actionType.positive,
  action = () => {
    new Snackbar().hide();
  }
) => {
  const snack = new Snackbar();
  snack.hide();
  if (text != constant.nothing) {
    snack.text.innerHTML = text;
    if (actionText != null && actionText != constant.nothing) {
      if (actionText == "Report") {
        isNormal = actionType.negative;
      }
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
      }, min([text.length*3,15])*1000); //lengthwise timer.
    } else {
      setTimeout((_) => {
        new Snackbar().hide();
      }, min([text.length*(3/2),15])*1000); //lengthwise timer for non action snackbar.
    }
    snack.displayType(isNormal);
  }
  snack.existence(text != constant.nothing && text != null);
};

const min=(numbers = [])=>{
  let min = numbers[0];
  numbers.forEach((number)=>{
    min = min>number?number:min;
  });
  return min;
}

/**
 * Manages the ids of dialog box elements, to be used by Dialog class in particular.
 */
class DialogID {
  viewId = "dialogView";
  innerview = `<div class="dialog-box container fmt-row fmt-animate-opacity" style="padding:22px 0;" id="dialogBox"></div>`
  boxId = "dialogBox";
  imagedivId = "dialogImagediv";
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
  basicDialogContent = `
    <div class="fmt-col fmt-third fmt-center" id="dialogImagediv">
      <img id="dialogImage" width="100%"/>
    </div>
    <div class="fmt-col fmt-twothird" id="dialogContent">
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

/**
 * The class to display and maintain dialog boxes of schemester, used throughout the application. 
 * Creates, hides, modifies, validates, and does many jobs using built-in methods for dialog boxes.
 * @note Requires the basic html content of dialog box to be present in current file.
 */
class Dialog extends DialogID {
  constructor() {
    super(DialogID);
    this.view = getElement(this.viewId);
    this.view.innerHTML = this.innerview;
    setDefaultBackground(this.view);
    this.box = getElement(this.boxId);
    appendClass(this.view,'dialog');
    appendClass(this.view,'fmt-animate-opacity');
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
    captions = [],
    hints = [],
    types = [],
    validateTypes = null,
    contents = null,
    autocompletes = null,
    spellChecks = null,
    autocaps = null
  ) {
    let total = captions.length;
    let fieldSet = String();
    for (var i = 0; i < total; i++) {
      fieldSet += getInputField(this.dialogInputFieldID(i));
    }
    this.inputFields.innerHTML = fieldSet;
    visibilityOf(this.inputFields, total > 0);
    this.inputField = Array(total);
    for (var k = 0; k < total; k++) {
      this.inputField[k] = new TextInput(
        this.dialogInputFieldID(k),'','',
        validateTypes ? validateTypes[k] : null,false
      );
    }

    for (var k = 0; k < total; k++) {
      this.inputField[k].caption.textContent = captions[k];
      this.inputField[k].setInputAttrs(hints[k], types[k]);
      this.inputField[k].input.value =
        contents != null &&
        contents[k] != null &&
        contents[k] != constant.nothing
          ? contents[k]
          : constant.nothing;
      this.inputField[k].input.autocomplete =
        autocompletes != null ? autocompletes[k] : constant.nothing;
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

  createActions(labels = [], types = Array(actionType.positive)) {
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

  allValid(){
    const invalid = this.inputField.every((_,i)=>{
      return this.isValid(i);
    });
    return invalid?true:false;
  }
  isValid(inputFieldIndex = 0) {
    return stringIsValid(
      this.getInputValue(inputFieldIndex),
      this.getInputType(inputFieldIndex)
    );
  }
  validate(inputFieldIndex = 0, validateAction = _=>{}) {
    this.inputField[inputFieldIndex].validate((_) => {
      validateAction();
    });
  }
  validateNow(inputFieldIndex = 0, validateAction = _=>{}) {
    this.inputField[inputFieldIndex].validateNow((_) => {
      validateAction();
    });
  }
  setDisplay(head, body = null, imgsrc  = null) {
    this.heading.innerHTML = head;
    this.subHeading.innerHTML = body;
    visibilityOf(this.image, imgsrc != null);
    if (imgsrc == null) {
      this.content.classList.remove("fmt-twothird");
    } else {
      this.content.classList.add("fmt-twothird");
      if(typeof imgsrc == "string"){
        this.image.src = imgsrc;
      } else {
        getElement(this.imagedivId).classList.add("fmt-padding");
      }
    }
    replaceClass(
      this.content,
      "fmt-padding-small",
      "fmt-padding",
      imgsrc == null
    );
  }

  loader(show = true,onloadAction=_=>{}) {
    visibilityOf(this.loading, show);
    opacityOf(this.box,show?0.5:1);
    if(this.dialogButtons){
      for (var k = 0; k < this.dialogButtons.length; k++) {
        visibilityOf(this.dialogButtons[k], !show);
      }
    }
    if(this.inputField)
      this.inputField.forEach((field,_)=>{
        show?field.disableInput():field.enableInput();
      });
    onloadAction();
  }

  largeTextArea(caption, hint) {
    this.largeTextField = new TextInput(
      this.textFieldId,
      this.textInputAreaId,
      this.textInputErrorId,
      validType.nonempty,false,true,true
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
  getInputType(index) {
    return this.inputField[index].type;
  }
  showFieldError(index,errortext){
    this.inputField[index].showError(errortext);
  }
  getDialogChip(index) {
    return this.optionsRadio[index];
  }
  getDialogButton(index) {
    return this.dialogButtons[index];
  }
  onChipClick(functions = []) {
    this.optionsRadio.forEach((radio, index) => {
      radio.onclick = () => {
        functions[index]();
      };
    });
  }
  onButtonClick(functions = []) {
    this.dialogButtons.forEach((button, index) => {
      button.onclick = () => {
        if (this.inputField) {
          this.inputField.forEach((field, _) => {
            field.normalize();
          });
        }
        functions[index]();
      };
    });
  }
  normalize() {
    this.inputField.forEach((field) => {
      field.normalize();
    });
  }
  setBackgroundColorType(type = bodyType.positive) {
    setDefaultBackground(this.view, type);
  }
  transparent(){
    this.view.style.backgroundColor = colors.transparent;
  }
  setBackgroundColor(color = colors.base) {
    this.view.style.backgroundColor = color;
  }
  setDialogColorType(type = bodyType.neutral) {
    setDefaultBackground(this.box, type);
  }
  setDialogColor(color = colors.white) {
    this.box.style.backgroundColor = color;
  }
  setHeadingColor(color = colors.base) {
    this.heading.style.color = color;
  }
  setSubheadingColor(color = colors.black) {
    this.subHeading.style.color = color;
  }
  show() {
    this.existence(true);
  }
  hide() {
    this.existence(false);
  }
  hideOnClickAnywhere(canhideifclickedoutside = false){
    if(canhideifclickedoutside){
      this.view.onclick=_=>{
        this.hide();
      }
    }
  }
  existence(show = true) {
    value.backbluecovered = show;
    elementFadeVisibility(this.view, show);
  }
}

/**
 * console.log() shorthand
 */
const clog = (msg) => console.log(msg);

/**
 * Dialog box to re-authenticate client accoriding to the type of client.
 */
const authenticateDialog = (
  clientType,
  afterLogin = (_) => {
    snackBar("Success");
  },
  isShowing = true,
  sensitive = false
) => {
  const loginDialog = new Dialog();
  if (isShowing) {
    loginDialog.setDisplay(
      "Authentication Required",
      "You are about to perform a sensitive action. Please provide your login credentials."
    );
    loginDialog.createInputs(
      ["Email address", "Password"],
      ["youremail@example.com", "Your password"],
      ["email", "password"],
      [validType.email, validType.nonempty]
    );
    loginDialog.createActions(
      ["Continue", "Cancel"],
      [actionType.neutral, actionType.positive]
    );
    if (sensitive) {
      loginDialog.setBackgroundColorType(bodyType.negative);
    }
    loginDialog.validate();
    loginDialog.validate(1);
    loginDialog.onButtonClick(
      [
        (_) => {
          if (!(loginDialog.isValid(0) && loginDialog.isValid(1))) {
            loginDialog.validateNow(0);
            loginDialog.validateNow(1);
          } else {
            loginDialog.loader();
            let postpath;
            switch(clientType){
              case client.admin:{postpath = post.admin.self;}break;
              case client.teacher:{postpath = post.teacher.self;}break;
              case client.student:{postpath = post.student.self;}break;
            }
            postJsonData(postpath, {
              target: "authenticate",
              email: loginDialog.getInputValue(0),
              password: loginDialog.getInputValue(1),
            }).then((response) => {
              if (response.event == code.auth.AUTH_SUCCESS) {
                afterLogin();
              } else {
                loginDialog.loader(false);
                switch (response.event) {
                  case code.auth.EMAIL_INVALID: {
                    return loginDialog
                      .inputField[0]
                      .showError("Wrong email address");
                  }
                  case code.auth.WRONG_PASSWORD: {
                    return loginDialog.inputField[1].showError("Wrong password");
                  }
                }
                snackBar("Authentication failed");
              }
            });
          }
        },
        (_) => {
          loginDialog.hide();
        }
      ]
    );
  }
  loginDialog.existence(isShowing);
};

/**
 * Dialog box to change password of client accoriding to the type of client.
 */
const resetPasswordDialog = (clientType,isShowing = true,onpasschange=_=>{snackBar("Your password was changed.","Done")}) => {
  const resetDialog = new Dialog();
  resetDialog.setDisplay(
    "Reset password",
    "Create a new password for your account."
  );
  resetDialog.createInputs(
    ["Create new password"],
    ["A strong password"],
    ["password"],
    [validType.password],
  );
  resetDialog.createActions(
    ["Update password", "Cancel"],
    [actionType.positive, actionType.neutral]
  );

  resetDialog.validate(0);

  resetDialog.onButtonClick(
    [
      () => {
        resetDialog.validateNow(0);
        if (!resetDialog.isValid(0)) return;
        resetDialog.loader();
        let postpath;
        switch(clientType){
          case client.admin:postpath = post.admin.self;break;
          case client.teacher:postpath = post.teacher.self;break;
          case client.student:postpath = post.student.self;break;
        }
        postJsonData(postpath, {
          target:"account",
          action:code.action.CHANGE_PASSWORD,
          newpassword:resetDialog.getInputValue(0)
        }).then(response=>{
          if(response.event == code.OK){
            resetDialog.hide();
            return onpasschange();
          }
          resetDialog.loader(false);
          snackBar(response.event,'Report');
        })
      },
      () => {
        resetDialog.hide();
      }
    ]
  );
  resetDialog.existence(isShowing);
};

/**
 * Dialog box to change email of client accoriding to the type of client.
 */
const changeEmailBox = (clientType,isShowing = true,onemailchange=_=>{clientType == client.admin?location.reload():parent.location.reload()}) => {
  authenticateDialog(clientType,(_) => {
    const mailChange = new Dialog();
    mailChange.setDisplay(
      "Change Email Address",
      "Provide the new email address. You'll have to verify this in next step."
    );
    mailChange.createInputs(
      ["New email address"],
      ["newemail@example.com"],
      ["email"],
      [validType.email]
    );
    mailChange.createActions(
      ["Change email ID", "Abort"],
      [actionType.negative, actionType.neutral]
    );
    mailChange.validate(0);
    mailChange.onButtonClick(
      [
        () => {
          if (!mailChange.isValid(0)) return mailChange.validateNow(0);
          mailChange.loader();
          let postpath;
          switch(clientType){
            case client.admin:postpath = post.admin.self;break;
            case client.teacher:postpath = post.teacher.self;break;
            case client.student:postpath = post.student.self;break;
          }
          postJsonData(postpath, {
            target: "account",
            action: code.action.CHANGE_ID,
            newemail: mailChange.getInputValue(0),
          }).then((response) => {
            if (response.event == code.OK) {
              return onemailchange();
            }
            mailChange.loader(false);
            switch (response.event) {
              case code.auth.SAME_EMAIL:
                return mailChange
                  .inputField[0]
                  .showError("Already the same.");
              case code.auth.USER_EXIST:
                return mailChange
                  .inputField[0]
                  .showError("Account already exists.");
              case code.auth.EMAIL_INVALID:
                return mailChange
                  .inputField[0]
                  .showError("Invalid email address.");
              default:snackBar('Action Failed');
            }
          });
        },
        () => {
          mailChange.hide();
        }
      ]
    );
    mailChange.existence(isShowing);
  });
};

/**
 * Saves the given data to localstorage.
 * @param {JSON} data The data to be stored via localStorage api of browser
 */
const saveDataLocally = (data = {}) => {
  for (var key in data) {
    if (data.hasOwnProperty(key)) {
      localStorage.setItem(key, data[key]);
    }
  }
};

/**
 * Checks if given data has any null key.
 * @param {JSON} data The data to be checked.
 * @returns {Boolean} true if any key null, else false.
 */
const hasAnyKeyNull = (data = {}) => {
  if (data == null) {
    return true;
  }
  if (data == {}) {
    return true;
  }
  for (var key in data) {
    if (data.hasOwnProperty(key)) {
      if (data[key] == null || data[key] == constant.nothing) {
        return true;
      }
    }
  }
  return false;
};

/**
 * Retrives current user session data and stores it in localstorage.
 */
const getSessionUserData = async(clientType) => {
  let data = {
    [constant.sessionID]: localStorage.getItem(constant.sessionID),
    [constant.sessionUID]: localStorage.getItem(constant.sessionUID),
    username: localStorage.getItem(key.username),
    uiid: localStorage.getItem(key.uiid)=='null'?false:localStorage.getItem(key.uiid),
  };
  if(hasAnyKeyNull(data)){
    let postpath;
    switch(clientType){
      case client.admin:postpath = post.admin.self;break;
      case client.teacher:postpath = post.teacher.self;break;
      case client.student:postpath = post.student.self;break;
    }
    let result = await postJsonData(postpath, {
      target:action.receive,
    });
    if(result.event == code.auth.SESSION_INVALID){
      return false;
    }
    saveDataLocally(result);
    return await getSessionUserData(clientType);
  } else {
    return data;
  }
};


/**
 * The global feedback box for schemester. Uses Dialog class.
 */
const feedBackBox = (
  isShowing = true,
  defaultText = String(),
  error = false
) => {
  const feedback = new Dialog();
  feedback.setDisplay(
    "Contact Developers",
    "Are you facing any problem? Or want a feature that helps you in some way? Explain everything that here. " +
      "We are always eager to listen from you.",
    "/graphic/icons/schemester512.png"
  );
  feedback.createInputs(
    ["Your email address"],
    ["To help or thank you directly ;)"],
    [validType.email],
    [validType.email],
    null,
    [validType.email]
  );
  feedback.largeTextArea(
    "Describe everything",
    "Start typing your experience here"
  );
  feedback.createRadios(
    ["Feedback", "Error"],
    error ? "Error" : "Feedback"
  );

  feedback.setBackgroundColorType(!error);

  feedback.createActions(
    ["Submit", "Abort"],
    [actionType.positive, actionType.negative]
  );
  feedback.onChipClick(
    [
      (_) => {
        feedback.setBackgroundColorType();
      },
      (_) => {
        feedback.setBackgroundColorType(bodyType.negative);
      }
    ]
  );

  feedback.largeTextField.input.value = defaultText;

  feedback.validate(0, (_) => {
    feedback.largeTextField.inputFocus();
  });
  feedback.largeTextField.validate();

  feedback.onButtonClick(
    [
      () => {
        if (
          !(
            stringIsValid(feedback.getInputValue(0), validType.email) &&
            stringIsValid(feedback.largeTextField.getInput())
          )
        ) {
          feedback.largeTextField.validateNow();
          feedback.inputField[0].validateNow((_) => {
            feedback.largeTextField.inputFocus();
          });
        } else {
          mailTo("schemester@outlook.in",`From ${feedback.getInputValue(0)}`,feedback.largeTextField.getInput());
          feedback.hide();
          snackBar(
            "Thanks for the interaction. We'll look forward to that.",
            "Hide"
          );
        }
      },
      () => {
       feedback.hide();
      }
    ]
  );
  feedback.existence(isShowing);
};

/**
 * Can be used to show a loading only dialog box via Dialog class.
 */
const loadingBox = (
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

/**
 * Can be used to show any confirmation via Dialog class.
 */
const confirmDialog=(heading,body,imgsrc,yesaction=_=>{}, serious = false,noaction)=>{
  const confdialog = new Dialog();
  confdialog.setDisplay(heading,body,imgsrc?imgsrc:serious?'/graphic/elements/warnicon.svg':null);
  confdialog.transparent();
  if(serious){
    confdialog.setHeadingColor(colors.negative);
  }
  confdialog.createActions(['Proceed','Abort'],[serious?actionType.negative:actionType.positive,actionType.neutral]);
  confdialog.onButtonClick([_=>{
    yesaction();
  },_=>{
    noaction?noaction():confdialog.hide();
  }]);
  confdialog.show();
}

/**
 * Can be used to show any information via Dialog class.
 */
const infoDialog=(heading,body,imgsrc,action)=>{
  const infodialog = new Dialog();
  infodialog.setDisplay(heading,body,imgsrc);
  infodialog.transparent();
  infodialog.createActions(['Got it'],[actionType.neutral]);
  infodialog.onButtonClick([_=>{
    action?action():infodialog.hide();
  }]);
  infodialog.show();
}

/**
 * Displays a timer on given element for which it remains disabled. This method however, doesn't actually disable the element,
 * therefore, must be called after disabling it.
 * @param {HTMLElement} element The element to be disabled.
 * @param {Number} duration The duration in seconds, for which element remains disabled.
 * @param {String} id A unique string associated with the element.
 * @param {Function} afterRestriction The method to be excecuted after restrication is lifted. (optional)
 * @param {Boolean} strict Defaults to false. If false, uses sessionStorage for timer (which means, timer will be removed if browser is closed), else uses localStorage.
 */
const restrictElement=(element,duration,id,afterRestriction=_=>{},strict = false)=>{
  opacityOf(element, 0.5);
  const ogtext = element.innerHTML;
  let time = duration;
  const timer = setInterval(() => {
    time--;
    strict?localStorage.setItem(`restrict${id}`, time):sessionStorage.setItem(`restrict${id}`, time);
    element.innerHTML = `Wait for ${time} seconds.`;
    if (time == 0) {
      element.innerHTML = ogtext;
      opacityOf(element, 1);
      strict?localStorage.setItem(`restrict${id}`, time):sessionStorage.removeItem(`restrict${id}`);
      afterRestriction();
      clearInterval(timer);
    }
  }, 1000);
}

/**
 * Resumes a timer on given element for which it remains disabled, if set by [restrictElement] method. This method however, doesn't actually disable the element,
 * therefore, must be called after disabling it. This method prevents removal of restriction commit by a simple page reload.
 * @param {HTMLElement} element The element to be disabled if timer set be [restrictElement] method is still running.
 * @param {String} id The unique string associated with the element, as set by [restrictElement] method.
 * @param {Function} afterRestriction The method to be excecuted after restrication is lifted. (optional)
 * @param {Boolean} strict Defaults to false. If false, uses sessionStorage for timer (which means, timer will be removed if browser is closed), else uses localStorage.
 * @note The param id and strict must be same for the same element as set by ]restrictElement] method.
 */
const resumeElementRestriction=(element,id,afterRestriction=_=>{},strict=false)=>{
  if (Number(sessionStorage.getItem(`restrict${id}`)) > 0) {
    opacityOf(element, 0.5);
    const ogtext = element.innerHTML;
    let time = Number(sessionStorage.getItem(`restrict${id}`));
    const timer = setInterval(() => {
      time--;
      strict?localStorage.setItem(`restrict${id}`, time):sessionStorage.setItem(`restrict${id}`, time);
      element.innerHTML = `Wait for ${time} seconds.`;
      if (time == 0) {
        element.innerHTML = ogtext;
        opacityOf(element, 1);
        strict?localStorage.setItem(`restrict${id}`, time):sessionStorage.removeItem(`restrict${id}`);
        afterRestriction();
        clearInterval(timer);
      }
    }, 1000);
  } else {
    afterRestriction();
  }  
}

/**
 * This method checks if session is valid for given client, and executes the provided methods accordingly.
 * @param {String} clientType The global type of client to check session.
 * @param {Function} validAction The method to execute if session is valid, defaults to navigating to client session main page.
 * @param {Function} invalidAction The method to execute if session is invalid, defaults to navigating to schemester's homepage.
 * @note The [clientType] can be derived from Client class in codes.js.
 */
const checkSessionValidation = (
  clientType = null,
  validAction = null,
  invalidAction = (_) => relocate(locate.homepage)
) => {
  switch (clientType) {
    case client.admin:{
        postJsonData(post.admin.sessionValidate)
          .then((result) => {
            if (result.event == code.auth.SESSION_INVALID) {
              invalidAction();
            } else {
              if (!validAction) {
                validAction = (_) => {
                  relocate(locate.admin.session, {
                    target: locate.admin.target.dashboard,
                  });
                };
              }
              validAction();
            }
          })
          .catch((error) => {
            clog(error);
            snackBar(
              'Network error',
            );
            relocate(locate.homepage);
          });
      }
      break;
    case client.teacher:
      {
        postJsonData(post.teacher.sessionValidate)
          .then((result) => {
            if (result.event == code.auth.SESSION_INVALID) {
              invalidAction();
            } else {
              if (!validAction) {
                validAction = (_) => {
                  relocate(locate.teacher.session, {
                    target: locate.teacher.target.dash,
                  });
                };
              }
              validAction();
            }
          })
          .catch((error) => {
            clog(error);
            snackBar(
              'Network error',
            );
            relocate(locate.homepage);
          });
      }
      break;
    case client.student:{
      postJsonData(post.student.sessionValidate)
          .then((result) => {
            if (result.event == code.auth.SESSION_INVALID) {
              invalidAction();
            } else {
              if (!validAction) {
                validAction = (_) => {
                  relocate(locate.student.session, {
                    target: locate.student.target.dash,
                  });
                };
              }
              validAction();
            }
          })
          .catch((error) => {
            clog(error);
            snackBar(
              'Network error',
            );
            relocate(locate.homepage);
          });
    }break;
    default: {
      checkSessionValidation(client.admin, null, (_) => {
        checkSessionValidation(client.teacher, null, (_) => {
          checkSessionValidation(client.student, null, (_) => {
            invalidAction();
          });
        });
      });
    }
  }
};

const onSessionStatus = (
  clientType,
  validAction = _=>{},
  invalidAction = _=>{}
) => {
  getSessionUserData(clientType).then(data=>{
    if(!data){
      invalidAction();
    }else {
      validAction(); 
    }
  }).catch(error=>{
    if(!navigator.onLine){
      snackBar("Couldn't connect to the network",null,false);
    } else {
      snackBar(error,'Report');
    }
  });
};

const validateTextField = (
  textfield = new TextInput(),
  type = validType.nonempty,
  afterValidAction =_=>{},
  ifmatchField = null
) => {
  let error, matcher = constant.nothing;
  switch (type) {
    case validType.name:{
      error = "There has to be a name.";
    }break;
    case validType.email:{
      error = "Invalid email address.";
    }break;
    case validType.phone:{
      error = "Not a valid number"
    }break;
    case validType.number:{
      error = "Not a valid number"
    }break;
    case validType.naturalnumber:{
      error = "Must be greater than zero";
    }break;
    case validType.wholenumber:{
      error = "Must be a positive number";
    }break;
    case validType.password:{
      error = "Weak password, try something else."
    }break;
    case validType.match:{
      error = "This one is different.";
      matcher = ifmatchField.getInput();
    }break;
    case validType.weekday:{
      error = "Invalid weekday"
    }break;
    default: {
      error = "This can't be empty";
    }
  }

  textfield.showError(error);
  if (!stringIsValid(textfield.getInput(), type, matcher)) {
    textfield.inputFocus();
    textfield.onTextInput((_) => {
      textfield.normalize();
      if (textfield.getInput() != constant.nothing) {
        validateTextField(
          textfield,
          type,
          (_) => {
            afterValidAction();
          },
          ifmatchField
        );
      } else {
        textfield.onTextInput((_) => {
          textfield.normalize();
        });
        textfield.onTextDefocus((_) => {
          if (stringIsValid(textfield.getInput(), type, matcher)) {
            afterValidAction();
          } else {
            textfield.showError(error);
            validateTextField(
              textfield,
              type,
              (_) => {
                afterValidAction();
              },
              ifmatchField
            );
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
        validateTextField(
          textfield,
          type,
          (_) => {
            afterValidAction();
          },
          ifmatchField
        );
      }
    });
  }
};

const finishSession = (
  clientType,
  afterfinish = () => {
    relocateParent(locate.root);
  }
) => {
  let postpath;
  switch(clientType){
    case client.admin:postpath = post.admin.auth;break;
    case client.teacher:postpath = post.teacher.auth;break;
    case client.student:postpath = post.student.auth;break;
  }
  postJsonData(postpath,{
    action:action.logout,
  }).then((res) => {
    if (res.event == code.auth.LOGGED_OUT) {
      sessionStorage.clear();
      clearLocalData();
      return afterfinish();
    }
    snackBar("Failed to logout", "Try again", false, (_) => {
      finishSession(clientType,_=>{afterfinish()});
    });
    parent.location.reload();
  }).catch(e=>{
    clog(e);
    snackBar("Failed to logout", "Try again", false, (_) => {
      finishSession(clientType,_=>{afterfinish()});
    });
    parent.location.reload();
  });
};

/**
 * Clears key value pairs from using localStorage API of browser.
 * @param {Boolean} absolute Defaults to false. If true, will clear every key-value pair from localStorage, otherwise, will keep 
 * the globally applied setting storage (like theme value,etc.) and remove others.
 */
const clearLocalData = (absolute = false) => {
  if (absolute) {
    localStorage.clear();
  } else {
    const t = theme.getTheme();
    const tuiid = localStorage.getItem(key.teacher.rememberuiid);
    const suiid = localStorage.getItem(key.student.rememberuiid);
    const hplogintab = localStorage.getItem(key.homelogintab);
    localStorage.clear();
    theme.setTheme(t);
    localStorage.setItem(key.teacher.rememberuiid,tuiid);
    localStorage.setItem(key.student.rememberuiid,suiid);
    localStorage.setItem(key.homelogintab,hplogintab);
  }
};

const setFieldSetof = (
  fieldset,
  isNormal = true,
  errorField = null,
  errorMsg = null
) => {
  if (errorField != null && errorMsg != null) {
    errorField.innerHTML = errorMsg;
  }
  if (isNormal && errorField != null) {
    errorField.innerHTML = constant.nothing;
  }
  setClassNames(
    fieldset,
    bodyType.getFieldStyle(bodyType.positive),
    bodyType.getFieldStyle(bodyType.negative),
    isNormal
  );
};

const setClass = (element = new HTMLElement(), classname) => (element.className = classname);

const setClassNames = (
  element,
  normalClass,
  errorClass,
  condition = actionType.positive,
  warnClass,
  activeClass
) => {
  switch (condition) {
    case actionType.positive:
      return element.className = normalClass;
    case actionType.negative:
      return element.className = errorClass;
    case actionType.warning:
      return element.className = warnClass;
    case actionType.active:
      return element.className = activeClass;
    default:
      return element.className = condition?normalClass:errorClass;
  }
};

/**
 * Shows single or all HTML elements in given array.
 * @param {Array} elements The array of html elements to be acted upon.
 * @param {Number} index The index of element in given array to be shown. If not provided, defaults to null, and all elements will be shown.
 * @param {Boolean} hideRest If false, the visiblity of rest of items in elements won't be affected. Defaults to true (hides the rest).
 */
const showElement = (elements = [], index = null, hideRest = true) => {
  if (hideRest) {
    for (let k = 0; k < elements.length; k++) {
      if (index != null) {
        visibilityOf(elements[k], k == index);
      } else {
        show(elements[k]);
      }
    }
  } else {
    index != null ? show(elements[index]) : showElement(elements);
  }
};

/**
 * Hides single or all HTML elements in given array.
 * @param {Array} elements The array of html elements to be acted upon.
 * @param {Number} index The index of element in given array to be hidden. If not provided, defaults to null, and all elements will be hidden.
 * @param {Boolean} hideRest If false, the visiblity of rest of items in elements won't be affected. Defaults to true (shows the rest).
 */
const hideElement = (elements = [], index = null, showRest = true) => {
  if (showRest) {
    for (let k = 0; k < elements.length; k++) {
      if (index != null) {
        visibilityOf(elements[k], k != index);
      } else {
        hide(elements[k]);
      }
    }
  } else {
    index != null ? hide(elements[index]) : hideElement(elements);
  }
};

const elementFadeVisibility = (element, isVisible) => {
  replaceClass(
    element,
    "fmt-animate-opacity-off",
    "fmt-animate-opacity",
    isVisible
  );
  visibilityOf(element, isVisible);
};

const elementRiseVisibility = (element, isVisible) => {
  replaceClass(
    element,
    "fmt-animate-bottom-off",
    "fmt-animate-bottom",
    isVisible
  );
  visibilityOf(element, isVisible);
};

/**
 * Sets background color of any element as per the param type (a value from ViewType class).
 * @param {HTMLElement} element The element to be updated.
 * @param {String} type Defaults to actionType.positive. Can be taken from ViewType class object.
 */
const setDefaultBackground = (element, type = actionType.positive) => {
  element.style.backgroundColor = colors.getColorByType(type);
  switch (type) {
    case actionType.neutral:
      element.style.color = colors.black;
      break;
    default:
      element.style.color = colors.white;
  }
};

/**
 * Replaces the class of given HTML element, with condition.
 * @param {HTMLElement} element The element whose given class will be replaced by the provided class.
 * @param {String} toBeReplaced The existing class of given element to be replaced.
 * @param {String} replacement The class which will replace given class of given element.
 * @param {Boolean} opposite This condition ensures the reversibility of the intended action. If set to false, the toBeReplaced and replacement class params will be exchanged.
 * If unset, defaults to true, means classes will be replaced normally as they were intended to. Can be used if classes are to be replaced on some boolean condition.
 */
const replaceClass = (
  element = new HTMLElement(),
  toBeReplaced,
  replacement,
  opposite = true
) =>
  opposite
    ? element.classList.replace(toBeReplaced, replacement)
    : element.classList.replace(replacement, toBeReplaced);

const appendClass = (element = new HTMLElement(), appendingClass) =>
  element.classList.add(appendingClass);

const showLoader = (_) => show(getElement("navLoader"));
const hideLoader = (_) => hide(getElement("navLoader"));

/**
 * Sets the opacity of given HTML element.
 * @param {HTMLElement} element The element whose opacity is to be set.
 * @param {Number} value The numeric value of opacity of the given element to set. Defaults to 1. Must be >=0 & <=1.
 */
const opacityOf = (element = new HTMLElement(), value = 1) =>
  (element.style.opacity = String(value));

/**
 * Sets the opacity of HTML element(s) of given array.
 * @param {Array} elements The array of whose element(s)'s opacity is to be set.
 * @param {Number} value The numeric value of opacity of the element(s) to set. Defaults to 1. Must be >=0 & <=1.
 * @param {Number} index The particular index element's opacity to be set. If not provided, will set the opacity for all elements.
 */
const opacityOfAll = (elements = [], value = 1,index = null) => index!=null? opacityOf(elements[index],value):elements.forEach((element)=>opacityOf(element,value))

/**
 * Controls visiblity of the given HTML element, as per the condition. (using hidden attribute of HTMLElement)
 * @param {HTMLElement} element The element whose visibility is to be toggled.
 * @param {Boolean} visible The boolean value to show or hide the given element. Defaults to true (shown).
 */
const visibilityOf = (element, visible = true) =>{
  if(!element) return;
  element.hidden = !visible;
  element.style.display = visible?constant.show:constant.hide;
}

/**
 * Controls visiblity of the HTML elements in given array, as per the condition. (using hidden attribute of HTMLElement).
 * @param {Array} elements The array of elements whose element's visibility is to be toggled.
 * @param {Boolean} visible The boolean value to show or hide the given element. Defaults to true (shown). The visibility of rest elements will be toggled oppositly.
 * @param {Number} index If not set, all the elements will have the same visibility state, else the element at given index will have the provided visibility state, and others opposite.
 */
const visibilityOfAll = (elements = [], visible = true, index = null) =>{
  index != null
    ?elements.forEach((element, e) => {
      visibilityOf(element, e==index);
    })
    : elements.forEach((element, _) => {
      visibilityOf(element, visible);
    });
}

/** Hides the given element
 * @param {HTMLElement} element The element to be hidden.
 */
const hide = (element = new HTMLElement()) => visibilityOf(element, false);

/** Hides the given element(s) in array
 * @param {Array} elements The array element(s) to be hidden
 * @param {Number} index The particular index element to be hidden. Will not affect visiblity of other elements if provided.
 */
const hideAll = (elements = [],index = null) => index!=null?hide(elements[index]):elements.forEach((element)=>{hide(element)});

/** Shows the given element 
 * @param {HTMLElement} element The element to be shown
 */
const show = (element = new HTMLElement()) => visibilityOf(element);

/** Shows the given element(s) in array
 * @param {Array} elements The array element(s) to be shown
 * @param {Number} index The particular index element to be shown. Will not affect visiblity of other elements if provided.
 */
const showAll = (elements = [],index = null) => index!=null?show(elements[index]):elements.forEach((element)=>{show(element)});

/**Checks if element is visible or not
 * @param {HTMLElement} element The element whose visibility is to be determined
 * @returns {Boolean} If element visible, true, or false otherwise.
 */
const isVisible = (element = new HTMLElement()) =>
element.style.display != constant.hide || !element.hidden;

/** Checks if element(s) in given array is/are visible or not.
 * @param {Array} elements The array of elements whose visibility is to be determined for single or each.
 * @param {Number} index The index of element to be checked in given array. If not provided, will check for any element.[using Array().some()]
 * @returns {Boolean} If element(s) are visible, true, or false otherwise.
 */
const areVisible = (elements = [], index = null) =>
  index != null
    ? elements[index].style.display == constant.show
    : elements.some((_, e) => {
      return areVisible(elements,e)
    });

/**
 * Returns name of week day as per index.
 * @param {Number} dIndex 0=<dIndex<=6, the index of day to return
 * @returns {String} The day name from weekdays
 */
const getDayName = (dIndex = Number) =>
dIndex < constant.weekdays.length && dIndex >= 0
? constant.weekdays[dIndex]
: null;


/**
 * Returns name of month as per index.
 * @param {Number} mIndex 0=<mIndex<=11, the index of month to return
 * @returns {String} The month name from month array
 */
const getMonthName = (mIndex = Number) =>
  mIndex < constant.months.length && mIndex >= 0
    ? constant.months[mIndex]
    : null;

/**
 * Shorthand for window.document.getElementById() method
 * @param {String} id The id of HTMLElement to return 
 * @returns {HTMLElement} The element associated with provided id
 */
const getElement = (id) => document.getElementById(id);

/**
 * This function extends the ability of window.location.replace(), by allowing you to provide additional link data passed as query along with the link.
 * @param {String} path The path or link to be passed in replace() function of window.location
 * @param {JSON} data The data to be passed with the link as query. The data should be provided as JSON key:value pairs. E.g. {question:'How?',response:'somehow'}.
 */
const relocate = (path = String, data = null) => window.location.replace(path+getRequestBody(data));

/**
 * This function extends the ability of window.location.replace(), by allowing you to provide additional link data passed as query along with the link.
 * Useful replacing parent location from an iframe source.
 * @param {String} path The path or link to be passed in replace() function of window.location
 * @param {JSON} data The data to be passed with the link as query. The data should be provided as JSON key:value pairs. E.g. {question:'How?',response:'somehow'}.
 */
const relocateParent = (path, data = null) => window.parent.location.replace(path+getRequestBody(data));

/**
 * Sets location as per given params
 * @param {String} href The base url of location
 * @param {JSON} data The optional parameters to be attached with url, like in GET type requests.
 */
const refer = (href, data = null) => window.location.href = href+getRequestBody(data);

/**
 * Opens link in a new tab as per given params
 * @param {String} href The base url of location
 * @param {JSON} data The optional parameters to be attached with url, like in GET type requests.
 */
const referTab = (href, data = null) => window.open(href+getRequestBody(data));

/**
 * Sets parent location href as per given params. Useful in loading a url from an iframe source.
 * @param {String} href The base url of location
 * @param {JSON} data The optional parameters to be attached with url, like in GET type requests.
 */
const referParent = (href, data = null) => window.parent.location.href = href+getRequestBody(data);

/**
 * Opens a link in new tab as per given params. Useful in opening a new tab from an iframe source.
 * @param {String} href The base url of location
 * @param {JSON} data The optional parameters to be attached with url, like in GET type requests.
 */
const referParentTab = (href, data = null) => window.parent.open(href+getRequestBody(data));

/**
 * Sends post request using browser fetch API, with json type body, and receives response in JSON format.
 * @param {String} url The endpoint location of post request. (same-origin)
 * @param {JSON} data The data to be sent along with request, key value type.
 * @returns {Promise} response object as a promise.
 */
const postJsonData = async (url = String, data = {}) => {
  try{
    data['acsrf'] = getElement("acsrf").innerHTML;
  }catch{};
  try{
    if (window.fetch) {
      const response = await fetch(url, {
        method: constant.post,
        mode: "same-origin",
        headers: {
          Accept: constant.fetchJsonContent,
          "Content-Type": constant.fetchJsonContent,
        },
        body: JSON.stringify(data),
      });
      const content = await response.json();
      if(content.result.event == code.auth.SESSION_INVALID&&![post.admin.sessionValidate,post.teacher.sessionValidate,post.student.sessionValidate].includes(url)){
        return window.parent.location.reload();
      }
      return content.result;
    }
  } catch (error){
    clog(error);
    if(!navigator.onLine){return snackBar('Network Error','',false)}
    snackBar(error,'Report');
  }
};

/**
 * Creates a string of queries to be passed along with any form action type link, from given JSON type data.
 * @param {JSON} data The given key:value pairs of data to be converted into url query.
 * @param {Boolean} isPost The optional parameter, if body is to be converted to send with a post request of content-type: x-www-form-urlencoded, set true. Defaults to false for get request.
 * @return {String} The query in string from, ready to be concatenated with some action URL of form kind.
 */
const getRequestBody = (data = {}, isPost = false) => {
  if(!data) return constant.nothing;
  let i = 0;
  let body = constant.nothing;
  for (let key in data) {
    if (data.hasOwnProperty(key)) {
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
  return body;
};

/**
 * To use browser get method to trigger email href.
 * @param {String} to The address of receiver
 * @param {String} subject The subject of email
 * @param {String} body The body of email, non-html.
 * @param {String} cc CC address
 * @param {String} bcc BCC address
 */
const mailTo = (to,subject = constant.nothing,body = constant.nothing,cc=constant.nothing,bcc=constant.nothing) => refer(`mailto:${to}`,{
  subject: subject,
  body: body,
  cc:cc,
  bcc:bcc,
});

/**
 * To use browser get method to trigger calling href.
 * @param {String} to The contact number of receiver
 */
const callTo = (to) => refer(`tel:${to}`); 

const idbSupported = () => {
  if (!window.indexedDB) {
    snackBar(
      "This browser is outdated for Schemester to work. Switch to Chrome/Edge/Safari/Firefox, or any modern browser.",
      "Learn more",
      false,
      (_) => {
        referParent("https://google.com/search", {
          q: "modern+browsers",
        });
      }
    );
  }
  return window.indexedDB;
};

/**
 * Adds string/html suffix to number passed (1->1st, etc).
 * @param {Number} number The number to be suffixed
 * @param {Boolean} html If true, then the suffex will be added as an html <sup> element, else simply concatenated as string.
 * @returns {String} Suffixed number, html or simple string, based on previous parameter.
 */
const addNumberSuffixHTML = (number = Number,html = true) => {
  var str = String(number);
  switch (number) {
    case 1:
      return html?number + "<sup>st</sup>":number + "st";
    case 2:
      return html?number + "<sup>nd</sup>":number + "nd";
    case 3:
      return html?number + "<sup>rd</sup>":number + "rd";
    default: {
      if (number > 9) {
        if (str.charAt(str.length - 2) == "1") return html?number + "<sup>th</sup>":number + "th";
        return addNumberSuffixHTML(Number(str.charAt(str.length - 1)),html);
      } else {
        return html?number + "<sup>th</sup>":number + "th";
      }
    }
  }
};

/**
 * @deprecated This method is deprecated as of October 3, 2020 23:53 (IST). See the new addNumberSuffixHTML(Number, Boolean) method, on which this method relies too now.
 * 
 * Adds string suffix to number passed (1->1st, etc).
 * @param {Number} number The number to be suffixed
 * @returns {String} Suffixed number as string.
 */
const addNumberSuffix = (number = Number) => addNumberSuffixHTML(number,false);

/**
 * Returns phrase readable form of date from standard Schemester form of date.
 * @param {String} dateTillMillis The full date in Schemester standard form: YYYYMMDDHHmmSSmmm
 * @return {String} Readable sentence like date.
 */
const getProperDate = (dateTillMillis) => {
  dateTillMillis = String(dateTillMillis);
  return `${getMonthName(dateTillMillis.substring(4, 6) - 1)} ${dateTillMillis.substring(6, 8)}, ${dateTillMillis.substring(0, 4)} at ${dateTillMillis.substring(8, 10)}:${dateTillMillis.substring(10, 12)} hours ${dateTillMillis.substring(12, 14)} seconds`;
};

/**
 * Returns HH:MM/HH:MM:ss as HHMM/HHMMss
 */
const getNumericTime=(time)=> Number(String(time).replace(':',constant.nothing));

const getLogInfo = (code, message) => `type:${code}\ninfo:${message}\n`;

//The following methods return templates for certain elements to be inserted dynamically.

const getButton = (id,label,type=actionType.positive)=>`<button class="${actionType.getButtonStyle(type)}" id="${id}">${label}</button>`;
const getRadioChip = (labelID, label, radioID) =>
  `<label class="radio-container" id="${labelID}">${label}<input type="radio" name="dialogChip" id="${radioID}"><span class="checkmark"></span></label>`;
const getCheckBox = (labelID, label, checkboxID) =>
  `<label class="check-container" id="${labelID}">${label}<input type="checkbox" id="${checkboxID}"><span class="tickmark-positive"></span></label>`;
const getSwitch = (labelID,label,checkID,switchcontainerID,switchviewID)=>
  `<span class="fmt-row switch-view" id="${switchcontainerID}">
    <span class="switch-text" id="${labelID}">${label}</span>
    <label class="switch-container">
      <input type="checkbox" id="${checkID}"/>
      <span class="switch-positive" id="${switchviewID}"></span>
    </label>
  </span>`;

const getInputField = (fieldID) =>
  `<fieldset class="fmt-row text-field" id="${fieldID}"></fieldset>`;
const getDialogButton = (buttonClass, buttonID, label) =>
  `<button class="${buttonClass} fmt-right" id="${buttonID}">${label}</button>`;
const getDialogLoaderSmall = (loaderID) =>
  `<img class="fmt-spin-fast fmt-right" width="50" src="/graphic/blueLoader.svg" id="${loaderID}"/>`;

const getLoader=(id,size = 30,blue = true) =>`<img class="fmt-spin-fast" width="${size}" src="/graphic/${blue?'blueLoader':'onethreeload'}.svg" id="${id}"/>`;

const editIcon=(size)=>`<img width="${size}" src="/graphic/elements/editicon.svg"/>`
const appicon=(size=256)=>`/graphic/icons/schemester${size}.png`
