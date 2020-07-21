class TeacherData {
    constructor() {
      this.view = getElement("stage3");
      this.teacherID = getElement("teacherEmail");
      this.dayInput = getElement("teacherDay");
  
      //this.scheduleBox = getElement("teacherFillerBox");
      this.classInput;
      this.subjectInput;
    }
    setDefaults(size) {
      this.classInput = Array(size);
      this.subjectInput = Array(size);
      for (var i = 0; i < size; i++) {
        this.classInput[i] = getElement("teacherClass" + i);
        this.subjectInput[i] = getElement("teacherSubject" + i);
      }
    }
}

  window.onload =()=>window.app = new TeacherData();