//For teacher session view with bottom navigation tabs.

class TeacherDash{
    constructor(){
        this.frag = getElement("frag").innerHTML;

        this.frame = getElement("frame");
        this.viewload = getElement('viewload');
        this.today = getElement("todaytab");
        this.fullweek = getElement("fulltab");
        this.classroom = getElement("classtab")
        this.about = getElement("abouttab");
        
        this.today.onclick = _=>{
            speechSynthesis.speak(new SpeechSynthesisUtterance("Today"));
            sessionStorage.setItem('fragment',locate.teacher.target.fragment.today);
            replaceClass(this.today,"bottom-tab-section","bottom-tab-section-selected");
            replaceClass(this.fullweek,"bottom-tab-section","bottom-tab-section-selected",false);
            replaceClass(this.classroom,"bottom-tab-section","bottom-tab-section-selected",false);
            replaceClass(this.about,"bottom-tab-section","bottom-tab-section-selected",false);
            this.frame.src = locate.teacher.fragment + getRequestBody({fragment:locate.teacher.target.fragment.today})
        }
        this.fullweek.onclick =_=>{
            speechSynthesis.speak(new SpeechSynthesisUtterance("Fullweek"));
            sessionStorage.setItem('fragment',locate.teacher.target.fragment.fullweek);
            replaceClass(this.today,"bottom-tab-section","bottom-tab-section-selected",false);
            replaceClass(this.fullweek,"bottom-tab-section","bottom-tab-section-selected");
            replaceClass(this.classroom,"bottom-tab-section","bottom-tab-section-selected",false);
            replaceClass(this.about,"bottom-tab-section","bottom-tab-section-selected",false);
            this.frame.src = locate.teacher.fragment + getRequestBody({fragment:locate.teacher.target.fragment.fullweek})
        }
        this.classroom.onclick =_=>{
            speechSynthesis.speak(new SpeechSynthesisUtterance("Classroom"));
            sessionStorage.setItem('fragment',locate.teacher.target.fragment.classroom);
            replaceClass(this.today,"bottom-tab-section","bottom-tab-section-selected",false);
            replaceClass(this.fullweek,"bottom-tab-section","bottom-tab-section-selected",false);
            replaceClass(this.classroom,"bottom-tab-section","bottom-tab-section-selected");
            replaceClass(this.about,"bottom-tab-section","bottom-tab-section-selected",false);
            this.frame.src = locate.teacher.fragment + getRequestBody({fragment:locate.teacher.target.fragment.classroom})
        }
        this.about.onclick =_=>{
            speechSynthesis.speak(new SpeechSynthesisUtterance("About"));
            sessionStorage.setItem('fragment',locate.teacher.target.fragment.about);
            replaceClass(this.today,"bottom-tab-section","bottom-tab-section-selected",false);
            replaceClass(this.fullweek,"bottom-tab-section","bottom-tab-section-selected",false);
            replaceClass(this.classroom,"bottom-tab-section","bottom-tab-section-selected",false);
            replaceClass(this.about,"bottom-tab-section","bottom-tab-section-selected");
            this.frame.src = locate.teacher.fragment + getRequestBody({fragment:locate.teacher.target.fragment.about})
        }

        this.setview(this.frag);
    }
    setview(frag){
        const frags = [locate.teacher.target.fragment.today,locate.teacher.target.fragment.fullweek,locate.teacher.target.fragment.classroom,locate.teacher.target.fragment.about];
        switch(frag){
            case locate.teacher.target.fragment.fullweek:{
                this.fullweek.click();
            }break;
            case locate.teacher.target.fragment.about:{
                this.about.click();
            }break;
            case locate.teacher.target.fragment.classroom:{
                this.classroom.click();
            }break;
            case locate.teacher.target.fragment.today:{
                this.today.click();
            }break;
            default:{
                this.setview(frags.includes(sessionStorage.getItem('fragment'))?sessionStorage.getItem('fragment'):locate.teacher.target.fragment.today)
            }
        }
    }
}

class PseudoTeacher{
    constructor(){
        this.darkmode = new Switch('darkmode');
        this.darkmode.turn(theme.isDark());
        this.darkmode.onTurnChange(_=>{theme.setDark()},_=>{theme.setLight()});
        this.deleteRequest = getElement("deleterequest");
        this.deleteRequest.onclick=_=>{
            snackBar('Deleting the request will also remove your account on Schemester.','Delete Request',false,_=>{
                postJsonData(post.teacher.self,{
                    target:"account",
                    action:code.action.ACCOUNT_DELETE
                }).then(response=>{
                    if(response.event == code.OK){

                    }
                })
            });
        }
    }
}

window.onload=_=>{
    try{
        new TeacherDash();
    }catch{
        new PseudoTeacher()
    }

}