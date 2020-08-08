//admin management default script

class Management {
  constructor() {
    this.sectionreq = getElement("section").innerHTML;
    switch(this.sectionreq){//for section to be displayed
        case locate.admin.section.institute:this.displayIndex = 1;break;
        case locate.admin.section.schedule:this.displayIndex = 2;break;
        case locate.admin.section.users:this.displayIndex = 3;break;
        case locate.admin.section.security:this.displayIndex = 4;break;
        case locate.admin.section.about:this.displayIndex = 5;break;
      default:this.displayIndex = 0;break;
    }
    clog(this.displayIndex);
    
    this.tabs = Array(
      getElement("adminTab"),
      getElement("institutionTab"),
      getElement("scheduleTab"),
      getElement("usersTab"),
      getElement("securityTab"),
      getElement("aboutTab")
    );
    setClassNames(this.tabs[this.displayIndex], "leftTabButtonSelected");
    this.chips = Array(
      getElement("madminTab"),
      getElement("minstitutionTab"),
      getElement("mscheduleTab"),
      getElement("musersTab"),
      getElement("msecurityTab"),
      getElement("maboutTab")
    );
    this.chips[this.displayIndex].click();
    this.boxes = Array(
      getElement("accountSettingsBox"),
      getElement("institutionSettingsBox"),
      getElement("scheduleSettingsBox"),
      getElement("usersSettingsBox"),
      getElement("securitySettingsBox"),
      getElement("aboutSettingsBox")
    );
    showElement(this.boxes, this.displayIndex);

    this.back = getElement("backFromSettings");
    this.contactDevs = getElement("contactDevelopers");
    this.logout = getElement("logoutAdmin");

    this.admin = new Admin();
    this.inst = new Institution();
    this.schedule = new Schedule();
    this.security = new Security();
    this.users = new Users();
    for (var i = 0; i < this.tabs.length; i++) {
      this.tabs[i].addEventListener(
        click,
        (_) => {
          this.handleTabClicks(
            event,
            this.tabs,
            this.boxes,
            "leftTabButtonSelected",
            "leftTabButton"
          );
        },
        false
      );
      this.chips[i].addEventListener(
        click,
        (_) => {
          this.handleTabClicks(event, this.chips, this.boxes);
        },
        false
      );
    }
    this.contactDevs.addEventListener(click, feedBackBox, false);
    this.back.addEventListener(click, this.undoAndReturn, false);
    this.logout.addEventListener(
      click,
      (_) => {
        showLoader();
        finishSession((_) => {
          relocate(locate.admin.login, { target: locate.admin.target.manage });
        });
      },
      false
    );
  }
  handleTabClicks = (event, clickables, showables, showClass, hideClass) => {
    var e = event.currentTarget;
    for (var k = 0; k < clickables.length; k++) {
      var condition = e == clickables[k];
      visibilityOf(showables[k], condition);
      if (showClass != null && hideClass != null) {
        setClassNames(clickables[k], showClass, hideClass, condition);
      }
    }
  };
  undoAndReturn = (_) => {
    showLoader();
    relocate(locate.admin.session, {
      u: localStorage.getItem(constant.sessionUID),
      target: locate.admin.target.dashboard,
    });
  };

}

class Admin {
  constructor() {
    this.name = getElement("adminName");
    this.email = getElement("adminEmailAddress");
    this.phone = getElement("adminPhoneNumber");
    this.creationTime = getElement("adminCreationTime");
  }
  setDetails(name, email, phone, creationTime) {
    this.name.textContent = name;
    this.email.textContent = email;
    this.phone.textContent = phone;
    this.creationTime.textContent = creationTime;
  }
  getName() {
    return this.name.textContent;
  }
  getEmail() {
    return this.email.textContent;
  }
  getPhone() {
    return this.phone.textContent;
  }
  getCreationTime() {
    return this.creationTime.textContent;
  }
}

class Institution {
  constructor() {
    this.name = getElement("instituteName");
    this.uiid = getElement("uiid");
    this.subscriptionTill = getElement("subscriptionTill");
  }
  setDetails(
    name = null,
    uiid = null,
    puiid = null,
    type = null,
    subscriptionTill = null
  ) {
    if (name != null) {
      this.name.textContent = name;
    }
    if (uiid != null) {
      this.uiid.textContent = uiid;
    }
    if (subscriptionTill != null) {
      this.subscriptionTill.textContent = subscriptionTill;
    }
  }
  getName() {
    return this.name.textContent;
  }
  getUIID() {
    return this.uiid.textContent;
  }
  getSubsciptionTill() {
    return this.subscriptionTill.textContent;
  }
}
class Schedule {
  constructor() {
    this.periodDuration = getElement("periodDuration");
    this.weekStartDay = getElement("weekStartDay");
    this.scheduleStartTime = getElement("scheduleStartTime");
    this.scheduleEndTime = getElement("scheduleEndTime");
    this.breakStartTime = getElement("breakStartTime");
    this.breakDuration = getElement("breakDuration");
    this.workDays = getElement("workdays");
    this.totalPeriods = getElement("totalPeriods");
  }
  setDetails(
    periodDuration,
    weekStartDay,
    scheduleStartTime,
    scheduleEndTime,
    breakStartTime,
    breakDuration,
    totalWorkDays,
    totalPeriodsInDay
  ) {
    this.periodDuration.textContent = periodDuration;
    this.weekStartDay.textContent = weekStartDay;
    this.scheduleStartTime.textContent = scheduleStartTime;
    this.scheduleEndTime.textContent = scheduleEndTime;
    this.breakStartTime.textContent = breakStartTime;
    this.breakDuration.textContent = breakDuration;
    this.workDays.textContent = totalWorkDays;
    this.totalPeriods.textContent = totalPeriodsInDay;
  }
}

class Security {
  constructor() {
    this.resetPass = getElement("resetPasswordButton");
    this.resetMail = getElement("resetMailButton");
    this.lastLogin = getElement("lastLoginTime");
    this.deleteAccount = getElement("deleteAdminAccount");
    this.resetPass.addEventListener(click, resetPasswordDialog, false);
    this.resetMail.addEventListener(click, changeEmailBox, false);
    this.deleteAccount.addEventListener(click, adminloginDialog, false);
  }
  setButtonText(resetMail, resetPass) {
    this.resetMail.textContent = resetMail;
    this.resetPass.textContent = resetPass;
  }
  getLastLogin() {
    return this.lastLogin.textContent;
  }
}
class Users {
  constructor() {
    this.invite = getElement("inviteUsers");
    this.invite.addEventListener(
      click,
      (_) => {
        this.linkGenerator(client.teacher);
      },
      false
    );

    class Teacher{
      constructor(){
        this.listview = getElement("teacherList");
        this.search = getElement("teacherSearch");
        this.load(false);
        this.search.oninput =_=>{
          if(this.search.value){
            this.load();
            postJsonData(post.admin.manage,{
              type:'search',
              target:client.teacher,
              q:this.search.value
            }).then(response=>{
              if(response.event== 'OK'){
                this.load(false,false);
                response.teachers.forEach((teacher,index)=>{
                  this.appendList(this.getSlate(teacher.username,teacher.teacherID));
                  getElement(`view${teacher.teacherID}`).onclick=_=>{
                    clog(teacher.teacherID);
                    refer(locate.admin.session,{
                      target:'viewschedule',
                      client:client.teacher,
                      teacherID:teacher.teacherID
                    });
                  }
                })
              }
            })
          }else {
            this.load(false);  
          }
        }
      }
      getSlate(name,email){
        return `<div class="fmt-row container" style="margin:4px 0px">
        <div class="fmt-col fmt-twothird">
            <span class="group-text positive">${name}</span><br/>
            <span class="group-text questrial">${email}</span>
        </div>
        <div class="fmt-col fmt-third">
            <button class="positive-button fmt-right"id="view${email}">View</button>
        </div>
        </div>`
      }
      load(show = true,noview = true){
        if(show){
          this.listview.innerHTML = this.getLoaderView();
        } else {
          if(noview){
            this.listview.innerHTML = this.getDefaultView();
          } else {
            this.listview.innerHTML = "";
          }
        }
      }
      appendList(slate){
        let last = this.listview.innerHTML;
        if(last == this.getDefaultView()||last == this.getLoaderView()){
          this.listview.innerHTML = slate
        } else {
          this.listview.innerHTML = last + slate
        }
      }
      getLoaderView(){
        return `<div class="fmt-center" id="tlistLoader">
        <img class="fmt-spin-fast" width="50" src="/graphic/blueLoader.svg"/>
        </div>`;
      }
      getDefaultView(){
        return '<div class="fmt-center">Start Typing...<div>';
      }
      clearList(){
        this.listview.innerHTML = "Start typing";
      }
    }
    this.teacher = new Teacher();
    class Classes{
      constructor(){
        this.listview = getElement("classList");
        this.search = getElement("classSearch");
        this.load(false);
        this.search.oninput =_=>{
          if(this.search.value){
            this.load();
            postJsonData(post.admin.manage,{
              type:'search',
              q:this.search.value
            }).then(response=>{
              if(response.event== 'OK'){
                this.load(false,false);
                response.classes.forEach((Class,index)=>{
                  this.appendList(this.getSlate(Class.classname,Class.teachercount));
                  getElement(`view${teacher.teacherID}`).onclick=_=>{
                    refer(locate.admin.session,{
                      target:'viewschedule',
                      client:client.student,
                      classname:Class.classname
                    });
                  }
                })
              }
            })
          }else {
            this.load(false);  
          }
        }
      }
      getSlate(classname,teachercount){
        return `<div class="fmt-row container" style="margin:4px 0px">
        <div class="fmt-col fmt-twothird">
            <span class="group-text positive">${classname}</span><br/>
            <span class="group-text questrial">Taken by ${teachercount} teachers</span>
        </div>
        <div class="fmt-col fmt-third">
            <button class="positive-button fmt-right"id="view${classname}">View</button>
        </div>
        </div>`
      }
      load(show = true,noview = true){
        if(show){
          this.listview.innerHTML = this.getLoaderView();
        } else {
          if(noview){
            this.listview.innerHTML = this.getDefaultView();
          }
        }
      }
      appendList(slate){
        let last = this.listview.innerHTML;
        if(last == this.getDefaultView()||last == this.getLoaderView()){
          this.listview.innerHTML = slate
        } else {
          this.listview.innerHTML = last + slate
        }
      }
      getLoaderView(){
        return `<div class="fmt-center" id="clistLoader">
        <img class="fmt-spin-fast" width="50" src="/graphic/blueLoader.svg"/>
        </div>`;
      }
      getDefaultView(){
        return '<div class="fmt-center">Start Typing...<div>';
      }
      clearList(){
        this.listview.innerHTML = "Start typing";
      }
    }
    this.classes = new Classes();
  }
  linkGenerator = (target) => {
    clog("link generator");
    loadingBox(
      true,
      "Generating Link",
      `A link is being created for your to share with ${target}s of ${localStorage.getItem(
        "uiid"
      )} institute`
    );
    postData(post.admin.manage, {
      type: "invitation",
      action: "create",
      target: target,
    })
      .then((response) => {
        clog("link generate response");
        clog(response);
        if (
          response.event == code.invite.LINK_EXISTS ||
          response.event == code.invite.LINK_CREATED
        ) {
          clog("link generated box");
          let linkdialog = new Dialog();
          linkdialog.setDisplay(
            "Invitation Link",
            `<center><a href="${response.link}">${response.link}</a>
            <br/>This Link will automatically expire on <b>${getProperDate(
              String(response.exp)
            )}</b>.
          </center>`
          );
          linkdialog.createActions(
            Array("Disable Link", "Copy", "Done"),
            Array(actionType.negative, actionType.positive, actionType.neutral)
          );

          linkdialog.onButtonClick(
            Array(
              (_) => {
                this.revokeLink(target);
              },
              (_) => {
                navigator.clipboard
                  .writeText(response.link)
                  .then((_) => {
                    snackBar("Link copied to clipboard.");
                  })
                  .catch((err) => {
                    snackBar(
                      "Failed to copy, please do it manually.",
                      null,
                      false
                    );
                  });
              },
              (_) => {
                linkdialog.hide();
              }
            )
          );
          linkdialog.show();
        }
        switch (response.event) {
          case code.invite.LINK_EXISTS:{
              snackBar("This link already exists and can be shared.");
            }
            break;
          case code.invite.LINK_CREATED:{
              snackBar("Share this with teachers of your institution.");
            }
            break;
          case code.invite.LINK_CREATION_FAILED: {
            snackBar(`Unable to generate link:${response.msg}`, "Report");
          }
          default: {
            snackBar(`Error:${response.event}:${response.msg}`, "Report");
          }
        }
      })
      .catch((error) => {
        clog(error);
        snackBar(error);
      });
  };

  revokeLink(target) {
    clog("revoke link");
    postData("/admin/manage", {
      type: "invitation",
      action: "disable",
      target: target,
    })
      .then((response) => {
        clog("revoke link response");
        clog(response);
        if (response.event == code.invite.LINK_DISABLED) {
          clog("link disabled");
          snackBar("All links are inactive now.");
          let nolinkdialog = new Dialog();
          nolinkdialog.setDisplay(
            "Generate Link",
            `Create a link to share with ${target}s of ${localStorage.getItem(
              "uiid"
            )} institute, 
          so that they can access and take part in schedule management.`
          );
          nolinkdialog.createActions(
            Array("Create Link", "Abort"),
            Array(actionType.positive, actionType.negative)
          );
          nolinkdialog.onButtonClick(
            Array(
              (_) => {
                nolinkdialog.hide();
                this.linkGenerator(target);
              },
              (_) => {
                nolinkdialog.hide();
              }
            )
          );
          nolinkdialog.show();
        } else {
          clog("disabled:false");
          snackBar(`Link couldn't be disabled.`, "Try again", false, (_) => {
            this.revokeLink(target);
          });
        }
      })
      .catch((error) => {
        clog(error);
        snackBar(error);
      });
  }
}

window.onload = (_) => (window.app = new Management());
