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
            replaceClass(this.today,"bottom-tab-section","bottom-tab-section-selected");
            replaceClass(this.fullweek,"bottom-tab-section","bottom-tab-section-selected",false);
            replaceClass(this.classroom,"bottom-tab-section","bottom-tab-section-selected",false);
            replaceClass(this.about,"bottom-tab-section","bottom-tab-section-selected",false);
            this.frame.src = locate.teacher.fragment + getRequestBody({fragment:locate.teacher.target.fragment.today})
        }
        this.fullweek.onclick =_=>{
            replaceClass(this.today,"bottom-tab-section","bottom-tab-section-selected",false);
            replaceClass(this.fullweek,"bottom-tab-section","bottom-tab-section-selected");
            replaceClass(this.classroom,"bottom-tab-section","bottom-tab-section-selected",false);
            replaceClass(this.about,"bottom-tab-section","bottom-tab-section-selected",false);
            this.frame.src = locate.teacher.fragment + getRequestBody({fragment:locate.teacher.target.fragment.fullweek})
        }
        this.classroom.onclick =_=>{
            replaceClass(this.today,"bottom-tab-section","bottom-tab-section-selected",false);
            replaceClass(this.fullweek,"bottom-tab-section","bottom-tab-section-selected",false);
            replaceClass(this.classroom,"bottom-tab-section","bottom-tab-section-selected");
            replaceClass(this.about,"bottom-tab-section","bottom-tab-section-selected",false);
            this.frame.src = locate.teacher.fragment + getRequestBody({fragment:locate.teacher.target.fragment.classroom})
        }
        this.about.onclick =_=>{
            replaceClass(this.today,"bottom-tab-section","bottom-tab-section-selected",false);
            replaceClass(this.fullweek,"bottom-tab-section","bottom-tab-section-selected",false);
            replaceClass(this.classroom,"bottom-tab-section","bottom-tab-section-selected",false);
            replaceClass(this.about,"bottom-tab-section","bottom-tab-section-selected");
            this.frame.src = locate.teacher.fragment + getRequestBody({fragment:locate.teacher.target.fragment.about})
        }

        switch(this.frag){
            case locate.teacher.target.fragment.fullweek:{
                this.fullweek.click();
            }break;
            case locate.teacher.target.fragment.about:{
                this.about.click();
            }break;
            default:{
                this.today.click();
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