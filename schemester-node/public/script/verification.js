class Verification{
    constructor(){
        value.backbluecovered = true;
        this.data = new ReceiveData();
        this.logout = getElement("logout");
        this.sendlink = getElement("sendlink");
        this.later = getElement("later");
        this.deleteaccount = getElement("resetaccount");
        this.later.onclick =_=>{
            refer(locate.homepage);
        }
        this.logout.onclick =_=>{
            finishSession(client.admin,_=>{relocate(locate.admin.login,{email:this.data.email,uiid:this.data.uiid,target:locate.admin.target.dashboard})});
        }
        this.sendlink.onclick=_=>{
            this.sendVerificationLink();
        }
    }
    sendVerificationLink(){
        snackBar(`Sending link to ${this.data.email}...`);
    }
}

class ReceiveData{
    constructor(){
        this.username = getElement("username").innerHTML;
        this.email = getElement("email").innerHTML;
        this.userid = getElement("uid").innerHTML;
        this.uiid = getElement("uiid").innerHTML;
    }
}
window.onload =_=>window.app = new Verification();