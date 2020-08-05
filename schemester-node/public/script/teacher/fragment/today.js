class TeacherToday{
    constructor(){
        this.data = new ReceiveData();
        this.rawdata = new ReceiveData(true);
        clog(this.data.start + 100);
        this.dateview = getElement("simpledate");
        if(!this.data.today){
            getElement("weekschedule").onclick = window.parent.document.getElementById("fulltab").onclick;
        }
        this.periodview = Array();
        for(let i = 0;i<this.data.totalperiods;i++){
            this.periodview.push(getElement(`periodview${i}`));
        }
        this.startTimers();
        let date = new Date()
    }
    startTimers= async()=>{
        const date = new Date();
        this.dateview.innerHTML = `${constant.weekdays[date.getDay()]}, ${addNumberSuffixHTML(date.getDate())} ${constant.shortMonths[date.getMonth()]}`;
        const indicator = setInterval(async ()=>{
            const date = new Date();
            if(date.getHours() === 0 && date.getMinutes() === 0 && date.getSeconds() === 0){ // Check the time
                clearInterval(indicator);
                window.location.reload();
            }
            if(this.data.today){
                const hrsnow = Number(`${date.getHours()}${date.getMinutes()}`);
                for(let p=0;p<this.data.totalperiods;p++){
                    if(p ==0 ){
                        if(hrsnow<(this.data.start + ((p+1)*100))){
                            this.periodview[p].style.borderColor = "var(--active)";
                            this.periodview[p].style.borderWidth = "4px";
                            this.periodview[p].style.borderStyle = "solid";
                        } else {
                            this.periodview[p].style.borderColor = "var(--positive)";
                            this.periodview[p].style.borderWidth = "4px";
                            this.periodview[p].style.borderStyle = "solid";
                        }
                    } else {
                        if(hrsnow<(this.data.start + ((p+1)*100))&&hrsnow>(this.data.start + ((p-1)*100))){
                            this.periodview[p].style.borderColor = "var(--active)";
                            this.periodview[p].style.borderWidth = "4px";
                            this.periodview[p].style.borderStyle = "solid";
                        } else {
                            this.periodview[p].style.borderColor = "var(--negative)";
                            this.periodview[p].style.borderWidth = "4px";
                            this.periodview[p].style.borderStyle = "solid";
                        }
                    }
                }
            }
        }, 1/100);
        window.setInterval(async ()=>{
            const date = new Date();
            this.dateview.innerHTML = `${constant.weekdays[date.getDay()]}, ${addNumberSuffixHTML(date.getDate())} ${constant.shortMonths[date.getMonth()]}`;
        },1000);
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
        this.today = getElement("today").innerHTML == 'false'?false:true;
        this.periodduration = Number(getElement("periodDuration").innerHTML);
        this.breakduration = Number(getElement("breakDuration").innerHTML);
        this.totalperiods = Number(getElement("periodsInDay").innerHTML);
        this.totaldays = String(getElement("daysInWeek").innerHTML).split(',');
    }
    getNumericTime(time){
        return Number(String(time).replace(':',constant.nothing));
    }
}

window.onload =_=>new TeacherToday();