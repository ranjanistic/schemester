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
    if(sessionStorage.getItem("totalDaysField")){
      String(sessionStorage.getItem("totalDaysField")).split(',').forEach((dayi,index)=>{
        this.daychecks[dayi].checked();
      });
    }
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

    sessionStorage.getItem("startTimeField")?this.startTimeField.setInput(sessionStorage.getItem("startTimeField")):_=>{};
    
    sessionStorage.getItem("breakStartField")?this.breakStartField.setInput(sessionStorage.getItem("breakStartField")):_=>{};

    sessionStorage.getItem("eachDurationField")?this.eachDurationField.setInput(
      sessionStorage.getItem("eachDurationField")
    ):_=>{};
    
    sessionStorage.getItem("totalPeriodsField")?
    this.totalPeriodsField.setInput(
      sessionStorage.getItem("totalPeriodsField")
    ):_=>{};
    
    sessionStorage.getItem("breakDurationField")?
    this.breakDurationField.setInput(
      sessionStorage.getItem("breakDurationField")
    ):_=>{};

    this.startTimeField.validate((_) => {
      this.breakStartField.inputFocus(),
        sessionStorage.setItem(
          "startTimeField",
          this.startTimeField.getInput()
        );
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
    this.workingdaysField = new TextInput("workingdaysfield",null,"workingdayserror");
  }
  durationValid(){
    const getNumeric=(value)=>{
      return Number(String(value).replace(':',''))
    }
    let start = getNumeric(this.startTimeField.getInput());
    let periods = Number(this.totalPeriodsField.getInput())
    let pdur = Number(this.eachDurationField.getInput());
    let bdur = Number(this.breakDurationField.getInput());
    clog(((end - start)-bdur)/pdur);
  }
  noneChecked(){
    let valid = this.daychecks.some((check,index)=>{
      return (check.isChecked())
    });
    if(!valid){
      this.workingdaysField.showError("Select at least one",false);
      this.daychecks.forEach((day,i)=>{
        day.onCheckChange(_=>{this.workingdaysField.normalize()},_=>{this.workingdaysField.showError("Select at least one",false);});
      });
    }
    return valid;
  }
  saveInstitution() {
    this.noneChecked();
    if (
      !(
        this.startTimeField.isValid() &&
        this.breakStartField.isValid() &&
        this.eachDurationField.isValid() &&
        this.totalPeriodsField.isValid() &&
        this.breakDurationField.isValid() &&
        this.noneChecked()
      )
    ) {
      this.startTimeField.validateNow((_) => {
        sessionStorage.setItem(
          "startTimeField",
          this.startTimeField.getInput()
        );
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
        `<center >Proceed to create schedule for <b>${sessionStorage.getItem(
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
          <li>Break starts at : <b>${sessionStorage.getItem("breakStartField")} hours</b></li>
          <li>Each period duration : <b>${sessionStorage.getItem("eachDurationField")} minutes</b></li>
          <li>Break duration : <b>${sessionStorage.getItem("breakDurationField")} minutes</b></li>
          <li>Periods in a day : <b>${sessionStorage.getItem("totalPeriodsField")}</b></li>
          <li>Working days : <b>${days}</li>
        <ul>
        </div>`
      );
      //confirm.setBackgroundColor(colors.transparent, this.view);
      
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
        const wdays = Array();
        const wdaysString = String(sessionStorage.getItem("totalDaysField")).split(",");
        wdaysString.forEach((item,_)=>{
          wdays.push(Number(item));
        });
        const data = {
          default:{
            admin:{
              username:sessionStorage.getItem("adname"),
              email: sessionStorage.getItem("ademail"),
              phone: sessionStorage.getItem("adphone"),
            },
            institute:{
              instituteName:  sessionStorage.getItem("instname"),
              email: sessionStorage.getItem("instemail"),
              phone: sessionStorage.getItem("instphone"),
            },
            timings:{
              startTime: sessionStorage.getItem("startTimeField"),
              breakStartTime: sessionStorage.getItem("breakStartField"),
              periodMinutes: Number(sessionStorage.getItem("eachDurationField")),
              breakMinutes: Number(sessionStorage.getItem("breakDurationField")),
              periodsInDay: Number(sessionStorage.getItem("totalPeriodsField")),
              daysInWeek: wdays,
            }
          },
        };
        //check other subdocs before sending
        postJsonData(post.admin.default, {
          target:post.admin.action.registerInstitute,
          data
        })
        .then((response) => {
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
                const finish = new Dialog();
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
                        u: localStorage.getItem(constant.sessionUID),
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
};
