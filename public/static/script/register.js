const defaults = 'defaults',batches = 'batches',users = 'users',assignees = 'assignees';
class Stage1{
    constructor(){
        this.view = document.getElementById('stage1');
        this.heading = document.getElementById('s1head');
        this.adminHead = document.getElementById('adminHead');
        this.nameField = document.getElementById('adminNameField');
        this.nameInput = document.getElementById('adminName');
        this.nameError = document.getElementById('adminNameError');
        this.phoneField = document.getElementById('phoneField');
        this.phoneInput = document.getElementById('adminPhone');
        this.phoneError = document.getElementById('phoneError');
        this.instHead = document.getElementById('instHead');
        this.instNameField = document.getElementById('instNameField');
        this.instNameInput = document.getElementById('instName');
        this.instNameError = document.getElementById('instNameError');
        this.instIdField = document.getElementById('uiidField');
        this.instIdInput = document.getElementById('uiid');
        this.instIdError = document.getElementById('uiidError');
        this.save = document.getElementById('saveStage1');

    }
    setDefaults(){
        this.heading.textContent = 'Basic';
        this.adminHead.textContent = 'Administrator';
        this.instHead.textContent = 'Institution';
        visibilityOf(new Stage1().view,true);
        visibilityOf(new Stage2().view,false);
    }
}
class Stage2{
    constructor(){
        this.view = document.getElementById('stage2');
        this.heading = document.getElementById('s2head');
        this.timeHead = document.getElementById('timeHead');
        this.startTimeField = document.getElementById('startTimeField');
        this.startTime = document.getElementById('startTime');
        this.startTimeError = document.getElementById('startTimeError');
        this.endTimeField = document.getElementById('endTimeField');
        this.endTime = document.getElementById('endTime');
        this.endTimeError = document.getElementById('endTimeError');
        this.breakStartField = document.getElementById('breakStartField');
        this.breakStart = document.getElementById('breakStartTime');
        this.breakStartError = document.getElementById('breakStartError');
        this.day1Field = document.getElementById('firstDayField');
        this.day1 = document.getElementById('firstDay');
        this.day1Error = document.getElementById('firstDayError');
        this.durationHead = document.getElementById('durationHead');
        this.eachDurationField = document.getElementById('eachDurationField');
        this.eachDuration = document.getElementById('eachDuration');
        this.eachDurationError = document.getElementById('eachDurationError');
        this.totalDaysField = document.getElementById('totalDaysField');
        this.totalDays = document.getElementById('totalDays');
        this.totalDaysError = document.getElementById('totalDaysError');
        this.breakDurationField = document.getElementById('breakDurationField');
        this.breakDuration = document.getElementById('breakDuration');
        this.breakDurationError = document.getElementById('breakDurationError');
        this.save = document.getElementById('saveStage2');
    }
    setDefaults(){
        this.heading.textContent = 'Schedule';
        this.timeHead.textContent = 'Timings';
        this.durationHead.textContent = 'Duration';
        visibilityOf(new Stage1().view,false);
        visibilityOf(new Stage2().view,true);
    }
}


window.onload = function(){
    //if stage1 incomplete
        var stage1 = new Stage1();
        stage1.setDefaults();
        stage1.save.onclick = function(){
            var stage2 = new Stage2()
            stage2.setDefaults();
            stage2.save.onclick = function(){
                var data2 = [
                    {
                        type:'admin',
                        email:'user.email',
                        name:stage1.nameInput.value,
                        phone:stage1.phoneInput.value
                    },
                    {
                        type:'institution',
                        name:stage1.instNameInput.value,
                        uiid:stage1.instIdInput.value,
                    },
                    {
                        type:'timings',
                        startTime:stage2.startTime.value,
                        endTime:stage2.endTime.value,
                        breakStartTime:stage2.breakStart.value,
                        startDay:stage2.day1.value,
                        periodMinutes:stage2.eachDuration.value,
                        breakMinutes:stage2.breakDuration.value,
                        totalDays:stage2.totalDays.value
                    }
                ]
                createDefaultValues(defaults,data2,'type');
                //createScheduleValues('schedule',data2,'type');
            }
            
        }
}