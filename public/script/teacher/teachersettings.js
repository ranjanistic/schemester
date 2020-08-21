class TeacherSettings{
    constructor(){
        this.back = getElement("back");
        this.back.onclick=_=>{
            relocate(locate.teacher.session,{
                target:locate.teacher.target.dash,
                fragment:locate.teacher.target.fragment.about
            });
        }
    }
}
window.onload =_=>new TeacherSettings();