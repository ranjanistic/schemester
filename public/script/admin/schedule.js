
/**
 * Script for admin/schedule_view, for individual schedule view w.r.t administrator.
 */
class Schedule{
    constructor(){
        this.data = new ReceiveData();
        this.back = getElement("back");
        this.back.onclick=_=>{window.history.back()}
        try{
            window.fragment =this.data.isTeacher()?new Teacher(this.data):new Class(this.data);
        }catch{
            new NoSchedule();
        }
    }
}

class NoSchedule{
    constructor(){
        const data = new ReceiveData();
        this.addschedule = getElement("addschedule");
        this.addschedule.onclick=_=>{
            refer(locate.admin.session, { target: locate.admin.target.addteacher, teacherID:data.teacherID });
        }
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
        this.currentdayIndex = this.data.weekdays[0];
        clog(this.currentdayIndex);
        this.daytabsview.innerHTML = tabs;
        this.data.weekdays.forEach((dindex,index)=>{
            this.daytabs[index] = getElement(`daytab${dindex}`);
            this.daytabs[index].onclick=_=>{
                this.daytabs.forEach((tab,i)=>{
                    if(i==index){
                        this.currentdayIndex = dindex;
                        clog(this.currentdayIndex);
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
            specific:'single',
            teacherID:this.data.teacherID,
            dayIndex:dayIndex
        }).then(response=>{
            clog(response);
            if(response.event == code.OK){
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
            this.theday;
            let found = this.schedule.days.some((day,index)=>{
                if(day.dayIndex == dayIndex){
                    clog(day);
                    clog("setting");
                    this.theday = day;
                    clog([this.theday.period][0]);
                    return true
                }
            });
            if(found){
                this.setPeriodsView([this.theday.period][0]);
            }
        }
    }
    setPeriodsView(periods){
        clog("period settter");
        let rows = constant.nothing;
        
        periods.forEach((period,p)=>{
            rows += `
            <div class="fmt-row tab-container fmt-center fmt-padding" id="period${p}">
                <div class="fmt-col fmt-quarter fmt-padding-small active">
                    ${addNumberSuffixHTML(p+1)} period
                </div>
                <div class="fmt-col fmt-quarter fmt-padding-small positive" id="classnameview${p}">
                    <span id="classname${p}">${period.classname}</span> <button class="neutral-button caption" id="editclassname${p}">✒️</button>
                </div>

                <div class="fmt-col fmt-quarter fmt-padding-small positive" id="classnameeditor${p}">
                    <fieldset style="margin:0" class="text-field questrial"  id="classnamefield${p}">
                        <legend class="field-caption">Replace ${period.classname}</legend>
                        <input class="text-input" style="font-size:18px" required value="${period.classname}" placeholder="New class" type="text" id="classnameinput${p}" name="classname" >
                        <span class="fmt-right error-caption"  id="classnameerror${p}"></span>
                    </fieldset>
                    <img class="fmt-spin-fast" style="display:none" width="25" src="/graphic/blueLoader.svg" id="classnameloader${p}"/>
                    <button class="positive-button caption" id="saveclassname${p}">Save</button>
                    <button class="negative-button caption" id="cancelclassname${p}">Cancel</button>
                </div>

                <div class="fmt-col fmt-quarter fmt-padding-small positive" id="subjectview${p}">
                    <span id="subject${p}">${period.subject}</span> <button class="neutral-button caption" id="editsubject${p}">✒️</button>
                </div>
                <div class="fmt-col fmt-quarter fmt-padding-small positive" id="subjecteditor${p}">
                    <fieldset style="margin:0" class="text-field questrial" id="subjectfield${p}">
                        <legend class="field-caption">Replace ${period.subject}</legend>
                        <input class="text-input" style="font-size:18px" required value="${period.subject}" placeholder="New subject" type="text" id="subjectinput${p}" name="subject" >
                        <span class="fmt-right error-caption"  id="subjecterror${p}"></span>
                    </fieldset>
                    <img class="fmt-spin-fast" style="display:none" width="25" src="/graphic/blueLoader.svg" id="subjectloader${p}"/>
                    <button class="positive-button caption" id="savesubject${p}">Save</button>
                    <button class="negative-button caption" id="cancelsubject${p}">Cancel</button>
                </div>


                <div class="fmt-col fmt-quarter fmt-padding-small positive">
                    <button class="positive-button">Action</button>
                </div>
            </div>`;
        });
        this.dayscheduleView.innerHTML = rows;
        //to handle renaming of fields
        this.classeditable = new Array();
        this.subjecteditable = Array();
        periods.forEach((period,p)=>{
            this.classeditable.push(new Editable(`classnameview${p}`,`classnameeditor${p}`,
                new TextInput(`classnamefield${p}`,`classnameinput${p}`,`classnameerror${p}`,validType.nonempty),
                `editclassname${p}`,`classname${p}`,`saveclassname${p}`,`cancelclassname${p}`,`classnameloader${p}`
            ));
            this.classeditable[p].onSave(_=>{
                this.classeditable[p].validateInputNow();
                if(!this.classeditable[p].isValidInput()) return;
                this.classeditable[p].disableInput();
                if(this.classeditable[p].getInputValue() == this.classeditable[p].displayText()){
                    return this.classeditable[p].clickCancel();
                }
                this.classeditable[p].load();
                postJsonData(post.admin.schedule,{
                    target:client.teacher,
                    action:"update",
                    specific:"renameclass",
                    teacherID:this.data.teacherID,
                    dayIndex:Number(this.currentdayIndex),
                    period:p,
                    oldclassname:this.classeditable[p].displayText(),
                    newclassname:this.classeditable[p].getInputValue()
                }).then(response=>{
                    this.classeditable[p].load(false);
                    clog(response);
                    if(response.event == code.OK){
                        this.classeditable[p].setDisplayText(this.classeditable[p].getInputValue());
                        this.classeditable[p].display();
                        return;
                    }
                    switch(response.event){
                        case code.schedule.SCHEDULE_CLASHED:{
                            this.classeditable[p].textInput.showError(
                                `This class is already taken at this period by 
                                <a id="clashlink${response.clash.id}">${response.clash.id}</a>.`
                            );
                            return getElement(`clashlink${response.clash.id}`).onclick=_=>{
                                refer(locate.admin.session, {
                                    target: locate.admin.target.viewschedule,
                                    type: client.teacher,
                                    'teacherID':response.clash.id
                                });
                            }
                        }
                        default:return this.classeditable[p].textInput.showError('Error');
                    }
                }).catch(err=>{
                    snackBar(err,'Report');
                });
                
            })
            this.subjecteditable.push(new Editable(`subjectview${p}`,`subjecteditor${p}`,
                new TextInput(`subjectfield${p}`,`subjectinput${p}`,`subjecterror${p}`,validType.nonempty),
                `editsubject${p}`,`subject${p}`,`savesubject${p}`,`cancelsubject${p}`,`subjectloader${p}`
            ));
            this.subjecteditable[p].onSave(_=>{
                this.subjecteditable[p].validateInputNow();
                if(!this.subjecteditable[p].isValidInput()) return;
                this.subjecteditable[p].disableInput();
                if(this.subjecteditable[p].getInputValue() == this.classeditable[p].displayText()){
                    return this.subjecteditable[p].clickCancel();
                }
                this.subjecteditable[p].load();
                
                postJsonData(post.admin.schedule,{
                    target:client.teacher,
                    action:"update",
                    specific:"renamesubject",
                    teacherID:this.data.teacherID,
                    dayIndex:Number(this.currentdayIndex),
                    period:p,
                    oldsubject:this.subjecteditable[p].displayText(),
                    newsubject:this.subjecteditable[p].getInputValue()
                }).then(response=>{
                    this.subjecteditable[p].load(false);
                    clog(response);
                    if(response.event == code.OK){
                        this.subjecteditable[p].setDisplayText(this.subjecteditable[p].getInputValue());
                        this.subjecteditable[p].display();
                        return;
                    }
                    switch(response.event){
                        default:return this.subjecteditable[p].textInput.showError('Error');
                    }
                }).catch(err=>{
                    snackBar(err,'Report');
                });
            })
        })
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
        if(this.isTeacher()){
            this.teacherID = getElement("teacherID").innerHTML == 'null'?null:getElement("teacherID").innerHTML;
            if(this.teacherID){
                this.teacherUID = getElement("teacherUID").innerHTML;
                this.teachername = getElement("teachername").innerHTML;
                this.verified = getElement("teacherverified").innerHTML == 'true'?true:false;
            } else {
                this.teacherID = getElement("scheduleteacherID").innerHTML
            }
        } else {
            this.classname = getElement("classname").innerHTML == 'null'?null:getElement("classname").innerHTML;
            if(this.classname){
                this.classUID = getElement("classUID").innerHTML;
            }
        }
        this.weekdays = String(getElement("daysinweek").innerHTML).split(',');
        this.totalperiods = Number(getElement("periodcount").innerHTML);
    }
    isTeacher(){
        return this.client == client.teacher;
    }
    isStudent(){
        return this.client == client.student;
    }
}

window.onload =_=> new Schedule()