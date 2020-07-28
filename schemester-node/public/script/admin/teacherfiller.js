class TeacherFiller {
    constructor() {
      sessionStorage.clear();
      this.data = new ReceiveData();
      this.view = getElement("workbox");
      this.next = getElement("nextSchedule");
      this.nloader = getElement("nextLoader");
      this.load(false);
      
      if(this.data.isAdmin){
        this.teacherIDField = new TextInput("teacherEmailField","teacherEmail","teacherEmailError",validType.email);
        this.teacherID = getElement("teacherEmailView");
      }

      this.dayCaption = getElement("teacherDayCaption");
      this.dayView = getElement("teacherDay");
      this.dayCount = 0;
      this.setDayCaption();
      this.setDayView();

      this.teacherClass = Array(this.data.totalPeriods);
      this.teacherSubject = Array(this.data.totalPeriods);

      for(let i = 0;i<this.data.totalPeriods;i++){
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
      }

      for(let i = 0;i<this.data.totalPeriods;i++){
        this.teacherClass[i].validate(_=>{
          if(i+1!=this.totalPeriods){
            this.teacherSubject[i].inputFocus();
          }
        });
        this.teacherSubject[i].validate(_=>{
          if(i+1!=this.totalPeriods){
            this.teacherClass[i+1].inputFocus();
          }
        });
      }
      
      this.next.onclick =_=>{
        if(this.dayCount == 0){
          if(this.data.isAdmin){
            if(!this.teacherIDField.isValid()){
              return this.teacherIDField.validateNow();
            }
            sessionStorage.setItem('teacherID',this.teacherIDField.getInput());
          }
        }
        this.validateDaySchedule(_=>{
          if(this.data.isAdmin){
            this.uploadScheduleByAdmin();
          } else {
            this.uploadScheduleByTeacher();
          }
        })
      }
    }
    setDayCaption(){
      this.dayCaption.innerHTML = `Day ${this.dayCount+1} of ${this.data.totalDays.length}`
    }
    setDayView(){
      this.dayView.innerHTML = constant.weekdays[Number(this.data.totalDays[this.dayCount])]
    }
    load(show = true){
      visibilityOf(this.next,!show);
      visibilityOf(this.nloader,show);
    }
    clearForm(){
      for(let i=0;i<this.data.totalPeriods;i++){
        this.teacherClass[i].setInput(constant.nothing);
        this.teacherSubject[i].setInput(constant.nothing);
        this.teacherClass[i].normalize();
        this.teacherSubject[i].normalize();
      }
    }

    uploadScheduleByTeacher = ()=>{
      //todo
    }
    uploadScheduleByAdmin = () =>{

      postData('/admin/schedule',{
        action:'upload',
        target:'teacher',
        teacherID:sessionStorage.getItem('teacherID'),
        data:{
          //todo
        }
      }).then(response=>{
        if(response.event == code.inst.SCHEDULE_UPLOADED){
          this.dayCount++;
          if(this.dayCount<this.data.totalDays.length){
            this.setDayCaption();
            this.setDayView();
            this.clearForm();
            if(this.data.isAdmin){
              hide(this.teacherIDField.input);
              show(this.teacherID);
              this.teacherID.innerHTML = sessionStorage.getItem('teacherID');
              this.teacherIDField.activate();
            }
            this.load(false);
          } else {
            new ScheduleComplete(this.data);
          }
        } else {
          if(!navigator.onLine){
            snackBar(`Network error, Unable to save.`,'Try again',false,_=>{
              new Snackbar().hide();
                this.next.click();
            })
          } else {
            snackBar(`An error occurred:${response.event}`,'Report');
          }
        }
      }).catch(error=>{
        snackBar(`Error:${error}`,'Report');
      });
    }
    validateDaySchedule = (afterValidate =_=>{})=>{
      let valid = true;
      for(let i=0;i<this.data.totalPeriods;i++){
        if(!(this.teacherClass[i].isValid() && this.teacherSubject[i].isValid())){
          this.teacherClass[i].validateNow(_=>{
            if(i!=this.data.totalPeriods){
              this.teacherSubject[i].inputFocus();
            }
          });
          this.teacherSubject[i].validateNow(_=>{
            if(i+1!=this.data.totalPeriods){
              this.teacherClass[i+1].inputFocus();
            }
          });
          valid = false;
        }
      }
      if(valid){
        this.load();
        for(let i=0;i<this.data.totalPeriods;i++){
          sessionStorage.setItem(this.teacherClass[i].getInput(),this.teacherSubject[i].getInput());
          this.teacherClass[i].activate();
          this.teacherSubject[i].activate();
        }
        afterValidate();
      }
    }
}

class ReceiveData{
  constructor(){
    this.isAdmin = getElement("isAdmin").innerHTML?true:false;
    this.uiid = getElement("uiid").innerHTML;
    this.totalDays = String(getElement("daysInWeek").innerHTML).split(',');
    this.totalPeriods = Number.parseInt(getElement("periodsInDay").innerHTML);
    if(!this.isAdmin){
      this.teacherName = getElement("teachername").innerHTML;
      this.teacherEmail = getElement("teacheremail").innerHTML;
      this.teacherVerified = getElement("teacherverfied").innerHTML=='true'?true:false;
      this.teacherid = getElement("teacherID").innerHTML;
    }
  }
}

class ScheduleComplete{
  constructor(data){
    this.view = getElement("workbox");
    this.view.innerHTML = data.isAdmin?this.content(sessionStorage.getItem('teacherID')):data.teacherName;
    this.addAnother = getElement("addAnother");
    this.exit = getElement("exitadder");

    this.addAnother.onclick =_=>{
      relocate(locate.adminDashPage,{
        target:'addteacher'
      });
    }
    this.exit.onclick =_=>{
      relocate(locate.root);
    }
  }
  content(id){
    return `<div class="fmt-center">
      <div class="heading">Schedule Added.</div>
      <div class="questrial">You have successfully created a full week schedule for <b>${id}</b>. An email has been sent to them for confirmation.
      <br>We will notify you as soon as they accept your schedule invitation. Cheers!</div>
      <br>
      <div>
          <button class="positive-button" id="addAnother">Add another teacher</button>
          Or
          <button class="neutral-button" id="exitadder">Return to dashboard</button>
      </div>
    </div>`;
  }
}

window.onload =()=> window.app = new TeacherFiller();
