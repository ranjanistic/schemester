class Register {
  constructor() {
    this.greeting = getElement("greeting");
    this.greeting.innerHTML = "Registration";
    this.search = getElement("search");
    this.saveExit = getElement("saveandexit");
    this.settings = getElement("settingsButton");
    this.logout = getElement("logoutAdminButton");

    this.finalize = getElement("registrationComplete");
    this.stage1Loader = getElement("stage1load");
    this.stage2Loader = getElement("stage2load");

    this.saveExit.onclick = () => {
      relocate(locate.homepage);
    };

    this.settings.onclick = () => {
      refer(locate.adminSettings, {
        target: "manage",
      });
    };
    this.logout.onclick = () => {
      finishSession();
    };
  }
}

class Stage1 {
  constructor() {
    this.view = getElement("stage1");
    //this.nameField = new TextInput("adminNameField","adminName","adminNameError",null,validType.name);
    this.namedisplay = getElement("adminNameView");
    this.emaildisplay = getElement("adminEmailView");
    this.phoneField = new TextInput(
      "adminPhoneField",
      "adminPhone",
      "adminPhoneError",
      validType.phone
    );
    this.instNameField = new TextInput(
      "instNameField",
      "instName",
      "instNameError",
      validType.name
    );
    //this.instIdField = new TextInput("uiidField","uiid","uiidError",null,validType.username);
    this.uiidVIew = getElement("uiidView");
    this.instEmailField = new TextInput(
      "instEmailField",
      "instEmail",
      "instEmailError",
      validType.email
    );
    this.instPhoneField = new TextInput(
      "instPhoneField",
      "instPhone",
      "instPhoneError",
      validType.phone
    );

    this.phoneField.setInput(sessionStorage.getItem("adphone"));
    this.instNameField.setInput(sessionStorage.getItem("instname"));
    this.instEmailField.setInput(sessionStorage.getItem("instemail"));
    this.instPhoneField.setInput(sessionStorage.getItem("instphone"));

    this.save = getElement("saveStage1");
    this.phoneField.validate((_) => {
      this.instNameField.inputFocus();
      sessionStorage.setItem("adphone", this.phoneField.getInput());
    });
    this.instNameField.validate((_) => {
      this.instEmailField.inputFocus();
      sessionStorage.setItem("instname", this.instNameField.getInput());
    });
    this.instEmailField.validate((_) => {
      this.instPhoneField.inputFocus();
      sessionStorage.setItem("instemail", this.instEmailField.getInput());
    });
    this.instPhoneField.validate((_) => {
      sessionStorage.setItem("instphone", this.instPhoneField.getInput());
    });
    this.loader = getElement("stage1loader");
    hide(this.loader);
  }

  movetostage2 = (app, s2) => {
    this.load();
    clog("moving");
    if (
      !(
        this.phoneField.isValid() &&
        this.instNameField.isValid() &&
        this.instEmailField.isValid() &&
        this.instPhoneField.isValid()
      )
    ) {
      this.phoneField.validateNow((_) => {
        this.instNameField.inputFocus();
        sessionStorage.setItem("adphone", this.phoneField.getInput());
      });
      this.instNameField.validateNow((_) => {
        this.instEmailField.inputFocus();
        sessionStorage.setItem("instname", this.instNameField.getInput());
      });
      this.instEmailField.validateNow((_) => {
        this.instPhoneField.inputFocus();
        sessionStorage.setItem("instemail", this.instEmailField.getInput());
      });
      this.instPhoneField.validateNow((_) => {
        sessionStorage.setItem("instphone", this.instPhoneField.getInput());
      });
      clog("invalidmove");
      this.load(false);
    } else {
      this.saveLocally();
      hide(this.view);
      clog("moved");
      show(s2.view);
      app.greeting.innerHTML = `<button class="neutral-button" id="previousButton">Previous</button>`;
      getElement("previousButton").onclick = () => {
        this.backToStage1(app, s2);
      };
    }
  };
  saveLocally() {
    sessionStorage.setItem("adname", this.namedisplay.innerHTML);
    sessionStorage.setItem("ademail", this.emaildisplay.innerHTML);
    sessionStorage.setItem("adphone", this.phoneField.getInput());
    sessionStorage.setItem("instname", this.instNameField.getInput());
    sessionStorage.setItem("uiid", this.uiidVIew.innerHTML);
    sessionStorage.setItem("instemail", this.instEmailField.getInput());
    sessionStorage.setItem("instphone", this.instPhoneField.getInput());
  }
  backToStage1(app, s2) {
    hide(s2.view);
    show(this.view);
    app.greeting.innerHTML = "Registration";
    this.load(false);
  }
  load(show = true) {
    visibilityOf(this.save, !show);
    visibilityOf(this.loader, show);
  }
}
class Stage2 {
  constructor() {
    this.view = getElement("stage2");

    this.startTimeField = new TextInput(
      "startTimeField",
      "startTime",
      "startTimeError",
      validType.nonempty
    );
    this.endTimeField = new TextInput(
      "endTimeField",
      "endTime",
      "endTimeError",
      validType.nonempty
    );
    this.breakStartField = new TextInput(
      "breakStartField",
      "breakStart",
      "breakStartError",
      validType.nonempty
    );
    this.day1Field = new TextInput(
      "firstDayField",
      "firstDay",
      "firstDayError",
      validType.nonempty
    );
    this.eachDurationField = new TextInput(
      "eachDurationField",
      "eachDuration",
      "eachDurationError",
      validType.nonempty
    );
    this.totalDaysField = new TextInput(
      "totalDaysField",
      "totalDays",
      "totalDaysError",
      validType.nonempty
    );
    this.totalPeriodsField = new TextInput(
      "totalPeriodsField",
      "totalPeriods",
      "totalPeriodsError",
      validType.nonempty
    );
    this.breakDurationField = new TextInput(
      "breakDurationField",
      "breakDuration",
      "breakDurationError",
      validType.nonempty
    );

    this.startTimeField.setInput(sessionStorage.getItem("startTimeField"));
    this.endTimeField.setInput(sessionStorage.getItem("endTimeField"));
    this.breakStartField.setInput(sessionStorage.getItem("breakStartField"));
    this.day1Field.setInput(sessionStorage.getItem("day1Field"));
    this.eachDurationField.setInput(
      sessionStorage.getItem("eachDurationField")
    );
    this.totalDaysField.setInput(sessionStorage.getItem("totalDaysField"));
    this.totalPeriodsField.setInput(
      sessionStorage.getItem("totalPeriodsField")
    );
    this.breakDurationField.setInput(
      sessionStorage.getItem("breakDurationField")
    );

    this.startTimeField.validate((_) => {
      this.endTimeField.inputFocus(),
        sessionStorage.setItem(
          "startTimeField",
          this.startTimeField.getInput()
        );
    });
    this.endTimeField.validate((_) => {
      this.breakStartField.inputFocus(),
        sessionStorage.setItem("endTimeField", this.endTimeField.getInput());
    });
    this.breakStartField.validate((_) => {
      this.day1Field.inputFocus(),
        sessionStorage.setItem(
          "breakStartField",
          this.breakStartField.getInput()
        );
    });
    this.day1Field.validate((_) => {
      this.eachDurationField.inputFocus(),
        sessionStorage.setItem("day1Field", this.day1Field.getInput());
    });
    this.eachDurationField.validate((_) => {
      this.totalDaysField.inputFocus(),
        sessionStorage.setItem(
          "eachDurationField",
          this.eachDurationField.getInput()
        );
    });
    this.totalDaysField.validate((_) => {
      this.totalPeriodsField.inputFocus(),
        sessionStorage.setItem(
          "totalDaysField",
          this.totalDaysField.getInput()
        );
    });
    this.totalPeriodsField.validate((_) => {
      this.breakDurationField.inputFocus(),
        sessionStorage.setItem(
          "totalPeriodsField",
          this.totalPeriodsField.getInput()
        );
    });
    this.breakDurationField.validate((_) => {
      sessionStorage.setItem(
        "breakDurationField",
        this.breakDurationField.getInput()
      );
    });

    this.save = getElement("saveStage2");
  }

  saveInstitution() {
    if (
      !(
        this.startTimeField.isValid() &&
        this.endTimeField.isValid() &&
        this.breakStartField.isValid() &&
        this.day1Field.isValid() &&
        this.eachDurationField.isValid() &&
        this.totalDaysField.isValid() &&
        this.totalPeriodsField.isValid() &&
        this.breakDurationField.isValid()
      )
    ) {
      this.startTimeField.validateNow((_) => {
          sessionStorage.setItem(
            "startTimeField",
            this.startTimeField.getInput()
          );
      });
      this.endTimeField.validateNow((_) => {
        
          sessionStorage.setItem("endTimeField", this.endTimeField.getInput());
      });
      this.breakStartField.validateNow((_) => {
        this.day1Field.inputFocus();
          sessionStorage.setItem(
            "breakStartField",
            this.breakStartField.getInput()
          );
      });
      this.day1Field.validateNow((_) => {
        
          sessionStorage.setItem("day1Field", this.day1Field.getInput());
      });
      this.eachDurationField.validateNow((_) => {
        this.totalDaysField.inputFocus(),
          sessionStorage.setItem(
            "eachDurationField",
            this.eachDurationField.getInput()
          );
      });
      this.totalDaysField.validateNow((_) => {
        
          sessionStorage.setItem(
            "totalDaysField",
            this.totalDaysField.getInput()
          );
      });
      this.totalPeriodsField.validateNow((_) => {
        
          sessionStorage.setItem(
            "totalPeriodsField",
            this.totalPeriodsField.getInput()
          );
      });
      this.breakDurationField.validateNow((_) => {
        sessionStorage.setItem(
          "breakDurationField",
          this.breakDurationField.getInput()
        );
      });
    } else {
      this.saveLocally();
      let confirm = new Dialog();
      confirm.setDisplay(
        "Schedule",
        `Proceed to create schedule for <b>${sessionStorage.getItem(
          "instname"
        )}</b>?`
      );
      confirm.setBackgroundColor(colors.transparent, this.view);
      confirm.setDialogColor(colors.white);
      confirm.createActions(
        Array("Confirm & Proceed", "Re-check"),
        Array(actionType.active, actionType.warning)
      );
      confirm.onButtonClick(0, (_) => {
        confirm.hide();
        loadingBox(
          true,
          "Setting up",
          `Preparing <b>${sessionStorage.getItem(
            "instname"
          )}'s (${sessionStorage.getItem(
            "uiid"
          )})</b> schedule structure, please wait...`
        );
        snackBar(
          `Your institution's UIID is, <b>${sessionStorage.getItem(
            "uiid"
          )}</b>. Always keep this in your mind.`,
          "Understood"
        );

        const defdata = {
          adminname: sessionStorage.getItem("adname"),
          adminemail: sessionStorage.getItem("ademail"),
          adminphone: sessionStorage.getItem("adphone"),

          instname: sessionStorage.getItem("instname"),
          instemail: sessionStorage.getItem("instemail"),
          instphone: sessionStorage.getItem("instphone"),

          starttime: sessionStorage.getItem("startTimeField"),
          endtime: sessionStorage.getItem("endTimeField"),
          breakstarttime: sessionStorage.getItem("breakStartField"),
          firstday: sessionStorage.getItem("day1Field"),
          periodduration: sessionStorage.getItem("eachDurationField"),
          breakduration: sessionStorage.getItem("breakDurationField"),
          workingdays: sessionStorage.getItem("totalDaysField"),
          totalperiods: sessionStorage.getItem("totalPeriodsField"),
        };
        clog(getRequestBody(defdata));
         postData('/admin/session/registerinstitution',
          defdata
        ).then(response=>{
          clog((response));
          if(response.event == code.auth.SESSION_INVALID){
            relocate(locate.adminLoginPage,{target:'registration'});
            return;
          }
          if(response.event == code.inst.INSTITUTION_DEFAULTS_UNSET){
            loadingBox(false);
            snackBar(`Error:${response.event}:${response.msg}`,'Retry',false,_=>{
              confirm.getDialogButton(0).click();
            });
            return;
          }
          if(response.event == code.inst.INSTITUTION_DEFAULTS_SET){
            //todo: here, save defaults in index db, then hide loading box, and show the finish dialog.
            //then clear the session database.
            loadingBox(false);
            let finish = new Dialog();
            finish.setDisplay('Insitution Saved','The details have been saved successfully.');
            finish.createActions(Array('Add teachers','Skip'),Array(actionType.positive,actionType.neutral));
            finish.onButtonClick(0,_=>{
              snackBar("Under construction");
            });
            finish.onButtonClick(1,_=>{
              finish.loader();
              relocate(locate.adminDashPage,{
                u:localStorage.getItem(constant.sessionUID),
                target:'dashboard'
              });
            })
            finish.show(); 
          }
        });
      });
      confirm.onButtonClick(1, (_) => {
        confirm.hide();
      });
      confirm.show();
    }
  }
  saveLocally() {
    sessionStorage.setItem("startTimeField", this.startTimeField.getInput());
    sessionStorage.setItem("endTimeField", this.endTimeField.getInput());
    sessionStorage.setItem("breakStartField", this.breakStartField.getInput());
    sessionStorage.setItem("day1Field", this.day1Field.getInput());
    sessionStorage.setItem(
      "eachDurationField",
      this.eachDurationField.getInput()
    );
    sessionStorage.setItem("totalDaysField", this.totalDaysField.getInput());
    sessionStorage.setItem(
      "totalPeriodsField",
      this.totalPeriodsField.getInput()
    );
    sessionStorage.setItem(
      "breakDurationField",
      this.breakDurationField.getInput()
    );
  }
}

window.onload = (_) => {
  let app = new Register();
  let s1 = new Stage1();
  let s2 = new Stage2();
  show(s1.view);
  hide(s2.view);

  s1.save.onclick = () => {
    s1.movetostage2(app, s2);
  };
  s2.save.onclick = () => {
    s1.saveLocally();
    s2.saveInstitution();
  };

  getUserLocally().then((data) => {
    postData("/admin/session/receiveinstitution", {
      uiid: data.uiid,
      doc: "default",
    })
      .then((response) => {
        clog("receiver respnose inst");
        clog(data.uiid);
        if (response.event == code.inst.INSTITUTION_NOT_EXISTS) {
          postData("/admin/session/createinstitution", {
            uiid: data.uiid,
          })
            .then((resp) => {
              clog("resp");
              if (resp.event == code.inst.INSTITUTION_CREATION_FAILED) {
                clog("creationfauled");
                finishSession();
              } else {
                clog("doc default response");
                clog(jstr(response));
              }
            })
            .catch((error) => {
              clog("creation errror");
              snackBar(error, "Report");
            });
        } else {
          clog("doc default response");
          clog(jstr(response));
        }
      })
      .catch((error) => {
        clog("recevie inst errorrr");
        snackBar(error, "Report");
      });
  });

  // register.saveExit.onclick = _=>{

  //   showLoader();
  //   visibilityOf(register.saveExit,false);
  //   var data = [
  //     {
  //       type: kpath.admin,
  //       email: adminEmail,
  //       adminname: stage1.getName(),
  //       phone: stage1.getPhone(),
  //     },
  //     {
  //       type: kpath.institution,
  //       institutename: stage1.getInstName(),
  //       uiid: stage1.getInstID(),
  //     },
  //     {
  //       type: kpath.timings,
  //       startTime: stage2.getStartTime(),
  //       endTime: stage2.getEndTime(),
  //       breakStartTime: stage2.getBreakStart(),
  //       startDay: stage2.getFirstDay(),
  //       periodMinutes: stage2.getPeriodDuration(),
  //       breakMinutes: stage2.getBreakDuration(),
  //       totalDays: stage2.getTotalDays(),
  //       totalPeriods: stage2.getTotalPeriods(),
  //     },
  //   ];
  //   initiateIDB(stage1.getInstID(),_=>{
  //     saveDefaults(data,_=>{
  //       relocate(homepage);
  //     });
  //   });
  // }
  // stage1.save.onclick = _=> {
  //   visibilityOf(register.stage1Loader,true);
  //   visibilityOf(stage1.save,false);
  //   var data1 = [
  //     {
  //       type: kpath.admin,
  //       email: adminEmail,
  //       adminname: stage1.getName(),
  //       phone: stage1.getPhone(),
  //     },
  //     {
  //       type: kpath.institution,
  //       institutename: stage1.getInstName(),
  //       uiid: stage1.getInstID(),
  //     },
  //   ];
  //   initiateIDB(stage1.getInstID(),_=>{
  //     saveDefaults(data1,_=>{
  //       stage1.exist(false);
  //       stage2.exist(true);
  //     });
  //   });
  //   stage2.save.onclick = _=> {
  //     visibilityOf(register.stage2Loader,true);
  //     visibilityOf(stage2.save,false);
  //     var data2 = [
  //       {
  //         type: kpath.timings,
  //         startTime: stage2.getStartTime(),
  //         endTime: stage2.getEndTime(),
  //         breakStartTime: stage2.getBreakStart(),
  //         startDay: stage2.getFirstDay(),
  //         periodMinutes: stage2.getPeriodDuration(),
  //         breakMinutes: stage2.getBreakDuration(),
  //         totalDays: stage2.getTotalDays(),
  //         totalPeriods: stage2.getTotalPeriods(),
  //       },
  //     ];
  //     saveDefaults(data2,_=>{
  //       stage2.exist(false);
  //       document.getElementById("viewportTag").setAttribute("content", "initial-scale=1.0");
  //       visibilityOf(register.finalize,true);
  //       var teacherData = new TeacherData();
  //       teacherData.setDefaults(stage2.getTotalPeriods()); //getDefaultPreference(def.timings, totalPeriods));
  //       teacherData.exist(true);
  //     });

  //     var teachers = Array("1teacher@testing", "2teacher@testing");
  //     for (var tindex = 0; tindex < teachers.length; tindex++) {
  //       for (var dayI = 0; dayI < stage2.getTotalDays(); dayI++) {
  //         for (var perI = 0; perI < stage2.getTotalPeriods(); perI++) {
  //           teacherDynamo(teachers[tindex], dayI, perI, "9B", "Biology");
  //         }
  //       }
  //     }
  //     clog(teacherSchedule);
  //   };
  // };
};

var teacherSchedule = [];
let teacherDynamo = (
  teacherID,
  dayIndex,
  periodIndex,
  classvalue,
  subject,
  hold = true
) => {
  if (teacherID in teacherSchedule) {
    if (dayIndex in teacherSchedule[teacherID]) {
      teacherSchedule[teacherID][dayIndex][periodIndex] = {
        class: classvalue,
        hold: hold,
        subject: subject,
      };
    } else {
      teacherSchedule[teacherID][dayIndex] = {};
      teacherSchedule[teacherID][dayIndex][periodIndex] = {
        class: classvalue,
        hold: hold,
        subject: subject,
      };
    }
  } else {
    teacherSchedule[teacherID] = {};
    if (dayIndex in teacherSchedule[teacherID]) {
      teacherSchedule[teacherID][dayIndex][periodIndex] = {
        class: classvalue,
        hold: hold,
        subject: subject,
      };
    } else {
      teacherSchedule[teacherID][dayIndex] = {};
      teacherSchedule[teacherID][dayIndex][periodIndex] = {
        class: classvalue,
        hold: hold,
        subject: subject,
      };
    }
  }
};
