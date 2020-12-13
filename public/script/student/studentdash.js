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
        this.frameparent = getElement("frameparent");
        this.frame = getElement("frame");
        this.viewload = getElement('viewload');
        tabs = new Tabs();
        this.tabs = [tabs.today,tabs.fullweek,tabs.classroom,tabs.settings];
        this.tabloaders = [tabs.todayload,tabs.weekload,tabs.classload,tabs.settingload];
        this.tabicons = ['/graphic/elements/todayicon.svg','/graphic/elements/weekicon.svg','/graphic/elements/classicon.svg','/graphic/elements/settingicon.svg'];
        this.fragpath = [locate.student.target.fragment.today,locate.student.target.fragment.fullweek,locate.student.target.fragment.classroom,locate.student.target.fragment.settings]

        this.tabs.forEach((tab,t)=>{
            tab.onclick=_=>{
              appendClass(this.frameparent,"blur");
              this.showLoader(tab);
              sessionStorage.setItem(key.fragment,this.fragpath[t]);
              this.selectTab(tab);
              this.frame.src = locate.student.fragment + getRequestBody({fragment:this.fragpath[t],day:new Date().getDay()});
            }
        });
        this.tabs[this.fragpath.includes(this.frag)?this.fragpath.indexOf(this.frag):this.fragpath.includes(sessionStorage.getItem(key.fragment))?this.fragpath.indexOf(sessionStorage.getItem(key.fragment)):0].click();
        this.clearAllLoaders();
        this.frame.onload=_=>{
          this.hideLoader();
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
async function linkSender(onsuccess=_=>{},onsendclick=_=>{}){
    snackBar(`To reset your password, a link will be sent to your email address.`,'Send Link',true,_=>{
      onsendclick();
      postJsonData(post.student.manage,{
        type:"resetpassword",
        action:action.send,
      }).then((resp)=>{
        if(resp.event== code.mail.ERROR_MAIL_NOTSENT){
          return snackBar('An error occurred','Report');
        }
        onsuccess();
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
        new ThemeSwitch("darkmode");
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
            parent.location.reload();
          });
        };
        this.name = new Editable(
            "studentnameview",
            "studentnameeditor",
            new TextInput(
              "studentnamefield",
              false,
              "",
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
  theme.setNav(false);
  try{
      new StudentDash();
  }catch{
    backRoot('backroot',{client:client.student});
    new Pseudostudent()
  }
  if ('serviceWorker' in window.navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then((registration)=> {
            console.log('SW:1:', registration.scope);
        }).catch((err)=> {
            console.log('SW:0:', err);
      });
}
}