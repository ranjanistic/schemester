class Switch{
    constructor(switchID,switchTextID,switchViewID,switchContainerID,viewType = bodyType.positive){
      this.switch = getElement(switchID);
      this.switch.innerHTML = 
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
  