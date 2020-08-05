class TeacherAbout{
    constructor(){
        this.logout = getElement("logout");
        this.logout.onclick =_=>{
            finishSession(_=>{
                relocateParent(locate.teacher.login,{email:localStorage.getItem('id')});
            });
        }
    }
}
window.onload =_=>new TeacherAbout();