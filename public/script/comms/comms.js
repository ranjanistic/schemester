/**
 * Script for communication view (chat&call history)
 */
class Comms{
    constructor(){
        this.data = new ReceiveData();
        this.sessionpath;
        this.chatroompath;
        this.callingpath;
        switch(this.data.client){
            case client.admin:{
                this.sessionpath = locate.admin.session;
                this.chatroompath = locate.admin.target.chatroom;
                this.callingpath = locate.admin.target.calling;
            };break;
            case client.teacher:{
                this.sessionpath = locate.teacher.session;
                this.chatroompath = locate.teacher.target.chatroom;
                this.callingpath = locate.teacher.target.calling;
            };break;
            case client.student:{
                this.sessionpath = locate.student.session;
                this.chatroompath = locate.student.target.chatroom;
                this.callingpath = locate.student.target.calling;
            };break;
            default:return location.reload();
        }
        this.chattab = getElement("chatstab");
        this.calltab = getElement("callstab");
        this.chatlist = getElement("chatlist");
        this.calllist = getElement("calllist");

        this.tabs = [this.chattab,this.calltab];
        this.lists = [this.chatlist,this.calllist];
        this.tabs.forEach((tab,t)=>{
            tab.onclick=_=>{
                this.selectTab(tab);
                visibilityOfAll(this.lists,true,t);
            }
        });

        this.rooms = [];
        this.calls = [];
        for(let r=0;r<this.data.totalrooms;r++){
            this.rooms.push(new Room(
                getElement(`room${r}`),
                getElement(`roomid${r}`),
                getElement(`roomname${r}`),
                getElement(`lastmsg${r}`),
                getElement(`lastactive${r}`)
            ));
            this.rooms[r].roomtab.onclick=_=>{
                refer(this.sessionpath,{
                    target:this.chatroompath,
                    rid:this.rooms[r].roomid
                })
            }
        }
        for(let c=0;c<this.data.totalcalls;c++){
            this.calls.push(new Call(
                getElement(`call${c}`),
                getElement(`callid${c}`),
                getElement(`callto${c}`),
                getElement(`duration${c}`),
                getElement(`reconnect${c}`)
            ));
            this.calls[c].recall.onclick=_=>{
                refer(this.sessionpath,{
                    target:this.callingpath,
                    clid:this.calls[c].callid
                })
            }
        }
        this.chattab.click();
        this.notificationpermitcheck();
    }
    selectTab(tab = this.chattab){
        this.tabs.forEach((Tab)=>{
            replaceClass(Tab,"tab-section","tab-section-selected",Tab==tab);
        });
    }
    notificationpermitcheck(){
        if (("Notification" in window) && Notification.permission !== "granted") {
            Notification.requestPermission().then(permission=>{
                if(permission === "granted"){
                    new Notification("Hi there!",{silent:false,body:"This is the body",icon:appicon(256),requireInteraction:true,image:appicon(256)});
                }
            }).catch(e=>{
                clog(e);
            })
        } else{
            // new Notification("Hi there!",{silent:false,body:"This is the body",icon:appicon(256),requireInteraction:false});
        }
    }
}

class Room{
    constructor(room,roomid,roomname,lastmsg,lastactive){
        this.roomtab = room;
        this.roomid = roomid;
        this.roomname = roomname;
        this.lastmsg = lastmsg;
        this.lastactive = lastactive;
        
    }
}

class Call{
    constructor(call,callid,callto,duration,recall){
        this.calltab = call;
        this.callid = callid;
        this.callto = callto;
        this.duration = duration;
        this.recall = recall;
    }
}

class ReceiveData{
    constructor(){
        this.client = getElement('clienttype').innerHTML
        this.totalrooms = Number(getElement('totalrooms').innerHTML);
        this.totalcalls = Number(getElement('totalcalls').innerHTML);
    }
}

window.onload=_=>new Comms();