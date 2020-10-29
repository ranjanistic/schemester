/**
 * Script for communication view (chat&call history)
 */
class Comms{
    constructor(){
        this.data = new ReceiveData();
        this.sessionpath;
        this.chatroompath;
        this.callingpath;
        clog(this.data.client)
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
                getElement(`roomid${r}`).innerHTML,
                getElement(`roomname${r}`).innerHTML.trim(),
                getElement(`lastmsg${r}`).innerHTML,
                getElement(`lastactive${r}`).innerHTML
            ));
            this.rooms[r].roomtab.onclick=_=>{
                refer(this.sessionpath,{
                    target:this.chatroompath,
                    [this.rooms[r].roomid?'rid':'roomname']:this.rooms[r].roomid?this.rooms[r].roomid:this.rooms[r].roomname
                });
            }
        }
        for(let c=0;c<this.data.totalcalls;c++){
            this.calls.push(new Call(
                getElement(`call${c}`),
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
        device.onNotifyPermit();
    }
    selectTab(tab = this.chattab){
        this.tabs.forEach((Tab)=>{
            replaceClass(Tab,"tab-section","tab-section-selected",Tab==tab);
        });
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
        clog(this.client);
        this.totalrooms = Number(getElement('totalrooms').innerHTML);
        this.totalcalls = Number(getElement('totalcalls').innerHTML);
    }
}

window.onload=_=>new Comms();