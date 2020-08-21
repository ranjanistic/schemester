class FullSchedule{
    constructor(){
        this.data = new ReceiveData();
        this.rawdata = new ReceiveData(true);
        if(this.data.schedule){
            this.dayBox = Array();
            this.dayBoxExpand = Array();
            this.periodsView = Array();
            this.data.totaldays.forEach((dindex,_)=>{
                this.dayBox.push(getElement(`dayBox${dindex}`));
                this.dayBoxExpand.push(getElement(`dayexpander${dindex}`));
                this.periodsView.push(getElement(`periodsview${dindex}`));
            });
            this.controlVisibility();
        } else {
            getElement("seesettings").onclick = window.parent.document.getElementById("abouttab").onclick;
        }
        this.startTimers();
    }
    controlVisibility(){
        hideElement(this.periodsView);
        this.data.totaldays.forEach((dindex,d)=>{
            new Date().getDay()==this.data.totaldays[d]?this.setActive(this.dayBox[d]):nothing();
            this.dayBoxExpand[d].onclick=_=>{
                show(this.periodsView[d]);
                let shower = this.dayBoxExpand[d].onclick;
                this.dayBoxExpand[d].innerHTML = 'Hide';    //replace by rotated icon;
                this.dayBoxExpand[d].onclick=_=>{
                    hide(this.periodsView[d]);
                    this.dayBoxExpand[d].innerHTML = 'Show';    //replace by rotated icon;
                    this.dayBoxExpand[d].onclick = shower;
                }
            };
        })
    }
    async startTimers(){
        if(this.data.schedule){
            const indicator = setInterval(async ()=>{
                const date = new Date();
                if(date.getHours() === 0 && date.getMinutes() === 0 && date.getSeconds() === 0){ // Check the time
                    clearInterval(indicator);
                    window.location.reload();   //reloads every night 00:00:00 hrs.
                }
            })
        }
    }
    setActive(element = new HTMLElement){
        element.style.backgroundColor ="24f36b34";
        element.style.border = "4px solid var(--positive)";
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
        this.schedule = getElement("schedule").innerHTML == 'false'?false:true;
        this.periodduration = Number(getElement("periodDuration").innerHTML);
        this.breakduration = Number(getElement("breakDuration").innerHTML);
        this.totalperiods = Number(getElement("periodsInDay").innerHTML);
        this.totaldays = String(getElement("daysInWeek").innerHTML).split(',');
        }
    }
    getNumericTime(time){
        return Number(String(time).replace(':',constant.nothing));
    }
}

window.onload =_=>new FullSchedule();