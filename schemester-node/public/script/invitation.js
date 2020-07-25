
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

        this.load();
        let username = this.nameField.getInput();
        let usermail = this.emailField.getInput();
        let userpass = this.passField.getInput();
        clog(data.target);
        sessionStorage.setItem('username',username);
        sessionStorage.setItem('useremail',useremail);
        sessionStorage.setItem('instname',data.instName);
        sessionStorage.setItem('uiid',data.uiid);
        //todo:send verfication using above stored data, user should verify first, then postdata.
        postData(`/${data.target}/auth/signup`,{
            username:username,
            email:usermail,
            password:userpass,
            uiid:data.uiid
        }).then(response=>{
            if(response.event == code.auth.ACCOUNT_CREATED){
                //after creation,(or maybe before), show verification dialog, and only after successfull verification, proceed further,
                //to schedule filler view, as schedule (teacherschedule/schedule subdocuments) is assumed not to be present if user is joining via invitaiton, however if present already
                //(say, admin added schedule themselves even after inviting), then proceed directly to dashboard (today page, for teachers).
                clog("yay!");
            } else {
                clog("oof");
            }
            this.load(false);
        }).catch(error=>{
            snackBar(error);
        })
        
        snackBar('Accepted');
        hide(this.loader);
    }

    rejectInvitation(data){
        snackBar('Rejected');
    }
    load(show = true){
        visibilityOf(this.acceptinvite,!show);
        visibilityOf(this.rejectinvite,!show);
        visibilityOf(this.loader,show);
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
        this.request.onclick =_=>{this.requestInviteAction(data)};
        this.loader = getElement('inviteloader');
        this.load(false);
    }
    requestInviteAction(data){
        if(!this.useremailfield.isValid){
            return this.useremailfield.validateNow();
        }
        this.load(true);
        let useremail = this.useremailfield.getInput();
        //todo: send request email, then change view.
        snackBar(`sent mail from ${useremail} to ${data.adminemail}`);
        this.load(false);
    }
    load(show = true){
        visibilityOf(this.request,!show);
        visibilityOf(this.loader,show);
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

