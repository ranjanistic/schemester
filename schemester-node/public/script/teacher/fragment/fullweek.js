class FullSchedule{
    constructor(){
        this.data = new ReceiveData();
        this.dayExpand = getElement("dayexpander");
        this.dayExpand.onclick =_=>{
                
        }
    }
}

class ReceiveData{
    constructor(){
        this.start = getElement("startTime")
        this.end = getElement("endTime")
        this.breakstart = getElement("breakTime")
        this.periodduration = getElement("periodDuration")
        this.breakduration = getElement("breakDuration")
        this.totalperiods = getElement("periodsInDay")
        this.totaldays = getElement("daysInWeek")
    }
}

window.onload =_=>new FullSchedule();