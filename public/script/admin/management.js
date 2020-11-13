//admin management default script

class Management {
  constructor() {
    this.sectionreq = getElement("section").innerHTML;
    this.sectionsArray = [
      locate.admin.section.account,
      locate.admin.section.institute,
      locate.admin.section.schedule,
      locate.admin.section.users,
      locate.admin.section.security,
      locate.admin.section.about
    ];
    this.displayIndex =
      this.sectionsArray.indexOf(this.sectionreq) < 0
        ? 0
        : this.sectionsArray.indexOf(this.sectionreq);
    this.settingsmenu = new Menu("settingsmenu", "settingsmenubutton");
    this.tabs = [
      getElement("adminTab"),
      getElement("institutionTab"),
      getElement("scheduleTab"),
      getElement("usersTab"),
      getElement("securityTab"),
      getElement("aboutTab")
    ];
    setClassNames(this.tabs[this.displayIndex], "leftTabButtonSelected");
    this.chips = [
      getElement("madminTab"),
      getElement("minstitutionTab"),
      getElement("mscheduleTab"),
      getElement("musersTab"),
      getElement("msecurityTab"),
      getElement("maboutTab")
    ];
    this.chips[this.displayIndex].click();
    this.boxes = [
      getElement("accountSettingsBox"),
      getElement("institutionSettingsBox"),
      getElement("scheduleSettingsBox"),
      getElement("usersSettingsBox"),
      getElement("securitySettingsBox"),
      getElement("aboutSettingsBox")
    ];
    showElement(this.boxes, this.displayIndex);

    this.back = getElement("backFromSettings");
    this.contactDevs = getElement("contactDevelopers");
    this.logout = getElement("logoutAdmin");
    this.data = new ReceiveData();
    this.admin = new Admin(this.data);
    this.inst = new Institution();
    this.schedule = new Schedule();
    this.security = new Security();
    this.users = new Users(this.sectionsArray);
    for (var i = 0; i < this.tabs.length; i++) {
      this.tabs[i].onclick=(event) => {
        this.handleTabClicks(
          event,
          this.tabs,
          this.boxes,
          "leftTabButtonSelected",
          "leftTabButton"
        );
      };
      this.chips[i].onclick=(event) => {
          this.handleTabClicks(event, this.chips, this.boxes);
      };
    }
    this.contactDevs.onclick=_=>feedBackBox();
    this.back.onclick=_=> this.undoAndReturn();
    this.logout.onclick=(_) => {
      showLoader();
      finishSession(client.admin, (_) => {
        relocate(locate.admin.login, { target: locate.admin.target.manage ,section:this.sectionsArray[this.displayIndex]});
      });
    };
  }
  handleTabClicks = (event, clickables, showables, showClass, hideClass) => {
    var e = event.currentTarget;
    for (var k = 0; k < clickables.length; k++) {
      var condition = e == clickables[k];
      if (condition) {
        const query = window.location.search;
        window.history.pushState(
          "object or string",
          "Management",
          query.replace(
            query.substr(query.lastIndexOf("=")),
            `=${this.sectionsArray[k]}`
          )
          );
          this.displayIndex = k;
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
  constructor(data) {
    this.name = new Editable(
      "adminName",
      "adminnameeditor",
      new TextInput(
        "adminnamefield",
        "adminnameinput",
        "adminnameerror",
        validType.name
      ),
      "editadminname",
      "adminnameview",
      "saveadminname",
      "canceladminname"
    );

    this.email = getElement("adminEmailAddress");

    this.phone = new Editable(
      "adminPhoneNumber",
      "adminphoneeditor",
      new TextInput(
        "adminphonefield",
        "adminphoneinput",
        "adminphoneerror",
        validType.phone
      ),
      "editadminphone",
      "adminphoneview",
      "saveadminphone",
      "canceladminphone"
    );

    this.name.onSave((_) => {
      this.name.validateInputNow();
      if (!this.name.isValidInput()) return;
      this.name.disableInput();
      if (this.name.getInputValue() == this.name.displayText()) {
        localStorage.setItem("username", this.name.getInputValue());
        return this.name.clickCancel();
      }
      showLoader();
      postJsonData(post.admin.self, {
        target: "account",
        action: code.action.CHANGE_NAME,
        newname: this.name.getInputValue(),
      }).then((resp) => {
        if (resp.event == code.OK) {
          localStorage.setItem("username", this.name.getInputValue());
          this.name.setDisplayText(this.name.getInputValue());
          this.name.display();
        } else {
          snackBar("Unable to save");
        }
        hideLoader();
      });
    });

    this.phone.onSave((_) => {
      this.phone.validateInputNow();
      if (!this.phone.isValidInput()) return;
      this.phone.disableInput();
      if (this.phone.getInputValue() == this.phone.displayText()) {
        return this.phone.clickCancel();
      }
      showLoader();
      postJsonData(post.admin.self, {
        target: "account",
        action: code.action.CHANGE_PHONE,
        newphone: this.phone.getInputValue(),
      }).then((resp) => {
        if (resp.event == code.OK) {
          this.phone.setDisplayText(this.phone.getInputValue());
          this.phone.display();
        } else {
          snackBar("Unable to save");
        }
        hideLoader();
      });
    });
    this.creationTime = getElement("adminCreationTime");

    class Preferences {
      constructor() {
        this.showphoneteacher = new Switch("teacherphonevcheck");
        this.showphonestudent = new Switch("studentphonevcheck");
        this.showmailteacher = new Switch("teachermailvcheck");
        this.showmailstudent = new Switch("studentmailvcheck");

        this.showphoneteacher.onTurnChange(
          (_) => {
            postJsonData(post.admin.self, {
              target: "preferences",
              action: action.set,
              specific: "showphonetoteacher",
              show: true,
            }).then((response) => {
              this.showphoneteacher.turn(response.event == code.OK);
            });
          },
          (_) => {
            postJsonData(post.admin.self, {
              target: "preferences",
              action: action.set,
              specific: "showphonetoteacher",
              show: false,
            }).then((response) => {
              this.showphoneteacher.turn(response.event != code.OK);
            });
          }
        );
        this.showphonestudent.onTurnChange(
          (_) => {
            postJsonData(post.admin.self, {
              target: "preferences",
              action: action.set,
              specific: "showphonetostudent",
              show: true,
            }).then((response) => {
              this.showphonestudent.turn(response.event == code.OK);
            });
          },
          (_) => {
            postJsonData(post.admin.self, {
              target: "preferences",
              action: action.set,
              specific: "showphonetostudent",
              show: false,
            }).then((response) => {
              this.showphonestudent.turn(response.event != code.OK);
            });
          }
        );
        this.showmailteacher.onTurnChange(
          (_) => {
            postJsonData(post.admin.self, {
              target: "preferences",
              action: action.set,
              specific: "showemailtoteacher",
              show: true,
            }).then((response) => {
              this.showmailteacher.turn(response.event == code.OK);
            });
          },
          (_) => {
            postJsonData(post.admin.self, {
              target: "preferences",
              action: action.set,
              specific: "showemailtoteacher",
              show: false,
            }).then((response) => {
              this.showmailteacher.turn(response.event != code.OK);
            });
          }
        );
        this.showmailstudent.onTurnChange(
          (_) => {
            postJsonData(post.admin.self, {
              target: "preferences",
              action: action.set,
              specific: "showemailtostudent",
              show: true,
            }).then((response) => {
              this.showmailstudent.turn(response.event == code.OK);
            });
          },
          (_) => {
            postJsonData(post.admin.self, {
              target: "preferences",
              action: action.set,
              specific: "showemailtostudent",
              show: false,
            }).then((response) => {
              this.showmailstudent.turn(response.event != code.OK);
            });
          }
        );
      }
    }
    new Preferences();
    this.inviteadmin = new Button("inviteadmin");
    this.inviteadmin.onclick(_=>{
      const adminlink = new Dialog();
      adminlink.transparent();
      adminlink.loader();
      postJsonData(post.admin.manage, {
        type: "invitation",
        action: action.create,
        target: client.admin,
      }).then(response=>{
        if (
          response.event == code.invite.LINK_EXISTS ||
          response.event == code.invite.LINK_CREATED
        ) {
          let linkdialog = new Dialog();
          linkdialog.setDisplay(
            "Admin Invitation Link",
            `<center>
              <a href="${response.link}" target="_blank" rel="noreferrer">${response.link}</a>
              <br/>This Link will automatically expire on <b>${getProperDate(String(response.exp))}</b><br/>
            </center>`,true
          );
          new QRCode(getElement(linkdialog.imagedivId),response.link);
          linkdialog.createActions(
            ["Disable Link", "Copy", "Done"],
            [actionType.negative, actionType.positive, actionType.neutral]
          );
          linkdialog.onButtonClick(
            [
              (_) => {
                linkdialog.loader();
                revokeLink(client.admin);
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
            ]
          );
          linkdialog.show();
        }
        switch (response.event) {
          case code.invite.LINK_EXISTS:
            return snackBar("This link already exists and can be shared.");
          case code.invite.LINK_CREATED:
            return snackBar("Share this with the administrator.");
          case code.invite.LINK_CREATION_FAILED:
            return snackBar(`Unable to generate link:${response.msg}`, "Report");
          default:
            return snackBar(`Error:${response.event}:${response.msg}`, "Report");
        }
      })
    })
  }
}

class Institution {
  constructor() {
    this.name = new Editable(
      "instituteName",
      "institutenameeditor",
      new TextInput(
        "institutenamefield",
        "institutenameinput",
        "institutenameerror",
        validType.name
      ),
      "editinstitutename",
      "institutenameview",
      "saveinstitutename",
      "cancelinstitutename"
    );
    this.name.onSave((_) => {
      this.name.validateInputNow();
      if (!this.name.isValidInput()) return;
      this.name.disableInput();
      if (this.name.getInputValue() == this.name.displayText()) {
        return this.name.clickCancel();
      }
      showLoader();
      postJsonData(post.admin.default, {
        target: "institute",
        action: code.action.CHANGE_NAME,
        newname: this.name.getInputValue(),
      }).then((resp) => {
        if (resp.event == code.OK) {
          this.name.setDisplayText(this.name.getInputValue());
          this.name.display();
        } else {
          snackBar("Unable to save");
        }
        hideLoader();
      });
    });

    this.phone = new Editable(
      "institutePhone",
      "institutephoneeditor",
      new TextInput(
        "institutephonefield",
        "institutephoneinput",
        "institutephoneerror",
        validType.phone
      ),
      "editinstitutephone",
      "institutephoneview",
      "saveinstitutephone",
      "cancelinstitutephone"
    );
    this.phone.onSave((_) => {
      this.phone.validateInputNow();
      if (!this.phone.isValidInput()) return;
      this.phone.disableInput();
      if (this.phone.getInputValue() == this.phone.displayText()) {
        return this.phone.clickCancel();
      }
      showLoader();
      postJsonData(post.admin.default, {
        target: "institute",
        action: code.action.CHANGE_PHONE,
        newphone: this.phone.getInputValue(),
      }).then((resp) => {
        if (resp.event == code.OK) {
          this.phone.setDisplayText(this.phone.getInputValue());
          this.phone.display();
        } else {
          snackBar("Unable to save");
        }
        hideLoader();
      });
    });

    this.mail = new Editable(
      "instituteMail",
      "institutemaileditor",
      new TextInput(
        "institutemailfield",
        "institutemailinput",
        "institutemailerror",
        validType.email
      ),
      "editinstitutemail",
      "institutemailview",
      "saveinstitutemail",
      "cancelinstitutemail"
    );

    this.mail.onSave((_) => {
      this.mail.validateInputNow();
      if (!this.mail.isValidInput()) return;
      this.mail.disableInput();
      if (this.mail.getInputValue() == this.mail.displayText()) {
        return this.mail.clickCancel();
      }
      showLoader();
      postJsonData(post.admin.default, {
        target: "institute",
        action: code.action.CHANGE_ID,
        newemail: this.mail.getInputValue(),
      }).then((resp) => {
        if (resp.event == code.OK) {
          this.mail.setDisplayText(this.mail.getInputValue());
          this.mail.display();
        } else {
          snackBar("Unable to save");
        }
        hideLoader();
      });
    });

    this.uiid = getElement("uiid");
    this.subscriptionTill = getElement("subscriptionTill");

    class Preferences {
      constructor() {
        this.allowteacherschedule = new Switch("teachereditschedule");
        this.scheduleActive = new Switch("scheduleactive");
        new ThemeSwitch('darkmode');
        this.allowteacherschedule.onTurnChange(
          (_) => {
            postJsonData(post.admin.manage, {
              type: "preferences",
              action: action.set,
              specific: "allowTeacherAddSchedule",
              allow: true,
            }).then((resp) => {
              this.allowteacherschedule.turn(resp.event == code.OK);
            });
          },
          (_) => {
            postJsonData(post.admin.manage, {
              type: "preferences",
              action: action.set,
              specific: "allowTeacherAddSchedule",
              allow: false,
            }).then((resp) => {
              this.allowteacherschedule.turn(resp.event != code.OK);
            });
          }
        );
        this.scheduleActive.onTurnChange(
          (_) => {
            postJsonData(post.admin.manage, {
              type: "preferences",
              action: action.set,
              specific: "active",
              active: true,
            }).then((resp) => {
              this.scheduleActive.turn(resp.event == code.OK);
            });
          },
          (_) => {
            postJsonData(post.admin.manage, {
              type: "preferences",
              action: action.set,
              specific: "active",
              active: false,
            }).then((resp) => {
              this.scheduleActive.turn(resp.event != code.OK);
            });
          }
        );
      }
    }
    new Preferences();
  }
}
class Schedule {
  constructor() {
    this.start = new Editable(
      "start",
      "starteditor",
      new TextInput(
        "startfield",
        "startinput",
        "starterror",
        validType.nonempty
      ),
      "editstart",
      "startView",
      "savestart",
      "cancelstart"
    );
    this.breakstart = new Editable(
      "breakstart",
      "breakstarteditor",
      new TextInput(
        "breakstartfield",
        "breakstartinput",
        "breakstarterror",
        validType.nonempty
      ),
      "editbreakstart",
      "breakstartView",
      "savebreakstart",
      "cancelbreakstart"
    );
    this.periodduration = new Editable(
      "periodduration",
      "perioddurationeditor",
      new TextInput(
        "perioddurationfield",
        "perioddurationinput",
        "perioddurationerror",
        validType.nonempty
      ),
      "editperiodduration",
      "perioddurationView",
      "saveperiodduration",
      "cancelperiodduration"
    );
    this.breakduration = new Editable(
      "breakduration",
      "breakdurationeditor",
      new TextInput(
        "breakdurationfield",
        "breakdurationinput",
        "breakdurationerror",
        validType.nonempty
      ),
      "editbreakduration",
      "breakdurationView",
      "savebreakduration",
      "cancelbreakduration"
    );

    this.start.onSave((_) => {
      this.start.validateInputNow();
      if (!this.start.isValidInput()) return;
      this.start.disableInput();
      if (this.start.getInputValue() == this.start.displayText()) {
        return this.start.clickCancel();
      }
      showLoader();
      postJsonData(post.admin.default, {
        target: "timings",
        action: code.action.CHANGE_START_TIME,
        start: this.start.getInputValue(),
      }).then((resp) => {
        if (resp.event == code.OK) {
          this.start.setDisplayText(this.start.getInputValue());
          this.start.display();
        } else {
          snackBar("Unable to save");
        }
        hideLoader();
      });
    });
    this.breakstart.onSave((_) => {
      this.breakstart.validateInputNow();
      if (!this.breakstart.isValidInput()) return;
      this.breakstart.disableInput();
      if (this.breakstart.getInputValue() == this.breakstart.displayText()) {
        return this.breakstart.clickCancel();
      }
      showLoader();
      postJsonData(post.admin.default, {
        target: "timings",
        action: code.action.CHANGE_BREAK_START_TIME,
        breakstart: this.breakstart.getInputValue(),
      }).then((resp) => {
        if (resp.event == code.OK) {
          this.breakstart.setDisplayText(this.breakstart.getInputValue());
          this.breakstart.display();
        } else {
          snackBar("Unable to save");
        }
        hideLoader();
      });
    });
    this.periodduration.onSave((_) => {
      this.periodduration.validateInputNow();
      if (!this.periodduration.isValidInput()) return;
      this.periodduration.disableInput();
      if (
        this.periodduration.getInputValue() == this.periodduration.displayText()
      ) {
        return this.periodduration.clickCancel();
      }
      showLoader();
      postJsonData(post.admin.default, {
        target: "timings",
        action: code.action.CHANGE_PERIOD_DURATION,
        periodduration: this.periodduration.getInputValue(),
      }).then((resp) => {
        if (resp.event == code.OK) {
          this.periodduration.setDisplayText(
            this.periodduration.getInputValue()
          );
          this.periodduration.display();
        } else {
          snackBar("Unable to save");
        }
        hideLoader();
      });
    });
    this.breakduration.onSave((_) => {
      this.breakduration.validateInputNow();
      if (!this.breakduration.isValidInput()) return;
      this.breakduration.disableInput();
      if (
        this.breakduration.getInputValue() == this.breakduration.displayText()
      ) {
        return this.breakduration.clickCancel();
      }
      showLoader();
      postJsonData(post.admin.default, {
        target: "timings",
        action: code.action.CHANGE_BREAK_DURATION,
        breakduration: this.breakduration.getInputValue(),
      }).then((resp) => {
        if (resp.event == code.OK) {
          this.breakduration.setDisplayText(this.breakduration.getInputValue());
          this.breakduration.display();
        } else {
          snackBar("Unable to save");
        }
        hideLoader();
      });
    });

    this.workDays = getElement("workdays");
    this.totalPeriods = getElement("totalPeriods");
    this.reschedule = getElement("reschedule");
    this.scheduler = new Dialog();
    this.reschedule.onclick = (_) => {
      this.rescheduleDefault();
      this.scheduler.show();
    };
  }
  rescheduleDefault(weekdays = false, periods = false) {
    this.scheduler.createActions(["Discard"], [actionType.neutral]);
    this.scheduler.onButtonClick(
      [(_) => {
        sessionStorage.clear();
        this.scheduler.hide();
      }]
    );
    this.scheduler.setDisplay(
      "Edit Schedule Structure",
      `
    <center class="negative">These actions will change the schedule structure, proceed with caution.</center>
    <br/>
    <div class="fmt-center">
      <button class="positive-button" id="editweekdays">Edit weekdays${
        weekdays ? "*" : ""
      }</button>
      <button class="positive-button" id="editperiods">Edit periods${
        periods ? "*" : ""
      }</button>
    </div>
  `
    );
    const editweek = getElement("editweekdays"),
      editperiods = getElement("editperiods");
    editweek.onclick = (_) => {
      this.rescheduleWeekEditor();
    };
    editperiods.onclick = (_) => {
      this.reschedulePeriodsEditor();
    };
  }
  reschedulePeriodsEditor() {
    let periods = Number(this.totalPeriods.innerHTML);
    let editcontent = "";
    for (let p = 0; p < periods; p++) {
      editcontent += `<div class="fmt-row tab-view" id="periodrow${p}">
        <div class="fmt-col fmt-half">
          Period ${addNumberSuffixHTML(p + 1)}
        </div>
        <div class="fmt-col fmt-half">
          <button class="negative-button fmt-right caption" id="deleteperiod${p}">Delete</button>
          <button class="warning-button fmt-right caption" id="switchperiod${p}">Switch</button>
        </div>
      </div>`;
    }
    this.scheduler.setDisplay(
      "Periods Editor",
      `<center class="negative">These actions will change the periods, proceed with caution.</center>
      ${getButton('addperiod','Add period')}
      <br/>
      <div class="fmt-row">
        ${editcontent}
      </div>`
    );
    getElement("addperiod").onclick=_=>{
      this.scheduler.setDisplay('Insert new period',`<center>Add a new (${addNumberSuffixHTML(periods+1)}) period in everyone's daily schedule.<br/>The period will be set to free by default.</center>
      `)
      this.scheduler.createActions(
        [`Back`, `Create ${addNumberSuffixHTML(periods+1)} period`],
        [actionType.neutral, actionType.warning]
      );
      this.scheduler.onButtonClick([
        (_) => {
          this.scheduler.createInputs();
          this.reschedulePeriodsEditor();
        },
        (_) => {
          this.scheduler.loader();
          postJsonData(post.admin.schedule, {
            target: client.teacher,
            action: action.update,
            specific: code.action.ADD_PERIOD,
            newperiod: periods+1,
          }).then(resp=>{
            if(resp.event == code.OK){
              snackBar(`${addNumberSuffixHTML(periods+1)} period has been created for everyone.`);
              return this.restartView();
            }
            this.scheduler.loader(false);
            switch(resp.event){
              default:snackBar('An error occurred','Report',false);
            }
          })
        }
      ]);
    }
    const periodrows = [];
    const switchperiods = [];
    const deleteperiods = [];
    let remainingperiods = periods;
    for (let p = 0; p < periods; p++) {
      periodrows.push(getElement(`periodrow${p}`));
      switchperiods.push(getElement(`switchperiod${p}`));
      switchperiods[p].onclick = (_) => {
        this.scheduler.setDisplay(
          `Switch ${addNumberSuffixHTML(p+1)} period`,
          `<center>Provide the period number which you want to transfer or exchange schedule of everyone's <b>${addNumberSuffixHTML(p+1)} period</b> with.</center>`
        );
        this.scheduler.createInputs(
          ["Period number"],
          [`A number between 1 and ${periods}`],
          ["number"],
          [validType.naturalnumber]
        );
        this.scheduler.getInput(0).max = periods;
        this.scheduler.getInput(0).min = 1;
        this.scheduler.validate();
        this.scheduler.createActions(
          [`Back`, `Switch ${addNumberSuffixHTML(p+1)} period`],
          [actionType.neutral, actionType.warning]
        );
        this.scheduler.onButtonClick([
          (_) => {
            this.scheduler.createInputs([]);
            this.reschedulePeriodsEditor();
          },
          (_) => {

            if (!this.scheduler.allValid()||Number(this.scheduler.getInputValue(0))<1||Number(this.scheduler.getInputValue(0))>periods) return this.scheduler.validateNow();
            this.scheduler.loader();
            postJsonData(post.admin.schedule, {
              target: client.teacher,
              action: action.update,
              specific: code.action.SWITCH_PERIODS,
              oldperiod: p,
              newperiod: Number(this.scheduler.getInputValue(0).trim())-1,
            }).then((response) => {

              if (response.event == code.OK) {
                this.scheduler.loader(false);
                snackBar(
                  `${addNumberSuffixHTML(p+1)} has been switched with ${addNumberSuffixHTML(this.scheduler.getInputValue(0))} period.`
                );
                this.restartView();
              } else {
                snackBar("Couldn't change period.", "Report");
              }
            });
          },
        ]);
      };
      deleteperiods.push(getElement(`deleteperiod${p}`));
      deleteperiods[p].onclick = (_) => {
        snackBar(`Delete period ${p+1} from every schedule?`, "Delete", false, (_) => {
          deleteperiods[p].onclick = (_) => {};
          this.scheduler.loader();
          snackBar(`Deleting period ${p+1}...`);
          postJsonData(post.admin.schedule, {
            target: client.teacher,
            action: action.update,
            specific: code.action.REMOVE_PERIOD,
            period: p,
          }).then((response) => {
            this.scheduler.loader(false);
            if (response.event == code.OK) {
              remainingperiods--;
              periods--;
              if(remainingperiods<1){
                this.scheduler.createActions(['Set periods']);
                this.scheduler.onButtonClick([_=>{
                  location.reload();
                }]);
              }
              hide(periodrows[p]);
              this.totalPeriods.innerHTML = Number(this.totalPeriods.innerHTML) - 1;
              snackBar(
                `${p+1} was removed from every schedule`,
                "Refresh",
                true,
                (_) => {
                  location.reload();
                }
              );
            } else {
              snackBar(`Unable to remove ${p+1} from every schedule`, "Report");
            }
          });
        });
      };
    };
    this.scheduler.createActions(
      [`Back`,'Cancel'],
      [actionType.neutral, actionType.positive]
    );
    this.scheduler.onButtonClick([_=>{
      this.rescheduleDefault();
    },_=>{
      this.scheduler.hide();
    }])
  }
  rescheduleWeekEditor() {
    const days = this.workDays.innerHTML.split(",");
    days.forEach((day,d)=>days[d] = day.trim());
    const daysindices = [days.length];
    let editcontent = constant.nothing;
    days.forEach((day, d) => {
      daysindices[d] = constant.weekdayscasual.indexOf(
        day.toLowerCase().trim()
      );
      editcontent += `<div class="fmt-row tab-view" id="dayrow${d}">
          <div class="fmt-col fmt-half">
            ${day}
          </div>
          <div class="fmt-col fmt-half">
            <button class="negative-button fmt-right caption" id="deleteday${d}">Delete</button>
            <button class="warning-button fmt-right caption" id="switchday${d}">Switch</button>
          </div>
      </div>
      `;
    });
    this.scheduler.setDisplay(
      "Weekdays Editor",
      `
    <center class="negative">These actions will change the weekdays, proceed with caution.</center>
    ${getButton('addday','Add day')}
    <br/>
    <div class="fmt-row">
      ${editcontent}
    </div>`
    );
    getElement("addday").onclick=_=>{
      this.scheduler.setDisplay('Insert new day',`<center>Add a new day in everyone's schedule.<br/>The periods of this day will be set to free by default.</center>
      `)
      this.scheduler.createInputs(
        ['New day name'],
        ['Type the new day to be inserted'],
        ['text'],
        [validType.weekday]
      );
      this.scheduler.validate();
      this.scheduler.createActions(
        [`Back`, `Create day`],
        [actionType.neutral, actionType.warning]
      );
      this.scheduler.onButtonClick([
        (_) => {
          this.scheduler.createInputs([]);
          this.rescheduleWeekEditor();
        },
        (_) => {
          if (!this.scheduler.allValid()) return this.scheduler.validateNow();
          this.scheduler.loader();
          postJsonData(post.admin.schedule, {
            target: client.teacher,
            action: action.update,
            specific: code.action.ADD_DAY,
            newdayindex: constant.weekdayscasual.indexOf(
              this.scheduler.getInputValue(0).toLowerCase().trim()
            ),
          }).then(resp=>{
            if(resp.event == code.OK){
              snackBar(`${this.scheduler.getInputValue(0)} is now a working day.`);
              return this.restartView();
            }
            this.scheduler.loader(false);
            switch(resp.event){
              case code.schedule.WEEKDAY_EXISTS:{
                return this.scheduler.showFieldError(0,`${this.scheduler.getInputValue(0)} is already in schedule.`);
              };
              default:snackBar('An error occurred','Report',false);
            }
          })
        }
      ]);
    }
    const dayrows = [];
    const switchdays = [];
    const deleteDays = [];
    let remainingdays = days.length;
    days.forEach((day, d) => {
      dayrows.push(getElement(`dayrow${d}`));
      switchdays.push(getElement(`switchday${d}`));
      switchdays[d].onclick = (_) => {
        this.scheduler.setDisplay(
          `Switch ${day}`,
          `
          <center>Provide the day which you want to transfer or exchange everyone's schedule of <b>${day}</b> with.</center>
        `
        );
        this.scheduler.createInputs(
          ["Weekday name"],
          [`${day}'s schedule will be transferred to or exchanged with`],
          ["text"],
          [validType.weekday]
        );
        this.scheduler.validate();
        this.scheduler.createActions(
          [`Back`, `Switch ${day}`],
          [actionType.neutral, actionType.warning]
        );
        this.scheduler.onButtonClick([
          (_) => {
            this.scheduler.createInputs([]);
            this.rescheduleWeekEditor();
          },
          (_) => {
            if (!this.scheduler.allValid()) return this.scheduler.validateNow();
            this.scheduler.loader();
            postJsonData(post.admin.schedule, {
              target: client.teacher,
              action: action.update,
              specific: code.action.SWITCH_DAY,
              switchclash:true,
              olddayindex: daysindices[d],
              newdayindex: constant.weekdayscasual.indexOf(
                this.scheduler.getInputValue(0).toLowerCase().trim()
              ),
            }).then((response) => {
              if (response.event == code.OK) {
                this.scheduler.loader(false);
                snackBar(
                  `${day} has been switched with ${this.scheduler.getInputValue(
                    0
                  )}`
                );
                
                this.restartView();
              } else {
                snackBar("Could'nt change weekdays", "Report");
              }
            });
          },
        ]);
      };
      deleteDays.push(getElement(`deleteday${d}`));
      deleteDays[d].onclick = (_) => {
        snackBar(`Delete ${day} from every schedule?`, "Delete", false, (_) => {
          deleteDays[d].onclick = (_) => {};
          this.scheduler.loader();
          snackBar(`Deleting ${day}...`);
          postJsonData(post.admin.schedule, {
            target: client.teacher,
            action: action.update,
            specific: code.action.REMOVE_DAY,
            removedayindex: daysindices[d],
          }).then((response) => {
            this.scheduler.loader(false);
            if (response.event == code.OK) {
              remainingdays--;
              if(remainingdays<1){
                this.scheduler.createActions(['Set days']);
                this.scheduler.onButtonClick([_=>{
                  location.reload();
                }]);
              }
              hide(dayrows[d]);
              snackBar(
                `${day} was removed from every schedule`,
                "Refresh",
                true,
                (_) => {
                  location.reload();
                }
              );
            } else {
              snackBar(`Unable to remove ${day} from every schedule`, "Report");
            }
          });
        });
      };
    });
    this.scheduler.createActions(["Back", "Cancel"], [actionType.neutral]);
    this.scheduler.onButtonClick([
      (_) => {
        this.rescheduleDefault();
      },
      (_) => {
        this.scheduler.hide();
      },
    ]);
  }

  restartView() {
    this.scheduler.setDisplay(
      "Load Changes",
      `<center class="active">Changes were applied successfully.<br/>A restart is required to load changes.</center>`
    );
    this.scheduler.createInputs();
    this.scheduler.createActions(["Restart now"], [actionType.positive]);
    this.scheduler.onButtonClick([
      (_) => {
        this.scheduler.loader();
        location.reload();
      },
    ]);
    let i = 10;
    setInterval(() => {
      this.scheduler.getDialogButton(0).innerHTML = `Restart now (${i})`;
      i -= 1;
      if (i == 0) {
        this.scheduler.getDialogButton(0).click();
      }
    }, 1000);
  }
}
class Security {
  constructor() {
    this.resetPass = getElement("resetPasswordButton");
    this.sendpasslink = getElement("sendpasswordlink");

    resumeElementRestriction(this.sendpasslink,"sendpasslink",_=>{
      this.sendpasslink.onclick = (_) => {
        this.linkSender();
      };
    });

    this.resetMail = getElement("resetMailButton");
    this.backup = getElement("instbackup");

    resumeElementRestriction(this.backup,"backupinst",_=>{
      this.backup.onclick=_=>{
        const backup = this.backup.onclick;
        this.backup.onclick=_=>{};
        snackBar('Generating backup file...');
        showLoader();
        postJsonData(post.admin.default,{
          target:code.inst.BACKUP_INSTITUTION
        }).then(resp=>{
          snackBar('Backup file generated. Save that file securely, and only provide that file to Schemester when required.');
          hideLoader();
          restrictElement(this.backup,60,"backupinst",_=>{
            this.backup.onclick=backup;
          });
          refer(resp.url);
        }).catch(err=>{
          clog(err);
        })
      }
    });
    this.deleteAccount = getElement("deleteAdminAccount");
    this.deleteInstitute = getElement("deleteInstitute");

    this.resetPass.onclick = (_) => {
      authenticateDialog(client.admin, (_) => {
        resetPasswordDialog(client.admin, true);
      });
    };
    
    this.resetMail.onclick = (_) => {
      changeEmailBox(client.admin);
    };
    this.deleteAccount.onclick=(_) => {
        authenticateDialog(
          client.admin,
          (_) => {
            const delconf = new Dialog();
            delconf.setDisplay(
              "Delete Account?",
              `Are you sure you want to delete your Schemester account <b>${localStorage.getItem(
                "id"
              )}</b> permanently? The following consequencies will take place:<br/>
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
            const deluiid = new TextInput(
              "deluiidfield",
              "deluiidinput",
              "deluiiderror",
              validType.nonempty
            );
            const deletinstituteswitch = new Switch("deleteinstituteswitch");
            deletinstituteswitch.onTurnChange(
              (_) => {
                deluiid.validate();
                deluiid.show();
              },
              (_) => {
                deluiid.hide();
              }
            );
            delconf.setBackgroundColorType(bodyType.negative);
            delconf.createActions(
              [`Delete account & Institution`, "No, step back"],
              [actionType.negative, actionType.positive]
            );
            delconf.onButtonClick(
              [
                (_) => {
                  
                },
                (_) => {
                  delconf.hide();
                }
              ]
            );
            restrictElement(delconf.getDialogButton(0),15,"admindelacc",_=>{
              delconf.getDialogButton(0).onclick=_=>{
                if (deletinstituteswitch.isOn()) {
                  if (!deluiid.isValid()) {
                    return deluiid.validateNow();
                  }
                }
                delconf.loader();
                deluiid.disableInput();
                postJsonData(post.admin.self, {
                  target: "account",
                  action: code.action.ACCOUNT_DELETE,
                  uiid: deluiid.getInput().trim(),
                }).then((response) => {
                  if (response.event == code.OK) {
                    relocate(locate.root);
                  } else {
                    delconf.loader(false);
                    deluiid.enableInput();
                    if (response.event == code.auth.WRONG_UIID) {
                      return deluiid.showError("Wrong UIID");
                    } else {
                      snackBar("Action Failed");
                    }
                  }
                });
              }
              let time = 60;
              let timer = setInterval(() => {
                time--;
                delconf.getDialogButton(0).innerHTML = `Delete account (${time}s)`;
                if (time == 0) {
                  clearInterval(timer);
                  delconf.hide();
                  snack.hide();
                }
              }, 1000);
            });
          },
        true,true
      );
    }

    this.deleteInstitute.onclick=_=>{
      authenticateDialog(client.admin,_=>{
        const delinst = new Dialog();
        delinst.setHeadingColor(colors.negative);
        delinst.setBackgroundColorType(bodyType.negative);
        delinst.setDisplay('Delete Institute?',`
          <div class="fmt-center">
            <div class="questrial group-text negative">This action is permanent, and kk will be completely removed.</div>
            <div class="questrial group-text">Type the uiid of your institution to delete it.</div>
            ${getInputField('deluiidfield','deluiidcap','deluiid','deluiiderror')}<br/>
            <button class="fmt-row positive-button questrial" id="downloadinst">Download Institute Backup</button><br/>
            <div class="fmt-row active caption">It is recommended to download a backup of your institution, which includes all schedule, settings, and user accounts, as a precautionary measure.</div>
          </div>`
        );
        const deluiid = new TextInput('deluiidfield','deluiid','deluiiderror',validType.nonempty,'deluiidcap');
        deluiid.setFieldCaption('UIID');
        deluiid.setInputAttrs(`Type your institute's unique ID`);
        const downloadinst = getElement("downloadinst");
        downloadinst.onclick=_=>{
          snackBar('Generating backup file...');
          postJsonData(post.admin.default,{
            target:code.inst.BACKUP_INSTITUTION
          }).then(resp=>{
            snackBar('Backup file generated. Save that file securely, and only provide that file to Schemester when required.');
            refer(resp.url);
          }).catch(err=>{
            clog(err);
          })
        }
        delinst.createActions(['Abort','Delete Institution Permanently'],[actionType.positive,actionType.negative]);
        delinst.onButtonClick([_=>{
          delinst.hide();
        },_=>{
          
        }]);
        restrictElement(delinst.getDialogButton(1),15,"delinst",_=>{
          delinst.getDialogButton(1).onclick=_=>{
            if (!deluiid.isValid()) {
              return deluiid.validateNow();
            }
            delinst.loader();
            deluiid.disableInput();
            postJsonData(post.admin.default, {
              target: "institute",
              action: code.action.INSTITUTE_DELETE,
              uiid: deluiid.getInput().trim(),
            }).then((response) => {
              if (response.event == code.OK) {
                return relocate(locate.root,{client:client.admin});
              } else {
                delinst.loader(false);
                deluiid.enableInput();
                if (response.event == code.auth.WRONG_UIID) {
                  return deluiid.showError("Wrong UIID");
                } else {
                  snackBar("Action Failed");
                }
              }
            });
          }
          let time = 60;
          const timer = setInterval(() => {
            time--;
            delinst.getDialogButton(1).innerHTML = `Delete Institute (${time}s)`;
            if (time == 0) {
              clearInterval(timer);
              delinst.hide();
            }
          }, 1000);
        });
        delinst.show();
      },true,true)
    }
  }

  linkSender() {
    this.sendpasslink.onclick=_=>{};
    postJsonData(post.admin.manage, {
      type: "resetpassword",
      action: "send",
    }).then((response) => {
      if (response.event == code.mail.MAIL_SENT) {
        snackBar("A link for password reset has been sent to your email address.");
        restrictElement(this.sendpasslink,120,"sendpasslink",_=>{
          this.sendpasslink.onclick=_=>{
            this.linkSender();
          }
        });
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
    this.invite.onclick = (_) => {
      linkGenerator(client.teacher);
    };
    class Teacher {
      constructor() {
        this.listview = getElement("teacherList");
        this.search = getElement("teacherSearch");
        this.load(false);
        this.search.oninput = (_) => {
          if (
            this.search.value &&
            this.search.value.trim() != "@" &&
            this.search.value.trim() != "." &&
            this.search.value.trim() != constant.nothing
          ) {
            this.load();
            postJsonData(post.admin.manage, {
              target: client.teacher,
              type: "search",
              q: this.search.value.trim(),
            }).then((resp) => {
              if (resp.event == code.OK) {
                if (resp.teachers.length < 1) {
                  return this.nouserfound();
                }
                let listitems = constant.nothing;
                resp.teachers.forEach((teacher, t) => {
                  listitems += this.getSlate(
                    teacher.username,
                    teacher.teacherID,
                    t
                  );
                });
                this.listview.innerHTML = listitems;
                const slates = [];
                resp.teachers.forEach((teacher, t) => {
                  slates.push(getElement(`teacherslate${t}`));
                  slates[t].onclick = (_) => {
                    refer(locate.admin.session, {
                      target: locate.admin.target.viewschedule,
                      type: client.teacher,
                      t: teacher.teacherUID,
                    });
                  };
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
      getSlate(name, email, index) {
        return `<button class="fmt-row wide neutral-button fmt-padding" style="margin:4px 0px" id="teacherslate${index}">
        <div class="fmt-col fmt-twothird group-text">
          <span class="positive" id="teachername${index}">${name}</span><br/>
          <span class="questrial" id="teachermail${index}">${email}</span>
        </div>
        </button>`;
      }
      load(show = true) {
        show ? this.getLoaderView() : this.getDefaultView();
      }
      getLoaderView() {
        this.listview.innerHTML = `<div class="fmt-center" id="tlistLoader">
          <img class="fmt-spin" width="50" src="/graphic/blueLoader.svg"/>
        </div>`;
      }
      getDefaultView() {
        this.listview.innerHTML =
          '<div class="fmt-center group-text">Type to search.</div>';
      }
      nouserfound() {
        const query = window.location.search;
        this.listview.innerHTML = `<div class="fmt-center group-text">No user found. <a href="${query.replace(
          query.substr(query.lastIndexOf("=")),
          `=${sectionsArray[2]}`
        )}">Try in schedule</a>?</div>`;
      }
    }
    this.teacher = new Teacher();

    class Classes {
      constructor() {
        this.listview = getElement("classList");
        this.search = getElement("classSearch");
        this.load(false);
        this.search.oninput = (_) => {
          if (
            this.search.value &&
            this.search.value.trim() != "@" &&
            this.search.value.trim() != "." &&
            this.search.value.trim() != constant.nothing
          ) {
            this.load();
            postJsonData(post.admin.manage, {
              target: client.student,
              type: "search",
              q: this.search.value.trim(),
            }).then((resp) => {
              if (resp.event == code.OK) {
                if (resp.classes.length < 1) {
                  return this.noclassfound();
                }
                let listitems = constant.nothing;
                resp.classes.forEach((Class, t) => {
                  listitems += this.getSlate(
                    Class.classname,
                    Class.inchargeID,
                    t
                  );
                });
                this.listview.innerHTML = listitems;
                const slates = [];
                resp.classes.forEach((Class, t) => {
                  slates.push(getElement(`classslate${t}`));
                  slates[t].onclick = (_) => {
                    refer(locate.admin.session, {
                      target: locate.admin.target.viewschedule,
                      type: client.student,
                      c: Class.classUID,
                    });
                  };
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
      getSlate(name, email, index) {
        return `<button class="fmt-row wide neutral-button fmt-padding" style="margin:4px 0px" id="classslate${index}">
        <div class="fmt-col fmt-twothird group-text">
          <span class="positive" id="classname${index}">${name}</span><br/>
          <span class="questrial" id="classincharge${index}">${email}</span>
        </div>
        </button>`;
      }
      load(show = true) {
        show ? this.getLoaderView() : this.setDefaultView();
      }
      getLoaderView() {
        this.listview.innerHTML = `<div class="fmt-center" id="tlistLoader">
          <img class="fmt-spin" width="50" src="/graphic/blueLoader.svg"/>
        </div>`;
      }
      setDefaultView() {
        this.listview.innerHTML =
          '<div class="fmt-center group-text">Type to search.</div>';
      }
      noclassfound() {
        this.listview.innerHTML =
          '<div class="fmt-center group-text">No class found.</div>';
      }
    }
    try {
      this.classes = new Classes();
    } catch {}
  }
}

class ReceiveData{
  constructor(){
    this.totalotheradmins = Number(getElement('totalotheradmins').innerHTML)
    this.otheradmins = [];
    for(let o =0;o<this.totalotheradmins;o++){
      this.otheradmins.push({
        username:getElement(`otheradminname${o}`),
        email:getElement(`otheradminemail${o}`),
        phone:getElement(`otheradminphone${o}`)
      });
    }
  }
}

window.onload = (_) => (window.app = new Management());
