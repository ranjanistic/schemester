class TeacherDash{
    constructor(){
        this.frame = getElement("frame");
        this.viewload = getElement('viewload');
        this.today = getElement("todaytab");
        this.fullweek = getElement("fulltab");
        this.today.onclick = _=>{
            this.frame.src = '/teacher/today';
        }
        this.fullweek.onclick =_=>{
            this.frame.src = '/home';
        }
        
        // this.logout.onclick =_=>{
        //     showLoader();
        //     finishSession(_=>{
        //         relocate(locate.teacher.login);
        //     });
        // }
    }
    load(){
        this.viewload
    }
}
window.onload=_=>window.app = new TeacherDash();