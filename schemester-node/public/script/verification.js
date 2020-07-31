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
            switch(this.data.client){
                case client.admin:{
                    clog("isadmin");
                    return finishSession(_=>{relocate(locate.admin.login,{email:this.data.email,uiid:this.data.uiid,target:locate.admin.target.dashboard})});
                }
                case client.teacher:{
                    return finishSession(_=>{relocate(locate.teacher.login,{email:this.data.email,uiid:this.data.uiid,target:locate.teacher.target.today})});
                }
                case client.student:{
                    clog("student");//todo
                }
                default:{
                    return finishSession(_=>{relocate(locate.homepage)});
                }
            }
        }
        this.sendlink.onclick=_=>{
            this.sendVerificationLink();
        }
    }
    sendVerificationLink(){
        snackBar(`Sending link to ${this.data.email}...`);//todo
    }
}

class ReceiveData{
    constructor(){
        this.client = getElement("client").innerHTML;
        this.username = getElement("username").innerHTML;
        this.email = getElement("email").innerHTML;
        this.userid = getElement("uid").innerHTML;
        this.uiid = getElement("uiid").innerHTML;
        localStorage.setItem('client',this.client);
        localStorage.setItem('username',this.username);
        localStorage.setItem('id',this.email);
        localStorage.setItem('uid',this.userid);
        localStorage.setItem('uiid',this.uiid);
    }
}
window.onload =_=>window.app = new Verification();