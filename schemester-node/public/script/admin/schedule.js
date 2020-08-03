
/**
 * Script for admin/schedule_view, for individual schedule view w.r.t administrator.
 */
class Schedule{
    constructor(){
        this.data = new ReceiveData();
        this.back = getElement("back");
        this.back.onclick=_=>{window.history.back()}
        window.fragment =this.data.isTeacher()?new Teacher(this.data):new Class(this.data);
    }
}
/**
 * A class for a teacher's schedule view script.
 */
class Teacher{
    constructor(){
        this.data = new ReceiveData();
        this.daytabsview = getElement("dayTabs");
        this.dayscheduleView = getElement("dayscheduleview");
        let tabs = String();
        this.daytabs = Array(this.data.weekdays.length);
        this.data.weekdays.forEach((dindex,index)=>{
            tabs += `<div class="fmt-col tab-button" style="width:${100/this.data.weekdays.length}%" id="daytab${dindex}">${constant.weekdays[dindex]}</div>`;
        });
        this.daytabsview.innerHTML = tabs;
        this.data.weekdays.forEach((dindex,index)=>{
            this.daytabs[index] = getElement(`daytab${dindex}`);
            this.daytabs[index].onclick=_=>{
                this.daytabs.forEach((tab,i)=>{
                    if(i==index){
                        setClass(this.daytabs[i],'fmt-col tab-button-selected');
                    } else {
                        setClass(this.daytabs[i],'fmt-col tab-button');
                    }
                });
                this.setDataForDindex(Number(dindex));
            }
        });
        this.schedule = null;
        this.setDataForDindex();
        setClass(this.daytabs[0],'fmt-col tab-button-selected');
    }
    setDataForDindex(dayIndex = Number(this.data.weekdays[0])){
        if(!this.schedule){
            clog("from cloud");
        postJsonData(post.admin.schedule,{
            target:client.teacher,
            action:'receive',
            teacherID:this.data.teacherID,
            dayIndex:dayIndex
        }).then(response=>{
            if(response.event == 'OK'){
                clog("OK");
                this.schedule = response.schedule;           
                let theday;
                clog(this.schedule);
                let found = this.schedule.days.some((day,index)=>{
                    if(day.dayIndex == dayIndex){
                        clog(day);
                        clog("setting");
                        theday = day;
                        clog([theday.period][0]);
                        return true
                    }
                });
                if(found){
                    this.setPeriodsView([theday.period][0]);
                }
            } else {
                this.schedule == null;
            }
        }).catch(e=>{
            clog(e);
        });
        } else {
            clog("from memory");
            let theday;
            let found = this.schedule.days.some((day,index)=>{
                if(day.dayIndex == dayIndex){
                    clog(day);
                    clog("setting");
                    theday = day;
                    clog([theday.period][0]);
                    return true
                }
            });
            if(found){
                this.setPeriodsView([theday.period][0]);
            }
        }
    }
    setPeriodsView(periods){
        clog("period settter");
        let rows = constant.nothing;
        periods.forEach((period,index)=>{
            rows += `<div class="fmt-row tab-container fmt-center fmt-padding" id="period0">
            <div class="fmt-col fmt-quarter fmt-padding-small active">
                ${addNumberSuffixHTML(index+1)} period
            </div>
            <div class="fmt-col fmt-quarter fmt-padding-small positive">
                ${period.classname}
            </div>
            <div class="fmt-col fmt-quarter fmt-padding-small positive">
                ${period.subject}
            </div>
            <div class="fmt-col fmt-quarter">
                <button class="circle-button">✒️</button>
            </div>
            </div>`;
        })
        this.dayscheduleView.innerHTML = rows;
    }
}

/**
 * A class for a class's schedule view script.
 */
class Class{
    constructor(){
        
    }
}

class ReceiveData{
    constructor(){
        this.client = getElement("client").innerHTML;
        if(this.client == client.teacher){
            this.teacherID = getElement("teacherID").innerHTML == 'null'?null:getElement("teacherID").innerHTML;
            if(this.teacherID){
                this.teacherUID = getElement("teacherUID").innerHTML;
                this.teachername = getElement("teachername").innerHTML;
                this.verified = getElement("teacherverified").innerHTML == 'true'?true:false;
            } else {
                this.teacherID = getElement("scheduleteacherID").innerHTML
            }
        }
        this.weekdays = String(getElement("daysinweek").innerHTML).split(',');
        this.totalperiods = Number(getElement("periodcount").innerHTML);
    }
    isTeacher(){
        return this.client == client.teacher;
    }
}

window.onload =_=> new Schedule()