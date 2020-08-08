class TeacherAbout{
    constructor(){
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
        this.dark = getElement("dark");
        this.light = getElement("light");
        if(theme.isDark()){
            this.dark.click()
        } else {
            this.light.click()
        }
        this.light.onclick =_=>{
            theme.setLight()
        }
        this.dark.onclick =_=>{
            theme.setDark()
        }
    }
}
window.onload =_=>new TeacherAbout();