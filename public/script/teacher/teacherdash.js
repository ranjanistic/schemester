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
    [
        tabs.today,
        tabs.fullweek,
        tabs.settings
    ].forEach((tab)=>{
        replaceClass(tab,'third','fourth');
    });
    setTimeout(() => {
        show(tabs.classroom);
    }, 340);
}
function clickTab(index){
  [tabs.today,tabs.fullweek,tabs.classroom,tabs.settings][index].click();
}
class TeacherDash{
    constructor(){
      this.frag = getElement("frag").innerHTML;
      this.frameparent = getElement("frameparent");
      this.frame = getElement("frame");
      this.viewload = getElement('viewload');
      
      tabs = new Tabs();
      this.tabs = [tabs.today,tabs.fullweek,tabs.classroom,tabs.settings];
      this.tabloaders = [tabs.todayload,tabs.weekload,tabs.classload,tabs.settingload];
      this.tabicons = ['/graphic/elements/todayicon.svg','/graphic/elements/weekicon.svg','/graphic/elements/classicon.svg','/graphic/elements/settingicon.svg'];
      this.fragpath = [locate.teacher.target.fragment.today,locate.teacher.target.fragment.fullweek,locate.teacher.target.fragment.classroom,locate.teacher.target.fragment.settings];
      this.tabs.forEach((tab,t)=>{
        tab.onclick=_=>{
          appendClass(this.frameparent,"blur");
          this.showLoader(tab);
          sessionStorage.setItem(key.fragment,this.fragpath[t]);
          this.selectTab(tab);
          this.frame.src = locate.teacher.fragment + getRequestBody({fragment:this.fragpath[t],day:new Date().getDay()});
        }
      });
      visibilityOf(tabs.classroom,localStorage.getItem('hideclassroom'))
      localStorage.getItem('hideclassroom')?hideClassroom():showClassroom();
      this.tabs[this.fragpath.includes(this.frag)?this.fragpath.indexOf(this.frag):this.fragpath.includes(sessionStorage.getItem(key.fragment))?this.fragpath.indexOf(sessionStorage.getItem(key.fragment)):0].click();
      this.clearAllLoaders();
      this.frame.onload=_=>{
        this.hideLoader()
        this.frameparent.classList.remove("blur");
      }
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
    hideLoader(){
      this.tabloaders.forEach((tl,l)=>{
        tl.src = this.tabicons[l]
        tl.classList.remove('fmt-spin-fast');
      })
    }
    showLoader(tab){
        this.tabloaders[this.tabs.indexOf(tab)].src = '/graphic/blueLoader.svg';
        this.tabloaders[this.tabs.indexOf(tab)].classList.add('fmt-spin-fast');
    }
}
async function linkSender(onsuccess=()=>{},onsendclick=_=>{}){
    snackBar(`To reset your password, a link will be sent to your email address.`,'Send Link',true,_=>{
      onsendclick();
      postJsonData(post.teacher.manage,{
        type:"resetpassword",
        action:action.send,
      }).then((resp)=>{
        if(resp.event != code.mail.MAIL_SENT){
          snackBar('An error occurred','Report');
          return false;
        }
        onsuccess();
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
        new ThemeSwitch("darkmode");
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
        this.logout = getElement("logout");
        this.logout.onclick = (_) => {
            finishSession(client.teacher,(_) => {
              parent.location.reload();
            });
        };
        this.name = new Editable(
            "teachernameview",
            "teachernameeditor",
            new TextInput(
              "teachernamefield",
              false,
              "",
              validType.name
            ),
            "editteachername",
            "teachername",
            "saveteachername",
            "cancelteachername"
          );
          this.name.onSave((_) => {
            this.name.validateInputNow();
            if (!this.name.isValidInput()) return;
            this.name.disableInput();
            if (this.name.getInputValue().trim() == this.name.displayText()) {
              return this.name.clickCancel();
            }
            postJsonData(post.teacher.self, {
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
            changeEmailBox(client.teacher);
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
                  linkSender();
                };
              }
            }, 1000);
          } else {
            this.forgotpass.onclick = (_) => {
              linkSender();
            };
          }
      
    }
}

window.onload=_=>{
  theme.setNav(false);
  try{
      new TeacherDash();
  }catch{
    backRoot('backroot',{
      client:client.teacher
    })
      new Pseudoteacher()
  }
  handlePageAlerts();
  registerServiceWorker();
}
function getelement(id){
    return getElement(id);
}