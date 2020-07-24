
class Active{
    constructor(data){
        this.nameField = new TextInput('usernamefield','username','usernameerror',validType.nonempty);
        this.emailField = new TextInput('usermailfield','usermail','usermailerror',validType.email);
        this.passField = new TextInput('userpassfield','userpass','userpasserror',validType.password);
        this.passConfirmField = new TextInput('userpassconffield','userconfpass','userconfpasserror',validType.match);

        getElement("expireat").innerHTML = getProperDate(String(data.expiresAt));

        this.nameField.validate(_=>{this.emailField.inputFocus()});
        this.emailField.validate(_=>{this.passField.inputFocus()});
        this.passField.validate(_=>{this.passConfirmField.inputFocus()});
        this.passConfirmField.validate(_=>{},this.passField);

        this.acceptinvite = getElement('acceptInvitation');
        this.rejectinvite = getElement('rejectInvitation');
        this.loader = getElement('inviteloader');
        hide(this.loader);

        this.acceptinvite.addEventListener(click,_=>{this.acceptInvitation(data)});
        this.rejectinvite.addEventListener(click,_=>{this.rejectInvitation(data)});
    }            
    acceptInvitation(data){
        if(!(this.nameField.isValid()&&this.emailField.isValid()&&this.passField.isValid()&&this.passConfirmField.isValid(this.passField.getInput()))){
            this.passConfirmField.validateNow(_=>{},this.passField);
            this.passField.validateNow(_=>{this.passConfirmField.inputFocus()});
            this.emailField.validateNow(_=>{this.passField.inputFocus()});
            this.nameField.validateNow(_=>{this.emailField.inputFocus()});
            return;
        }
        show(this.loader);
        let username = this.nameField.getInput();
        let usermail = this.emailField.getInput();
        let userpass = this.passField.getInput();
        clog(data.target);
        postData(`/${data.target}/auth/signup`,{
            username:username,
            email:usermail,
            password:userpass,
            uiid:data.uiid
        }).then(response=>{
            if(response.event == code.auth.ACCOUNT_CREATED){
                clog("yay!");
            } else {
                clog("oof");
            }
        }).catch(error=>{
            snackBar(error);
        })
        
        snackBar('Accepted');
        hide(this.loader);
    }

    rejectInvitation(data){
        snackBar('Rejected');
    }
}
class Expired{
    constructor(data){
        this.view = getElement('userinvitationexpired');
        this.useremailfield = new TextInput('requsermailfield','requsermail','requsermailerror',validType.email);
        this.usermessage = new TextInput('usermessagefield','usermessage','usermessageerror');

        getElement('expiredat').innerHTML = getProperDate(String(data.expiresAt));

        this.useremailfield.validate();
        this.request = getElement('requestInvitation');
        this.request.addEventListener(click,this.requestInviteAction(data));
        this.loader = getElement('inviteloader');
        hide(this.loader);
    }
    requestInviteAction(data){
        if(!this.useremailfield.isValid){
            return this.useremailfield.validateNow();
        }
        show(this.loader);
        let useremail = this.useremailfield.getInput();
        snackBar(`sent mail from ${useremail} to ${data.adminemail}`);
        hide(this.loader);
    }
}

class ReceivedInfo{
    constructor(){
        this.adminname = getElement("adminname").innerHTML;
        this.adminemail = getElement("adminemail").innerHTML;
        this.uiid = getElement("uiid").innerHTML;
        this.target = getElement("target").innerHTML;
        this.expiresAt = getElement("exp").innerHTML;
        this.instName = getElement("instname").innerHTML;
    }
}

class Invitation{
    constructor(){
        this.data = new ReceivedInfo();
        try{
            window.fragment = new Expired(this.data)
        }catch{
            window.fragment = new Active(this.data);
        }
    }
}

window.onload =_=>{
    window.app = new Invitation();
}

