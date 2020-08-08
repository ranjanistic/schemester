class FullSchedule{
    constructor(){
        this.data = new ReceiveData();
        this.rawdata = new ReceiveData(true);
        this.dayBox = Array();
        this.dayBoxExpand = Array();
        this.periodsView = Array();
        this.data.totaldays.forEach((dindex,_)=>{
            this.dayBox.push(getElement(`dayBox${dindex}`));
            this.dayBoxExpand.push(getElement(`dayexpander${dindex}`));
            this.periodsView.push(getElement(`periodsview${dindex}`));
        });
        this.controlVisibility();
    }
    controlVisibility(){
        hideElement(this.periodsView)
        this.data.totaldays.forEach((dindex,d)=>{
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
}

class ReceiveData{
    constructor(raw = false){
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
    getNumericTime(time){
        return Number(String(time).replace(':',constant.nothing));
    }
}

window.onload =_=>new FullSchedule();