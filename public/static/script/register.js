const defaults = "defaults",
  batches = "batches",
  users = "users",
  assignees = "assignees";
var dbVer = 1;
class Default {
  constructor() {
    this.admin = "admin";
    this.institution = "institution";
    this.timings = "timings";
  }
}
let def = new Default();
class Register {
  constructor() {
    this.greeting = getElement("greeting");
    this.finalize = getElement("finalizeDataButton");
    this.saveExit = getElement("saveandexit");
    this.setDefaults();
  }
  setDefaults() {
    visibilityOf(this.finalize, false);
  }
}

class Stage1 {
  constructor() {
    this.view = getElement("stage1");
    this.heading = getElement("s1head");
    this.adminHead = getElement("adminHead");
    this.nameField = getElement("adminNameField");
    this.nameInput = getElement("adminName");
    this.nameError = getElement("adminNameError");
    this.phoneField = getElement("phoneField");
    this.phoneInput = getElement("adminPhone");
    this.phoneError = getElement("phoneError");
    this.instHead = getElement("instHead");
    this.instNameField = getElement("instNameField");
    this.instNameInput = getElement("instName");
    this.instNameError = getElement("instNameError");
    this.instIdField = getElement("uiidField");
    this.instIdInput = getElement("uiid");
    this.instIdError = getElement("uiidError");
    this.save = getElement("saveStage1");
    this.setDefaults();
  }
  setDefaults() {
    this.heading.textContent = "Basic";
    this.adminHead.textContent = "Administrator";
    this.instHead.textContent = "Institution";
  }
  getName() {
    return this.nameInput.value;
  }
  getPhone() {
    return this.phoneInput.value;
  }
  getInstName() {
    return this.instNameInput.value;
  }
  getInstID() {
    return this.instIdInput.value;
  }
  exist(show = true) {
    elementFadeVisibility(this.view, show);
  }
}
class Stage2 {
  constructor() {
    this.view = getElement("stage2");
    this.heading = getElement("s2head");
    this.timeHead = getElement("timeHead");
    this.startTimeField = getElement("startTimeField");
    this.startTime = getElement("startTime");
    this.startTimeError = getElement("startTimeError");
    this.endTimeField = getElement("endTimeField");
    this.endTime = getElement("endTime");
    this.endTimeError = getElement("endTimeError");
    this.breakStartField = getElement("breakStartField");
    this.breakStart = getElement("breakStartTime");
    this.breakStartError = getElement("breakStartError");
    this.day1Field = getElement("firstDayField");
    this.day1 = getElement("firstDay");
    this.day1Error = getElement("firstDayError");
    this.durationHead = getElement("durationHead");
    this.eachDurationField = getElement("eachDurationField");
    this.eachDuration = getElement("eachDuration");
    this.eachDurationError = getElement("eachDurationError");
    this.totalDaysField = getElement("totalDaysField");
    this.totalDays = getElement("totalDays");
    this.totalDaysError = getElement("totalDaysError");
    this.totalPeriodsField = getElement("totalPeriodsField");
    this.totalPeriods = getElement("totalPeriods");
    this.totalPeriodsError = getElement("totalPeriodsError");
    this.breakDurationField = getElement("breakDurationField");
    this.breakDuration = getElement("breakDuration");
    this.breakDurationError = getElement("breakDurationError");
    this.save = getElement("saveStage2");
    this.setDefaults();
    this.exist(false);
  }
  setDefaults() {
    this.heading.textContent = "Schedule";
    this.timeHead.textContent = "Timings";
    this.durationHead.textContent = "Duration";
  }
  getStartTime() {
    return this.startTime.value;
  }
  getEndTime() {
    return this.endTime.value;
  }
  getBreakStart() {
    return this.breakStart.value;
  }
  getFirstDay() {
    return this.day1.value;
  }
  getPeriodDuration() {
    return this.eachDuration.value;
  }
  getBreakDuration() {
    return this.breakDuration.value;
  }
  getTotalDays() {
    return this.totalDays.value;
  }
  getTotalPeriods() {
    return this.totalPeriods.value;
  }
  exist(show = true) {
    elementFadeVisibility(this.view, show);
  }
}

class TeacherData {
  constructor() {
    this.view = getElement("stage3");
    this.teacherID = getElement("teacherEmail");
    this.dayInput = getElement("teacherDay");

    this.scheduleBox = getElement("teacherFillerBox");
    this.classInput;
    this.subjectInput;
    this.exist(false);
  }
  setDefaults(size) {
    var division = String();
    for (var i = 0; i < size; i++) {
      division =
        division +
        '<div class="fmt-row" style="margin-bottom:4px"><div class="fmt-col fmt-center" style="width:20%;padding:18px;color:#216bf3">' +
        addNumberSuffixHTML(i + 1) +
        '</div><div class="fmt-col fm-purple" style="width:30%"><fieldset class="text-field" id="teacherClassField' +
        i +
        '"><legend class="field-caption">Class assigned</legend><input class="text-input group-text" required placeholder="e.g. 8A,12b,9,etc. (only one)"  type="text" id="teacherClass' +
        i +
        '" name="teacherScheduleDetail"></fieldset></div><div class="fmt-col" style="width:50%"><fieldset class="text-field" id="teacherSubjectField' +
        i +
        '"><legend class="field-caption">Subject to be taken</legend><input class="text-input group-text" placeholder="e.g. Physics, Politics, etc."  type="text" id="teacherSubject' +
        i +
        '" name="teacherScheduleDetail"></fieldset></div></div>';
    }
    this.scheduleBox.innerHTML = division;

    this.classInput = Array(size);
    this.subjectInput = Array(size);
    for (var i = 0; i < size; i++) {
      this.classInput[i] = getElement("teacherClass" + i);
      this.subjectInput[i] = getElement("teacherSubject" + i);
    }
  }
  exist(show = true) {
    visibilityOf(this.view, show);
  }
}

window.onload = function () {
  initiateIDB();
  var register = new Register();
  var adminEmail;
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      adminEmail = user.email;
      register.greeting.textContent = "Admin, " + adminEmail;
    }
  });
  var stage1 = new Stage1();
  var stage2 = new Stage2();

  new TeacherData().exist(false);
  stage1.save.onclick = function () {
    stage1.exist(false);
    stage2.exist(true);
    stage2.save.onclick = function () {
      var data = [
        {
          type: def.admin,
          email: adminEmail,
          name: stage1.getName(),
          phone: stage1.getPhone(),
        },
        {
          type: def.institution,
          name: stage1.getInstName(),
          uiid: stage1.getInstID(),
        },
        {
          type: def.timings,
          startTime: stage2.getStartTime(),
          endTime: stage2.getEndTime(),
          breakStartTime: stage2.getBreakStart(),
          startDay: stage2.getFirstDay(),
          periodMinutes: stage2.getPeriodDuration(),
          breakMinutes: stage2.getBreakDuration(),
          totalDays: stage2.getTotalDays(),
          totalPeriods: stage2.getTotalPeriods(),
        },
      ];
      saveDefaults(data);
      stage2.exist(false);
      document.getElementById("viewportTag").setAttribute('content', 'inital-scale=1.0');
      var teacherData = new TeacherData();
      teacherData.setDefaults(stage2.getTotalPeriods()); //getDefaultPreference(def.timings, totalPeriods));
      
      teacherData.exist(true);

      var teachers = Array("1teacher@testing", "2teacher@testing");
      for (var tindex = 0; tindex < teachers.length; tindex++) {
        for (var dayI = 0; dayI < stage2.getTotalDays(); dayI++) {
          for (var perI = 0; perI < stage2.getTotalPeriods(); perI++) {
            teacherDynamo(teachers[tindex], dayI, perI, "9B", "Biology");
          }
        }
      }
      clog(teacherSchedule);
    };
  };
};

var teacherSchedule = [];
let teacherDynamo = function (
  teacherID,
  dayIndex,
  periodIndex,
  classvalue,
  subject,
  hold = true
) {
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

function formatPhone(number = String()) {
  if (number.length < 10) {
    return false;
  }
  if (number.length > 10) {
    if (
      number.charAt(0) == "+" &&
      number.charAt(1) == "9" &&
      number.charAt(2) == "1"
    ) {
      return number.substring(3, number.length - 1);
    } else {
      return false;
    }
  }
  return true;
}

let usernameValid = function (name = String()) {
  return /^(?=.{8,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/.test(
    name.toLocaleLowerCase()
  );
};

let addNumberSuffixHTML = function (number) {
  var str = String(number);
  switch (number) {
    case 1:
      return number + "<sup>st</sup>";
    case 2:
      return number + "<sup>nd</sup>";
    case 3:
      return number + "<sup>rd</sup>";
    default: {
      if (number > 9) {
        if (str.charAt(str.length - 2) == "1") {
          return number + "<sup>th</sup>";
        } else {
          switch (str.charAt(str.length - 1)) {
            case "1":
              return number + "<sup>st</sup>";
            case "2":
              return number + "<sup>nd</sup>";
            case "3":
              return number + "<sup>rd</sup>";
            default:
              return number + "<sup>th</sup>";
          }
        }
      } else {
        return number + "<sup>th</sup>";
      }
    }
  }
};
