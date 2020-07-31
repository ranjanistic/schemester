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
    this.logout.onclick = () => {
      finishSession(client.admin);
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

    if (sessionStorage.getItem("uiid") == localStorage.getItem("uiid")) {
      this.phoneField.setInput(sessionStorage.getItem("adphone"));
      this.instNameField.setInput(sessionStorage.getItem("instname"));
      this.instEmailField.setInput(sessionStorage.getItem("instemail"));
      this.instPhoneField.setInput(sessionStorage.getItem("instphone"));
    }

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
    this.daySelector = getElement("dayselector");
    this.daychecks = Array(constant.weekdays.length);
    this.dayschecked = Array(constant.weekdays.length);
    var checks = constant.nothing;

    constant.weekdays.forEach((day, index) => {
      checks += `<label class="check-container fmt-margin" id="daycheckcontainer${index}">
        <span id="daychecklabel${index}">${day}</span>
        <input type="checkbox" id="daycheck${index}">
        <span class="tickmark-positive" id="daycheckview${index}"></span>
      </label>`;
    });
    this.daySelector.innerHTML = checks;
    constant.weekdays.forEach((_, index) => {
      this.daychecks[index] = new Checkbox(
        `daycheckcontainer${index}`,
        `daychecklabel${index}`,
        `daycheck${index}`,
        `daycheckview${index}`
      );
    });

    this.eachDurationField = new TextInput(
      "eachDurationField",
      "eachDuration",
      "eachDurationError",
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

    this.eachDurationField.setInput(
      sessionStorage.getItem("eachDurationField")
    );
    String(sessionStorage.getItem("totalDaysField")).split(',').forEach((dayi,index)=>{
      this.daychecks[dayi].checked();
    })
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
      this.eachDurationField.inputFocus(),
        sessionStorage.setItem(
          "breakStartField",
          this.breakStartField.getInput()
        );
    });
    this.eachDurationField.validate((_) => {
      this.totalPeriodsField.inputFocus(),
        sessionStorage.setItem(
          "eachDurationField",
          this.eachDurationField.getInput()
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
  durationValid(){
    const getNumeric=(value)=>{
      return Number(String(value).replace(':',''))
    }
    let start = getNumeric(this.startTimeField.getInput());
    let end = getNumeric(this.endTimeField.getInput());
    let periods = Number(this.totalPeriodsField.getInput())
    let pdur = Number(this.eachDurationField.getInput());
    let bdur = Number(this.breakDurationField.getInput());
    clog(((end - start)-bdur)/pdur);
  }
  saveInstitution() {
    if (
      !(
        this.startTimeField.isValid() &&
        this.endTimeField.isValid() &&
        this.breakStartField.isValid() &&
        this.eachDurationField.isValid() &&
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
        this.eachDurationField.inputFocus();
        sessionStorage.setItem(
          "breakStartField",
          this.breakStartField.getInput()
        );
      });

      this.eachDurationField.validateNow((_) => {
        this.totalPeriodsField.inputFocus(),
          sessionStorage.setItem(
            "eachDurationField",
            this.eachDurationField.getInput()
          );
      });
      this.totalPeriodsField.validateNow((_) => {
        this.breakDurationField.inputFocus(),
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
      let dindex = String(sessionStorage.getItem("totalDaysField")).split(',');
      let days = constant.weekdays[Number(dindex[0])];
      for(let i=1;i<dindex.length;i++){
        days =`${days}, ${constant.weekdays[Number(dindex[i])]}`;
      }
      confirm.setDisplay(
        "Confirmation",
        `<center>Proceed to create schedule for <b>${sessionStorage.getItem(
          "instname"
        )}</b>?</center>
        <br/>
        <div class="questrial">
        <ul>
          <li>Administrator : <b>${sessionStorage.getItem("adname")}</b></li>
          <li>Admin email address : <b>${sessionStorage.getItem("ademail")}</b></li>
          <li>Admin contact number : <b>${sessionStorage.getItem("adphone")}</b></li>
          <li>Institute email address : <b>${sessionStorage.getItem("instemail")}</b></li>
          <li>Institute phone : <b>${sessionStorage.getItem("instphone")}</b></li>
          <li>Day starts at: <b>${sessionStorage.getItem("startTimeField")} hours</b></li>
          <li>Day ends at : <b>${sessionStorage.getItem("endTimeField")} hours</b></li>
          <li>Break starts at : <b>${sessionStorage.getItem("breakStartField")} hours</b></li>
          <li>Each period duration : <b>${sessionStorage.getItem("eachDurationField")} minutes</b></li>
          <li>Break duration : <b>${sessionStorage.getItem("breakDurationField")} minutes</b></li>
          <li>Periods in a day : <b>${sessionStorage.getItem("totalPeriodsField")}</b></li>
          <li>Working days : <b>${days}</li>
        <ul>
        </div>`
      );
      //confirm.setBackgroundColor(colors.transparent, this.view);
      confirm.setDialogColor(colors.white);
      confirm.createActions(
        Array("Confirm & Proceed", "Edit"),
        Array(actionType.active, actionType.neutral)
      );
      confirm.onButtonClick(Array( (_) => {
        confirm.hide();
        loadingBox(
          true,
          "Setting up",
          `Preparing <b>${sessionStorage.getItem(
            "instname"
          )}'s (${sessionStorage.getItem(
            "uiid"
          )})</br> schedule structure, please wait...`
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

          instname:  sessionStorage.getItem("instname"),
          instemail: sessionStorage.getItem("instemail"),
          instphone: sessionStorage.getItem("instphone"),

          starttime: sessionStorage.getItem("startTimeField"),
          endtime: sessionStorage.getItem("endTimeField"),
          breakstarttime: sessionStorage.getItem("breakStartField"),
          periodduration: sessionStorage.getItem("eachDurationField"),
          breakduration: sessionStorage.getItem("breakDurationField"),
          totalperiods: sessionStorage.getItem("totalPeriodsField"),
          workingdays: String(sessionStorage.getItem("totalDaysField")).split(","),
        };
        clog(getRequestBody(defdata));
        postData(post.admin.register, defdata).then((response) => {
          clog(response);
          switch (response.event) {
            case code.auth.SESSION_INVALID: {
              return relocate(locate.admin.login, {
                target: locate.admin.target.register,
              });
            }
            case code.inst.INSTITUTION_CREATION_FAILED: {
              loadingBox(false);
              snackBar(
                `Error:${response.event}:${response.msg}`,
                "Retry",
                false,
                (_) => {
                  confirm.getDialogButton(0).click();
                }
              );
              return;
            }
            case code.inst.INSTITUTION_CREATED:
              {
                loadingBox(false);
                let finish = new Dialog();
                finish.setDisplay(
                  "Insitution registered",
                  "The details have been saved successfully. You may add teachers, or skip to your dashboard."
                );
                finish.createActions(
                  Array("Add teachers", "Skip"),
                  Array(actionType.positive, actionType.neutral)
                );
                finish.onButtonClick(
                  Array(
                    (_) => {
                      finish.loader();
                      relocate(locate.admin.session, {
                        target: locate.admin.target.addteacher,
                      });
                    },
                    (_) => {
                      finish.loader();
                      relocate(locate.admin.session, {
                        u: localStorage.getItem(constant.sessionUID),
                        target: locate.admin.target.dashboard,
                      });
                    }
                  )
                );
                finish.show();
              }
              break;
          }
        });
      }, (_) => {
        confirm.hide();
      }));
      confirm.show();
    }
  }
  saveLocally() {
    let days = Array();
    this.daychecks.forEach((daycheck, index) => {
      if (daycheck.isChecked()) {
        days.push(index);
      }
    });

    sessionStorage.setItem("startTimeField", this.startTimeField.getInput());
    sessionStorage.setItem("endTimeField", this.endTimeField.getInput());
    sessionStorage.setItem("breakStartField", this.breakStartField.getInput());

    sessionStorage.setItem(
      "eachDurationField",
      this.eachDurationField.getInput()
    );
    sessionStorage.setItem("totalDaysField", days);
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

  app.saveExit.onclick = () => {
    sessionStorage.setItem("adname", s1.namedisplay.innerHTML);
    sessionStorage.setItem("ademail", s1.emaildisplay.innerHTML);
    sessionStorage.setItem("adphone", s1.phoneField.getInput());
    sessionStorage.setItem("instname", s1.instNameField.getInput());
    sessionStorage.setItem("uiid", s1.uiidVIew.innerHTML);
    sessionStorage.setItem("instemail", s1.instEmailField.getInput());
    sessionStorage.setItem("instphone", s1.instPhoneField.getInput());
    sessionStorage.setItem("startTimeField", s2.startTimeField.getInput());
    sessionStorage.setItem("endTimeField", s2.endTimeField.getInput());
    sessionStorage.setItem("breakStartField", s2.breakStartField.getInput());
    sessionStorage.setItem("day1Field", s2.day1Field.getInput());
    sessionStorage.setItem(
      "eachDurationField",
      s2.eachDurationField.getInput()
    );
    sessionStorage.setItem("totalDaysField", s2.totalDaysField.getInput());
    sessionStorage.setItem(
      "totalPeriodsField",
      s2.totalPeriodsField.getInput()
    );
    sessionStorage.setItem(
      "breakDurationField",
      s2.breakDurationField.getInput()
    );
    relocate(locate.homepage);
  };

  //
  //getUserLocally().then((data) => {
  //
  //  postData("/admin/session/receiveinstitution", {
  //    uiid: data.uiid,
  //    doc: "default",
  //  }).then((response) => {
  //      clog("receiver respnose inst");
  //      clog(data.uiid);
  //      if(response.event != code.inst.INSTITUTION_DEFAULTS_SET || response.event != code.inst.INSTITUTION_CREATED
  //        || response.event != code.inst.INSTITUTION_EXISTS){
  //        clog("creationfauled:"+response.event);
  //        finishSession();
  //      }
  //    })
  //    .catch((error) => {
  //      clog("recevie inst errorrr");
  //      snackBar(error, "Report");
  //    });
  //});
  //
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
