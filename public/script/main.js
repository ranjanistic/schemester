if (localStorage.getItem("theme")) {
  document.documentElement.setAttribute(
    "data-theme",
    localStorage.getItem("theme")
  );
}

class Button{
  constructor(buttonid,actiontype=actionType.positive){
    this.button = getElement(buttonid);
    setClassNames(this.button,actionType.getButtonStyle(actiontype));
  }
  setType(actiontype = actionType.positive){
    setClassNames(this.button,actionType.getButtonStyle(actiontype));
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
    this.error =
      errorId != constant.nothing && errorId != null
        ? getElement(errorId)
        : null;
    this.type = type;
    this.normalize();
  }
  show() {
    show(this.fieldset);
  }
  hide() {
    hide(this.fieldset);
  }
  visible(isvisible = true) {
    visibilityOf(this.fieldset, isvisible);
  }
  activate() {
    setClass(this.fieldset, bodyType.getFieldStyle(bodyType.active));
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

class Checkbox {
  constructor(
    containerId = String,
    labelId = String,
    checkboxId = String,
    checkViewId = null,
    type = actionType.positive
  ) {
    this.container = getElement(containerId);
    this.label = getElement(labelId);
    this.checkbox = getElement(checkboxId);
    if (checkViewId) {
      this.checkview = getElement(checkViewId);
      this.type = type;
      setClass(this.checkview, actionType.getCheckStyle(this.type));
    }
  }
  setLabel(text = String) {
    this.label.innerHTML = text;
  }
  onCheckChange(checked = _=>{}, unchecked = _=>{}) {
    this.checkbox.addEventListener(change, (_) => {
      if (this.checkbox.checked) {
        checked();
      } else {
        unchecked();
      }
    });
  }
  isChecked() {
    return this.checkbox.checked;
  }
  check() {
    this.checkbox.checked = true;
  }
  uncheck() {
    this.checkbox.checked = false;
  }
  checked(ischecked = true) {
    this.checkbox.checked = ischecked;
  }
  show() {
    show(this.container);
  }
  hide() {
    hide(this.container);
  }
  visible(isvisible = true) {
    visibilityOf(this.container, isvisible);
  }
}

const nothing=()=>{};
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
  var snack = new Snackbar();
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
  basicDialogContent = `
      <img class="fmt-col fmt-third fmt-center" id="dialogImage" width="100%"/>
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
        validateTypes ? validateTypes[k] : null,
        this.dialogFieldCaptionID(k)
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

  createActions(labels, types = Array(actionType.positive)) {
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
      this.image.src = imgsrc;
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
    for (var k = 0; k < this.dialogButtons.length; k++) {
      visibilityOf(this.dialogButtons[k], !show);
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
  onChipClick(functions = Array) {
    this.optionsRadio.forEach((radio, index) => {
      radio.onclick = () => {
        functions[index]();
      };
    });
  }
  onButtonClick(functions = Array) {
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
const clog = (msg) => {
  console.log(msg);
};

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
  var loginDialog = new Dialog();
  if (isShowing) {
    loginDialog.setDisplay(
      "Authentication Required",
      "You are about to perform a sensitive action. Please provide your login credentials."
    );
    loginDialog.createInputs(
      ["Email address", "Password"],
      ["youremail@example.com", "Your password"],
      ["email", "password"],
      [validType.email, validType.password]
    );
    loginDialog.createActions(
      ["Continue", "Cancel"],
      [actionType.neutral, actionType.positive]
    );
    if (sensitive) {
      loginDialog.setBackgroundColorType(bodyType.negative);
    }
    loginDialog.validate(0);
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
const resetPasswordDialog = (clientType,isShowing = true,onpasschange=_=>{snackBar(
    "Your password was changed.",
    "Done"
  )}) => {
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
    username: localStorage.getItem("username"),
    uiid: localStorage.getItem("uiid")=='null'?false:localStorage.getItem("uiid"),
    createdAt: localStorage.getItem("createdAt"),
  };
  if(hasAnyKeyNull(data)){
    let postpath;
    switch(clientType){
      case client.admin:postpath = post.admin.self;break;
      case client.teacher:postpath = post.teacher.self;break;
      case client.student:postpath = post.student.self;break;
    }
    let result = await postJsonData(postpath, {
      target:'receive',
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
  var feedback = new Dialog();
  feedback.setDisplay(
    "Contact Developers",
    "Are you facing any problem? Or want a feature that helps you in some way? Explain everything that here. " +
      "We are always eager to listen from you.",
    "/graphic/icons/schemester512.png"
  );
  feedback.createInputs(
    ["Your email address"],
    ["To help or thank you directly ;)"],
    ["email"],
    [validType.email],
    null,
    ["email"]
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

let checkSessionValidation = (
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
              if (validAction == null) {
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
            snackBar(
              getLogInfo(code.auth.AUTH_REQ_FAILED, (error)),
              "Report"
            );
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
              if (validAction == null) {
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
            snackBar(
              getLogInfo(code.auth.AUTH_REQ_FAILED, (error)),
              "Report",
            );
          });
      }
      break;
    case client.student:{
      postJsonData(post.student.sessionValidate)
          .then((result) => {
            if (result.event == code.auth.SESSION_INVALID) {
              invalidAction();
            } else {
              if (validAction == null) {
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
            snackBar(
              getLogInfo(code.auth.AUTH_REQ_FAILED, (error)),
              "Report",
            );
          });
      }break;
    default: {
      if (validAction == null) {
        switch (clientType) {
          case client.admin:
            {
              validAction = (_) => {
                relocate(locate.admin.session, {
                  target: locate.admin.target.dashboard,
                });
              };
            }
            break;
          case client.teacher:
            {
              validAction = (_) => {
                relocate(locate.teacher.session, {
                  target: locate.teacher.target.dash,
                });
              };
            }
            break;
          case client.student:
            {
              validAction = (_) => {
                relocate(locate.student.session, {
                  target: locate.student.target.dash,
                });
              };
            }
            break;
        }
      }
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
  afterValidAction = _=>{},
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
    case validType.match:
      {
        error = "This one is different.";
        matcher = ifmatchField.getInput();
      }
      break;
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
    action:'logout',
  }).then((res) => {
    if (res.event == code.auth.LOGGED_OUT) {
      sessionStorage.clear();
      clearLocalData();
      return afterfinish();
    }
    snackBar("Failed to logout", "Try again", false, (_) => {
      finishSession(clientType,_=>{afterfinish()});
    });
    location.reload();
  }).catch(e=>{
    clog(e);
    snackBar("Failed to logout", "Try again", false, (_) => {
      finishSession(clientType,_=>{afterfinish()});
    });
    location.reload();
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
    localStorage.clear();
    theme.setTheme(t);
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
const showElement = (elements = Array, index = null, hideRest = true) => {
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
const hideElement = (elements = Array, index = null, showRest = true) => {
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
 * Controls visiblity of the given HTML element, as per the condition. (using hidden attribute of HTMLElement)
 * @param {HTMLElement} element The element whose visibility is to be toggled.
 * @param {Boolean} visible The boolean value to show or hide the given element. Defaults to true (shown).
 */
const visibilityOf = (element = new HTMLElement(), visible = true) =>{
  (element.hidden = visible ? false : true);
  (element.style.display = visible?constant.show:constant.hide);
}

const visibilityOfAll = (elements = [], visible = true, index = null) =>
  index != null
    ? visibilityOf(elements[index], visible)
    : elements.forEach((element, _) => {
      visibilityOf(element, visible);
    });
const hide = (element = new HTMLElement()) => visibilityOf(element, false);
const show = (element = new HTMLElement()) => visibilityOf(element, true);
const isVisible = (element = new HTMLElement()) =>
  element.style.display == constant.show;
const areVisible = (elements = [], index = null) =>
  index != null
    ? elements[index].style.display == constant.show
    : elements.some((element, _) => {
        return element.style.display == constant.show;
      });

const getDayName = (dIndex = Number) =>
  dIndex < constant.weekdays.length && dIndex >= 0
    ? constant.weekdays[dIndex]
    : null;
const getMonthName = (mIndex = Number) =>
  mIndex < constant.months.length && mIndex >= 0
    ? constant.months[mIndex]
    : null;

const getElement = (id) => document.getElementById(id);

/**
 * This function extends the ability of window.location.replace(), by allowing you to provide additional link data passed as query along with the link.
 * @param {String} path The path or link to be passed in replace() function of window.location
 * @param {JSON} data The data to be passed with the link as query. The data should be provided as JSON key:value pairs. E.g. {question:'How?',response:'somehow'}.
 */
const relocate = (path = String, data = null) => {
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

/**
 * This function extends the ability of window.location.replace(), by allowing you to provide additional link data passed as query along with the link.
 * Useful replacing parent location from an iframe source.
 * @param {String} path The path or link to be passed in replace() function of window.location
 * @param {JSON} data The data to be passed with the link as query. The data should be provided as JSON key:value pairs. E.g. {question:'How?',response:'somehow'}.
 */
const relocateParent = (path, data = null) => {
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
  window.parent.location.replace(path);
};

/**
 * @deprecated As of September 27, 2020 02:41 hours. See the new [postJsonData] method.
 * Sends post request using browser fetch API, with x-www-form-urlencoded type body, and receives response in JSON format.
 * @param {String} url The endpoint location of post request. (same-origin)
 * @param {JSON} data The data to be sent along with request, key value type.
 * @returns {Promise} response object as a promise.
 */
const postData = async (url = String, data = {}) => {
  const response = await fetch(url, {
    method: constant.post,
    mode: "same-origin",
    headers: { "Content-type": constant.fetchContentType },
    body: getRequestBody(data, true),
  });
  const res = await response.json();
  return await res.result;
};

/**
 * Sends post request using browser fetch API, with json type body, and receives response in JSON format.
 * @param {String} url The endpoint location of post request. (same-origin)
 * @param {JSON} data The data to be sent along with request, key value type.
 * @returns {Promise} response object as a promise.
 */
const postJsonData = async (url = String, data = {}) => {
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
  return await content.result;
};


/**
 * Sets location as per given params
 * @param {String} href The base url of location
 * @param {JSON} data The optional parameters to be attached with url, like in GET type requests.
 */
const refer = (href, data = null) => {
  href += data != null ? getRequestBody(data) : constant.nothing;
  window.location.href = href;
};

/**
 * Opens link in a new tab as per given params
 * @param {String} href The base url of location
 * @param {JSON} data The optional parameters to be attached with url, like in GET type requests.
 */
const referTab = (href, data = null) => {
  href += data != null ? getRequestBody(data) : constant.nothing;
  window.open(href);
};

/**
 * Sets parent location href as per given params. Useful in loading a url from an iframe source.
 * @param {String} href The base url of location
 * @param {JSON} data The optional parameters to be attached with url, like in GET type requests.
 */
const referParent = (href, data = null) => {
  href += data != null ? getRequestBody(data) : constant.nothing;
  window.parent.location.href = href;
};

/**
 * Opens a link in new tab as per given params. Useful in opening a new tab from an iframe source.
 * @param {String} href The base url of location
 * @param {JSON} data The optional parameters to be attached with url, like in GET type requests.
 */
const referParentTab = (href, data = null) => {
  href += data != null ? getRequestBody(data) : constant.nothing;
  window.parent.open(href);
};

/**
 * Creates a string of queries to be passed along with any form action type link, from given JSON type data.
 * @param data The given key:value pairs of data to be converted into url query.
 * @param {Boolean} isPost The optional parameter, if body is to be converted to send with a post request of content-type: x-www-form-urlencoded, set true. Defaults to false.
 * @return {String} The query in string from, ready to be concatenated with some action URL of form kind.
 */
const getRequestBody = (data = {}, isPost = false) => {
  let i = 0;
  let body = constant.nothing;
  for (var key in data) {
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


const mailTo = (to,subject = constant.nothing,body = constant.nothing,cc=constant.nothing,bcc=constant.nothing) => refer(`mailto:${to}`,{
  subject: subject,
  body: body,
  cc:cc,
  bcc:bcc,
});

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

const addNumberSuffixHTML = (number = Number) => {
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
        if (str.charAt(str.length - 2) == "1") return number + "<sup>th</sup>";
        return addNumberSuffixHTML(Number(str.charAt(str.length - 1)));
      } else {
        return number + "<sup>th</sup>";
      }
    }
  }
};

const addNumberSuffix = (number = Number) => {
  var str = String(number);
  switch (number) {
    case 1:
      return number + "st";
    case 2:
      return number + "nd";
    case 3:
      return number + "rd";
    default: {
      if (number > 9) {
        if (str.charAt(str.length - 2) == "1") return number + "th";
        return addNumberSuffixHTML(Number(str.charAt(str.length - 1)));
      } else {
        return number + "th";
      }
    }
  }
};

/**
 * Returns phrase readable form of date from standard Schemester form of date.
 * @param {String} dateTillMillis The full date in Schemester standard form: YYYYMMDDHHmmSSmmm
 * @return {String} Readable sentence like date.
 */
const getProperDate = (dateTillMillis) => {
  dateTillMillis = String(dateTillMillis);
  const year = dateTillMillis.substring(0, 4);
  const month = dateTillMillis.substring(4, 6);
  const date = dateTillMillis.substring(6, 8);
  const hour = dateTillMillis.substring(8, 10);
  const min = dateTillMillis.substring(10, 12);
  const sec = dateTillMillis.substring(12, 14);
  return `${getMonthName(
    month - 1
  )} ${date}, ${year} at ${hour}:${min} hours ${sec} seconds`;
};

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

const getInputField = (fieldID, captionID, inputID, errorID) =>
  `<fieldset class="fmt-row text-field" id="${fieldID}"> 
  <legend class="field-caption" id="${captionID}"></legend> 
  <input class="text-input" id="${inputID}">
  <span class="fmt-right error-caption" id="${errorID}"></span></fieldset>`;
const getDialogButton = (buttonClass, buttonID, label) =>
  `<button class="${buttonClass} fmt-right" id="${buttonID}">${label}</button>`;
const getDialogLoaderSmall = (loaderID) =>
  `<img class="fmt-spin-fast fmt-right" width="50" src="/graphic/blueLoader.svg" id="${loaderID}"/>`;
const editIcon=(size)=>`<img width="${size}" src="/graphic/elements/editicon.svg"/>`
