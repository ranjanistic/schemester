//For teacher session view with bottom navigation tabs.
class Tabs{
    constructor(){
        this.todayload = getElement("todayload");
        this.today = getElement("todaytab");
        this.fullweek = getElement("fulltab");
        this.classroom = getElement("classtab");
        this.settings = getElement("settingstab");
        this.weekload = getElement("weekload");
        this.classload = getElement("classload");
        this.settingload = getElement("aboutload");       
    }
}

let tabs;

function hideClassroom(loadanother=false){
    localStorage.setItem('hideclassroom',true);
    hide(tabs.classroom);
    [ tabs.today,
      tabs.fullweek,
      tabs.settings
    ].forEach((tab)=>{
      replaceClass(tab,'fourth','third');
    });
    if(loadanother) tabs.today.click();
}

function showClassroom(){
    localStorage.removeItem('hideclassroom');
    [ tabs.today,
        tabs.fullweek,
        tabs.settings
    ].forEach((tab)=>{
        replaceClass(tab,'third','fourth');
    });
    setTimeout(() => {
        show(tabs.classroom);
    }, 300);
}
class TeacherDash{
    constructor(){
        this.frag = getElement("frag").innerHTML;
        this.frame = getElement("frame");
        this.viewload = getElement('viewload');
        
        tabs = new Tabs();
        tabs.today.onclick =_=>{
            this.showLoader(tabs.todayload);
            sessionStorage.setItem('fragment',locate.teacher.target.fragment.today);
            replaceClass(tabs.today,"bottom-tab-section","bottom-tab-section-selected");
            replaceClass(tabs.fullweek,"bottom-tab-section","bottom-tab-section-selected",false);
            replaceClass(tabs.classroom,"bottom-tab-section","bottom-tab-section-selected",false);
            replaceClass(tabs.settings,"bottom-tab-section","bottom-tab-section-selected",false);
            this.frame.src = locate.teacher.fragment + getRequestBody({fragment:locate.teacher.target.fragment.today});
            this.frame.onload=_=>{
                this.hideLoader(tabs.todayload)
            }
        }
        tabs.fullweek.onclick =_=>{
            this.showLoader(tabs.weekload);
            sessionStorage.setItem('fragment',locate.teacher.target.fragment.fullweek);
            replaceClass(tabs.today,"bottom-tab-section","bottom-tab-section-selected",false);
            replaceClass(tabs.fullweek,"bottom-tab-section","bottom-tab-section-selected");
            replaceClass(tabs.classroom,"bottom-tab-section","bottom-tab-section-selected",false);
            replaceClass(tabs.settings,"bottom-tab-section","bottom-tab-section-selected",false);
            this.frame.src = locate.teacher.fragment + getRequestBody({fragment:locate.teacher.target.fragment.fullweek});
            this.frame.onload=_=>{
                this.hideLoader(tabs.weekload)
            }
        }
        if(localStorage.getItem('hideclassroom')){
            hide(tabs.classroom);
            [tabs.today,tabs.fullweek,tabs.settings].forEach((tab)=>{
                replaceClass(tab,'fourth','third');
            });
        }
        tabs.classroom.onclick =_=>{
            this.showLoader(tabs.classload);
            sessionStorage.setItem('fragment',locate.teacher.target.fragment.classroom);
            replaceClass(tabs.today,"bottom-tab-section","bottom-tab-section-selected",false);
            replaceClass(tabs.fullweek,"bottom-tab-section","bottom-tab-section-selected",false);
            replaceClass(tabs.classroom,"bottom-tab-section","bottom-tab-section-selected");
            replaceClass(tabs.settings,"bottom-tab-section","bottom-tab-section-selected",false);
            this.frame.src = locate.teacher.fragment + getRequestBody({fragment:locate.teacher.target.fragment.classroom});
            this.frame.onload=_=>{
                this.hideLoader(tabs.classload)
            }
        }
        tabs.settings.onclick =_=>{
            this.showLoader(tabs.settingload);
            sessionStorage.setItem('fragment',locate.teacher.target.fragment.settings);
            replaceClass(tabs.today,"bottom-tab-section","bottom-tab-section-selected",false);
            replaceClass(tabs.fullweek,"bottom-tab-section","bottom-tab-section-selected",false);
            replaceClass(tabs.classroom,"bottom-tab-section","bottom-tab-section-selected",false);
            replaceClass(tabs.settings,"bottom-tab-section","bottom-tab-section-selected");
            this.frame.src = locate.teacher.fragment + getRequestBody({fragment:locate.teacher.target.fragment.settings});
            this.frame.onload=_=>{
                this.hideLoader(tabs.settingload);
            }
        }

        this.setview(this.frag);
        this.clearAllLoaders();
    }
    showAllLoaders(){
        [tabs.todayload,tabs.weekload,tabs.classload,tabs.settingload].forEach((load)=>{
            this.showLoader(load);
        });
    }
    clearAllLoaders(){
        [tabs.todayload,tabs.weekload,tabs.classload,tabs.settingload].forEach((load)=>{
            this.hideLoader(load);
        });
    }
    hideLoader(tabload = tabs.todayload){
        let iconpath;
        switch(tabload){
            case tabs.weekload:iconpath = '/graphic/elements/weekicon.svg';break;
            case tabs.classload:iconpath = '/graphic/elements/classicon.svg';break;
            case tabs.settingload:iconpath = '/graphic/elements/settingicon.svg';break;
            default:iconpath = '/graphic/elements/todayicon.svg';break;
        }
        tabload.src = iconpath;
        tabload.onload=_=>{
            tabload.classList.remove('fmt-spin-fast');
        }
    }
    showLoader(tabload = tabs.todayload){
        tabload.src = '/graphic/blueLoader.svg';
        tabload.onload=_=>{
            tabload.classList.add('fmt-spin-fast');
        }
    }
    setview(frag){
        const frags = [locate.teacher.target.fragment.today,locate.teacher.target.fragment.fullweek,locate.teacher.target.fragment.classroom,locate.teacher.target.fragment.settings];
        switch(frag){
            case locate.teacher.target.fragment.fullweek:{
                tabs.fullweek.click();
            }break;
            case locate.teacher.target.fragment.settings:{
                tabs.settings.click();
            }break;
            case locate.teacher.target.fragment.classroom:{
                tabs.classroom.click();
            }break;
            case locate.teacher.target.fragment.today:{
                tabs.today.click();
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
class Pseudoteacher{
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

window.onload=_=>{
    clog("dahsloaded");
     try{
        new TeacherDash();
    }catch{
        new Pseudoteacher()
    }

}
function getelement(id){
    return getElement(id);
}