class TeacherAbout{
    constructor(){
        return;
        this.logout = getElement("logout");
        this.logout.onclick =_=>{
            showLoader();
            finishSession(_=>{
                relocate(locate.teacher.login);
            });
        }
    }
}
window.onload =_=>new TeacherAbout();