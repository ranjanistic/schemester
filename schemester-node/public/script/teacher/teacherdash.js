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
            replaceClass(this.today,"bottom-tab-section","bottom-tab-section-selected");
            replaceClass(this.fullweek,"bottom-tab-section","bottom-tab-section-selected",false);
            replaceClass(this.about,"bottom-tab-section","bottom-tab-section-selected",false);
            this.frame.src = locate.teacher.fragment + getRequestBody({fragment:locate.teacher.target.fragment.today})
        }
        this.fullweek.onclick =_=>{
            replaceClass(this.today,"bottom-tab-section","bottom-tab-section-selected",false);
            replaceClass(this.fullweek,"bottom-tab-section","bottom-tab-section-selected");
            replaceClass(this.about,"bottom-tab-section","bottom-tab-section-selected",false);
            this.frame.src = locate.teacher.fragment + getRequestBody({fragment:locate.teacher.target.fragment.fullweek})
        }
        this.about.onclick =_=>{
            replaceClass(this.today,"bottom-tab-section","bottom-tab-section-selected",false);
            replaceClass(this.fullweek,"bottom-tab-section","bottom-tab-section-selected",false);
            replaceClass(this.about,"bottom-tab-section","bottom-tab-section-selected");
            this.frame.src = locate.teacher.fragment + getRequestBody({fragment:locate.teacher.target.fragment.about})
        }
    }
}

window.onload=_=>window.app = new TeacherDash();