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

const getDialogDiv = (id="dialogView")=>`<div id="${id}"></div>`