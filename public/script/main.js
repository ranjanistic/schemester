if (localStorage.getItem("theme")) {
  document.documentElement.setAttribute(
    "data-theme",
    localStorage.getItem("theme")
  );
}

const code = new Codes();
const client = new Client();
const value = new Constant();
const constant = new Constant();
const locate = new Locations();
const theme = new Theme();
const post = new Posts();
const colors = new Colors();
const validType = new InputType();
const actionType = new ViewType();
const bodyType = new ViewType();

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
    this.input.disabled = true;
  }
  enableInput() {
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
    clog("here");
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
  getInputValue(){
    return this.textInput.getInput();
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
    this.label.innerHTML = text;
  }
  onTurnChange(onAction = _=>{}, offAction = _=>{}) {
    this.switch.addEventListener(change, (_) => {
      if (this.switch.checked) {
        onAction();
      } else {
        offAction();
      }
    });
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
      }, text.length * 3 * 1000); //lengthwise timer.
    } else {
      setTimeout((_) => {
        new Snackbar().hide();
      }, text.length * (3 / 2) * 1000); //lengthwise timer for non action snackbar.
    }
    snack.displayType(isNormal);
  }
  snack.existence(text != constant.nothing && text != null);
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
  isValid(inputFieldIndex = Number) {
    return stringIsValid(
      this.getInputValue(inputFieldIndex),
      this.getInputType(inputFieldIndex)
    );
  }
  validate(inputFieldIndex = Number, validateAction = _=>{}) {
    this.inputField[inputFieldIndex].validate((_) => {
      validateAction();
    });
  }
  validateNow(inputFieldIndex = Number, validateAction = _=>{}) {
    this.inputField[inputFieldIndex].validateNow((_) => {
      validateAction();
    });
  }
  setDisplay(head, body = null, imgsrc  = null) {
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
      Array("Email address", "Password"),
      Array("youremail@example.com", "Your password"),
      Array("email", "password"),
      Array(validType.email, validType.password)
    );
    loginDialog.createActions(
      Array("Continue", "Cancel"),
      Array(actionType.neutral, actionType.positive)
    );
    if (sensitive) {
      loginDialog.setBackgroundColorType(bodyType.negative);
    }
    loginDialog.validate(0);
    loginDialog.validate(1);
    loginDialog.onButtonClick(
      Array(
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
              clog(response);
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
      )
    );
  }
  loginDialog.existence(isShowing);
};

const resetPasswordDialog = (clientType,isShowing = true) => {
  const resetDialog = new Dialog();
  resetDialog.setDisplay(
    "Reset password",
    "Create a new password for your account."
  );
  resetDialog.createInputs(
    Array("Create new password"),
    Array("A strong password"),
    Array("password"),
    Array(validType.password),
  );
  resetDialog.createActions(
    Array("Update password", "Cancel"),
    Array(actionType.positive, actionType.neutral)
  );

  resetDialog.validate(0);

  resetDialog.onButtonClick(
    Array(
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
            return snackBar(
              "Your password was changed.",
              "Done"
            );
          }
          resetDialog.loader(false);
          snackBar(response.event,'Report');
        })
      },
      () => {
        resetDialog.hide();
      }
    )
  );
  resetDialog.existence(isShowing);
};

const changeEmailBox = (clientType,isShowing = true) => {
  authenticateDialog(clientType,(_) => {
    const mailChange = new Dialog();
    mailChange.setDisplay(
      "Change Email Address",
      "Provide your the new email address. You'll be logged out after successful change, for verification purposes."
    );
    mailChange.createInputs(
      Array("New email address"),
      Array("newemail@example.com"),
      Array("email"),
      Array(validType.email)
    );
    mailChange.createActions(
      Array("Change Email ID", "Abort"),
      Array(actionType.negative, actionType.neutral)
    );
    mailChange.validate(0);
    mailChange.onButtonClick(
      Array(
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
              return location.reload();
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
      )
    );

    mailChange.existence(isShowing);
  });
};

const registrationDialog = (isShowing = true, email = null, uiid = null) => {
  loadingBox();
  receiveSessionData(
    (_) => {
      var confirmLogout = new Dialog();
      var data;
      getUserLocally().then((adata) => {
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
        confirmLogout.onButtonClick(
          Array(
            () => {
              confirmLogout.hide();
            },
            () => {
              confirmLogout.loader();
              finishSession((_) => {
                registrationDialog(true);
              });
            }
          )
        );
        confirmLogout.show();
      });
    },
    (_) => {
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
        Array(
          validType.name,
          validType.email,
          validType.password,
          validType.username
        ),
        Array(null, email, null, uiid),
        Array("name", "email", "new-password", "username"),
        Array(true, false, false, false),
        Array("words", "off", "off", "off")
      );

      regDial.validate(0, (_) => {
        regDial.getInput(1).focus();
      });
      regDial.validate(1, (_) => {
        regDial.getInput(2).focus();
      });
      regDial.validate(2, (_) => {
        regDial.getInput(3).focus();
      });
      regDial.validate(3);

      regDial.onButtonClick(
        Array(
          () => {
            if (
              !(
                stringIsValid(regDial.getInputValue(0), validType.name) &&
                stringIsValid(regDial.getInputValue(1), validType.email) &&
                stringIsValid(regDial.getInputValue(2), validType.password) &&
                stringIsValid(regDial.getInputValue(3), validType.username)
              )
            ) {
              regDial.validateNow(0, (_) => {
                regDial.getInput(1).focus();
              });
              regDial.validateNow(1, (_) => {
                regDial.getInput(2).focus();
              });
              regDial.validateNow(2, (_) => {
                regDial.getInput(3).focus();
              });
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
          },
          () => {
            regDial.hide();
          }
        )
      );
      regDial.existence(isShowing);
    }
  );
};

const showTeacherRegistration = (visible = true, email = null, uiid = null) => {
  const teachdialog = new Dialog();
  teachdialog.setDisplay(
    "Registration",
    "Provide your details, including the unique ID of your institute (UIID)."
  );
  teachdialog.createInputs(
    Array(
      "UIID",
      "Your email address",
      "Your name",
      "Create password"
    ),
    Array(
      "Your institution's unique ID",
      "youremail@example.domain",
      "Sunaina Kapoor, or something.",
      "A strong password."
    ),
    Array("text", "email", "text", "password"),
    Array(
      validType.nonempty,
      validType.email,
      validType.name,
      validType.password
    ),
    Array(uiid, email, null, null),
    Array(null,"email","name","newpassword")
  );

  teachdialog.validate(0, (_) => {
    teachdialog.getInput(1).focus();
  });
  teachdialog.validate(1, (_) => {
    teachdialog.getInput(2).focus();
  });
  teachdialog.validate(2, (_) => {
    teachdialog.getInput(3).focus();
  });
  teachdialog.validate(3);
  
  teachdialog.createActions(
    Array("Register as Teacher", "Abort"),
    Array(bodyType.positive, bodyType.neutral)
  );
  teachdialog.onButtonClick(
    Array(
      (_) => {
        if (
          !(
            teachdialog.isValid(0) &&
            teachdialog.isValid(1) &&
            teachdialog.isValid(2) &&
            teachdialog.isValid(3)
          )
        ) {
          clog("invalid");
          teachdialog.validateNow(0, (_) => {
            teachdialog.getInput(1).focus();
          });
          teachdialog.validateNow(1, (_) => {
            teachdialog.getInput(2).focus();
          });
          teachdialog.validateNow(2, (_) => {
            teachdialog.getInput(3).focus();
          });
          teachdialog.validateNow(3);
        } else {
          teachdialog.loader();
          clog("posting");
          postData(post.teacher.auth,{
            action:post.teacher.action.signup,
            pseudo:true,
            uiid: teachdialog.getInputValue(0),
            email: teachdialog.getInputValue(1),
            username: teachdialog.getInputValue(2),
            password: teachdialog.getInputValue(3),
          }).then((response) => {
              clog(response);
              switch (response.event) {
                case code.auth.ACCOUNT_CREATED:{
                  clog(response.user);
                  saveDataLocally(response.user);
                  relocate(locate.teacher.session,{
                    u:response.user.uid,
                    target:locate.teacher.target.dash
                  });
                }break;
                case code.auth.USER_EXIST:{
                  teachdialog.inputField[1].showError(
                    "Account already exists."
                  );
                  snackBar("Try signing in?", "Login", true, (_) => {
                    refer(locate.teacher.login, {
                      email: teachdialog.getInputValue(1),
                      uiid: teachdialog.getInputValue(0),
                    });
                  });
                }break;
                case code.inst.INSTITUTION_NOT_EXISTS:{
                  teachdialog.inputField[0].showError(
                    "No institution with this UIID found."
                  );
                }break;
                case code.auth.EMAIL_INVALID:{
                    teachdialog.inputField[1].showError("Invalid email address.");
                }break;
                case code.auth.PASSWORD_INVALID:{
                    //todo: check invalidity and show suggesstions
                    teachdialog.inputField[3].showError(
                      "Weak password, try something better."
                    );
                }break;
                case code.auth.NAME_INVALID:{
                  teachdialog.inputField[3].showError(
                    "This doesn't seem like a name."
                  );
                }
                  break;
                default: {
                  clog("in default");
                  teachdialog.hide();
                  snackBar(`${response.event}:${response.msg}`, "Report");
                }
              }
              teachdialog.loader(false);
            })
            .catch((e) => {
              snackBar(e, "Report");
              teachdialog.hide();
            });
        }
      },
      (_) => {
        teachdialog.hide();
      }
    )
  );
  teachdialog.existence(visible);
};

const showStudentRegistration = (visible = true, email = null, uiid = null,classname = null) => {
  const studialog = new Dialog();
  studialog.setDisplay(
    "Registration",
    "Provide your details, including the unique ID of your institute (UIID)."
  );
  studialog.createInputs(
    Array(
      "UIID",
      "Your class's name",
      "Your email address",
      "Your name",
      "Create password"
    ),
    Array(
      "Your institution's unique ID",
      "Type in the format of your institute.",
      "youremail@example.domain",
      "Sunaina Kapoor, or something.",
      "A strong password."
    ),
    Array("text", "text", "email", "text", "password"),
    Array(
      validType.nonempty,
      validType.nonempty,
      validType.email,
      validType.name,
      validType.password
    ),
    Array(uiid, classname, email, null, null)
  );

  studialog.validate(0, (_) => {
    studialog.getInput(1).focus();
  });
  studialog.validate(1, (_) => {
    studialog.getInput(2).focus();
  });
  studialog.validate(2, (_) => {
    studialog.getInput(3).focus();
  });
  studialog.validate(3);
  
  studialog.createActions(
    Array("Register as Student", "Abort"),
    Array(bodyType.positive, bodyType.neutral)
  );
  studialog.onButtonClick(
    Array(
      (_) => {
        if (!(studialog.allValid())) {
          studialog.validateNow(0, (_) => {
            studialog.getInput(1).focus();
          });
          studialog.validateNow(1, (_) => {
            studialog.getInput(2).focus();
          });
          studialog.validateNow(2, (_) => {
            studialog.getInput(3).focus();
          });
          studialog.validateNow(3, (_) => {
            studialog.getInput(4).focus();
          });
          studialog.validateNow(4);
        } else {
          studialog.loader();
          clog("posting");
          postJsonData(post.student.auth, {
            action:post.student.action.signup,
            pseudo:true,
            uiid: studialog.getInputValue(0),
            classname: studialog.getInputValue(1),
            email: studialog.getInputValue(2),
            username: studialog.getInputValue(3),
            password: studialog.getInputValue(4),
          })
            .then((response) => {
              clog(response);
              switch (response.event) {
                case code.auth.ACCOUNT_CREATED:{
                    clog(response.user);
                    saveDataLocally(response.user);
                    relocate(locate.student.session,{
                      u:response.user.uid,
                      target:locate.student.target.dash
                    });
                }break;
                case code.auth.CLASS_NOT_EXIST:{
                  studialog.inputField[1].showError(
                    "No such classroom found."
                  );
                }break;
                case code.auth.USER_EXIST:{
                    studialog.inputField[2].showError(
                      "Account already exists."
                    );
                    snackBar("Try signing in?", "Login", true, (_) => {
                      refer(locate.student.login, {
                        email: studialog.getInputValue(2),
                        uiid: studialog.getInputValue(0),
                      });
                    });
                  }
                  break;
                case code.inst.INSTITUTION_NOT_EXISTS:
                  {
                    studialog.inputField[0].showError(
                      "No institution with this UIID found."
                    );
                  }
                  break;
                case code.schedule.BATCH_NOT_FOUND:
                  {
                    studialog.inputField[1].showError(
                      "No such class. Don't use any special charecters."
                    );
                  }
                  break;
                case code.auth.EMAIL_INVALID:
                  {
                    studialog.inputField[2].showError("Invalid email address.");
                  }
                  break;
                case code.auth.PASSWORD_INVALID:
                  {
                    //todo: check invalidity and show suggesstions
                    studialog.inputField[4].showError(
                      "Weak password, try something better."
                    );
                  }
                  break;
                case code.auth.NAME_INVALID:
                  {
                    studialog.inputField[3].showError(
                      "This doesn't seem like a name."
                    );
                  }
                  break;
                default: {
                  clog("in default");
                  studialog.hide();
                  snackBar(`${response.event}:${response.msg}`, "Report");
                }
              }
              studialog.loader(false);
            })
            .catch((e) => {
              snackBar(e, "Report");
              studialog.hide();
            });
        }
      },
      (_) => {
        studialog.hide();
      }
    )
  );
  studialog.existence(visible);
};

const saveDataLocally = (data = {}) => {
  for (var key in data) {
    if (data.hasOwnProperty(key)) {
      localStorage.setItem(key, data[key]);
    }
  }
};

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

const getUserLocally = async () => {
  let data = {
    [constant.sessionID]: localStorage.getItem(constant.sessionID),
    [constant.sessionUID]: localStorage.getItem(constant.sessionUID),
    username: localStorage.getItem("username"),
    uiid: localStorage.getItem("uiid"),
    createdAt: localStorage.getItem("createdAt"),
  };
  clog("the data");
  clog(data);
  if (!hasAnyKeyNull(data)) {
    clog("here nonull key");
    clog(data);
    return data;
  } else {
    clog("locally esle post");
    postData(post.admin.sessionValidate, {
      getuser: true,
    })
      .then((response) => {
        clog("the response");
        clog(response);
        if (response.event == code.auth.SESSION_INVALID) {
          finishSession((_) => {
            relocate(locate.root);
          });
        } else {
          data = response;
          saveDataLocally(data);
        }
        return data;
      })
      .finally((data) => {
        return data;
      });
  }
};

const createAccount = (dialog, adminname, email, password, uiid) => {
  postData(post.admin.signup, {
    username: adminname,
    email: email,
    password: password,
    uiid: uiid,
  })
    .then((result) => {
      dialog.loader(false);
      switch (result.event) {
        case code.auth.ACCOUNT_CREATED:
          {
            clog(result.user);
            saveDataLocally(result.user);
            relocate(locate.admin.session, {
              target: locate.admin.target.register,
            });
          }
          break;
        case code.auth.USER_EXIST:
          {
            dialog.inputField[1].showError("Account already exists.");
            snackBar("Try signing in?", "Login", true, (_) => {
              refer(locate.admin.login, { email: email, uiid: uiid });
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
              "Weak password, try something better."
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
          dialog.hide();
          snackBar(`${result.event}:${result.msg}`, "Report");
        }
      }
    })
    .catch((error) => {
      clog(error);
      snackBar(error, "Report");
    });
};

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
  feedback.onChipClick(
    Array(
      (_) => {
        feedback.setBackgroundColorType();
      },
      (_) => {
        feedback.setBackgroundColorType(bodyType.negative);
      }
    )
  );

  feedback.largeTextField.input.value = defaultText;

  feedback.validate(0, (_) => {
    feedback.largeTextField.inputFocus();
  });
  feedback.largeTextField.validate();

  feedback.onButtonClick(
    Array(
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
    )
  );
  feedback.existence(isShowing);
};

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

let checkSessionValidation = (
  clientType = null,
  validAction = null,
  invalidAction = (_) => relocate(locate.homepage)
) => {
  clog(validAction);
  switch (clientType) {
    case client.admin:
      {
        postData(post.admin.sessionValidate)
          .then((result) => {
            if (result.event == code.auth.SESSION_INVALID) {
              invalidAction();
            } else {
              if (validAction == null) {
                clog("isnull");
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
            clog("error in admin validation");
            snackBar(
              getLogInfo(code.auth.AUTH_REQ_FAILED, jstr(error)),
              "Report"
            );
          });
      }
      break;
    case client.teacher:
      {
        postData(post.teacher.sessionValidate)
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
            clog("error in teacher validation");
            snackBar(
              getLogInfo(code.auth.AUTH_REQ_FAILED, jstr(error)),
              "Report",
              false
            );
          });
      }
      break;
    default: {
      clog("in target default");
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
        }
      }
      checkSessionValidation(client.admin, null, (_) => {
        checkSessionValidation(client.teacher, null, (_) => {
          invalidAction();
        });
      });
    }
  }
};

const receiveSessionData = (
  validAction = _=>{},
  invalidAction = _=>{}
) => {
  postData(post.admin.sessionValidate, {
    getuser: true,
  })
    .then((result) => {
      console.log(result);
      if (result.event == code.auth.SESSION_INVALID) {
        invalidAction();
      } else {
        if (result == getUserLocally()) {
          clog("match");
        } else {
          saveDataLocally(result);
        }
        validAction();
      }
    })
    .catch((error) => {
      clog("in catch sessionvalidation:" + error);
      clog(navigator.onLine);
      if (navigator.onLine) {
        postData(post.admin.sessionValidate).then((response) => {
          if (response.event == code.auth.SESSION_INVALID) {
            invalidAction();
          } else {
            validAction();
          }
        });
      } else {
        let data = getUserLocally();
        if (hasAnyKeyNull(data)) {
          clog("haskeynull");
          snackBar(
            "Couldn't connect to the network",
            "Try again",
            false,
            (_) => {
              receiveSessionData(
                (_) => {
                  validAction();
                },
                (_) => {
                  invalidAction();
                }
              );
            }
          );
        } else {
          clog("haskeynullnot");
          validAction();
        }
        clog("locally:" + jstr(data));
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
  afterfinish = () => {
    relocate(locate.root);
  }
) => {
  postData(post.admin.logout).then((res) => {
    if (res.event == code.auth.LOGGED_OUT) {
      sessionStorage.clear();
      afterfinish();
      clearLocalData();
    } else {
      snackBar("Failed to logout", "Try again", false, (_) => {
        finishSession();
      });
    }
  });
};

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

const setClass = (element = new HTMLElement(), classname) =>
  (element.className = classname);

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
 * Controls visiblity of the given HTML element, as per the condition.
 * @param {HTMLElement} element The element whose visibility is to be toggled.
 * @param {Boolean} visible The boolean value to show or hide the given element. Defaults to true (shown).
 */
const visibilityOf = (element = new HTMLElement(), visible = true) =>
  (element.style.display = visible ? constant.show : constant.hide);
const visibilityOfAll = (elements = Array(), visible = true, index = null) =>
  index != null
    ? visibilityOf(elements[index], visible)
    : elements.forEach((element, _) => {
        visibilityOf(element, visible);
      });
const hide = (element = new HTMLElement()) => visibilityOf(element, false);
const show = (element = new HTMLElement()) => visibilityOf(element, true);
const isVisible = (element = new HTMLElement()) =>
  element.style.display == constant.show;
const areVisible = (elements = Array(), index = null) =>
  index != null
    ? elements[index].style.display == constant.show
    : elements.some((element, _) => {
        return element.style.display == constant.show;
      });
/**
 * Checks if given string is valid, according to its type given as second parameter.
 * @param {String} value The string value to be checked for validity.
 * @param {String} type The type of string according to which it will be verified. E.g. email, password, nonempty. Defaults to nonempty.
 * @param {String} ifMatchValue This optional parameter becomes neccessary, when the given value is to be checked for equality. This parameter works as the second string, against which
 * the given value will be checked. In this case, the type parameter should be 'matching'.
 * @note The type parameter can be passed using the InputType class object available in Schemester.
 */
const stringIsValid = (
  value = String,
  type = validType.nonempty,
  ifMatchValue = String
) => {
  switch (type) {
    case validType.name:
      return stringIsValid(String(value).trim());
    case validType.email:
      return constant.emailRegex.test(String(value).toLowerCase());
    case validType.phone:
      return !isNaN(value) && stringIsValid(String(value).trim());
    //todo: case inputType.password: return constant.passRegex.test(String(passValue));
    case validType.username:
      return stringIsValid(String(value).trim());
    case validType.match:
      return value === ifMatchValue;
    case validType.weekday:
      return constant.weekdayscasual.includes(value.toLowerCase())
    default:
      return value != null && value != constant.nothing;

  }
};

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
 * @param data The data to be passed with the link as query. The data should be provided as JSON key:value pairs. E.g. {question:'How?',response:'somehow'}.
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

const postData = async (url = String, data = {}) => {
  const response = await fetch(url, {
    method: constant.post,
    mode: "same-origin",
    headers: { "Content-type": constant.fetchContentType },
    body: getRequestBody(data, true),
  });
  let res = await response.json();
  return await res.result;
};

/**
 * Sends post request using browser fetch API, and receives response in JSON format.
 * @param {String} url The endpoint location of post request. (same-origin)
 * @param {JSON} data The data to be sent along with request, key value type.
 * @returns {Promise} response object as a promise.
 */
const postJsonData = async (url = String, data = {}) => {
  const response = await fetch(url, {
    method: constant.post,
    mode: "same-origin",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  const content = await response.json();
  return await content.result;
};

const refer = (href, data = null) => {
  href += data != null ? getRequestBody(data) : constant.nothing;
  window.location.href = href;
};

const referParent = (href, data = null) => {
  href += data != null ? getRequestBody(data) : constant.nothing;
  window.parent.location.href = href;
};

/**
 * Creates a string of queries to be passed along with any form action type link, from given JSON type data.
 * @param data The given key:value pairs of data to be converted into url query.
 * @param {Boolean} isPost The optional parameter, if data is to be converted to send with a post request of content-type: x-www-form-urlencoded, set true. Defaults to false.
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

const sendEmail = async (to, subject, body, cc, bcc) => {
  //todo: send emails from here.
  return code.mail.MAIL_SENT;
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

const setTimeGreeting = (element = new HTMLElement()) => {
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
};

/**
 * Returns phrase readable form of date from standard Schemester form of date.
 * @param {String} dateTillMillis The full date in Schemester standard form: YYYYMMDDHHmmSSmmm
 * @return {String} Readable sentence like date.
 */
const getProperDate = (dateTillMillis = String) => {
  const year = dateTillMillis.substring(0, 4);
  const month = dateTillMillis.substring(4, 6);
  const date = dateTillMillis.substring(6, 8);
  const hour = dateTillMillis.substring(8, 10);
  const min = dateTillMillis.substring(10, 12);
  const sec = dateTillMillis.substring(12, 14);
  clog(dateTillMillis.substring(6, 8));
  return `${getMonthName(
    month - 1
  )} ${date}, ${year} at ${hour}:${min} hours ${sec} seconds`;
};

const getLogInfo = (code, message) => `type:${code}\ninfo:${message}\n`;

const getRadioChip = (labelID, label, radioID) =>
  `<label class="radio-container" id="${labelID}">${label}<input type="radio" name="dialogChip" id="${radioID}"><span class="checkmark"></span></label>`;
const getCheckBox = (labelID, label, checkboxID) =>
  `<label class="check-container" id="${labelID}">${label}<input type="checkbox" id="${checkboxID}"><span class="tickmark-positive"></span></label>`;
const getInputField = (fieldID, captionID, inputID, errorID) =>
  `<fieldset class="fmt-row text-field" id="${fieldID}"> 
  <legend class="field-caption" id="${captionID}"></legend> 
  <input class="text-input" id="${inputID}">
  <span class="fmt-right error-caption" id="${errorID}"></span></fieldset>`;
const getDialogButton = (buttonClass, buttonID, label) =>
  `<button class="${buttonClass} fmt-right" id="${buttonID}">${label}</button>`;
const getDialogLoaderSmall = (loaderID) =>
  `<img class="fmt-spin-fast fmt-right" width="50" src="/graphic/blueLoader.svg" id="${loaderID}"/>`;
const jstr = (obj) => JSON.stringify(obj);
