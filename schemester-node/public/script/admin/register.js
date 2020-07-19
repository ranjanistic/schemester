
class Register {
  constructor() {
    this.greeting = getElement("greeting");
    this.greeting.innerHTML = "Registration";
    this.search =  getElement("search");
    this.saveExit = getElement("saveandexit");
    this.settings = getElement('settingsButton');
    this.logout = getElement('logoutAdminButton');


    this.finalize = getElement('registrationComplete');
    this.stage1Loader = getElement('stage1load');
    this.stage2Loader = getElement('stage2load');

    this.saveExit.onclick = ()=>{
      relocate(locate.homepage);
    };

    this.settings.onclick = ()=>{
      refer(locate.adminSettings,{
        target:'manage'
      })
    }
    this.logout.onclick = ()=>{
      finishSession();
    };
  }
}

class Stage1 {
  constructor() {
    this.view = getElement("stage1");
    this.nameField = new TextInput("adminNameField","adminName","adminNameError",null,validType.name);
    this.namedisplay = getElement("adminNameView");
    this.emaildisplay = getElement("adminEmailView");
    this.phoneField = new TextInput("adminPhoneField","adminPhone","adminPhoneError",null,validType.phone)
    this.instNameField = new TextInput("instNameField","instName","instNameError",null,validType.name);
    this.instIdField = new TextInput("uiidField","uiid","uiidError",null,validType.username);
    this.uiidVIew = getElement("uiidView");
    this.instEmailField = new TextInput("instEmailField","instEmail","instEmailError",null,validType.email);
    this.instPhoneField = new TextInput("instPhoneField","instPhone","instPhoneError",null,validType.phone);
    
    this.save = getElement("saveStage1");
    this.phoneField.validate(_=>{this.instNameField.inputFocus()});
    this.instNameField.validate(_=>{this.instEmailField.inputFocus()});
    this.instEmailField.validate(_=>{this.instPhoneField.inputFocus()});
    this.instPhoneField.validate();
    this.loader = getElement("stage1loader");
    hide(this.loader);
  }
  movetostage2 = (app,s2)=>{
    this.load();
    clog("moving");
   if(!(stringIsValid(this.phoneField.getInput(),this.phoneField.type)&&
      stringIsValid(this.instNameField.getInput(),this.instNameField.type)&&
      stringIsValid(this.instEmailField.getInput(),this.instEmailField.type)&&
      stringIsValid(this.instPhoneField.getInput(),this.instPhoneField.type))
   ) {
    this.phoneField.validateNow(_=>{this.instNameField.inputFocus()});
    this.instNameField.validateNow(_=>{this.instEmailField.inputFocus()});
    this.instEmailField.validateNow(_=>{this.instPhoneField.inputFocus()});
    this.instPhoneField.validateNow();
    clog("invalidmove");
    this.load(false);
   }else{
     hide(this.view);
     clog("moved");
     show(s2.view);
     app.greeting.innerHTML = `<button class="neutral-button" id="previousButton">Previous</button>`;
     getElement("previousButton").onclick = ()=>{
       this.backToStage1(app,s2);
     }
   }
  }
  backToStage1(app,s2){
    hide(s2.view);
    show(this.view);
    app.greeting.innerHTML = 'Registration';
    this.load(false);
  }
  load(show = true){
    visibilityOf(this.save,!show);
    visibilityOf(this.loader,show);
  }
}
class Stage2 {
  constructor() {

    this.view = getElement("stage2");
    this.startTimeField = new TextInput("startTimeField","startTime","startTimeError");
    this.endTimeField = new TextInput("endTimeField","endTime","endTimeError");
    this.breakStartField = new TextInput("breakStartField","breakStart","breakStartError")
    this.day1Field = new TextInput("firstDayField","firstDay","firstDayError");
    
    this.eachDurationField = new TextInput("eachDurationField","eachDuration","eachDurationError");
    this.totalDaysField = new TextInput("totalDaysField","totalDays","totalDaysError");
    this.totalPeriodsField = new TextInput("totalPeriodsField","totalPeriods","totalPeriodsError");
    this.breakDurationField = new TextInput("breakDurationField","breakDuration","breakDurationError");
    
    this.save = getElement("saveStage2");
      
  }
  
}


window.onload = _=> {
  let app = new Register();
  let s1 = new Stage1();
  let s2 = new Stage2();
  show(s1.view);
  hide(s2.view);

  s1.save.onclick =()=>{s1.movetostage2(app,s2)}
  getUserLocally().then(data=>{
    postData('/admin/session/receiveinstitution',{
      uiid:data.uiid,
      doc:'default'
    }).then(response=>{
      clog("receiver respnose inst");
      clog(data.uiid);
      if(response.event == code.inst.INSTITUTION_NOT_EXISTS){
        postData('/admin/session/createinstitution',{
          uiid:data.uiid
        }).then(resp=>{
          clog("resp")
          if(resp.event == code.inst.INSTITUTION_CREATION_FAILED){
            clog("creationfauled");
            finishSession();
          } else {
            clog("doc default response");
            clog(jstr(response));
          }
        }).catch(error=>{
          clog("creation errror");
          snackBar(error,'Report');
        });
      } else {  
        clog("doc default response");
        clog(jstr(response));
      }
    }).catch(error=>{
      clog("recevie inst errorrr");
      snackBar(error,"Report");
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
)=>{
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
