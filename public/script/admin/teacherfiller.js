let teacher;
class TeacherFiller {
  constructor() {
    sessionStorage.clear();
    this.settingsmenu = new Menu("settingsmenu", "settingsmenubutton");
    new ThemeSwitch('darkmode');
    this.data = new ReceiveData();
    this.view = getElement("workbox");
    this.back = getElement("back");
    if (this.data.isAdmin) {
      this.back.onclick = (_) => {
        relocate(locate.admin.session);
      };
    } else {
      this.back.onclick = (_) => {
        relocate(locate.root,{client:client.teacher});
      };
    }

    this.uploadfile = getElement("uploadschedule");
    this.uploadfile.onclick=_=>{
      this.updial = new Dialog();
      this.updial.transparent();
      this.updial.setDisplay('Upload schedule',`
      <center>If you have already a backup file (.json) of schedule, then you can upload it here to directly create schedule from it.</center>
      <div class="fmt-center group-text">The file must appear like XXXXXXXXXXXXXXXX_NNNNNNNNNNNNNNNNN.json</div>
        <fieldset class="text-field" id="fileuploadfield">
          <legend class="field-caption">Select the file from your device</legend>
          <input class="text-input" required type="file" id="fileupload" name="schedulefileupload">
          <span class="error-caption" id="fileuploaderror"></span>
        </fieldset>
      `);
      const fileinput = new TextInput("fileuploadfield","fileupload","fileuploaderror");
      this.updial.createActions(['Create Schedule','Cancel'],[actionType.positive,actionType.neutral]);
      fileinput.input.addEventListener('change',(event)=>{
        var files = event.target.files;
        var file = files[0];           
        var reader = new FileReader();
        reader.onload = (eve)=> {
          try{
            teacher = JSON.parse(eve.target.result);
          }catch(e){
            clog(e);
            fileinput.showError('Problem with your file');
          }
        }
        reader.readAsText(file)
      },false);
      this.updial.onButtonClick([_=>{
        if(!teacher){
          snackBar('File corrupt','Help',false);
        }else{
          this.fillScheduleFromfile(teacher);

        }
      },_=>{
        this.updial.hide();
      }])
      this.updial.show();
    }

    this.logout = getElement("logout");
    this.next = getElement("nextSchedule");
    this.previous = getElement("prevSchedule");
    hide(this.previous);
    this.nloader = getElement("nextLoader");
    this.next2 = getElement("next2");
    this.nloader2 = getElement("nextloader2");
    this.load(false);

    if (this.data.isAdmin) {
      this.teacherIDField = new TextInput(
        "teacherEmailField",
        "teacherEmail",
        "teacherEmailError",
        validType.email
      );
      this.teacherID = getElement("teacherEmailView");
    }

    this.dayCaption = getElement("teacherDayCaption");
    this.dayView = getElement("teacherDay");
    this.dayCount = 0;
    this.setDayCaption();
    this.setDayView();

    this.teacherClass = Array(this.data.totalPeriods);
    this.teacherSubject = Array(this.data.totalPeriods);
    this.teacherfreeswitch = Array(this.data.totalperiods);
    for (let i = 0; i < this.data.totalPeriods; i++) {
      this.teacherClass[i] = new TextInput(
        `teacherClassField${i}`,
        `teacherClass${i}`,
        `teacherClassError${i}`,
        validType.nonempty
      );
      this.teacherSubject[i] = new TextInput(
        `teacherSubjectField${i}`,
        `teacherSubject${i}`,
        `teacherSubjectError${i}`,
        validType.nonempty
      );
      this.teacherfreeswitch[i] = new Switch(
        `teacherperiodfreecheck${i}`,
        `teacherperiodfreelabel${i}`
      );
      this.teacherfreeswitch[i].onTurnChange(
        (_) => {
          this.teacherClass[i].setInput(code.free);
          this.teacherClass[i].disableInput();
          this.teacherSubject[i].setInput(code.free);
          this.teacherSubject[i].disableInput();
          this.teacherClass[i].normalize();
          this.teacherSubject[i].normalize();
        },
        (_) => {
          this.teacherClass[i].clearInput();
          this.teacherClass[i].enableInput();
          this.teacherSubject[i].clearInput();
          this.teacherSubject[i].enableInput();
        }
      );
    }

    for (let i = 0; i < this.data.totalPeriods; i++) {
      this.teacherClass[i].validate((_) => {
        if (i + 1 != this.data.totalPeriods) {
          this.teacherSubject[i].inputFocus();
        }
      });
      this.teacherSubject[i].validate((_) => {
        if (i + 1 != this.data.totalPeriods) {
          this.teacherClass[i + 1].inputFocus();
        }
      });
    }
    this.logout.onclick = (_) => {
      finishSession(this.data.isAdmin ? client.admin : client.teacher, (_) => {
        if (this.data.isAdmin) {
          relocate(locate.admin.login, {
            target: locate.admin.target.addteacher,
          });
        } else if (this.data.isTeacher) {
          relocate(locate.teacher.login, {
            target: locate.teacher.target.addschedule,
          });
        }
      });
    };
    this.next.onclick = (_) => {
      new Snackbar().hide();
      if (this.dayCount == 0) {
        if (this.data.isAdmin) {
          if (!this.teacherIDField.isValid()) {
            return this.teacherIDField.validateNow();
          }
          sessionStorage.setItem("teacherID", this.teacherIDField.getInput());
        } else if (this.data.isTeacher) {
          sessionStorage.setItem("teacherID", this.data.teacherEmail);
        }
      }
      this.validateDaySchedule((_) => {
        if (this.data.isAdmin) {
          this.uploadScheduleByAdmin(this.data.totalDays[this.dayCount]);
        } else if (this.data.isTeacher) {
          this.uploadScheduleByTeacher(this.data.totalDays[this.dayCount]);
        } else {
          return location.reload();
        }
      });
    };
    this.next2.onclick = this.next.onclick;
    this.previous.onclick = (_) => {
      this.dayCount--;
      this.setDayCaption();
      this.setDayView();
      this.fillFromSession();
      if (this.data.isAdmin) {
        this.teacherIDField.setInput(sessionStorage.getItem("teacherID"));
        this.teacherIDField.disableInput();
        this.teacherIDField.activate();
      }
      if (this.dayCount == 0) {
        hide(this.previous);
      }
    };
  }

  fillScheduleFromfile(teacher){
    try{
    teacher.days.forEach(day=>{
      day.period.forEach((period,p)=>{
        sessionStorage.setItem(`${day.dayIndex}classname${p}`, period.classname);
        sessionStorage.setItem(`${day.dayIndex}subject${p}`, period.subject);
      });
    });
    this.teachername = teacher.teachername;
    sessionStorage.setItem('teacherID',teacher.teacherID)
    this.teacherIDField.setInput(teacher.teacherID);
    this.fillFromSession();
    this.updial.hide();
    this.uploadfile.innerHTML = 'File Selected';
    opacityOf(this.uploadfile,0.5);
    this.uploadfile.onclick=_=>{snackBar('A file is already selected','Deselect File',true,_=>{location.reload()})}
    }catch(e){
      clog(e);
      snackBar(`File corrupted`,'Report',false);
    }
  }

  fillFromSession() {
    for (let i = 0; i < this.data.totalPeriods; i++) {
      this.teacherClass[i].setInput(
        sessionStorage.getItem(
          `${this.data.totalDays[this.dayCount]}classname${i}`
        )
      );
      this.teacherSubject[i].setInput(
        sessionStorage.getItem(
          `${this.data.totalDays[this.dayCount]}subject${i}`
        )
      );
      this.teacherClass[i].enableInput();
      this.teacherSubject[i].enableInput();
      this.teacherClass[i].normalize();
      this.teacherSubject[i].normalize();
      this.teacherfreeswitch[i].off();
    }
  }
  setDayCaption() {
    this.dayCaption.innerHTML = `Day ${this.dayCount + 1} of ${
      this.data.totalDays.length
    }`;
  }
  setDayView() {
    this.dayView.innerHTML =
      constant.weekdays[Number(this.data.totalDays[this.dayCount])];
  }
  load(show = true) {
    visibilityOf(this.next, !show);
    visibilityOf(this.nloader, show);
    visibilityOf(this.next2, !show);
    visibilityOf(this.nloader2, show);
  }
  clearForm() {
    for (let i = 0; i < this.data.totalPeriods; i++) {
      this.teacherClass[i].setInput(constant.nothing);
      this.teacherSubject[i].setInput(constant.nothing);
      this.teacherClass[i].enableInput();
      this.teacherSubject[i].enableInput();
      this.teacherClass[i].normalize();
      this.teacherSubject[i].normalize();
      this.teacherfreeswitch[i].off();
    }
  }

  uploadScheduleByTeacher = (dayindex) => {
    var periods = [];
    for (let i = 0; i < this.data.totalPeriods; i++) {
      periods.push({
        classname: this.teacherClass[i].getInput(),
        subject: this.teacherSubject[i].getInput(),
        hold: true,
      });
      sessionStorage.setItem(`${dayindex}classname${i}`, periods[i].classname);
      sessionStorage.setItem(`${dayindex}subject${i}`, periods[i].subject);
    }
    const data = {
      dayIndex: Number(dayindex),
      absent: false,
      period: periods,
    };
    postJsonData(post.teacher.schedule, {
      action: "upload",
      teachername:this.data.teacherName,
      teacherID: sessionStorage.getItem("teacherID"),
      data: data,
    })
      .then((response) => {
        this.handleScheduleResponse(response);
      })
      .catch((error) => {
        this.load(false);
        if (!navigator.onLine) {
          snackBar(
            `Network error, Unable to save.`,
            "Try again",
            false,
            (_) => {
              new Snackbar().hide();
              this.next.click();
            }
          );
        } else {
          snackBar(`Error:${error}`, "Report");
        }
      });
  };
  uploadScheduleByAdmin = (dayindex) => {
    var periods = [];
    for (let i = 0; i < this.data.totalPeriods; i++) {
      periods.push({
        classname: this.teacherClass[i].getInput(),
        subject: this.teacherSubject[i].getInput(),
        hold: true,
      });
      sessionStorage.setItem(`${dayindex}classname${i}`, periods[i].classname);
      sessionStorage.setItem(`${dayindex}subject${i}`, periods[i].subject);
    }
    const data = {
      dayIndex: Number(dayindex),
      absent: false,
      period: periods,
    };
    postJsonData(post.admin.schedule, {
      action: "upload",
      target: "teacher",
      teacherID: sessionStorage.getItem("teacherID").trim(),
      data: data,
    })
      .then((response) => {
        this.handleScheduleResponse(response);
      })
      .catch((error) => {
        if (!navigator.onLine) {
          snackBar(
            `Network error, Unable to save.`,
            "Try again",
            false,
            (_) => {
              new Snackbar().hide();
              this.next.click();
            }
          );
        } else {
          snackBar(`Error:${error}`, "Report");
        }
      });
  };
  validateDaySchedule = (afterValidate = (_) => {}) => {
    let valid = true;
    for (let i = 0; i < this.data.totalPeriods; i++) {
      if (
        !(this.teacherClass[i].isValid() && this.teacherSubject[i].isValid())
      ) {
        this.teacherClass[i].validateNow((_) => {
          if (i != this.data.totalPeriods) {
            this.teacherSubject[i].inputFocus();
          }
        });
        this.teacherSubject[i].validateNow((_) => {
          if (i + 1 != this.data.totalPeriods) {
            this.teacherClass[i + 1].inputFocus();
          }
        });
        valid = false;
      }
    }
    if (valid) {
      this.load();
      afterValidate();
    }
  };
  handleScheduleResponse(response) {
      if(response.event == code.schedule.SCHEDULE_CREATED){
          for (let i = 0; i < this.data.totalPeriods; i++) {
            this.teacherClass[i].activate();
            this.teacherSubject[i].activate();
          }
          this.dayCount++;
          show(this.previous);
          if (this.dayCount < this.data.totalDays.length) {
            this.setDayCaption();
            this.setDayView();
            this.clearForm();
            this.fillFromSession();
            if (this.data.isAdmin) {
              this.teacherIDField.setInput(sessionStorage.getItem("teacherID"));
              this.teacherIDField.disableInput();
              this.teacherIDField.activate();
            }
            this.load(false);
          } else {
            window.onbeforeunload = () => {};
            if (this.data.isAdmin) {
              postJsonData(post.admin.email,{
                to:sessionStorage.getItem("teacherID"),
                target:client.teacher,
                type:'personalinvite'
              }).then(res=>{
                if(res.event == code.mail.MAIL_SENT){
                  snackBar(`Request email has been sent to ${sessionStorage.getItem("teacherID")}.`,'OK');
                  return new ScheduleComplete(this.data);
                }
                throw res;
              }).catch(e=>{
                clog(e);
                snackBar('Failed to send email. You can resend it from teachers view.',null,false);
                return new ScheduleComplete(this.data);
              })
            } else if (this.data.isTeacher) {
              return location.reload();
            }
          }
          return;
      }
    switch(response.event){
      case code.schedule.SCHEDULE_EXISTS:{
        this.load(false);
          if (this.data.isAdmin) {
            snackBar(
              `Schedule for ${sessionStorage.getItem(
                "teacherID"
              )} already exists.`,
              "View",
              bodyType.warning,
              (_) => {
                referTab(locate.admin.session, {
                  target: locate.admin.target.viewschedule,
                  type: client.teacher,
                  [response.id ?"teacherID":"id"]: response.uid
                    ? response.uid
                    : response.id,
                });
              }
            );
          }
        }
        break;
      case code.schedule.SCHEDULE_CLASHED:{
          if (this.data.isAdmin) {
            this.teacherClass[response.clash.period].showError(
              `This class is already taken at this period by 
              <a id="clashlink${response.clash.uid}">${response.clash.id}</a>.`
            );
            getElement(`clashlink${response.clash.uid}`).onclick = (_) => {
              referTab(locate.admin.session, {
                target: locate.admin.target.viewschedule,
                type: client.teacher,
                [response.clash.uid ? "t" : "teacherID"]: response.clash.uid
                  ? response.clash.uid
                  : response.clash.id,
              });
            };
          } else {
            this.teacherClass[response.clash.period].showError(
              `This class is already taken at this period by ${response.clash.clashwith}.`
            );
          }
        }
        break;
      default: {
        if (!navigator.onLine) {
          snackBar(
            `Network error, Unable to save.`,
            "Try again",
            false,
            (_) => {
              new Snackbar().hide();
              this.next.click();
            }
          );
        } else {
          snackBar(`An error occurred:${response.event}`, "Report");
        }
      }
    }
  }
}

class ReceiveData {
  constructor() {
    this.isAdmin = getElement("isAdmin").innerHTML ? true : false;
    this.uiid = getElement("uiid").innerHTML;
    this.totalDays = String(getElement("daysInWeek").innerHTML).split(",");
    this.totalPeriods = Number.parseInt(getElement("periodsInDay").innerHTML);
    if (!this.isAdmin) {
      this.isTeacher = getElement("isTeacher").innerHTML ? true : false;
      this.teacherName = getElement("teachername").innerHTML;
      this.teacherEmail = getElement("teacheremail").innerHTML;
      this.teacherVerified = getElement("teacherverfied").innerHTML == "true";
      this.teacherid = getElement("teacherID").innerHTML;
      this.isTeacherAllowed =
        getElement("allowTeacherAddSchedule").innerHTML == "true";
    }
  }
}

class ScheduleComplete {
  constructor(data) {
    window.onbeforeunload = () => {};
    this.view = getElement("workbox");
    this.view.innerHTML = data.isAdmin
      ? this.content(sessionStorage.getItem("teacherID"))
      : data.teacherName;
    this.addAnother = getElement("addAnother");
    this.exit = getElement("exitadder");
    this.addAnother.onclick = (_) => {
      relocate(locate.admin.session, {
        u:localStorage.getItem(constant.seesionUID),
        target: locate.admin.target.addteacher,
      });
    };
    this.exit.onclick = (_) => {
      relocate(locate.root);
    };
  }
  content(id) {
    return `<div class="fmt-row fmt-center">
      <div class="fmt-row heading">Schedule Added.</div>
      <div class="fmt-row questrial">You have successfully created a full week schedule for <b>${id}</b>. An email has been sent to them for confirmation.
      <br>They will be able to access their schedule, after joining or otherwise.</div>
      <br>
      <div class="fmt-row">
          <button class="positive-button" id="addAnother">Add another teacher</button>
            Or
          <button class="neutral-button" id="exitadder">Return to dashboard</button>
      </div>
    </div>`;
  }
}
window.onbeforeunload = () => {
  snackBar("Try to complete before leaving to avoid data loss.");
  return "";
};

window.onload = () => (window.app = new TeacherFiller());
