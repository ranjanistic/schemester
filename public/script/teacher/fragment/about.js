class TeacherAbout{
    constructor(){
        this.darkmode = new Switch('darkmode');
        this.darkmode.turn(theme.isDark());
        this.darkmode.onTurnChange(_=>{theme.setDark()},_=>{theme.setLight()});
        getElement("themetab").onclick=_=>{
            theme.switch();
            this.darkmode.change();
        }
        this.settings = getElement("moreSettings");
        this.settings.onclick =_=>{
            referParent(locate.teacher.session,{u:localStorage.getItem('uid'),target:locate.teacher.target.settings});
        }
        this.logout = getElement("logout");
        this.logout.onclick =_=>{
            finishSession(_=>{
                relocateParent(locate.teacher.login,{email:localStorage.getItem('id')});
            });
        }
        this.name = new Editable("teachernameview","teachernameeditor",
            new TextInput("teachernamefield","teachernameinput","teachernameerror",validType.name),
            "editteachername","teachername","saveteachername","cancelteachername"
        );
        this.name.onSave(_=>{
            this.name.validateInputNow();
            if(!this.name.isValidInput()) return;
            this.name.disableInput();
            if(this.name.getInputValue() == this.name.displayText()){
              return this.name.clickCancel();
            }
            postJsonData(post.teacher.self,{
              target:"account",
              action:code.action.CHANGE_NAME,
              newname:this.name.getInputValue()
            }).then(resp=>{
              if(resp.event == code.OK){
                this.name.setDisplayText(this.name.getInputValue());
                this.name.display();
              } else {
                snackBar('Unable to save');
              }
            })
        });
    }
}
window.onload =_=>new TeacherAbout();