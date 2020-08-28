//For student session view with bottom navigation tabs.

class StudentDash{
    constructor(){
        this.frag = getElement("frag").innerHTML;

        this.frame = getElement("frame");
        this.viewload = getElement('viewload');
        this.today = getElement("todaytab");
        this.fullweek = getElement("fulltab");
        this.classroom = getElement("classtab")
        this.settings = getElement("settingstab");
        
        this.today.onclick = _=>{
            speechSynthesis.speak(new SpeechSynthesisUtterance("Today"));
            sessionStorage.setItem('fragment',locate.student.target.fragment.today);
            replaceClass(this.today,"bottom-tab-section","bottom-tab-section-selected");
            replaceClass(this.fullweek,"bottom-tab-section","bottom-tab-section-selected",false);
            replaceClass(this.classroom,"bottom-tab-section","bottom-tab-section-selected",false);
            replaceClass(this.settings,"bottom-tab-section","bottom-tab-section-selected",false);
            this.frame.src = locate.student.fragment + getRequestBody({fragment:locate.student.target.fragment.today})
        }
        this.fullweek.onclick =_=>{
            speechSynthesis.speak(new SpeechSynthesisUtterance("Fullweek"));
            sessionStorage.setItem('fragment',locate.student.target.fragment.fullweek);
            replaceClass(this.today,"bottom-tab-section","bottom-tab-section-selected",false);
            replaceClass(this.fullweek,"bottom-tab-section","bottom-tab-section-selected");
            replaceClass(this.classroom,"bottom-tab-section","bottom-tab-section-selected",false);
            replaceClass(this.settings,"bottom-tab-section","bottom-tab-section-selected",false);
            this.frame.src = locate.student.fragment + getRequestBody({fragment:locate.student.target.fragment.fullweek})
        }
        this.classroom.onclick =_=>{
            speechSynthesis.speak(new SpeechSynthesisUtterance("Classroom"));
            sessionStorage.setItem('fragment',locate.student.target.fragment.classroom);
            replaceClass(this.today,"bottom-tab-section","bottom-tab-section-selected",false);
            replaceClass(this.fullweek,"bottom-tab-section","bottom-tab-section-selected",false);
            replaceClass(this.classroom,"bottom-tab-section","bottom-tab-section-selected");
            replaceClass(this.settings,"bottom-tab-section","bottom-tab-section-selected",false);
            this.frame.src = locate.student.fragment + getRequestBody({fragment:locate.student.target.fragment.classroom})
        }
        this.settings.onclick =_=>{
            speechSynthesis.speak(new SpeechSynthesisUtterance("settings"));
            sessionStorage.setItem('fragment',locate.student.target.fragment.settings);
            replaceClass(this.today,"bottom-tab-section","bottom-tab-section-selected",false);
            replaceClass(this.fullweek,"bottom-tab-section","bottom-tab-section-selected",false);
            replaceClass(this.classroom,"bottom-tab-section","bottom-tab-section-selected",false);
            replaceClass(this.settings,"bottom-tab-section","bottom-tab-section-selected");
            this.frame.src = locate.student.fragment + getRequestBody({fragment:locate.student.target.fragment.settings})
        }

        this.setview(this.frag);
    }
    setview(frag){
        const frags = [locate.student.target.fragment.today,locate.student.target.fragment.fullweek,locate.student.target.fragment.classroom,locate.student.target.fragment.settings];
        switch(frag){
            case locate.student.target.fragment.fullweek:{
                this.fullweek.click();
            }break;
            case locate.student.target.fragment.settings:{
                this.settings.click();
            }break;
            case locate.student.target.fragment.classroom:{
                this.classroom.click();
            }break;
            case locate.student.target.fragment.today:{
                this.today.click();
            }break;
            default:{
                this.setview(frags.includes(sessionStorage.getItem('fragment'))?sessionStorage.getItem('fragment'):locate.student.target.fragment.today)
            }
        }
    }
}

class Pseudostudent{
    constructor(){
        this.darkmode = new Switch('darkmode');
        this.darkmode.turn(theme.isDark());
        this.darkmode.onTurnChange(_=>{theme.setDark()},_=>{theme.setLight()});
        this.deleteRequest = getElement("deleterequest");
        this.deleteRequest.onclick=_=>{
            snackBar('Deleting the request will also remove your account on Schemester.','Delete Request',false,_=>{
                postJsonData(post.student.self,{
                    target:"account",
                    action:code.action.ACCOUNT_DELETE
                }).then(response=>{
                    if(response.event == code.OK){
                        location.reload();
                    }
                });
            });
        }
    }
}

window.onload=_=>{
    //  try{
        new StudentDash();
    // }catch{
    //     new Pseudostudent()
    // }

}