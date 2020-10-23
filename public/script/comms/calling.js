/**
 * Script for calling view
 */
class Calling{
    constructor(){
        sessionStorage.removeItem('lastcallduration');
        this.view= getElement('info');
        this.callstate = getElement('callstate');
        this.callto = getElement('callto');
        this.calltoname = getElement('calltoname');
        this.timer = getElement('timer');
        this.end = getElement('endcall');
        this.mute = getElement('mute');
        this.speaker = getElement('speakerphone');
        this.hold = getElement('hold');
        this.hold.onclick=_=>{
            this.pauseCall();
        }
        this.end.onclick=_=>{
            this.finishCall();
        }
        this.onCall();
    }
    startCall(){

    }
    onCall(){
        replaceClass(this.view,'b-positive','b-active');
        replaceClass(this.view,'b-negative','b-active');
        this.callstate.innerHTML = 'On call with';
        this.startTimer();
    }
    pauseCall(){
        replaceClass(this.view,'b-positive','b-warning');
        replaceClass(this.view,'b-active','b-warning');
        this.callstate.innerHTML = 'On hold';
        this.hold.innerHTML = 'Holding';
        replaceClass(this.hold,'neutral-button','warning-button');
        this.hold.onclick=_=>{
            this.hold.innerHTML = 'Hold';
            replaceClass(this.hold,'neutral-button','warning-button',false);
            this.resumeCall();
            this.hold.onclick=_=>{
                this.pauseCall();
            }
        }
    }
    resumeCall(){
        replaceClass(this.view,'b-active','b-warning',false);
    }
    startTimer(){
        let totalsec = 0;
        let sec = 0;
        let min = 0;
        let hour = 0;
        this.timer.innerHTML = `${hour}:${min}:${sec}`;
        let calltimer = setInterval(() => {
            if(sec<60){
                this.timer.innerHTML = `${hour}:${min}:${sec}`;
            } else {
                min++;
                sec = sec%60;
                if(min<60){
                    this.timer.innerHTML = `${hour}:${min}:0${sec}`
                } else {
                    hour++;
                    min = min%60;
                    if(hour<24){
                        this.timer.innerHTML = `${hour}:${min}:0${sec}`
                    } else {
                        clearInterval(calltimer);
                        this.finishCall();
                    }
                }
            }
            sec++;
            totalsec++;
            sessionStorage.setItem('lastcallduration',totalsec);
        }, 1000);
        this.end.onclick=_=>{
            clearInterval(calltimer);
            this.finishCall();
        }
    }
    finishCall(){
        replaceClass(this.view,'b-positive','b-negative');
        replaceClass(this.view,'b-active','b-negative');
        this.callstate.innerHTML = 'Ending call...'
        relocate(locate.root);
    }
}

window.onload=_=>new Calling();