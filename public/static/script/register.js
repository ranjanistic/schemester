const defaults = 'defaults',batches = 'batches',users = 'users',assignees = 'assignees';
var dbVer = 1;
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
                var data = [
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
                var data2 = [
                    {
                        day:'mon',
                        email:'user.email',
                        name:stage1.nameInput.value,
                        phone:stage1.phoneInput.value
                    },
                    {
                        day:'tue',
                        name:stage1.instNameInput.value,
                        uiid:stage1.instIdInput.value,
                    },
                    {
                        day:'wed',
                        startTime:stage2.startTime.value,
                        endTime:stage2.endTime.value,
                        breakStartTime:stage2.breakStart.value,
                        startDay:stage2.day1.value,
                        periodMinutes:stage2.eachDuration.value,
                        breakMinutes:stage2.breakDuration.value,
                        totalDays:stage2.totalDays.value
                    }
                ]
                createDefaultValues(defaults,data,'type',dbVer);
                createScheduleValues('batches',data2,'day',++dbVer);

                //This creates teacherSchedule json array and loops in it, for creation of all teachers' schedule by administrator.
                var teachers = Array('1teacher@testing','2teacher@testing');

                for(var tindex = 0;tindex<teachers.length;tindex++){
                    for(var dayI = 0;dayI<6;dayI++){        //for day index, currently set to 6 days max
                        for(var perI = 0;perI<5;perI++){    //for periods in each day, currently set to 5 max.
                            teacherDynamo(teachers[tindex],dayI,perI,'9B','Biology');    //classvalue and subjects are constant temporarily.
                        }
                    }
                }
                console.log(teacherSchedule);
                //test(); //to log the values of teacherSchedule json array.
            }
            
        }
}
//days array for dayIndex
var days = new Array('mon','tue','wed','thu','fri','sat');
//teacherSchedule json array
var teacherSchedule = [];
//previous teacher id
var lastID = nothing;
//previous day index
var lastDay = -1; 
let teacherDynamo = function(teacherID,dayIndex,periodIndex,classvalue,subject,hold = true){
    if(teacherID in teacherSchedule)
    {   
        if(days[dayIndex] in teacherSchedule[teacherID])
        {
    teacherSchedule[teacherID][days[dayIndex]][periodIndex] = {
                    "class":classvalue,
                    "hold":hold,
                    "subject":subject
            }
    }
    else{
        teacherSchedule[teacherID][days[dayIndex]] = {};
        teacherSchedule[teacherID][days[dayIndex]][periodIndex] = {
            "class":classvalue,
            "hold":hold,
            "subject":subject
    }
    }
}

else{
    teacherSchedule[teacherID] = {};
    if(days[dayIndex] in teacherSchedule[teacherID])
    {
teacherSchedule[teacherID][days[dayIndex]][periodIndex] = {
                "class":classvalue,
                "hold":hold,
                "subject":subject
        }
}
else{
    teacherSchedule[teacherID][days[dayIndex]] = {};
    teacherSchedule[teacherID][days[dayIndex]][periodIndex] = {
        "class":classvalue,
        "hold":hold,
        "subject":subject
}
}
}
    // if(lastID!=teacherID){  //if given teacherID has not been pushed in teacherSchedule.
    //      teacherSchedule.push(
    //     {
    //         [teacherID]:[ //teacherID is the json array of days {mon, tue,etc.}
    //             {
    //                 [days[dayIndex]]:[{ //each day is accessed by dayIndex passed as function parameter, day[dayIndex] is a json array.
    //                     [periodIndex]:{ //this is a json Object, holding three unique key pair values passed as parameters. This indicaties the period of current day.
    //                         "class":classvalue,
    //                         "hold":hold,
    //                         "subject":subject
    //                     }
    //                 }]
    //             }
    //         ]
    //     }
    //     );
    //     console.log(teacherSchedule);
    //     lastID = teacherID;     //as the current teacherID has been pushed, now it doesn't need to be pushed again, so it becomes the lastID (means previous ID).
    // } else if(lastDay != dayIndex) {    //if current teacherID has already been pushed, but the day is changed to next one (dayIndex increment),
    //     teacherSchedule[lastID].push({     // push the new day[dayIndex]
    //         [days[dayIndex]]:[{
    //             [periodIndex]:{
    //                 "class":classvalue,
    //                 "hold":hold,
    //                 "subject":subject
    //             }
    //         }]
    //     });
    //     lastDay = dayIndex;     //current day has been pushed, so current day is now the lastDay (previous day), no need to push again the same day.
    // } else {        //if current teacher and current day is already pushed,
    //     teacherSchedule[lastID][days[lastDay]].push({ // then just push the new period (periodIndex) in the current day of current teacherID, which is always unique.
    //         [periodIndex]:{
    //             "class":classvalue,
    //             "hold":hold,
    //             "subject":subject
    //         }
    //     });
    // }
    //createTeacherSchedule('assignees',teacherSchedule,null,++dbVer);  //meant for storage in indexedDB later.
}


function test(){
    //check console after this function is called.
    teacherSchedule.forEach(function(teacher){
        log(teacher);
    });
    snackBar(true,"Check console, before the 'Event' log.");
}