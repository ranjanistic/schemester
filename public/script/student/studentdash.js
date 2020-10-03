//For student session view with bottom navigation tabs.

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

function clickTab(index){
  [tabs.today,tabs.fullweek,tabs.classroom,tabs.settings][index].click();
}

class StudentDash{
    constructor(){
        this.frag = getElement("frag").innerHTML;
        this.frame = getElement("frame");
        this.viewload = getElement('viewload');
        tabs = new Tabs();
        this.tabs = [tabs.today,tabs.fullweek,tabs.classroom,tabs.settings];
        this.tabloaders = [tabs.todayload,tabs.weekload,tabs.classload,tabs.settingload];
        this.tabicons = ['/graphic/elements/todayicon.svg','/graphic/elements/weekicon.svg','/graphic/elements/classicon.svg','/graphic/elements/settingicon.svg'];
        this.fragpath = [locate.student.target.fragment.today,locate.student.target.fragment.fullweek,locate.student.target.fragment.classroom,locate.student.target.fragment.settings]

        this.tabs.forEach((tab,t)=>{
            tab.onclick=_=>{
                this.showLoader(tab);
                sessionStorage.setItem('fragment',this.fragpath[t]);
                this.selectTab(tab);
                this.frame.src = locate.student.fragment + getRequestBody({fragment:this.fragpath[t],day:new Date().getDay()});
                this.frame.onload=_=>{
                    this.hideLoader(tab)
                }
            }
        });
        this.tabs[this.fragpath.includes(this.frag)?this.fragpath.indexOf(this.frag):this.fragpath.includes(sessionStorage.getItem('fragment'))?this.fragpath.indexOf(sessionStorage.getItem('fragment')):0].click();
        this.clearAllLoaders();
    }
    selectTab(tab){
        this.tabs.forEach((Tab)=>{
            replaceClass(Tab,"bottom-tab-section","bottom-tab-section-selected",tab == Tab);
        });
    }
    showAllLoaders(){
        this.tabs.forEach((tab)=>{
            this.showLoader(tab);
        });
    }
    clearAllLoaders(){
        this.tabs.forEach((tab)=>{
            this.hideLoader(tab);
        });
    }
    hideLoader(tab){
        this.tabloaders[this.tabs.indexOf(tab)].src = this.tabicons[this.tabs.indexOf(tab)];
        this.tabloaders[this.tabs.indexOf(tab)].classList.remove('fmt-spin-fast');
    }
    showLoader(tab){
        this.tabloaders[this.tabs.indexOf(tab)].src = '/graphic/blueLoader.svg';
        this.tabloaders[this.tabs.indexOf(tab)].classList.add('fmt-spin-fast');
    }
}
async function linkSender(onsuccess=_=>{}){
    snackBar(`To reset your password, a link will be sent to your email address.`,'Send Link',true,_=>{
      postJsonData(post.student.manage,{
        type:"resetpassword",
        action:"send",
      }).then((resp)=>{
        if(resp.event== code.mail.ERROR_MAIL_NOTSENT){
          return snackBar('An error occurred','Report');
        }
        snackBar(
          "If your email address was correct, you'll receive an email from us in a few moments.",'Hide'
        );
        onsuccess();
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
        this.logout = getElement("logout");
        this.logout.onclick = (_) => {
          finishSession(client.student,(_) => {
            const email  = localStorage.getItem(key.id)
            relocateParent(locate.teacher.login, {
              email: email,
            });
          });
        };
        this.name = new Editable(
            "studentnameview",
            "studentnameeditor",
            new TextInput(
              "studentnamefield",
              "studentnameinput",
              "studentnameerror",
              validType.name
            ),
            "editstudentname",
            "studentname",
            "savestudentname",
            "cancelstudentname"
          );
          this.name.onSave((_) => {
            this.name.validateInputNow();
            if (!this.name.isValidInput()) return;
            this.name.disableInput();
            if (this.name.getInputValue().trim() == this.name.displayText()) {
              return this.name.clickCancel();
            }
            postJsonData(post.student.self, {
              target: "account",
              action: code.action.CHANGE_NAME,
              newname: this.name.getInputValue().trim(),
            }).then((resp) => {
              if (resp.event == code.OK) {
                this.name.setDisplayText(this.name.getInputValue());
                this.name.display();
              } else {
                parent.snackbar("Unable to save");
              }
            });
          });
          this.resetmail = getElement("resetemail");
          this.forgotpass = getElement("forgotpass");
          this.resetmail.onclick = (_) => {
            changeEmailBox(client.student);
          };
          resumeElementRestriction(this.forgotpass,'studentforgot',_=>{
            this.forgotpass.onclick = (_) => {
              this.sendForgotLink()
            };
          })
        }
        sendForgotLink(){
          this.forgotpass.onclick = (_) => {};
          linkSender(_=>{
            restrictElement(this.forgotpass,120,'studentforgot',_=>{
              this.forgotpass.onclick = (_) => {this.sendForgotLink()};
            });
          });
        }
}

window.onload=_=>{
     try{
        new StudentDash();
    }catch{
        new Pseudostudent()
    }

}