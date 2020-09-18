// const { clog } = require("../codes");

/**
 * Script for admin/schedule_view, for individual schedule view w.r.t administrator.
 */
class Schedule{
    constructor(){
        this.data = new ReceiveData();
        this.darkmode = new Switch('darkmode');
        this.darkmode.turn(theme.isDark());
        this.darkmode.onTurnChange(_=>{theme.setDark()},_=>{theme.setLight()});
        sessionStorage.removeItem('switchclash');
        this.back = getElement("back");
        this.back.onclick=_=>{window.history.back()}
        this.settingsmenu = new Menu("settingsmenu","settingsmenubutton");
        this.editmodeview = getElement("editmodeview");
        this.editmode = new Switch('editmode');
        this.editmode.onTurnChange(_=>{
            sessionStorage.setItem('switchclash',true);
            this.editmodeview.innerHTML=`Switch Edit`;
            snackBar('Any change will be switched if clashed with someone.','Means?',bodyType.warning,_=>{
                infoDialog('Edit modes',`The edit mode type tells schemester how to respond if any change made by you results in any kind of conflict.<br/>
                    <ul>
                        <li><b>Clash check</b>: The default mode. If any change in classname, or incharge at a certain period of day made by you results in conflict with some other class or teacher, the change will not take place, and conflict details will be displayed.</li>
                        <br/>
                        <li><b>Switch</b>: If any change in classname, or incharge at a certain period of day made by you results in conflict with some other class or teacher, schemester will try to resolve conflict by exchanging details with the affected class or teacher, and will make your desired change.
                        You'll be notified about which other information has been modified in order to apply your current change.</li>
                    </ul>
                `,'/graphic/elements/editicon.svg');
            });
        },_=>{
            sessionStorage.removeItem('switchclash');
            this.editmodeview.innerHTML=`Clash Edit`;
            snackBar('Changes will not be applied if conflicted');
        })
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
        this.deleteschedule = getElement("deleteschedule");
        if(!this.data.pending){
            this.makeincharge = getElement("makeincharge");
            this.makeincharge.onclick=_=>{
                //todo
            }
            this.removeteacher = getElement("removeteacher");
            this.removeteacher.onclick=_=>{
                confirmDialog('Remove teacher?',`Are you sure you want to remove ${this.data.teachername} (${this.data.teacherID}) from your institution?
                    Their schedule will not be affected, but they won't be
                able to login to your institution. They'll have to join again if needed.`,null,_=>{
                    loadingBox(true,'Removing Teacher...');
                    postJsonData(post.admin.users,{
                        target:client.teacher,
                        action:'remove',
                        teacherID:this.data.teacherID
                    }).then(resp=>{
                        if(resp.event == code.OK){
                            return relocate(locate.admin.session,{
                                u:localStorage.getItem(constant.sessionUID),
                                target:locate.admin.target.teachers
                            })
                        }
                        loadingBox(false);
                        snackBar(resp.event,null,false);
                    });
                },true,_=>{new Dialog().hide();snackBar(`${this.data.teachername}'s account is safe.`)});
            }
        }
        this.deleteschedule.onclick=_=>{
            const confirmdialog = new Dialog();
            confirmdialog.setDisplay('Delete schedule?',`Are you sure you want to delete ${this.data.pending?this.data.teacherID:this.data.teachername}'s schedule permanently?${this.data.pending?' Their invitation will no longer remain valid.':' This might affect schedule of several classes too.'}`);
            this.data.pending
            ?confirmdialog.createActions(['Remove','Abort'],[actionType.negative,actionType.neutral])
            :confirmdialog.createActions(['Check affected classes','Delete anyway','Abort'],[actionType.positive,actionType.negative,actionType.neutral]);
            confirmdialog.transparent();
            this.data.pending
            ?confirmdialog.onButtonClick([_=>{
                confirmdialog.loader();
                snackBar(`Deleting ${this.data.teacherID}'s schedule...`,null,false);
                postJsonData(post.admin.schedule,{
                    target:client.teacher,
                    action:"remove",
                    teacherID:this.data.teacherID
                }).then((resp)=>{
                    if(resp.event == code.OK){
                        return relocate(locate.admin.session,{
                            u:localStorage.getItem(constant.sessionUID),
                            target:locate.admin.target.teachers,
                        });
                    }
                    snackBar(resp.event);
                });
            },_=>{
                confirmdialog.hide();
            }])
            :confirmdialog.onButtonClick([_=>{
                confirmdialog.loader();
                postJsonData(post.admin.receivedata,{
                    target:'classroom',
                    specific:'teacherclasses',
                    teacherID:this.data.teacherID
                }).then(resp=>{
                    if(resp.event==code.OK){
                        let classlist = `<div class="fmt-row fmt-center">`;
                        resp.classes.forEach((Class,c)=>{
                            classlist+=`<div class="fmt-row group-heading positive" id="class${c}">
                                <div class="fmt-col third">
                                    ${Class}
                                </div>
                                <div class="fmt-col third">
                                    <button class="positive-button caption" id="editclass${c}">Edit schedule</button>
                                </div>
                            </div>`;
                        });
                        confirmdialog.setDisplay('Affected classes',`Deleting ${this.data.teachername}'s schedule will affect following classes.<br/>
                        ${classlist}<div>`);
                        const editclasses = [];
                        resp.classes.forEach((Class,c)=>{
                            editclasses.push(getElement(`editclass${c}`));
                            editclasses[c].onclick=_=>{
                                referTab(locate.admin.session,{
                                    target:'viewschedule',
                                    type:client.student,
                                    classname:Class
                                });
                            }
                        })
                        confirmdialog.createActions(['Delete schedule now','Abort'],[actionType.negative,actionType.neutral]);
                        confirmdialog.onButtonClick([_=>{
                            confirmdialog.loader();
                            snackBar(`Deleting ${this.data.teachername}'s schedule (${this.data.teacherID})...`,null,false);
                            postJsonData(post.admin.schedule,{
                                target:client.teacher,
                                action:"remove",
                                teacherID:this.data.teacherID
                            }).then((resp)=>{
                                if(resp.event == code.OK){
                                    return relocate(locate.admin.session,{
                                        u:localStorage.getItem(constant.sessionUID),
                                        target:locate.admin.target.teachers,
                                    });
                                }
                                snackBar(resp.event);
                            });
                        },_=>{
                            confirmdialog.hide();
                        }]);
                        confirmdialog.loader(false);
                    }
                }).catch(e=>{
                    clog(e);
                });
            },_=>{
                confirmdialog.loader();
                snackBar(`Deleting ${this.data.teachername}'s schedule (${this.data.teacherID})...`,null,false);
                postJsonData(post.admin.schedule,{
                    target:client.teacher,
                    action:"remove",
                    teacherID:this.data.teacherID
                }).then((resp)=>{
                    if(resp.event == code.OK){
                        return relocate(locate.admin.session,{
                            u:localStorage.getItem(constant.sessionUID),
                            target:locate.admin.target.teachers,
                        });
                    }
                    snackBar(resp.event);
                });
            },_=>{
                confirmdialog.hide();
            }]);
            confirmdialog.show();
        }

        this.daytabsview = getElement("dayTabs");
        let tabs = String();
        this.dayboxes = [];
        this.daynames = [];
        this.dayshows = [];
        this.periodsView = [];
        this.data.weekdays.forEach((dindex,index)=>{
            tabs += `<div class="fmt-col fmt-half fmt-padding-small">
            <div class="fmt-row tab-container b-neutral" id="dayBox${dindex}">
                <div class="fmt-row fmt-padding-small   ">
                    <div class="fmt-col  fmt-twothird  group-heading questrial" style="text-align:left;color:var(--secondary-text)" id="dayname${dindex}">
                        ${constant.weekdays[dindex]}
                    </div>
                    <div class="fmt-col fmt-third">
                        <button class="fmt-right positive-button-togg  questrial" id="dayexpander${dindex}">Show</button>
                    </div>
                </div>
                <div class="fmt-row"  id="periodsview${dindex}">
                    <!-- periods -->
                </div>
            </div>
        </div>`;
        });
        this.daytabsview.innerHTML = tabs;
        this.currentdayIndex = this.data.weekdays[0];
        this.data.weekdays.forEach((dindex,index)=>{
            this.dayboxes.push(getElement(`dayBox${dindex}`));
            this.daynames.push(getElement(`dayname${dindex}`));
            this.dayshows.push(getElement(`dayexpander${dindex}`));
            this.periodsView.push(getElement(`periodsview${dindex}`));
            const isToday = new Date().getDay()==dindex;
            isToday?this.setActive(index):hide(this.periodsView[index]);
            this.dayshows[index].innerHTML = isToday?'Hide':'Show';    //replace by rotated icon;
            this.dayshows[index].onclick=_=>{
                isToday?hide(this.periodsView[index]):show(this.periodsView[index]);
                let shower = this.dayshows[index].onclick;
                this.dayshows[index].innerHTML = isToday?'Show':'Hide';    //replace by rotated icon;
                this.dayshows[index].onclick=_=>{
                    isToday?show(this.periodsView[index]):hide(this.periodsView[index]);
                    this.dayshows[index].innerHTML = isToday?'Hide':'Show';    //replace by rotated icon;
                    this.dayshows[index].onclick = shower;
                }
                this.setDataForDindex(Number(dindex));
            }
        });
        this.schedule = null;
        this.setDataForDindex(Number(this.data.weekdays.includes(String(new Date().getDay()))?new Date().getDay():this.data.weekdays[0]));
        Promise.resolve(this.startTimers());
    }
    async startTimers(){
        setInterval(() => {
            this.data.weekdays.forEach((dindex,index)=>{
                new Date().getDay()==dindex?this.setActive(index):_=>{};
            });
        }, 1);
    }
    setActive(index){
        this.dayboxes[index].style.backgroundColor ="24f36b34";
        this.dayboxes[index].style.border = `4px solid ${colors.positive}`;
        this.daynames[index].style.color = colors.positive;
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
                this.schedule = response.schedule;
                clog(this.schedule);
                this.theday = this.schedule.days.find((day)=>day.dayIndex == dayIndex)
                this.setPeriodsView([this.theday.period][0],this.data.weekdays.indexOf(String(dayIndex)));
            } else {
                this.schedule == null;
            }
        }).catch(e=>{
            clog(e);
        });
        } else {
            clog("from memory");
            this.theday = this.schedule.days.find((day)=>day.dayIndex == dayIndex)
            this.setPeriodsView([this.theday.period][0],this.data.weekdays.indexOf(String(dayIndex)));
        }
    }
    setPeriodsView(periods,index){
        clog("period settter");
        let rows = constant.nothing;
        
        periods.forEach((period,p)=>{
            rows += `<div class="fmt-row break" id="period${index}${p}">
                <div class="fmt-col sixth fmt-padding-small active">
                    ${addNumberSuffixHTML(p+1)}
                </div>
                <div class="fmt-col fmt-quarter fmt-padding-small positive" id="classnameview${index}${p}">
                    <span id="classname${index}${p}">${period.classname}</span> <button class="neutral-button caption" id="editclassname${index}${p}"><img width="20" src="/graphic/elements/editicon.svg"/></button>
                </div>
                <div class="fmt-col fmt-quarter fmt-padding-small positive" id="classnameeditor${index}${p}">
                    <fieldset style="margin:0" class="text-field questrial"  id="classnamefield${index}${p}">
                        <legend class="field-caption">Replace ${period.classname}</legend>
                        <input class="text-input" style="font-size:18px" required value="${period.classname}" placeholder="New class" type="text" id="classnameinput${index}${p}" name="classname" >
                        <span class="fmt-right error-caption"  id="classnameerror${index}${p}"></span>
                    </fieldset>
                    <img class="fmt-spin-fast" style="display:none" width="25" src="/graphic/blueLoader.svg" id="classnameloader${index}${p}"/>
                    <button class="positive-button caption" id="saveclassname${index}${p}">Save</button>
                    <button class="negative-button caption" id="cancelclassname${index}${p}">Cancel</button>
                </div>

                <div class="fmt-col fmt-half fmt-padding-small positive" id="subjectview${index}${p}">
                    <span id="subject${index}${p}">${period.subject}</span> <button class="neutral-button caption" id="editsubject${index}${p}"><img width="20" src="/graphic/elements/editicon.svg"/></button>
                </div>
                <div class="fmt-col fmt-half fmt-padding-small positive" id="subjecteditor${index}${p}">
                    <fieldset style="margin:0" class="text-field questrial" id="subjectfield${index}${p}">
                        <legend class="field-caption">Replace ${period.subject}</legend>
                        <input class="text-input" style="font-size:18px" required value="${period.subject}" placeholder="New subject" type="text" id="subjectinput${index}${p}" name="subject" >
                        <span class="fmt-right error-caption"  id="subjecterror${index}${p}"></span>
                    </fieldset>
                    <img class="fmt-spin-fast" style="display:none" width="25" src="/graphic/blueLoader.svg" id="subjectloader${index}${p}"/>
                    <div class="fmt-col third fmt-center">
                        <button class="positive-button caption" id="savesubject${index}${p}">Save</button>
                    </div>
                    <div class="fmt-col third fmt-center">
                        <button class="negative-button caption" id="cancelsubject${index}${p}">Cancel</button>
                    </div>
                </div>
            </div>`;
        });
        this.periodsView[index].innerHTML = rows;
        //to handle renaming of fields
        this.dayperiods = [];
        this.classeditable = [];
        this.subjecteditable = [];
        
        periods.forEach((period,p)=>{
            this.dayperiods.push(getElement(`period${index}${p}`));
            this.classeditable.push(new Editable(`classnameview${index}${p}`,`classnameeditor${index}${p}`,
                new TextInput(`classnamefield${index}${p}`,`classnameinput${index}${p}`,`classnameerror${index}${p}`,validType.nonempty),
                `editclassname${index}${p}`,`classname${index}${p}`,`saveclassname${index}${p}`,`cancelclassname${index}${p}`,`classnameloader${index}${p}`
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
                    specific:code.action.RENAME_CLASS,
                    switchclash:sessionStorage.getItem('switchclash'),
                    teacherID:this.data.teacherID,
                    dayIndex:Number(this.currentdayIndex),
                    period:p,
                    oldclassname:this.classeditable[p].displayText(),
                    newclassname:this.classeditable[p].getInputValue()
                }).then(response=>{
                    this.classeditable[p].load(false);
                    clog(response);
                    if(response.event == code.OK){
                        this.schedule = null;
                        this.dayshows[this.data.weekdays.indexOf(this.currentdayIndex)].click();
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
                        case code.inst.CLASS_NOT_FOUND:{
                            return snackBar('No such classroom exists. You can create a new class in classrooms view.','Show classrooms',bodyType.warning,_=>{
                                refer(locate.admin.session,{
                                    target:locate.admin.target.classes
                                });
                            });
                        }
                        default:return this.classeditable[p].textInput.showError('Error');
                    }
                }).catch(err=>{
                    snackBar(err,'Report');
                });
                
            })
            this.subjecteditable.push(new Editable(`subjectview${index}${p}`,`subjecteditor${index}${p}`,
                new TextInput(`subjectfield${index}${p}`,`subjectinput${index}${p}`,`subjecterror${index}${p}`,validType.nonempty),
                `editsubject${index}${p}`,`subject${index}${p}`,`savesubject${index}${p}`,`cancelsubject${index}${p}`,`subjectloader${index}${p}`
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
                    specific:code.action.RENAME_SUBJECT,
                    switchclash:sessionStorage.getItem('switchclash'),
                    teacherID:this.data.teacherID,
                    classname:this.classeditable[p].displayText(),
                    dayIndex:Number(this.currentdayIndex),
                    period:p,
                    oldsubject:this.subjecteditable[p].displayText(),
                    newsubject:this.subjecteditable[p].getInputValue()
                }).then(response=>{
                    this.subjecteditable[p].load(false);
                    clog(response);
                    if(response.event == code.OK){
                        this.schedule = null;
                        this.dayshows[this.data.weekdays.indexOf(this.currentdayIndex)].click();
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
        this.startPeriodTimers(index);
    }
    startPeriodTimers= async(index)=>{
        const gap = (((this.data.periodduration - (this.data.periodduration%60))/60)*100) + (this.data.periodduration%60)
        clog(gap);
        const indicator = setInterval(async ()=>{
                const date = new Date();
                for(let p=0;p<this.data.totalperiods;p++){
                    if(this.data.weekdays[index] == date.getDay()){
                        const hrsnow = Number(`${date.getHours()}${date.getMinutes()<10?`0${date.getMinutes()}`:date.getMinutes()}`);
                        try{
                            const day = this.schedule.days.find(day=>day.dayIndex == date.getDay());
                            if(this.data.start+(p*gap) <= hrsnow && hrsnow < this.data.start+((p+1)*gap)){
                                //in the schedule duration
                                day.period[p].hold?setActive(this.dayperiods[p]):setNegativeActive(this.dayperiods[p]);
                            }
                        }catch{
                            clearInterval(indicator);
                            location.reload();
                        }
                    }
                }
            }, 1000);
    }
}

/**
 * A class for a class's schedule view script.
 */
class Class{
    constructor(){
        this.data = new ReceiveData();
        this.changeIncharge = getElement("changeincharge");
        this.removeclass = getElement("removeclass");
        this.removeclass.onclick=_=>{
            confirmDialog('Remove classroom?',`Removing ${this.data.classname} will also remove all its students and their accounts in the class, and unset the incharge too.
            Also, the teachers having periods in this class in their schedule, will be set as free on those periods of their schedule.`,null,_=>{
                postJsonData(post.admin.users,{
                    target:client.student,
                    action:'remove',
                    specific:'removeclass',
                    oldclassname:this.data.classname,
                }).then(resp=>{
                    if(resp.event == code.OK){
                        location.reload();
                    }
                })
            },true);

        }
        this.classname = new Editable('classnameview','classnameeditor',
            new TextInput('classnamefield','classnameinput','classnameerror',validType.nonempty,'classnamecaption'),
            'editclassname','classname','saveclassname','cancelclassname','classnameloader'
        );
        this.classname.validateInput();
        this.classname.onSave(_=>{
            if(!this.classname.isValidInput()) return this.classname.validateInputNow();
            if(this.classname.getInputValue().trim() == this.classname.displayText()){
                return this.classname.display();
            };
            this.classname.load();
            postJsonData(post.admin.schedule,{
                target:client.student,
                action:'update',
                specific:code.action.RENAME_CLASS,
                switchclash:sessionStorage.getItem('switchclash'),
                oldclassname:this.classname.displayText(),
                newclassname:this.classname.getInputValue()
            }).then(resp=>{
                if(resp.event == code.OK){
                    if(resp.msg == code.inst.CLASS_EXISTS){
                        snackBar(`Class ${this.classname.displayText()} has been replaced with ${this.classname.getInputValue()}, and the latter one is the former now.`,'Undo',true,_=>{
                            this.classname.saveButton.click();
                        });
                    } else {
                    snackBar(`Class ${this.classname.displayText()} is renamed as ${this.classname.getInputValue()}.`,'Undo',true,_=>{
                        this.classname.saveButton.click();
                    });}
                    this.classname.setDisplayText(this.classname.getInputValue());
                    this.classname.display();
                }
                this.classname.load(false);
                switch(resp.event){
                    case code.inst.CLASS_EXISTS:return this.classname.textInput.showError('Class already exists');
                    case code.schedule.SCHEDULE_CLASHED:return this.classname.textInput.showError('Clashed');
                }
            })
        })
        this.dayboxesview = getElement("dayTabs");
        let tabs = String();
        this.dayboxes = [];
        this.daynames = [];
        this.dayshows = [];
        this.periodsView = [];
        this.data.weekdays.forEach((dindex,index)=>{
            tabs +=`
            <div class="fmt-col fmt-half fmt-padding-small">
                <div class="fmt-row tab-container b-neutral" id="dayBox${dindex}">
                    <div class="fmt-row fmt-padding-small   ">
                        <div class="fmt-col  fmt-twothird  group-heading questrial" style="text-align:left;color:var(--secondary-text)" id="dayname${dindex}">
                            ${constant.weekdays[dindex]}
                        </div>
                        <div class="fmt-col fmt-third">
                            <button class="fmt-right positive-button-togg  questrial" id="dayexpander${dindex}">Show</button>
                        </div>
                    </div>
                    <div class="fmt-row"  id="periodsview${dindex}">
                        <!-- periods -->
                    </div>
                </div>
            </div>`
        });
        this.dayboxesview.innerHTML = tabs;
        this.currentdayIndex = this.data.weekdays[0];
        this.data.weekdays.forEach((dindex,index)=>{
            this.dayboxes.push(getElement(`dayBox${dindex}`));
            this.daynames.push(getElement(`dayname${dindex}`));
            this.dayshows.push(getElement(`dayexpander${dindex}`));
            this.periodsView.push(getElement(`periodsview${dindex}`));
            const isToday = new Date().getDay()==dindex;
            isToday?this.setActive(index):hide(this.periodsView[index]);
            this.dayshows[index].innerHTML = isToday?'Hide':'Show';    //replace by rotated icon;
            this.dayshows[index].onclick=_=>{
                isToday?hide(this.periodsView[index]):show(this.periodsView[index]);
                let shower = this.dayshows[index].onclick;
                this.dayshows[index].innerHTML = isToday?'Show':'Hide';    //replace by rotated icon;
                this.dayshows[index].onclick=_=>{
                    isToday?show(this.periodsView[index]):hide(this.periodsView[index]);
                    this.dayshows[index].innerHTML = isToday?'Hide':'Show';    //replace by rotated icon;
                    this.dayshows[index].onclick = shower;
                }
                this.setDataForDindex(Number(dindex));
            }
        });
        this.schedule = null;
        this.setDataForDindex(Number(this.data.weekdays.includes(String(new Date().getDay()))?new Date().getDay():this.data.weekdays[0]));
        this.startDayTimers();
    }
    async startDayTimers(){
        setInterval(() => {
            this.data.weekdays.forEach((dindex,index)=>{
                new Date().getDay()==dindex?this.setActive(index):_=>{};
            });
        }, 1);
    }
    setActive(index){
        this.dayboxes[index].style.backgroundColor ="24f36b34";
        this.dayboxes[index].style.border = `4px solid ${colors.positive}`;
        this.daynames[index].style.color = colors.positive;
    }
    setDataForDindex(dayIndex = Number(this.data.weekdays[0])){
        if(!this.schedule){
            clog("from cloud");
        postJsonData(post.admin.schedule,{
            target:client.student,
            action:'receive',
            classname:this.data.classname,
            dayIndex:dayIndex
        }).then(response=>{
            clog(response);
            if(response.event == code.OK){
                this.schedule = response.schedule;
                clog(this.schedule);
                this.theday = this.schedule.days.find((day)=>day.dayIndex == dayIndex)
                this.setPeriodsView([this.theday.period][0],this.data.weekdays.indexOf(String(dayIndex)));
            } else {
                this.schedule == null;
            }
        }).catch(e=>{
            clog(e);
        });
        } else {
            clog("from memory");
            this.theday = this.schedule.days.find((day)=>day.dayIndex == dayIndex)
            this.setPeriodsView([this.theday.period][0],this.data.weekdays.indexOf(String(dayIndex)));
        }
    }

    setPeriodsView(periods,index){
        clog("period settter");
        let rows = constant.nothing;
        periods.forEach((period,p)=>{
            rows+=                    
                `<br/>
                <div class="fmt-row break" id="period${index}${p}">
                    <div class="fmt-col sixth fmt-padding-small active">
                        ${addNumberSuffixHTML(p+1)}
                    </div>
                    <div class="fmt-col fmt-quarter fmt-padding-small positive" id="subjectview${index}${p}">
                        <span id="subject${index}${p}">${period?period.subject:'Not set'}</span> <button class="neutral-button caption" id="editsubject${index}${p}">${editIcon(15)}</button>
                    </div>
                    <div class="fmt-col fmt-quarter fmt-padding-small positive" id="subjecteditor${index}${p}">
                        <fieldset style="margin:0" class="text-field questrial"  id="subjectfield${index}${p}">
                            <legend class="field-caption">Replace ${period?period.subject:''}</legend>
                            <input class="text-input" style="font-size:18px" required value="${period?period.subject:''}" placeholder="New subject" type="text" id="subjectinput${index}${p}" name="subject" >
                            <span class="fmt-right error-caption"  id="subjecterror${index}${p}"></span>
                        </fieldset>
                        <img class="fmt-spin-fast" style="display:none" width="25" src="/graphic/blueLoader.svg" id="subjectloader${index}${p}"/>
                        <div class="fmt-col">
                            <button class="positive-button caption" id="savesubject${index}${p}">✔</button>
                        </div>
                        <div class="fmt-col">
                            <button class="negative-button caption" id="cancelsubject${index}${p}">❌</button>
                        </div>
                    </div>

                    <div class="fmt-col fmt-half fmt-padding-small positive" id="teacherIDview${index}${p}">
                        <span class="" id="teachername${index}${p}">${period?period.teacherID:'Not set'}</span><button class="neutral-button caption" id="editteacherID${index}${p}">${editIcon(15)}</button>
                        <br/>
                        <span class="group-text" id="teacherID${index}${p}">${period?period.teacherID:'Not set'}</span>
                    </div>
                    <div class="fmt-col fmt-half fmt-padding-small positive" id="teacherIDeditor${index}${p}">
                        <fieldset style="margin:0" class="text-field questrial fmt-third" id="teacherIDfield${index}${p}">
                            <legend class="field-caption">Replace ${period?period.teacherID:''}</legend>
                            <input class="text-input" style="font-size:18px" required value="${period?period.teacherID:''}" placeholder="New teacherID" type="text" id="teacherIDinput${index}${p}" name="teacherID" >
                            <span class="fmt-right error-caption"  id="teacherIDerror${index}${p}"></span>
                        </fieldset>
                        <img class="fmt-spin-fast" style="display:none" width="25" src="/graphic/blueLoader.svg" id="teacherIDloader${index}${p}"/>
                        <div class="fmt-col third fmt-center">
                            <button class="positive-button caption" id="saveteacherID${index}${p}">Save</button>
                        </div>
                        <div class="fmt-col third fmt-center">
                            <button class="negative-button caption" id="cancelteacherID${index}${p}">Cancel</button>
                        </div>
                    </div>
                </div>`
        })
        
        this.periodsView[index].innerHTML = rows;
        //to handle renaming of fields
        this.dayperiods = [];
        this.subjecteditable = [];
        this.teachereditable = [];
        periods.forEach((period,p)=>{
            this.dayperiods.push(getElement(`period${index}${p}`));
            this.subjecteditable.push(new Editable(`subjectview${index}${p}`,`subjecteditor${index}${p}`,
                new TextInput(`subjectfield${index}${p}`,`subjectinput${index}${p}`,`subjecterror${index}${p}`,validType.nonempty),
                `editsubject${index}${p}`,`subject${index}${p}`,`savesubject${index}${p}`,`cancelsubject${index}${p}`,`subjectloader${index}${p}`
            ));
            this.subjecteditable[p].onSave(_=>{
                this.subjecteditable[p].validateInputNow();
                if(!this.subjecteditable[p].isValidInput()) return;
                this.subjecteditable[p].disableInput();
                if(this.subjecteditable[p].getInputValue() == this.subjecteditable[p].displayText()){
                    return this.subjecteditable[p].clickCancel();
                }
                
                this.subjecteditable[p].load();
                postJsonData(post.admin.schedule,{
                    target:client.student,
                    action:"update",
                    specific:code.action.RENAME_SUBJECT,
                    switchclash:sessionStorage.getItem('switchclash'),
                    dayIndex:Number(this.currentdayIndex),
                    period:p,
                    oldsubject:this.subjecteditable[p].displayText(),
                    newsubject:this.subjecteditable[p].getInputValue()
                }).then(response=>{
                    this.subjecteditable[p].load(false);
                    clog(response);
                    if(response.event == code.OK){
                        this.schedule = null;
                        this.dayshows[this.data.weekdays.indexOf(this.currentdayIndex)].click();
                        return;
                    }
                    switch(response.event){
                        case code.schedule.SCHEDULE_CLASHED:{
                            this.subjecteditable[p].textInput.showError(
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
                        default:return this.subjecteditable[p].textInput.showError('Error');
                    }
                }).catch(err=>{
                    snackBar(err,'Report');
                });
                
            })
            this.teachereditable.push(new Editable(`teacherIDview${index}${p}`,`teacherIDeditor${index}${p}`,
                new TextInput(`teacherIDfield${index}${p}`,`teacherIDinput${index}${p}`,`teacherIDerror${index}${p}`,validType.email),
                `editteacherID${index}${p}`,`teacherID${index}${p}`,`saveteacherID${index}${p}`,`cancelteacherID${index}${p}`,`teacherIDloader${index}${p}`
            ));
            this.teachereditable[p].textInput.onTextInput(_=>{this.teacherpredictor(this.teachereditable[p].getInputValue().trim(),this.teachereditable[p].textInput)});
            this.teachereditable[p].onSave(_=>{
                this.teachereditable[p].validateInputNow();
                this.teachereditable[p].textInput.onTextInput(_=>{this.teacherpredictor(this.teachereditable[p].getInputValue().trim(),this.teachereditable[p].textInput)});
                if(!this.teachereditable[p].isValidInput()) return;
                this.teachereditable[p].disableInput();
                if(this.teachereditable[p].getInputValue().trim() == this.teachereditable[p].displayText()){
                    return this.teachereditable[p].clickCancel();
                }
                this.teachereditable[p].load();
                postJsonData(post.admin.schedule,{
                    target:client.student,
                    action:"update",
                    specific:"switchteacher",
                    switchclash:sessionStorage.getItem('switchclash'),
                    classname:this.data.classname,
                    dayIndex:Number(this.currentdayIndex),
                    period:p,
                    oldteacherID:this.teachereditable[p].displayText(),
                    newteacherID:this.teachereditable[p].getInputValue()
                }).then(response=>{
                    clog(response);
                    this.teachereditable[p].load(false);
                    if(response.event == code.OK){
                        this.schedule = null;
                        this.dayshows[this.data.weekdays.indexOf(this.currentdayIndex)].click();
                        return;
                    }
                    switch(response.event){
                        case code.auth.USER_NOT_EXIST:return this.teachereditable[p].textInput.showError('No such teacher');
                        default:return this.teachereditable[p].textInput.showError('Error');
                    }
                }).catch(err=>{
                    snackBar(err,'Report');
                });
            })
        });
        this.startPeriodTimers(index);
    }
    startPeriodTimers= async(index)=>{
        const gap = (((this.data.periodduration - (this.data.periodduration%60))/60)*100) + (this.data.periodduration%60)
        clog(gap);
        const indicator = setInterval(async ()=>{
            const date = new Date();
            for(let p=0;p<this.data.totalperiods;p++){
                if(this.data.weekdays[index] == date.getDay()){
                    const hrsnow = Number(`${date.getHours()}${date.getMinutes()<10?`0${date.getMinutes()}`:date.getMinutes()}`);
                    const day = this.schedule.days.find(day=>day.dayIndex == date.getDay());
                    if(this.data.start+(p*gap) <= hrsnow && hrsnow < this.data.start+((p+1)*gap)){
                        //in the schedule duration
                        day.period[p].hold?setActive(this.dayperiods[p]):setNegativeActive(this.dayperiods[p]);
                    }
                }
            }
        }, 1);
    }
    teacherpredictor(c, textInput){
        if (c && c!='@' && c!='.' && c != constant.nothing) {
          postJsonData(post.admin.manage, {
            target: client.teacher,
            type: "search",
            q: c,
          }).then((resp) => {
            if (resp.event == code.OK) {
              if(resp.teachers.length>0){
                snackBar(`${resp.teachers[0].username} (${resp.teachers[0].teacherID})?`,'Yes',true,_=>{
                  textInput.normalize();
                  textInput.setInput(resp.teachers[0].teacherID);
                });
              }
            }
          })
        } else {
          new Snackbar().hide();
        }
      }
}

function setActive(element = new HTMLElement){
    element.style.backgroundColor ="#12653423";
    element.style.borderRadius = "8px";
}


function setNegativeActive(element){
    element.style.backgroundColor ="#45123423";
    element.style.borderRadius = "8px";
}

function setNone(element){
    element.style.backgroundColor ="#00000000";
}

class ReceiveData{
    constructor(){
        this.client = getElement("client").innerHTML;
        this.pending = getElement("pending").innerHTML=='true'?true:false;
        if(this.isTeacher()){
            this.teacherID = getElement("teacherID").innerHTML == 'null'?null:getElement("teacherID").innerHTML;
            if(!this.pending){
                this.teacherUID = getElement("teacherUID").innerHTML;
                this.teachername = getElement("teachername").innerHTML;
                this.verified = getElement("teacherverified").innerHTML == 'true'?true:false;
            }
        } else {
            this.classname = getElement("classname").innerHTML == 'null'?null:getElement("classname").innerHTML;
            if(!this.pending){
                this.classUID = getElement("classUID").innerHTML;
                this.classinchargeID = getElement("classinchargeID").innerHTML;
                this.classinchargename = getElement("classinchargename").innerHTML;
            }
        }
        this.start = getNumericTime(getElement("startTime").innerHTML);
        this.end = getNumericTime(getElement("endTime").innerHTML);
        this.breakstart = getNumericTime(getElement("breakTime").innerHTML);
        this.periodduration = Number(getElement("periodDuration").innerHTML);
        this.breakduration = Number(getElement("breakDuration").innerHTML);
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