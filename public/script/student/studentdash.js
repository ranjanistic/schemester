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
async function linkSender(){
    clog("showing");
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
            relocateParent(locate.teacher.login, {
            email: localStorage.getItem("id"),
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
          if (Number(sessionStorage.getItem("linkin")) > 0) {
            opacityOf(this.forgotpass, 0.5);
            let time = Number(sessionStorage.getItem("linkin"));
            const timer = setInterval(() => {
              time--;
              sessionStorage.setItem("linkin", time);
              this.forgotpass.innerHTML = `Try again in ${time} seconds.`;
              if (Number(sessionStorage.getItem("linkin")) == 0) {
                clearInterval(timer);
                this.forgotpass.innerHTML = "Forgot password";
                opacityOf(this.forgotpass, 1);
                this.forgotpass.onclick = (_) => {
                  this.sendForgotLink()
                };
              }
            }, 1000);
          } else {
            this.forgotpass.onclick = (_) => {
              this.sendForgotLink()
            };
          }
        }
        sendForgotLink(){
          linkSender().then(done=>{
            if(done){
              opacityOf(this.forgotPassword, 0.4);
              this.forgotPassword.onclick = (_) => {};
              let time = 120;
              sessionStorage.setItem("linkin", time);
              const timer = setInterval(() => {
                time--;
                sessionStorage.setItem("linkin", time);
                this.forgotPassword.innerHTML = `Try again in ${time} seconds.`;
                if (Number(sessionStorage.getItem("linkin")) == 0) {
                  clearInterval(timer);
                  this.forgotPassword.innerHTML = "Forgot password";
                  opacityOf(this.forgotPassword, 1);
                  this.forgotPassword.onclick = (_) => {this.linkSender()};
                }
              }, 1000);
            }
          })
        }
}

window.onload=_=>{
    clog("dahsloaded")
     try{
        new StudentDash();
    }catch{
        new Pseudostudent()
    }

}