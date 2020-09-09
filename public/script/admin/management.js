//admin management default script

class Management {
  constructor() {
    this.sectionreq = getElement("section").innerHTML;
    this.sectionsArray = Array(
      locate.admin.section.account,
      locate.admin.section.institute,
      locate.admin.section.schedule,
      locate.admin.section.users,
      locate.admin.section.security,
      locate.admin.section.about
    );
    this.displayIndex = this.sectionsArray.indexOf(this.sectionreq)<0?0:this.sectionsArray.indexOf(this.sectionreq);
    clog(this.displayIndex);
    this.settingsmenu = new Menu("settingsmenu","settingsmenubutton");
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
    this.users = new Users(this.sectionsArray);
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
        finishSession(client.admin, (_) => {
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
      if(condition){
        const query = window.location.search;
        window.history.pushState('object or string','Management',query.replace(query.substr(query.lastIndexOf('=')),`=${this.sectionsArray[k]}`));
      }
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

    class Preferences{
      constructor(){
        this.showphoneteacher = new Switch('teacherphonevcheck');
        this.showphonestudent = new Switch('studentphonevcheck');
        this.showmailteacher = new Switch('teachermailvcheck');
        this.showmailstudent = new Switch('studentmailvcheck');

        this.showphoneteacher.onTurnChange(_=>{
          postJsonData(post.admin.self,{
            target:"preferences",
            action:"set",
            specific:"showphonetoteacher",
            show:true,
          }).then(response=>{
            this.showphoneteacher.turn(response.event == code.OK)
          })
        },_=>{
          postJsonData(post.admin.self,{
            target:"preferences",
            action:"set",
            specific:"showphonetoteacher",
            show:false
          }).then(response=>{
            this.showphoneteacher.turn(response.event != code.OK)
          })
        })
        this.showphonestudent.onTurnChange(_=>{
          postJsonData(post.admin.self,{
            target:"preferences",
            action:"set",
            specific:"showphonetostudent",
            show:true,
          }).then(response=>{
            this.showphonestudent.turn(response.event == code.OK)
          })
        },_=>{
          postJsonData(post.admin.self,{
            target:"preferences",
            action:"set",
            specific:"showphonetostudent",
            show:false
          }).then(response=>{
            this.showphonestudent.turn(response.event != code.OK)
          })
        })
        this.showmailteacher.onTurnChange(_=>{
          postJsonData(post.admin.self,{
            target:"preferences",
            action:"set",
            specific:"showemailtoteacher",
            show:true,
          }).then(response=>{
            this.showmailteacher.turn(response.event == code.OK)
          })
        },_=>{
          postJsonData(post.admin.self,{
            target:"preferences",
            action:"set",
            specific:"showemailtoteacher",
            show:false
          }).then(response=>{
            this.showmailteacher.turn(response.event != code.OK)
          })
        })
        this.showmailstudent.onTurnChange(_=>{
          postJsonData(post.admin.self,{
            target:"preferences",
            action:"set",
            specific:"showemailtostudent",
            show:true,
          }).then(response=>{
            this.showmailstudent.turn(response.event == code.OK)
          })
        },_=>{
          postJsonData(post.admin.self,{
            target:"preferences",
            action:"set",
            specific:"showemailtostudent",
            show:false
          }).then(response=>{
            this.showmailstudent.turn(response.event != code.OK)
          })
        })   
      }
    }
    new Preferences();
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

    class Preferences{
      constructor(){
        this.allowteacherschedule = new Switch('teachereditschedule');
        this.scheduleActive = new Switch('scheduleactive');
        this.darkmode = new Switch('darkmode');
        this.darkmode.turn(theme.isDark());
        this.darkmode.onTurnChange(_=>{theme.setDark()},_=>{theme.setLight()});

        this.allowteacherschedule.onTurnChange(_=>{
          postJsonData(post.admin.manage,{
            type:"preferences",
            action:"set",
            specific:"allowTeacherAddSchedule",
            allow:true
          }).then(resp=>{
            this.allowteacherschedule.turn(resp.event == code.OK);
          });
        },_=>{
          postJsonData(post.admin.manage,{
            type:"preferences",
            action:"set",
            specific:"allowTeacherAddSchedule",
            allow:false
          }).then(resp=>{
            this.allowteacherschedule.turn(resp.event != code.OK);
          });
        });
        this.scheduleActive.onTurnChange(_=>{
          postJsonData(post.admin.manage,{
            type:"preferences",
            action:"set",
            specific:"active",
            active:true
          }).then(resp=>{
            this.scheduleActive.turn(resp.event == code.OK);
          });
        },_=>{
          postJsonData(post.admin.manage,{
            type:"preferences",
            action:"set",
            specific:"active",
            active:false
          }).then(resp=>{
            this.scheduleActive.turn(resp.event != code.OK);
          });
        })
      }
    }
    new Preferences();
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
              location.reload();
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
      authenticateDialog(client.admin,(_) => {
        resetPasswordDialog(client.admin,true);
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
        changeEmailBox(client.admin);
    };
    this.deleteAccount.addEventListener(
      click,
      (_) => {
        authenticateDialog(
          client.admin,
          (_) => {
            const delconf = new Dialog();
            delconf.setDisplay(
              "Delete?",
              `Are you sure you want to delete your Schemester account <b>${localStorage.getItem("id")}</b> permanently? The following consequencies will take place:<br/>
      <div>
      <ul>
      <li>You will not be able to recover your account forever.</li>
      <li>Scheduling for your institution will stop, affecting all the users, and their accounts will be deleted too.</li>
      <li>Make sure you understand what your next step will lead to.</li>
      </ul><br/>
      <div class="active">If someone else is taking administration instead of you, then you can <a onclick="changeEmailBox(client.admin)">transfer ownership of your institution</a> rather than deleting it.</div>
      <div class="switch-view" id="deleteinstitutecontainer">
              <span class="switch-text negative">Also delete the institution.</span>
              <label class="switch-container">
                <input type="checkbox" id="deleteinstituteswitch">
                <span class="switch-negative" id="deleteinstituteswitchview"></span>
              </label>
      </div>
      <fieldset class="text-field" id="deluiidfield" style="display:none">
          <legend class="field-caption" >UIID</legend>
          <input class="text-input" required placeholder="Type the UIID of your institution" type="email" inputmode="email" id="deluiidinput" name="email"">
          <span class="fmt-right error-caption" id="deluiiderror"></span>
      </fieldset>
      </div>`
        );
        const deluiid = new TextInput("deluiidfield","deluiidinput","deluiiderror",validType.nonempty);
              const deletinstituteswitch = new Switch("deleteinstituteswitch");
              deletinstituteswitch.onTurnChange(_=>{
                deluiid.validate();
                deluiid.show();
              },_=>{
                deluiid.hide();
              })
            delconf.setBackgroundColorType(bodyType.negative);
            delconf.createActions(
              Array(`Delete account & Institution`, "No, step back"),
              Array(actionType.negative, actionType.positive)
            );
            delconf.onButtonClick(
              Array(
                (_) => {
                  if(deletinstituteswitch.isOn()){
                    if(!deluiid.isValid()){
                      return deluiid.validateNow();
                    }
                  }
                  delconf.loader();
                  deluiid.disableInput();
                  postJsonData(post.admin.self, {
                    target: "account",
                    action: code.action.ACCOUNT_DELETE,
                    uiid:deluiid.getInput().trim()
                  }).then((response) => {
                    if (response.event == code.OK) {
                      relocate(locate.root);
                    }else{ 
                      delconf.loader(false);
                      deluiid.enableInput();
                    if(response.event == code.auth.WRONG_UIID){
                      return deluiid.showError('Wrong UIID');
                    } else {
                      snackBar("Action Failed");
                    }}
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
              delconf.getDialogButton(0).innerHTML = `Delete account (${time}s)`;
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
  constructor(sectionsArray) {
    this.invite = getElement("inviteUsers");
    this.invite.onclick=(_)=>{linkGenerator(client.teacher)};
    class Teacher {
      constructor() {
        this.listview = getElement("teacherList");
        this.search = getElement("teacherSearch");
        this.load(false);
        this.search.oninput = (_) => {
          if (this.search.value && this.search.value.trim()!='@' && this.search.value.trim()!='.' && this.search.value.trim() != constant.nothing) {
            this.load();
            postJsonData(post.admin.manage, {
              target: client.teacher,
              type: "search",
              q: this.search.value.trim(),
            }).then((resp) => {
              if (resp.event == code.OK) {
                if(resp.teachers.length<1){
                  return this.nouserfound();
                }
                let listitems = constant.nothing;
                resp.teachers.forEach((teacher,t)=>{
                    listitems+= this.getSlate(teacher.username,teacher.teacherID,t)
                });
                this.listview.innerHTML = listitems;
                const slates = Array();
                resp.teachers.forEach((teacher,t)=>{
                  slates.push(getElement(`teacherslate${t}`));
                  slates[t].onclick=_=>{
                    refer(locate.admin.session, {
                      target: locate.admin.target.viewschedule,
                      type: client.teacher,
                      t: teacher.teacherUID,
                    });
                  }
                });
                return;
              }
            });
          } else {
            this.load(false);
          }
          this.getDefaultView();
        };
      }
      getSlate(name, email,index) {
        return `<button class="fmt-row wide neutral-button fmt-padding" style="margin:4px 0px" id="teacherslate${index}">
        <div class="fmt-col fmt-twothird group-text">
          <span class="positive" id="teachername${index}">${name}</span><br/>
          <span class="questrial" id="teachermail${index}">${email}</span>
        </div>
        </button>`;
      }
      load(show = true) {
        show?this.getLoaderView():this.getDefaultView();
      }
      getLoaderView() {
        this.listview.innerHTML =  `<div class="fmt-center" id="tlistLoader">
          <img class="fmt-spin" width="50" src="/graphic/blueLoader.svg"/>
        </div>`;
      }
      getDefaultView() {
        this.listview.innerHTML = '<div class="fmt-center group-text">Type to search.</div>';
      }
      nouserfound(){
        const query = window.location.search;
        this.listview.innerHTML = `<div class="fmt-center group-text">No user found. <a href="${query.replace(query.substr(query.lastIndexOf('=')),`=${sectionsArray[2]}`)}">Try in schedule</a>?</div>`;
      }
    }
    this.teacher = new Teacher();
    
    class Classes {
      constructor() {
        this.listview = getElement("classList");
        this.search = getElement("classSearch");
        this.load(false);
        this.search.oninput = (_) => {
          if (this.search.value && this.search.value.trim()!='@' && this.search.value.trim()!='.' && this.search.value.trim() != constant.nothing) {
            this.load();
            postJsonData(post.admin.manage, {
              target: client.student,
              type: "search",
              q: this.search.value.trim(),
            }).then((resp) => {
              if (resp.event == code.OK) {
                if(resp.classes.length<1){
                  return this.noclassfound();
                }
                let listitems = constant.nothing;
                resp.classes.forEach((Class,t)=>{
                    listitems+= this.getSlate(Class.classname,Class.inchargeID,t)
                });
                this.listview.innerHTML = listitems;
                const slates = Array();
                resp.classes.forEach((Class,t)=>{
                  slates.push(getElement(`classslate${t}`));
                  slates[t].onclick=_=>{
                    refer(locate.admin.session, {
                      target: locate.admin.target.viewschedule,
                      type: client.student,
                      c: Class.classUID,
                    });
                  }
                });
                return;
              }
            });
          } else {
            this.load(false);
          }
          this.setDefaultView();
        };
      }
      getSlate(name, email,index) {
        return `<button class="fmt-row wide neutral-button fmt-padding" style="margin:4px 0px" id="classslate${index}">
        <div class="fmt-col fmt-twothird group-text">
          <span class="positive" id="classname${index}">${name}</span><br/>
          <span class="questrial" id="classincharge${index}">${email}</span>
        </div>
        </button>`;
      }
      load(show = true) {
        show?this.getLoaderView():this.setDefaultView();
      }
      getLoaderView() {
        this.listview.innerHTML =  `<div class="fmt-center" id="tlistLoader">
          <img class="fmt-spin" width="50" src="/graphic/blueLoader.svg"/>
        </div>`;
      }
      setDefaultView() {
        this.listview.innerHTML = '<div class="fmt-center group-text">Type to search.</div>';
      }
      noclassfound(){
        this.listview.innerHTML = '<div class="fmt-center group-text">No class found.</div>';
      }
    }
    try{
      this.classes = new Classes();
    }catch{}
  }
}

window.onload = (_) => (window.app = new Management());
