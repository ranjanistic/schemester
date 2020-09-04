parent.window.scrollTo(0, 0);
class TeacherToday{
    constructor(){
        this.data = new ReceiveData();
        this.rawdata = new ReceiveData(true);
        this.dateview = getElement("simpledate");
        if(!this.data.today || !this.data.timings){
            getElement("weekschedule").onclick = window.parent.document.getElementById("fulltab").onclick;
        } else {
            this.gap = (((this.data.periodduration - (this.data.periodduration%60))/60)*100) + (this.data.periodduration%60)
            this.periodview = Array();
            this.periodExpand = Array();
            this.periodTime = Array();
            this.periodActions = Array();
            this.actionYes = Array();
            this.actionNo = Array();
            for(let i = 0;i<this.data.totalperiods;i++){
                this.periodview.push(getElement(`periodview${i}`));
                this.periodExpand.push(getElement(`showactions${i}`));
                this.periodTime.push(getElement(`timing${i}`));
                this.periodActions.push(getElement(`action${i}`));
                this.actionYes.push(getElement(`present${i}`));
                this.actionNo.push(getElement(`absent${i}`));
            }
            this.controlVisibility();
            this.options = getElement("todayOptions");
            this.options.onclick=_=>{
                this.todayactions();
            }
        }
        this.startTimers();
    }
    controlVisibility(){
        hideElement(this.periodActions);
        this.periodview.forEach((view,pindex)=>{
            this.periodTime[pindex].innerHTML = pindex;//todo: show timing
            this.periodExpand[pindex].onclick=_=>{
                show(this.periodActions[pindex]);
                let shower = this.periodExpand[pindex].onclick;
                this.periodExpand[pindex].onclick=_=>{
                    hide(this.periodActions[pindex]);
                    this.periodExpand[pindex].onclick = shower;
                }
            };
        })
    }
    startTimers= async()=>{
        const date = new Date();
        this.dateview.innerHTML = `${constant.weekdays[date.getDay()]}, ${addNumberSuffixHTML(date.getDate())} ${constant.shortMonths[date.getMonth()]}`;
        const indicator = setInterval(async ()=>{
            const date = new Date();
            if(date.getHours() === 0 && date.getMinutes() === 0 && date.getSeconds() === 0){ // Check the time
                clearInterval(indicator);
                window.location.reload();   //reloads every night 00:00:00 hrs.
            }
            if(this.data.today){
                const hrsnow = Number(`${date.getHours()}${date.getMinutes()<10?`0${date.getMinutes()}`:date.getMinutes()}`);
                for(let p=0;p<this.data.totalperiods;p++){
                    if(hrsnow < this.data.start) {
                        this.data.hold[p]?this.setPositive(this.periodview[p]):this.setNegative(this.periodview[p]);
                    }
                    if(this.data.start+(p*this.gap) <= hrsnow && hrsnow < this.data.start+((p+1)*this.gap)){
                        this.data.hold[p]?this.setActive(this.periodview[p]):this.setNegativeActive(this.periodview[p]);
                    } else if(hrsnow > this.data.start+(p*this.gap)){
                        this.setDead(this.periodview[p]);
                    } else {
                        this.setPositive(this.periodview[p])
                    }
                }
            }
        }, 1);

        window.setInterval(async ()=>{
            const date = new Date();
            this.dateview.innerHTML = `${constant.weekdays[date.getDay()]}, ${addNumberSuffixHTML(date.getDate())} ${constant.shortMonths[date.getMonth()]}`;
        },1000);
    }

    setPositive(element){
        element.style.border = "4px solid var(--positive)";
    }
    setActive(element = new HTMLElement){
        element.style.backgroundColor ="24f36b34";
        element.style.border = "4px solid var(--active)";
    }
    setNegative(element = new HTMLElement){
        element.style.backgroundColor ="#c40c0c21";
        element.style.border = "4px solid var(--negative)";
    }
    setDead(element = new HTMLElement){
        element.style.backgroundColor ="#23232321";
        element.style.border = "4px solid var(--tertiary-text)";
    }
    setNegativeDead(element){
        element.style.backgroundColor ="#23232321";
        element.style.border = "4px solid var(--negative)";
    }
    setNegativeActive(element){
        element.style.backgroundColor ="24f36b21";
        element.style.border = "4px solid var(--negative)";
    }

    todayactions(show = true){
        let options = new Dialog();
        options.transparent();
        options.setBoxHTML(`
        <div class="fmt-row group-heading positive">
                    Options
                </div>
                <div class="fmt-row questrial">
                    <div class="fmt-row fmt-padding fmt-center">
                    <div>
                    Absent today
                    <label class="switch-container">
                        <input type="checkbox" id="absenttoday">
                        <span class="switch-negative"></span>
                    </label>
                    </div>
                    </div>
                </div>
        `)
        options.show();
        const discard = getElement('discard');
        discard.onclick=_=>{
            options.hide();
        }
    }
}

class ReceiveData{
    constructor(raw = false){
        this.timings = getElement("timings").innerHTML?true:false;
        if(this.timings){
            if(raw){
                this.start = getElement("startTime").innerHTML;
                this.end = getElement("endTime").innerHTML;
                this.breakstart = getElement("breakTime").innerHTML;
            }else {
                this.start = this.getNumericTime(getElement("startTime").innerHTML);
                this.end = this.getNumericTime(getElement("endTime").innerHTML);
                this.breakstart = this.getNumericTime(getElement("breakTime").innerHTML);
            }
            this.periodduration = Number(getElement("periodDuration").innerHTML);
            this.breakduration = Number(getElement("breakDuration").innerHTML);
            this.totalperiods = Number(getElement("periodsInDay").innerHTML);
            this.totaldays = String(getElement("daysInWeek").innerHTML).split(',');
        }
        this.today = getElement("today").innerHTML == 'false'?false:true;
        clog(this.today);
        if(this.today){
            this.classname = Array();
            this.subject = Array();
            this.hold = Array();
            for(let i = 0;i<this.totalperiods;i++){
                this.classname.push(getElement(`classname${i}`).innerHTML);
                this.subject.push(getElement(`subject${i}`).innerHTML);
                this.hold.push(getElement(`hold${i}`).innerHTML == 'true');
            }
        }
    }
    getNumericTime(time){
        return Number(String(time).replace(':',constant.nothing));
    }
}

window.onload =_=>new TeacherToday();
