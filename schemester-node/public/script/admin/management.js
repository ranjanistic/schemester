//admin management default script

class Management {
  constructor() {
    this.sectionreq = getElement("section").innerHTML;
    const sectionsArray = Array(
      locate.admin.section.account,
      locate.admin.section.institute,
      locate.admin.section.schedule,
      locate.admin.section.users,
      locate.admin.section.security,
      locate.admin.section.about
    );
    this.displayIndex = sectionsArray.indexOf(this.sectionreq)<0?0:sectionsArray.indexOf(this.sectionreq);
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

    this.name = new Editable("adminName","adminnameeditor",
      new TextInput("adminnamefield","adminnameinput","adminnameerror",validType.name),
      "editadminname","adminnameview","saveadminname","canceladminname"
    );
    
    this.email = getElement("adminEmailAddress");

    this.phone = new Editable("adminPhoneNumber","adminphoneeditor",
      new TextInput("adminphonefield","adminphoneinput","adminphoneerror",validType.phone),
      "editadminphone","adminphoneview","saveadminphone","canceladminphone"
    );

    this.name.onSave(_=>{
      this.name.validateInputNow();
      if(!this.name.isValidInput()) return;
      this.name.disableInput();
      if(this.name.getInputValue() == this.name.displayText()){
        localStorage.setItem('username',this.name.getInputValue());
        return this.name.clickCancel();
      }
      showLoader();
      postJsonData(post.admin.self,{
        target:"account",
        action:code.action.CHANGE_NAME,
        newname:this.name.getInputValue()
      }).then(resp=>{
        if(resp.event == code.OK){
          localStorage.setItem('username',this.name.getInputValue());
          this.name.setDisplayText(this.name.getInputValue());
          this.name.display();
        } else {
          snackBar('Unable to save');
        }
        hideLoader();
      })
    });

    this.phone.onSave(_=>{
      this.phone.validateInputNow();
      if(!this.phone.isValidInput()) return;
      this.phone.disableInput();
      if(this.phone.getInputValue() == this.phone.displayText()){
        return this.phone.clickCancel();
      }
      showLoader();
      postJsonData(post.admin.self,{
        target:"account",
        action:code.action.CHANGE_PHONE,
        newphone:this.phone.getInputValue()
      }).then(resp=>{
        if(resp.event == code.OK){
          this.phone.setDisplayText(this.phone.getInputValue());
          this.phone.display();
        } else {
          snackBar('Unable to save');
        }
        hideLoader();
      })
    });
    this.creationTime = getElement("adminCreationTime"); 
  }
}

class Institution {
  constructor() {
    this.name = new Editable("instituteName","institutenameeditor",
      new TextInput("institutenamefield","institutenameinput","institutenameerror",validType.name),
      "editinstitutename","institutenameview","saveinstitutename","cancelinstitutename"
    );
    this.name.onSave(_=>{
      this.name.validateInputNow();
      if(!this.name.isValidInput()) return;
      this.name.disableInput();
      if(this.name.getInputValue() == this.name.displayText()){
        return this.name.clickCancel();
      }
      showLoader();
      postJsonData(post.admin.default,{
        target:"institute",
        action:code.action.CHANGE_NAME,
        newname:this.name.getInputValue()
      }).then(resp=>{
        if(resp.event == code.OK){
          this.name.setDisplayText(this.name.getInputValue());
          this.name.display();
        } else {
          snackBar('Unable to save');
        }
        hideLoader();
      })
    });
    
    this.phone = new Editable("institutePhone","institutephoneeditor",
      new TextInput("institutephonefield","institutephoneinput","institutephoneerror",validType.phone),
      "editinstitutephone","institutephoneview","saveinstitutephone","cancelinstitutephone"
    );
    this.phone.onSave(_=>{
      this.phone.validateInputNow();
      if(!this.phone.isValidInput()) return;
      this.phone.disableInput();
      if(this.phone.getInputValue() == this.phone.displayText()){
        return this.phone.clickCancel();
      }
      showLoader();
      postJsonData(post.admin.default,{
        target:"institute",
        action:code.action.CHANGE_PHONE,
        newphone:this.phone.getInputValue()
      }).then(resp=>{
        if(resp.event == code.OK){
          this.phone.setDisplayText(this.phone.getInputValue());
          this.phone.display();
        } else {
          snackBar('Unable to save');
        }
        hideLoader();
      })
    });
    
    this.mail = new Editable("instituteMail","institutemaileditor",
      new TextInput("institutemailfield","institutemailinput","institutemailerror",validType.email),
      "editinstitutemail","institutemailview","saveinstitutemail","cancelinstitutemail"
    );

    this.mail.onSave(_=>{
      this.mail.validateInputNow();
      if(!this.mail.isValidInput()) return;
      this.mail.disableInput();
      if(this.mail.getInputValue() == this.mail.displayText()){
        return this.mail.clickCancel();
      }
      showLoader();
      postJsonData(post.admin.default,{
        target:"institute",
        action:code.action.CHANGE_ID,
        newemail:this.mail.getInputValue()
      }).then(resp=>{
        if(resp.event == code.OK){
          this.mail.setDisplayText(this.mail.getInputValue());
          this.mail.display();
        } else {
          snackBar('Unable to save');
        }
        hideLoader();
      })
    });

    
    this.uiid = getElement("uiid");
    this.subscriptionTill = getElement("subscriptionTill");
  }

  
}
class Schedule {
  constructor() {
    this.start = new Editable("start","starteditor",
      new TextInput("startfield","startinput","starterror",validType.nonempty),
      "editstart","startView","savestart","cancelstart"
    );
    this.breakstart = new Editable("breakstart","breakstarteditor",
      new TextInput("breakstartfield","breakstartinput","breakstarterror",validType.nonempty),
      "editbreakstart","breakstartView","savebreakstart","cancelbreakstart"
    );
    this.periodduration = new Editable("periodduration","perioddurationeditor",
      new TextInput("perioddurationfield","perioddurationinput","perioddurationerror",validType.nonempty),
      "editperiodduration","perioddurationView","saveperiodduration","cancelperiodduration"
    );
    this.breakduration = new Editable("breakduration","breakdurationeditor",
      new TextInput("breakdurationfield","breakdurationinput","breakdurationerror",validType.nonempty),
      "editbreakduration","breakdurationView","savebreakduration","cancelbreakduration"
    );

    this.start.onSave(_=>{
      this.start.validateInputNow();
      if(!this.start.isValidInput()) return;
      this.start.disableInput();
      if(this.start.getInputValue() == this.start.displayText()){
        return this.start.clickCancel();
      }
      showLoader();
      postJsonData(post.admin.default,{
        target:"timings",
        action:code.action.CHANGE_START_TIME,
        start:this.start.getInputValue()
      }).then(resp=>{
        if(resp.event == code.OK){
          this.start.setDisplayText(this.start.getInputValue());
          this.start.display();
        } else {
          snackBar('Unable to save');
        }
        hideLoader();
      })
    });
    this.breakstart.onSave(_=>{
      this.breakstart.validateInputNow();
      if(!this.breakstart.isValidInput()) return;
      this.breakstart.disableInput();
      if(this.breakstart.getInputValue() == this.breakstart.displayText()){
        return this.breakstart.clickCancel();
      }
      showLoader();
      postJsonData(post.admin.default,{
        target:"timings",
        action:code.action.CHANGE_BREAK_START_TIME,
        breakstart:this.breakstart.getInputValue()
      }).then(resp=>{
        if(resp.event == code.OK){
          this.breakstart.setDisplayText(this.breakstart.getInputValue());
          this.breakstart.display();
        } else {
          snackBar('Unable to save');
        }
        hideLoader();
      })
    });
    this.periodduration.onSave(_=>{
      this.periodduration.validateInputNow();
      if(!this.periodduration.isValidInput()) return;
      this.periodduration.disableInput();
      if(this.periodduration.getInputValue() == this.periodduration.displayText()){
        return this.periodduration.clickCancel();
      }
      showLoader();
      postJsonData(post.admin.default,{
        target:"timings",
        action:code.action.CHANGE_PERIOD_DURATION,
        periodduration:this.periodduration.getInputValue()
      }).then(resp=>{
        if(resp.event == code.OK){
          this.periodduration.setDisplayText(this.periodduration.getInputValue());
          this.periodduration.display();
        } else {
          snackBar('Unable to save');
        }
        hideLoader();
      })
    });
    this.breakduration.onSave(_=>{
      this.breakduration.validateInputNow();
      if(!this.breakduration.isValidInput()) return;
      this.breakduration.disableInput();
      if(this.breakduration.getInputValue() == this.breakduration.displayText()){
        return this.breakduration.clickCancel();
      }
      showLoader();
      postJsonData(post.admin.default,{
        target:"timings",
        action:code.action.CHANGE_BREAK_DURATION,
        breakduration:this.breakduration.getInputValue()
      }).then(resp=>{
        if(resp.event == code.OK){
          this.breakduration.setDisplayText(this.breakduration.getInputValue());
          this.breakduration.display();
        } else {
          snackBar('Unable to save');
        }
        hideLoader();
      })
    });

    this.workDays = getElement("workdays");
    this.totalPeriods = getElement("totalPeriods");
    this.reschedule = getElement("reschedule");
    this.scheduler = new Dialog();
    this.reschedule.onclick=_=>{
      this.rescheduleDefault();
      this.scheduler.show();
    }
  }
  rescheduleDefault(weekdays = false,periods = false){
    this.scheduler.createActions(Array('Discard'),Array(actionType.neutral));
    this.scheduler.onButtonClick(Array(_=>{
      sessionStorage.clear();
      this.scheduler.hide();
    }));
    this.scheduler.setDisplay('Edit Schedule Structure',`
    <center class="negative">These actions will change the schedule structure, proceed with caution.</center>
    <br/>
    <div class="fmt-center">
      <button class="positive-button" id="editweekdays">Edit weekdays${weekdays?'*':''}</button>
      <button class="positive-button" id="editperiods">Edit periods${periods?'*':''}</button>
    </div>
  `);
    const editweek = getElement("editweekdays"), editperiods = getElement("editperiods");
    editweek.onclick=_=>{this.rescheduleWeekEditor()};
  }
  
  rescheduleWeekEditor(){
    const daysindices = Array();
    const days = this.workDays.innerHTML.split(',');
    let editcontent = constant.nothing;
    days.forEach((day,d)=>{
      daysindices.push(constant.weekdayscasual.indexOf(day.toLowerCase().trim()));
      editcontent += 
      `<div class="fmt-row" id="dayrow${d}">
        <div class="fmt-row">
          <div class="fmt-col fmt-half">
          Shift ${day} to
          </div>
          <div class="fmt-col fmt-half">
          <button class="negative-button fmt-right" id="deleteday${d}">Delete ${day}</button>
          </div>
        </div>
        <div class="fmt-row">
        ${getInputField(`dayfield${d}`,`daycap${d}`,`dayinput${d}`,`dayerror${d}`)}
        </div>
      </>
      `;
    });
    this.scheduler.setDisplay('Weekdays Editor',`
    <center class="negative">These actions will change the weekdays, proceed with caution.</center>
    <br/>
    <div class="fmt-row">
      ${editcontent}
    </div>
  `);
    const dayrows = Array();
    const editDayField = Array();
    const deleteDays = Array();
    days.forEach((day,d)=>{
      dayrows.push(getElement(`dayrow${d}`));
      editDayField.push(new TextInput(`dayfield${d}`,`dayinput${d}`,`dayerror${d}`,validType.weekday,`daycap${d}`));
      deleteDays.push(getElement(`deleteday${d}`));
      deleteDays[d].onclick=_=>{
        snackBar(`Delete ${day} from every schedule?`,'Delete',false,_=>{
          deleteDays[d].onclick=_=>{}
          snackBar(`Deleting ${day}...`);
          postJsonData(post.admin.schedule,{
            target:client.teacher,
            action:"remove",
            specific:"weekday",
            removeday:daysindices[d]
          }).then(response=>{
            clog(response);
            if(response.event == code.OK){
              locatoin.reload();
              snackBar(`${day} was removed from every schedule`,'Refresh',true);
            } else {
              snackBar(`Unable to remove ${day} from every schedule`,'Report');
            }
          });
        });
      }
    });
    editDayField.forEach((field,f)=>{
      field.setFieldCaption('Weekday name');
      field.setInputAttrs(`${days[f]} schedule will be transferred to`);
    });
    this.scheduler.createActions(Array('Back','Move schedule'),Array(actionType.neutral,actionType.positive));
    this.scheduler.onButtonClick(Array(_=>{this.rescheduleDefault()},
    _=>{
      const someinvalid = editDayField.some((f,_)=>{
        if(f.getInput()!=constant.nothing){
          f.validateNow();
        } else {
          f.showError('Cannot be empty');
        }
        return !f.isValid();
      });
      if(!someinvalid){
        const data = Array();
        days.forEach((day,d)=>{
          data.push({
            old:daysindices[d],
            new:constant.weekdayscasual.indexOf(editDayField[d].getInput().toLowerCase())
          })
        });
        const equals = Array();
        data.forEach((obj,o)=>{
          equals.push(obj.old == obj.new);
        });
        if(!equals.includes(false)){
          return snackBar('All days are same as their old ones.',null,bodyType.warning);
        }
        days.includes(constant.weekdayscasual[data.new])
        this.scheduler.loader(true,_=>{editDayField.forEach((f,_)=>{f.disableInput()})})
        postJsonData(post.admin.schedule,{
          target:client.teacher,
          action:"update",
          specific:"switchweekdays",
          days:data
        }).then(response=>{
          clog(response);
          if(response.event == code.OK){
            this.scheduler.loader(false);
            this.rescheduleDefault();
            this.restartView();
          } else {
            snackBar('Could\'nt change weekdays','Report');
            editDayField.forEach((field,f)=>{
              field.validateNow();
            });
          }
        })
      }
    }))
  }

  restartView(){
    this.scheduler.createActions(Array('Restart now'),Array(actionType.positive));
    this.scheduler.onButtonClick(Array(_=>{
      relocate(locate.root);
    }));
    this.scheduler.setDisplay('Restart now',`<center class="active">Changes were applied successfully.<br/>A restart is required to resume scheduling.</center>`);
    let i = 10;
    setInterval(() => {
      this.scheduler.getDialogButton(0).innerHTML = `Restart now (${i})`;
      i-=1;
      if(i==0){
        this.scheduler.getDialogButton(0).click();
      }
    }, 1000);
  }
}

class Security {
  constructor() {
    this.resetPass = getElement("resetPasswordButton");
    this.sendpasslink = getElement("sendpasswordlink");
    this.resetMail = getElement("resetMailButton");
    this.lastLogin = getElement("lastLoginTime");
    this.deleteAccount = getElement("deleteAdminAccount");
    this.resetPass.onclick = (_) => {
      adminloginDialog((_) => {
        resetPasswordDialog();
      });
    };
    if (Number(sessionStorage.getItem("linkin")) > 0) {
      opacityOf(this.sendpasslink, 0.5);
      let time = Number(sessionStorage.getItem("linkin"));
      const timer = setInterval(() => {
        time--;
        sessionStorage.setItem("linkin", time);
        this.sendpasslink.innerHTML = `Try again in ${time} seconds.`;
        if (Number(sessionStorage.getItem("linkin")) == 0) {
          clearInterval(timer);
          this.sendpasslink.innerHTML = "Get password link";
          opacityOf(this.sendpasslink, 1);
          this.sendpasslink.onclick = (_) => {this.linkSender()};
        }
      }, 1000);
    } else {
      this.sendpasslink.onclick = (_) => {this.linkSender()};
    }
    this.resetMail.onclick = (_) => {
      changeEmailBox();
    };
    this.deleteAccount.addEventListener(
      click,
      (_) => {
        adminloginDialog(
          (_) => {
            const delconf = new Dialog();
            delconf.setDisplay(
              "Delete?",
              `Are you sure you want to delete your Schemester account <b>${localStorage.getItem(
                "id"
              )}</button> permanently? The following consequencies will take place:<br/>
      <div>
      <ul>
      <li>You will not be able to recover your account forever.</li>
      <li>Your institution will also get deleted.</li>
      <li>Scheduling for your institution will stop, affecting all the users, and their accounts will be deleted too.</li>
      <li>Make sure you understand what your next step will lead to.</li>
      </ul><br/>
      <div class="active">If someone else is taking administration instead of you, then you can <a onclick="changeEmailBox()">transfer ownership of your institution</a> rather than deleting it.</div>
      </div>`
            );
            delconf.setBackgroundColorType(bodyType.negative);
            delconf.createActions(
              Array(`Delete account & Institution`, "No, step back"),
              Array(actionType.negative, actionType.positive)
            );
            delconf.onButtonClick(
              Array(
                (_) => {
                  delconf.loader();
                  postJsonData(post.admin.self, {
                    target: "account",
                    action: code.action.ACCOUNT_DELETE,
                  }).then((response) => {
                    if (response.event == code.OK) {
                      relocate(locate.root);
                    } else {
                      snackBar("Action Failed");
                    }
                  });
                },
                (_) => {
                  delconf.hide();
                }
              )
            );
            let time = 60;
            const snack = new Snackbar();
            snack.show();
            let timer = setInterval(() => {
              time--;
              snack.createSnack(`${time}s to revert.`, bodyType.negative);
              if (time == 0) {
                clearInterval(timer);
                delconf.hide();
                snack.hide();
              }
            }, 1000);
          },
          true,
          true
        );
      },
      false
    );
  }

  linkSender(){
      postJsonData(post.admin.manage, {
        type: "resetpassword",
        action: "send",
      }).then((response) => {
        clog(response);
        if (response.event == code.mail.MAIL_SENT) {
          snackBar(
            "A link for password reset has been sent to your email address."
          );
          opacityOf(this.sendpasslink, 0.4);
          this.sendpasslink.onclick = (_) => {};
          let time = 120;
          sessionStorage.setItem("linkin", time);
          const timer = setInterval(() => {
            time--;
            sessionStorage.setItem("linkin", time);
            this.sendpasslink.innerHTML = `Try again in ${time} seconds.`;
            if (Number(sessionStorage.getItem("linkin")) == 0) {
              clearInterval(timer);
              this.sendpasslink.innerHTML = "Get password link";
              opacityOf(this.sendpasslink, 1);
            }
          }, 1000);
        }
      });
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

    class Teacher {
      constructor() {
        this.listview = getElement("teacherList");
        this.search = getElement("teacherSearch");
        this.load(false);
        this.search.oninput = (_) => {
          if (this.search.value) {
            this.load();
            postJsonData(post.admin.manage, {
              type: "search",
              target: client.teacher,
              q: this.search.value,
            }).then((response) => {
              if (response.event == "OK") {
                this.load(false, false);
                response.teachers.forEach((teacher, index) => {
                  this.appendList(
                    this.getSlate(teacher.username, teacher.teacherID)
                  );
                  getElement(`view${teacher.teacherID}`).onclick = (_) => {
                    clog(teacher.teacherID);
                    refer(locate.admin.session, {
                      target: locate.admin.target.viewschedule,
                      client: client.teacher,
                      teacherID: teacher.teacherID,
                    });
                  };
                });
              }
            });
          } else {
            this.load(false);
          }
        };
      }
      getSlate(name, email) {
        return `<div class="fmt-row container" style="margin:4px 0px">
        <div class="fmt-col fmt-twothird">
            <span class="group-text positive">${name}</span><br/>
            <span class="group-text questrial">${email}</span>
        </div>
        <div class="fmt-col fmt-third">
            <button class="positive-button fmt-right"id="view${email}">View</button>
        </div>
        </div>`;
      }
      load(show = true, noview = true) {
        if (show) {
          this.listview.innerHTML = this.getLoaderView();
        } else {
          if (noview) {
            this.listview.innerHTML = this.getDefaultView();
          } else {
            this.listview.innerHTML = "";
          }
        }
      }
      appendList(slate) {
        let last = this.listview.innerHTML;
        if (last == this.getDefaultView() || last == this.getLoaderView()) {
          this.listview.innerHTML = slate;
        } else {
          this.listview.innerHTML = last + slate;
        }
      }
      getLoaderView() {
        return `<div class="fmt-center" id="tlistLoader">
        <img class="fmt-spin-fast" width="50" src="/graphic/blueLoader.svg"/>
        </div>`;
      }
      getDefaultView() {
        return '<div class="fmt-center">Start Typing...<div>';
      }
      clearList() {
        this.listview.innerHTML = "Start typing";
      }
    }
    this.teacher = new Teacher();
    class Classes {
      constructor() {
        this.listview = getElement("classList");
        this.search = getElement("classSearch");
        this.load(false);
        this.search.oninput = (_) => {
          if (this.search.value) {
            this.load();
            postJsonData(post.admin.manage, {
              type: "search",
              q: this.search.value,
            }).then((response) => {
              if (response.event == "OK") {
                this.load(false, false);
                response.classes.forEach((Class, index) => {
                  this.appendList(
                    this.getSlate(Class.classname, Class.teachercount)
                  );
                  getElement(`view${teacher.teacherID}`).onclick = (_) => {
                    refer(locate.admin.session, {
                      target: "viewschedule",
                      client: client.student,
                      classname: Class.classname,
                    });
                  };
                });
              }
            });
          } else {
            this.load(false);
          }
        };
      }
      getSlate(classname, teachercount) {
        return `<div class="fmt-row container" style="margin:4px 0px">
        <div class="fmt-col fmt-twothird">
            <span class="group-text positive">${classname}</span><br/>
            <span class="group-text questrial">Taken by ${teachercount} teachers</span>
        </div>
        <div class="fmt-col fmt-third">
            <button class="positive-button fmt-right"id="view${classname}">View</button>
        </div>
        </div>`;
      }
      load(show = true, noview = true) {
        if (show) {
          this.listview.innerHTML = this.getLoaderView();
        } else {
          if (noview) {
            this.listview.innerHTML = this.getDefaultView();
          }
        }
      }
      appendList(slate) {
        let last = this.listview.innerHTML;
        if (last == this.getDefaultView() || last == this.getLoaderView()) {
          this.listview.innerHTML = slate;
        } else {
          this.listview.innerHTML = last + slate;
        }
      }
      getLoaderView() {
        return `<div class="fmt-center" id="clistLoader">
        <img class="fmt-spin-fast" width="50" src="/graphic/blueLoader.svg"/>
        </div>`;
      }
      getDefaultView() {
        return '<div class="fmt-center">Start Typing...<div>';
      }
      clearList() {
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
          case code.invite.LINK_EXISTS:
            {
              snackBar("This link already exists and can be shared.");
            }
            break;
          case code.invite.LINK_CREATED:
            {
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
