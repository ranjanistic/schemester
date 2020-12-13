/**
 * Script for chatroom view
 */
class Chatroom{
    constructor(){
        backHistory();
        this.data = new ReceiveData();
        if(!this.data.isroom) return;
        this.window = getElement("chatwindow");
        this.controlpanel = getElement("usercontrols");   
        this.textinput = getElement('textinput');
        this.chats = [];

        for(let c=0;c<this.data.totalchats;c++){
            this.chats.push(new Chat(
                getElement(`time${c}`),
                getElement(`text${c}`),
                getElement(`username${c}`),
                getElement(`id${c}`),
            ));
        }
    }
}

class ReceiveData{
    constructor(){
        this.client = getElement('clientType').innerHTML;
        this.isroom = getElement('isroom').innerHTML=='true';
        if(this.isroom){
            this.roomid = getElement('roomid').innerHTML;
            this.roomname = getElement('roomname').innerHTML;
            this.totalchats = Number(getElement('totalchats').innerHTML);
            this.totalpeople = Number(getElement('totalpeople').innerHTML);
        }
    }
}

class Chat{
    constructor(time,text,username,id){
        this.time = time;
        this.text = text;
        this.username = username;
        this.id = id;
    }
}

window.onload=_=>{
    theme.setNav();
    new Chatroom();
}