//For teacher session view with bottom navigation tabs.

class TeacherDash{
    constructor(){
        this.frag = getElement("frag").innerHTML;

        this.frame = getElement("frame");
        this.viewload = getElement('viewload');
        this.today = getElement("todaytab");
        this.todayload = getElement("todayload");
        this.fullweek = getElement("fulltab");
        this.weekload = getElement("weekload");
        this.classroom = getElement("classtab")
        this.classload = getElement("classload");
        this.settings = getElement("settingstab");
        this.settingload = getElement("aboutload");
        this.today.onclick =_=>{
            this.showLoader(this.todayload);
            sessionStorage.setItem('fragment',locate.teacher.target.fragment.today);
            replaceClass(this.today,"bottom-tab-section","bottom-tab-section-selected");
            replaceClass(this.fullweek,"bottom-tab-section","bottom-tab-section-selected",false);
            replaceClass(this.classroom,"bottom-tab-section","bottom-tab-section-selected",false);
            replaceClass(this.settings,"bottom-tab-section","bottom-tab-section-selected",false);
            this.frame.src = locate.teacher.fragment + getRequestBody({fragment:locate.teacher.target.fragment.today});
            this.frame.onload=_=>{
                this.hideLoader(this.todayload)
            }
        }
        this.fullweek.onclick =_=>{
            this.showLoader(this.weekload);
            sessionStorage.setItem('fragment',locate.teacher.target.fragment.fullweek);
            replaceClass(this.today,"bottom-tab-section","bottom-tab-section-selected",false);
            replaceClass(this.fullweek,"bottom-tab-section","bottom-tab-section-selected");
            replaceClass(this.classroom,"bottom-tab-section","bottom-tab-section-selected",false);
            replaceClass(this.settings,"bottom-tab-section","bottom-tab-section-selected",false);
            this.frame.src = locate.teacher.fragment + getRequestBody({fragment:locate.teacher.target.fragment.fullweek});
            this.frame.onload=_=>{
                this.hideLoader(this.weekload)
            }
        }
        this.classroom.onclick =_=>{
            this.showLoader(this.classload);
            sessionStorage.setItem('fragment',locate.teacher.target.fragment.classroom);
            replaceClass(this.today,"bottom-tab-section","bottom-tab-section-selected",false);
            replaceClass(this.fullweek,"bottom-tab-section","bottom-tab-section-selected",false);
            replaceClass(this.classroom,"bottom-tab-section","bottom-tab-section-selected");
            replaceClass(this.settings,"bottom-tab-section","bottom-tab-section-selected",false);
            this.frame.src = locate.teacher.fragment + getRequestBody({fragment:locate.teacher.target.fragment.classroom});
            this.frame.onload=_=>{
                this.hideLoader(this.classload)
            }
        }
        this.settings.onclick =_=>{
            this.showLoader(this.settingload);
            sessionStorage.setItem('fragment',locate.teacher.target.fragment.settings);
            replaceClass(this.today,"bottom-tab-section","bottom-tab-section-selected",false);
            replaceClass(this.fullweek,"bottom-tab-section","bottom-tab-section-selected",false);
            replaceClass(this.classroom,"bottom-tab-section","bottom-tab-section-selected",false);
            replaceClass(this.settings,"bottom-tab-section","bottom-tab-section-selected");
            this.frame.src = locate.teacher.fragment + getRequestBody({fragment:locate.teacher.target.fragment.settings});
            this.frame.onload=_=>{
                this.hideLoader(this.settingload)
            }
        }

        this.setview(this.frag);
        this.clearAllLoaders();
    }
    showAllLoaders(){
        [this.todayload,this.weekload,this.classload,this.settingload].forEach((load)=>{
            this.showLoader(load);
        });
    }
    clearAllLoaders(){
        [this.todayload,this.weekload,this.classload,this.settingload].forEach((load)=>{
            this.hideLoader(load);
        });
    }
    hideLoader(tabload = this.todayload){
        let iconpath;
        switch(tabload){
            case this.weekload:iconpath = '/graphic/leftArrow.svg';break;
            case this.classload:iconpath = '/graphic/leftArrow.svg';break;
            case this.settingload:iconpath = '/graphic/leftArrow.svg';break;
            default:iconpath = '/graphic/leftArrow.svg';break;
        }
        tabload.src = iconpath;
        tabload.classList.remove('fmt-spin-fast');
    }
    showLoader(tabload = this.todayload){
        tabload.src = '/graphic/blueloader.svg';
        tabload.classList.add('fmt-spin-fast');
    }
    setview(frag){
        const frags = [locate.teacher.target.fragment.today,locate.teacher.target.fragment.fullweek,locate.teacher.target.fragment.classroom,locate.teacher.target.fragment.settings];
        switch(frag){
            case locate.teacher.target.fragment.fullweek:{
                this.fullweek.click();
            }break;
            case locate.teacher.target.fragment.settings:{
                this.settings.click();
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
async function linkSender(){
    snackBar(`To reset your password, a link will be sent to your email address.`,'Send Link',true,_=>{
      postJsonData(post.teacher.manage,{
        type:"resetpassword",
        action:"send",
      }).then((resp)=>{
        if(resp.event != code.mail.MAIL_SENT){
          snackBar('An error occurred','Report');
          return false;
        }
        snackBar("A link for password reset has been sent to your email address.",'OK');
        return true;
      })
    })
}

function snackbar(
    text = String(),
    actionText = 'OK',
    isNormal = actionType.positive,
    action = () => {
      new Snackbar().hide();
    }
  ){
    snackBar(
        text,
        actionText,
        isNormal,
        _=>{action()}
    )
}
class Pseudostudent{
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
                        location.reload();
                    }
                });
            });
        }
    }
}

let fragment;

window.onload=_=>{
    clog("dahsloaded")
    //  try{
        fragment = new TeacherDash();
    // }catch{
    //     fragment = new Pseudostudent()
    // }

}