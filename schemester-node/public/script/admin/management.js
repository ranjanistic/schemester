//admin management default script

class Management {
  constructor() {
    this.displayIndex = 0;
    this.tabs = Array(
      getElement("adminTab"),
      getElement("institutionTab"),
      getElement("scheduleTab"),
      getElement("usersTab"),
      getElement("securityTab"),
      getElement("aboutTab")
    );
    setClassName(this.tabs[this.displayIndex], "leftTabButtonSelected");
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
        click,_=> {
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
        _=> {
          this.handleTabClicks(event, this.chips, this.boxes);
        },
        false
      );
    }
    this.contactDevs.addEventListener(click, feedBackBox, false);
    this.back.addEventListener(click, this.undoAndReturn, false);
    this.logout.addEventListener(click,_=> {
        showLoader();
        logoutUser(false);
    },false);
    
  }
  handleTabClicks = (event, clickables, showables, showClass, hideClass) => {
    var e = event.currentTarget;
    for (var k = 0; k < clickables.length; k++) {
      var condition = e == clickables[k];
      visibilityOf(showables[k], condition);
      if (showClass != null && hideClass != null) {
        setClassName(clickables[k], showClass, hideClass, condition);
      }
    }
  };
   undoAndReturn = _=> {
    showLoader();
    relocate(adminDashPage);
  }
}

class Admin{
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

class Institution{
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

class Security{
  constructor() {
    this.resetPass = getElement("resetPasswordButton");
    this.resetMail = getElement("resetMailButton");
    this.lastLogin = getElement("lastLoginTime");
    this.resetPass.addEventListener(click, resetPasswordDialog, false);
    this.resetMail.addEventListener(click, changeEmailBox, false);
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
    this.invite.addEventListener(click,this.linkGenerator,false);
  }
  linkGenerator =_=> {
    fetch("/admin/invitation/teachers/generatelink", {
      method: "post",
    })
      .then((res) => res.json())
      .then((res) => {
        let dialog = new Dialog();
        let result = JSON.parse(res.linkdata);
        dialog.setDisplay(
          "Invitation link",
          `<center><a href="${result.link}">${
            result.link
          }</a><br/>This Link will automatically expire on <b>${getProperDate(
            String(result.time)
          )}</b>.</center>`
        );
        dialog.createActions(
          Array("Disable Link", "Copy", "Done"),
          Array(actionType.negative, actionType.positive, actionType.neutral)
        );
        dialog.onButtonClick(0, _=> {
          dialog.setDisplay(
            "Generate link",
            `<center>Create a link and share that with teachers of your institution.</center>`
          );
          dialog.createActions(
            Array("Create Link", "Cancel"),
            Array(actionType.active, actionType.negative)
          );
          dialog.onButtonClick(0, _=> {
            this.linkGenerator();
          });
        });
        dialog.onButtonClick(1, _=> {
          snackBar("Link Copied to clipboard.");
          dialog.existence(false);
        });
        dialog.onButtonClick(2, _=> {
          dialog.existence(false);
        });
        dialog.existence(true);
      })
      .catch((error) => {
        snackBar("Failed to generate invite link", "Report", false, _=> {
          feedBackBox(true, error, true);
        });
      });
  };
 
}

window.onload = _=> {
    window.app = new Management();
};
