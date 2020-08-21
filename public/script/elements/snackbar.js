/**
 * For short bottom notifications (or Snackbars). 
 * Some constants and functions are defined separately in main.js, codes.js, and styles in main.css and fmt.css, thus,
 * might not work without them.
 * 
 * Usage: Set the ids of elements as defined in this class, and place the snackbar division at bottom, just before closing body tag,
 * in the document where the snackbar needs to be shown.
 */

class Snackbar {
    id = "snackBar";
    textId = "snackText";
    buttonId = "snackButton";
    constructor(){}
    getSnackbarHTML(){
        return `<div id="snackBar" class="snack-positive fmt-animate-bottom">
        <span class="fmt-left fmt-padding" id="snackText"></span>
        <button class="fmt-right neutral-button" id="snackButton"></button>
        </div>`
    }
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
  