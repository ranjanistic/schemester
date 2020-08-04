/**
 * For checkboxes.
 * Some constants and functions are defined separately in main.js, codes.js, and styles in main.css and fmt.css, thus,
 * might not work without them.
 */

class Checkbox {
    constructor(){}
    getCheckBox(viewID,labelID, label, checkboxID,checkTypeID){
        return `<label class="check-container" id="${viewID}">
            <span id="${labelID}">${label}<span>
            <input type="checkbox" id="${checkboxID}">
            <span class="tickmark-positive" id="${checkTypeID}"></span>
        </label>`;
    }
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
    onCheckChange(checked = (_) => {}, unchecked = (_) => {}) {
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