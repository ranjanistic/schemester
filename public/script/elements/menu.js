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