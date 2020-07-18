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
      if(show){
        new Register().setStageView('Add Records');
        new Register().backStage.onclick = _=>{
          new TeacherData().exist(false);
          new Stage2().exist(true);
        }
      }
    }
  }

  window.onload =()=>window.app = new TeacherData();