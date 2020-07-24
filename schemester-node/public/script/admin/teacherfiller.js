class TeacherFiller {
    constructor() {
      this.view = getElement("workbox");

      this.teacherIDField = new TextInput("teacherEmailField","teacherEmail","teacherEmailError",validType.email);
      this.teacherID = getElement("teacherEmailView");
      show(this.teacherIDField.input);
      hide(this.teacherID);

      this.dayView = getElement("teacherDay");

      this.next = getElement("nextSchedule");
      this.nloader = getElement("nextLoader");
      this.load(false);
      this.totalDays = Number.parseInt(getElement("daysInWeek").innerHTML);
      this.totalPeriods = Number.parseInt(getElement("periodsInDay").innerHTML);
      this.firstDay = getElement("startDay").innerHTML;

      this.dayCount = constant.weekdays.indexOf(this.firstDay);
      

      this.teacherClass = Array(this.totalPeriods);
      this.teacherSubject = Array(this.totalPeriods);

      for(let i = 0;i<this.totalPeriods;i++){
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

      for(let i = 0;i<this.totalPeriods;i++){
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
        if(this.dayCount == constant.weekdays.indexOf(this.firstDay)){
          if(!this.teacherIDField.isValid()){
            this.teacherIDField.validateNow();
            return;
          }
          sessionStorage.setItem('teacherID',this.teacherIDField.getInput());
        }

        this.validateDaySchedule(_=>{
            this.uploadSchedule();
        })
      }
    }
    load(show){
      visibilityOf(this.next,!show);
      visibilityOf(this.nloader,show);
    }
    clearForm(){
      for(let i=0;i<this.totalPeriods;i++){
        this.teacherClass[i].setInput(constant.nothing);
        this.teacherSubject[i].setInput(constant.nothing);
        this.teacherClass[i].normalize();
        this.teacherSubject[i].normalize();
      }
    }

    uploadSchedule = () =>{
      postData('/admin/upload',{
        target:'teacherschedule'
        //todo: teacher schedule upload, one day at a time
      }).then(response=>{
        if(response.event == code.inst.SCHEDULE_UPLOADED){
          if(this.dayCount<this.totalDays){
            this.dayCount++;
            this.dayView.innerHTML = constant.weekdays[this.dayCount];
            this.clearForm();
            hide(this.teacherIDField.input);
            show(this.teacherID);
            this.teacherID.innerHTML = sessionStorage.getItem('teacherID');
            this.teacherIDField.activate();
            this.load(false);
          } else {;
            new ScheduleComplete(sessionStorage.getItem('teacherID'));
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
    validateDaySchedule = async (afterValidate =_=>{})=>{
      let valid = true;
      for(let i=0;i<this.totalPeriods;i++){
        setTimeout(() => {
          if(!(this.teacherClass[i].isValid() && this.teacherSubject[i].isValid())){
            this.teacherClass[i].validateNow(_=>{
              if(i!=this.totalPeriods){
                this.teacherSubject[i].inputFocus();
              }
            });
            this.teacherSubject[i].validateNow(_=>{
              if(i+1!=this.totalPeriods){
                this.teacherClass[i+1].inputFocus();
              }
            });
            valid = false;
          } else {
            clog("valid"+i);
          }
          if(valid){
            this.load();
            for(let i=0;i<this.totalPeriods;i++){
              this.teacherClass[i].activate();
              this.teacherSubject[i].activate();
            }
            afterValidate();
          }
        }, 100);
      }
    }
}

class ScheduleComplete{
  constructor(teacherID){
    this.view = getElement("workbox");
    this.view.innerHTML = this.content(teacherID);
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
