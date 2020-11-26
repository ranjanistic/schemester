/**
 * This class is for dynamic assignment of input boxes and their properties.
 * Some constants and functions are defined separately in main.js, codes.js, and styles in main.css and fmt.css, thus,
 * might not work without them.
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

const getFieldSet=(id)=>`<fieldset id=${id}></fieldset>`;
