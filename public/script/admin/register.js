let inst;
class Register {
  constructor() {
    this.greeting = getElement("greeting");
    this.greeting.innerHTML = "Registration";
    this.search = getElement("search");
    this.saveExit = getElement("saveandexit");
    this.settings = getElement("settingsButton");
    this.logout = getElement("logoutAdminButton");
    this.settingsmenu = new Menu("settingsmenu", "settingsmenubutton");
    new ThemeSwitch('darkmode');
    this.finalize = getElement("registrationComplete");
    this.stage1Loader = getElement("stage1load");
    this.stage2Loader = getElement("stage2load");
    this.logout.onclick = () => {
      finishSession(client.admin);
    };
    this.updating = getElement("updatinginst").innerHTML == 'true';
    if(!this.updating){
   this.uploadfile = getElement("uploadinst");
  this.uploadfile.onclick = (_) => {
    this.updial = new Dialog();
    this.updial.transparent();
    this.updial.setDisplay(
      "Upload Institute",
      `
      <center>If you have already a backup file (.json) of your institution, then you can upload it here to directly create schedule from it.</center>
      <div class="fmt-center group-text">The file must appear like XXXXXXXXXXXXXXXX_AA_NNNNNNNNNNNNNNNNN.json</div>
        <fieldset class="text-field" id="fileuploadfield">
          <legend class="field-caption">Select the file from your device</legend>
          <input class="text-input" required type="file" id="fileupload" name="schedulefileupload">
          <span class="error-caption" id="fileuploaderror"></span>
        </fieldset>
      `
    );
    const fileinput = new TextInput(
      "fileuploadfield",
      "fileupload",
      "fileuploaderror"
    );
    this.updial.createActions(
      ["Create Institute", "Cancel"],
      [actionType.positive, actionType.neutral]
    );
    fileinput.input.addEventListener(
      "change",
      (event) => {
        var files = event.target.files;
        var file = files[0];
        var reader = new FileReader();
        reader.onload = (eve) => {
          try {
            inst = JSON.parse(eve.target.result);
          } catch (e) {
            clog(e);
            fileinput.showError('Invalid file, must be of JSON type.');
          }
        };
        reader.readAsText(file);
      },
      false
    );
    this.updial.onButtonClick([
      (_) => {
        if(inst){
          this.updial.loader(true);
          this.fillScheduleFromfile(inst);
        }else {
          snackBar('Problem with your file.','Help',false);
        }
      },
      (_) => {
        this.updial.hide();
      },
    ]);
    this.updial.show();
  };}

  }
  fillScheduleFromfile(inst){
    try{
      sessionStorage.setItem("adphone", inst.default.admin.phone);
      sessionStorage.setItem("instname", inst.default.institute.instituteName);
      sessionStorage.setItem("uiid", inst.uiid);
      sessionStorage.setItem("instemail", inst.default.institute.email);
      sessionStorage.setItem("instphone", inst.default.institute.phone);
      sessionStorage.setItem("startTimeField", inst.default.timings.startTime);
      sessionStorage.setItem("breakStartField", inst.default.timings.breakStartTime);
      sessionStorage.setItem("eachDurationField",inst.default.timings.periodMinutes);
      sessionStorage.setItem("totalDaysField", inst.default.timings.daysInWeek);
      sessionStorage.setItem("totalPeriodsField",inst.default.timings.periodsInDay);
      sessionStorage.setItem("breakDurationField",inst.default.timings.breakMinutes);
      
      const choosedialog = new Dialog();
      choosedialog.transparent();
      let choicesview = inst.schedule.teachers.length?`${getSwitch('teacherschedule','Teachers Schedule','teacherscheduleswitch')}`:constant.nothing;
      choicesview += inst.users.teachers.length?`${getSwitch('teacheraccount','Teacher Accounts','teacheraccountswitch')}`:constant.nothing;
      choicesview += inst.users.classes.length?`${getSwitch('classrooms','Classrooms','classroomswitch')}`:constant.nothing;
      choosedialog.setDisplay('Choose to use',`The following information was found in your file. Choose the ones to use.
      <div class="fmt-row">
      ${choicesview}
      </div>
      `);
      const teacherscheduleswitch = new Switch('teacherscheduleswitch');
      const teacheraccountswitch = new Switch('teacheraccountswitch');
      const studentaccountswitch = new Switch('studentaccountswitch');
      const classroomswitch = new Switch('classroomswitch');
      try{
        teacherscheduleswitch.onTurnChange(_=>{
          sessionStorage.setItem('fileteacherschedule',true);
        },_=>{
          sessionStorage.removeItem('fileteacherschedule');
        });
        teacheraccountswitch.onTurnChange(_=>{
          sessionStorage.setItem('fileteacheraccount',true);
        },_=>{
          sessionStorage.removeItem('fileteacheraccount');
        });
        studentaccountswitch.onTurnChange(_=>{
          sessionStorage.setItem('filestudentaccount',true);
        },_=>{
          sessionStorage.removeItem('filestudentaccount');
        });
        classroomswitch.onTurnChange(_=>{
          sessionStorage.setItem('fileclasses',true);
        },_=>{
          sessionStorage.removeItem('fileclasses');
        });
      }catch{};
      choosedialog.createActions(['Apply','Cancel'],[actionType.positive,actionType.neutral]);
      choosedialog.onButtonClick([_=>{
        choosedialog.setDisplay('Confirm Data',`${sessionStorage.getItem('fileteacherschedule')?'Schedule':''}, 
        ${sessionStorage.getItem('fileteacheraccount')?'Teacher accounts':''},
        ${sessionStorage.getItem('filestudentaccount')?'Student accounts':''}
        ${sessionStorage.getItem('fileclasses')?', & Classrooms':''} will be created from your file.`);
        choosedialog.createActions(['Confirm','Abort'],[actionType.positive,actionType.neutral]);
        choosedialog.onButtonClick([_=>{
          setClasses();
          this.uploadfile.innerHTML = 'File Selected';
          opacityOf(this.uploadfile,0.5);
          this.uploadfile.onclick=_=>{snackBar('A file is already selected','Deselect File',true,_=>{location.reload()})}
          choosedialog.hide();
        },_=>{
          inst = null;
          sessionStorage.removeItem('fileteacherschedule');
          sessionStorage.removeItem('fileteacheraccount');
          sessionStorage.removeItem('filestudentaccount');
          sessionStorage.removeItem('fileclasses');
          choosedialog.hide();
        }])
      },_=>{
        inst = null;
        sessionStorage.removeItem('fileteacherschedule');
        sessionStorage.removeItem('fileteacheraccount');
        sessionStorage.removeItem('filestudentaccount');
        sessionStorage.removeItem('fileclasses');
        choosedialog.hide();
      }]);
      choosedialog.show();

    }catch(e){
      this.updial.loader(false);
      snackBar(`File corrupted`,'Report',false);
    }
    
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

    this.instemailsame = new Switch('emailsameasadmin');
    this.instemailsame.onTurnChange(_=>{
      this.instEmailField.setInput(this.emaildisplay.innerHTML);
    },_=>{
      this.instEmailField.clearInput();
    });
    this.instphonesame = new Switch('phonesameasadmin');
    this.instphonesame.onTurnChange(_=>{
      this.instPhoneField.setInput(this.phoneField.getInput());
    },_=>{
      this.instPhoneField.clearInput();
    });
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
      this.load(false);
    } else {
      this.saveLocally();
      hide(this.view);
      show(s2.view);
      app.greeting.innerHTML = getButton("previousButton","Previous",actionType.neutral);
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
    this.updating = getElement("updatinginst").innerHTML == 'true';
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
    this.breakDurationField = new TextInput(
      "breakDurationField",
      "breakDuration",
      "breakDurationError",
      validType.naturalnumber
    );
    this.nobreak = new Switch('nobreakcheck','nobreaklabel');
    this.nobreak.onTurnChange(_=>{
      this.breakStartField.disableInput();
      this.breakStartField.setInput(null);
      this.breakStartField.normalize();
      this.breakDurationField.disableInput();
      this.breakDurationField.setInput(0);
      this.breakDurationField.normalize();
      sessionStorage.setItem('nobreak',true);
    },_=>{
      sessionStorage.removeItem('nobreak');
      this.breakStartField.enableInput();
      this.breakDurationField.enableInput();
    })

    this.daySelector = getElement("dayselector");
    this.daychecks = Array(constant.weekdays.length);
    this.dayschecked = Array(constant.weekdays.length);
    var checks = '<div class="fmt-row">';

    constant.weekdays.forEach((day, index) => {
      checks += `
      <div class="fmt-col third fmt-padding">
        <span class="questrial group-text" id="daychecklabel${index}">${day}</span>
        <label class="switch-container fmt-left fmt-padding">
        <input type="checkbox" id="daycheck${index}">
        <span class="switch-active" id="daycheckview${index}"></span>
      </label>
      </div>
    `;
    });
    this.daySelector.innerHTML = checks + "</div>";
    const days = [];
    constant.weekdays.forEach((_, index) => {
      this.daychecks[index] = new Switch(
        `daycheck${index}`,
        `daychecklabel${index}`,
        `daycheckview${index}`,
        `daycheckcontainer${index}`,
        bodyType.active
      );
      this.daychecks[index].onTurnChange(
        (_) => {
          this.workingdaysField.normalize();
          appendClass(this.daychecks[index].switchText, "active");
          days.push(index);
          sessionStorage.setItem("totalDaysField", days);
        },
        (_) => {
          if (!this.someChecked()) {
            this.workingdaysField.showError("Select at least one", false);
          }
          if (days.indexOf(index) > -1) {
            days.splice(days.indexOf(index), 1);
            sessionStorage.setItem("totalDaysField", days);
          }
          replaceClass(
            this.daychecks[index].switchText,
            "active",
            "group-text"
          );
        }
      );
    });

    if (sessionStorage.getItem("totalDaysField")) {
      String(sessionStorage.getItem("totalDaysField"))
        .split(",")
        .forEach((dayi) => {
          appendClass(this.daychecks[dayi].switchText, "active");
          this.daychecks[dayi].on();
        });
    }
    this.eachDurationField = new TextInput(
      "eachDurationField",
      "eachDuration",
      "eachDurationError",
      validType.naturalnumber
    );

    this.totalPeriodsField = new TextInput(
      "totalPeriodsField",
      "totalPeriods",
      "totalPeriodsError",
      validType.naturalnumber
    );

    sessionStorage.getItem("startTimeField")
      ? this.startTimeField.setInput(sessionStorage.getItem("startTimeField"))
      : (_) => {};
    if(sessionStorage.getItem('nobreak')){
      this.nobreak.on()
      this.breakStartField.disableInput();
      this.breakStartField.setInput(null);
      this.breakStartField.normalize();
      this.breakDurationField.disableInput();
      this.breakDurationField.setInput(0);
      this.breakDurationField.normalize();
    }else {
      sessionStorage.getItem("breakStartField")
      ? this.breakStartField.setInput(sessionStorage.getItem("breakStartField"))
      : (_) => {};
      sessionStorage.getItem("breakDurationField")
      ? this.breakDurationField.setInput(
          sessionStorage.getItem("breakDurationField")
        )
      : (_) => {};
    }
    sessionStorage.getItem("eachDurationField")
      ? this.eachDurationField.setInput(
          sessionStorage.getItem("eachDurationField")
        )
      : (_) => {};

    sessionStorage.getItem("totalPeriodsField")
      ? this.totalPeriodsField.setInput(
          sessionStorage.getItem("totalPeriodsField")
        )
      : (_) => {};


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
    this.workingdaysField = new TextInput(
      "workingdaysfield",
      null,
      "workingdayserror"
    );
  }
  durationValid() {
    const getNumeric = (value) => {
      return Number(String(value).replace(":", ""));
    };
    let start = getNumeric(this.startTimeField.getInput());
    let periods = Number(this.totalPeriodsField.getInput());
    let pdur = Number(this.eachDurationField.getInput());
    let bdur = Number(this.breakDurationField.getInput());
  }
  someChecked() {
    let valid = this.daychecks.some((check) => {
      return check.isOn();
    });
    if (!valid) {
      this.workingdaysField.showError("Select at least one", false);
    }
    return valid;
  }
  saveInstitution() {
    if (
      !(
        this.startTimeField.isValid() &&
        (this.breakStartField.isValid()||sessionStorage.getItem('nobreak'))&&
        this.eachDurationField.isValid() &&
        this.totalPeriodsField.isValid() &&
        (this.breakDurationField.isValid() ||sessionStorage.getItem('nobreak')) &&
        this.someChecked()
      )
    ) {
      this.startTimeField.validateNow((_) => {
        sessionStorage.setItem(
          "startTimeField",
          this.startTimeField.getInput()
        );
      });
      if(!sessionStorage.getItem('nobreak')){
        this.breakStartField.validateNow((_) => {
          this.eachDurationField.inputFocus();
          sessionStorage.setItem(
            "breakStartField",
            this.breakStartField.getInput()
          );
        });
        this.breakDurationField.validateNow((_) => {
          sessionStorage.setItem(
            "breakDurationField",
            this.breakDurationField.getInput()
          );
        });
      }

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
    } else {
      if(this.totalPeriodsField.getInput()*this.eachDurationField.getInput()>constant.minutesInDay-this.breakDurationField.getInput()){
        this.totalPeriodsField.showError('Not acceptable');
        this.eachDurationField.showError('Not acceptable');
        return snackBar(`Invalid period setup. Make sure that product of total periods and each period duration doesn't exceed ${constant.minutesInDay-this.breakDurationField.getInput()} (total minutes in a day, excluding break minutes)`,'Help',false);
      }
      this.saveLocally();
      this.confirmationDialog();
    }
  }
  confirmationDialog(){
    const confirm = new Dialog();
      let dindex = String(sessionStorage.getItem("totalDaysField")).split(",");
      let days = constant.weekdays[Number(dindex[0])];
      for (let i = 1; i < dindex.length; i++) {
        days = `${days}, ${constant.weekdays[Number(dindex[i])]}`;
      }
      confirm.setDisplay(
        "Confirmation",
        `<center >Proceed to ${this.updating?'update':'create'} <b>${sessionStorage.getItem(
          "instname"
        )}</b>?${inst?' (From uploaded file)':''}</center>
        <br/>
        <div class="questrial">
          <ul>
            <li>Administrator : <b>${sessionStorage.getItem("adname")}</b></li>
            <li>Admin email address : <b class=" pointer positive" onclick="mailTo('${sessionStorage.getItem(
              "ademail"
            )}')">${sessionStorage.getItem("ademail")}</b></li>
            <li>Admin contact number : <b class=" pointer active" onclick="callTo('${sessionStorage.getItem(
              "adphone"
            )}')">${sessionStorage.getItem("adphone")}</b></li>
            <li>Institute email address : <b class=" pointer positive" onclick="mailTo('${sessionStorage.getItem(
              "instemail"
            )})">${sessionStorage.getItem("instemail")}</b></li>
            <li>Institute phone : <b class="active pointer" onclick="callTo('${sessionStorage.getItem(
              "instphone"
            )}')">${sessionStorage.getItem("instphone")}</b></li>
            <li>Day starts at: <b>${sessionStorage.getItem(
              "startTimeField"
            )} hours</b></li>
            ${sessionStorage.getItem(
              "nobreak"
              )?'<li>No break time':`<li>Break starts at : <b>${sessionStorage.getItem(
                "breakStartField"
              )} hours</b></li>
              <li>Break duration : <b>${sessionStorage.getItem(
                "breakDurationField"
              )} minutes</b></li>`}
            <li>Each period duration : <b>${sessionStorage.getItem(
              "eachDurationField"
            )} minutes</b></li>
            <li>Periods in a day : <b>${sessionStorage.getItem(
              "totalPeriodsField"
            )}</b></li>
            <li>Working days : <b>${days}</li>
          </ul>
          ${inst?
          `<div class="fmt-row">
            With ${sessionStorage.getItem('fileteacherschedule')?'Schedule':''}, 
            ${sessionStorage.getItem('fileteacheraccount')?'Teacher accounts':''}
            ${sessionStorage.getItem('filestudentaccount')?'Student accounts':''}
            ${sessionStorage.getItem('fileclasses')?', & Classrooms':''} from your file.
          </div>`:''}
        </div>`
      );
      confirm.createActions(
        ["Confirm & Proceed", "Edit"],
        [actionType.active, actionType.neutral]
      );
      confirm.onButtonClick([
          (_) => {
            loadingBox(
              true,
              "Setting up",
              `Preparing <b>${sessionStorage.getItem(
                "instname"
              )}'s (${sessionStorage.getItem(
                "uiid"
              )})</br> schedule structure, please wait...`
            );
            const wdays = [];
            String(sessionStorage.getItem("totalDaysField")).split(",").forEach((item) => {
              wdays.push(Number(item));
            });
            const data = inst?{
              default: {
                admin: [{
                  username: sessionStorage.getItem("adname"),
                  email: sessionStorage.getItem("ademail"),
                  phone: sessionStorage.getItem("adphone"),
                }],
                institute: {
                  instituteName: sessionStorage.getItem("instname"),
                  email: sessionStorage.getItem("instemail"),
                  phone: sessionStorage.getItem("instphone"),
                },
                timings: {
                  startTime: sessionStorage.getItem("startTimeField"),
                  breakStartTime: sessionStorage.getItem("nobreak")?null:sessionStorage.getItem("breakStartField"),
                  periodMinutes: Number(
                    sessionStorage.getItem("eachDurationField")
                  ),
                  breakMinutes: sessionStorage.getItem("nobreak")?0:Number(
                    sessionStorage.getItem("breakDurationField")
                  ),
                  periodsInDay: Number(
                    sessionStorage.getItem("totalPeriodsField")
                  ),
                  daysInWeek: wdays,
                },
              },
              schedule:sessionStorage.getItem('fileteacherschedule')?inst.schedule:{teachers:[]},
              users:{
                teachers:sessionStorage.getItem('fileteacheraccount')?inst.users.teachers:[],
                students:sessionStorage.getItem('filestudentaccount')?inst.users.students:[],
                classes:sessionStorage.getItem('fileclasses')?inst.users.classes:[]
              },
              pseudousers:{
                teachers:sessionStorage.getItem('fileteacheraccount')?inst.pseudousers.teachers:[],
                students:sessionStorage.getItem('filestudentaccount')?inst.pseudousers.students:[],
                classes:sessionStorage.getItem('fileclasses')?inst.pseudousers.classes:[]
              },
              invite:inst.invite,
              restricted:inst.restricted,
              vacations:inst.vacations,
              preferences:inst.preferences
            }:{
              default: {
                admin: {
                  username: sessionStorage.getItem("adname"),
                  email: sessionStorage.getItem("ademail"),
                  phone: sessionStorage.getItem("adphone"),
                },
                institute: {
                  instituteName: sessionStorage.getItem("instname"),
                  email: sessionStorage.getItem("instemail"),
                  phone: sessionStorage.getItem("instphone"),
                },
                timings: {
                  startTime: sessionStorage.getItem("startTimeField"),
                  breakStartTime: sessionStorage.getItem("nobreak")?null:sessionStorage.getItem("breakStartField"),
                  periodMinutes: Number(
                    sessionStorage.getItem("eachDurationField")
                  ),
                  breakMinutes: sessionStorage.getItem("nobreak")?0:Number(
                    sessionStorage.getItem("breakDurationField")
                  ),
                  periodsInDay: Number(
                    sessionStorage.getItem("totalPeriodsField")
                  ),
                  daysInWeek: wdays,
                },
              },
            };
            postJsonData(post.admin.default, {
              target: post.admin.action.registerInstitute,
              fromfile:inst?true:false,
              data,
            }).then((response) => {
              switch (response.event) {
                case code.auth.SESSION_INVALID: {
                  return relocate(locate.admin.auth, {
                    action: "login",
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
                    window.onbeforeunload = () => {};
                    if(inst || this.updating) return location.reload();
                    loadingBox(false);
                    const finish = new Dialog();
                    finish.setDisplay(
                      "Insitution registered",
                      "The details have been saved successfully. You may add teachers, or skip to your dashboard."
                    );
                    finish.createActions(
                      ["Add teachers", "Skip"],
                      [actionType.positive, actionType.neutral]
                    );
                    snackBar(
                      `Your institution's UIID is, <b>${sessionStorage.getItem(
                        "uiid"
                      )}</b>. Always keep this in your mind.`,
                      "Understood"
                    );
                    finish.onButtonClick(
                      [
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
                      ]
                    );
                    finish.show();
                  }
                  break;
                  default:snackBar(`Couldn't create institution, please check for any wrong inputs.`);
              }
            });
          },
          (_) => {
            confirm.hide();
          }
        ]
      );
      confirm.show();
  }
  saveLocally() {
    const days = [];
    this.daychecks.forEach((daycheck, index) => {
      if (daycheck.isOn()) {
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

function setClasses(){
  const app = new Register();
  const s1 = new Stage1();
  const s2 = new Stage2();
  show(s1.view);
  hide(s2.view);
  s1.save.onclick = () => {
    s1.movetostage2(app, s2);
  };
  s2.save.onclick = () => {
    s1.saveLocally();
    s2.saveInstitution();
  };
}

window.onbeforeunload = () => {
  snackBar("Try to complete before leaving to avoid data loss.");
  return constant.nothing;
};

window.onload = (_) => {
  setClasses();
};