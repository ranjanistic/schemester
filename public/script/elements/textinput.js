/**
 * This class is for dynamic assignment of input boxes and their properties.
 * Some constants and functions are defined separately in main.js, codes.js, and styles in main.css and fmt.css, thus,
 * might not work without them.
 */

class TextInput {
    constructor(){}
    getInputField(fieldID, captionID, inputID, errorID){
        return `<fieldset class="fmt-row text-field" id="${fieldID}"> 
            <legend class="field-caption" id="${captionID}"></legend> 
            <input class="text-input" id="${inputID}">
            <span class="fmt-right error-caption" id="${errorID}"></span></fieldset>`;
    }
    getActiveInputField(fieldID, captionID, inputID, errorID){
        return `<fieldset class="fmt-row text-field-active" id="${fieldID}"> 
            <legend class="field-caption" id="${captionID}"></legend> 
            <input class="text-input" id="${inputID}">
            <span class="fmt-right error-caption" id="${errorID}"></span></fieldset>`;
    }
    getWaningInputField(fieldID, captionID, inputID, errorID){
        return `<fieldset class="fmt-row text-field-warning" id="${fieldID}"> 
            <legend class="field-caption" id="${captionID}"></legend> 
            <input class="text-input" id="${inputID}">
            <span class="fmt-right error-caption" id="${errorID}"></span></fieldset>`;
    }
    getErrorInputField(fieldID, captionID, inputID, errorID){
        return `<fieldset class="fmt-row text-field-error" id="${fieldID}"> 
            <legend class="field-caption" id="${captionID}"></legend>
            <input class="text-input" id="${inputID}">
            <span class="fmt-right error-caption" id="${errorID}"></span></fieldset>`;
    }
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
    validateNow(validAction = (_) => {}, ifmatchfield = null) {
      validateTextField(this, this.type, validAction, ifmatchfield);
    }
    validate(validAction = (_) => {}, ifmatchfield = null) {
      this.onTextDefocus((_) => {
        validateTextField(this, this.type, validAction, ifmatchfield);
      });
    }
    isValid(matchfieldvalue = null) {
      return stringIsValid(this.getInput(), this.type, matchfieldvalue);
    }
    strictValidate(validAction = (_) => {}, ifmatchfield = null) {
      this.onTextInput((_) => {
        validateTextField(this, this.type, validAction, ifmatchfield);
      });
    }
    onTextInput(action = (_) => {}) {
      if (this.input) {
        this.input.oninput = () => {
          action();
        };
      }
    }
    onTextDefocus(action) {
      this.input.onchange = () => {
        action();
      };
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
      return this.input.value;
    }
    setInput(value) {
      this.input.value = value;
    }

}
  