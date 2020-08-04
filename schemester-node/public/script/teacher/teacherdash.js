//For teacher session view with bottom navigation tabs.

class TeacherDash{
    constructor(){
        this.frame = getElement("frame");
        this.viewload = getElement('viewload');

        this.today = getElement("todaytab");
        this.fullweek = getElement("fulltab");
        this.about = getElement("abouttab");
        this.frame.src = locate.teacher.fragment + getRequestBody({fragment:locate.teacher.target.fragment.today});
        this.today.onclick = _=>{
            this.frame.src = locate.teacher.fragment + getRequestBody({fragment:locate.teacher.target.fragment.today})
        }
        this.fullweek.onclick =_=>{
            this.frame.src = locate.teacher.fragment + getRequestBody({fragment:locate.teacher.target.fragment.fullweek})
        }
        this.about.onclick =_=>{
            this.frame.src = locate.teacher.fragment + getRequestBody({fragment:locate.teacher.target.fragment.about})
        }
    }
}

window.onload=_=>window.app = new TeacherDash();