class Active{
    constructor(parent,data){
        this.viewcontent = `
        <div class="container" id="userinvitationactive">
        <div class="heading fmt-row fmt-center">Invitation</div>
        <div class="group-text fmt-row">
            <b>${data.adminname}</b> has invited you to join <b>${data.instname}</b> as a ${data.target}.
            Fill up your details, create a password, and join, if you are a
            teacher at <b>${data.instname}</b> (code name: <b>${data.uiid}</b>).<br/>
            <center><span class="error-caption">This invitation will expire on <b>${data.exp}</b>, exactly.</span></center>
        </div>
        <br/>
        <fieldset class="text-field fmt-row" id="usermailfield">
            <legend class="field-caption" >Your email address</legend>
            <input class="text-input" required spellcheck="false" autocomplete="email" placeholder="youremail@example.domain" type="email" id="usermail" name="useremail">
            <span class="fmt-right error-caption" id="usermailerror"></span>
        </fieldset>
        <fieldset class="text-field fmt-row" id="userpassfield">
            <legend class="field-caption" >Create your password</legend>
            <input class="text-input" required autocomplete="new-password" placeholder="A strong password" type="password" id="userpass" name="userpassword">
            <span class="fmt-right error-caption" id="userpasserror"></span>
        </fieldset>
        <fieldset class="text-field fmt-row" id="userpassconffield">
            <legend class="field-caption" >Type again to confirm</legend>
            <input class="text-input" required autocomplete="new-password" placeholder="Confirm password" type="password" id="userconfpass" name="confuserpassword">
            <span class="fmt-right error-caption" id="userconfpasserror"></span>
        </fieldset>
        <br/>
        <div class="fmt-row">
            <button class="active-button fmt-right" id="acceptInvitation">Accept & Join</button>
            <button class="negative-button fmt-right" id="rejectInvitation">Reject Invitation</button>
            <img class="fmt-spin-fast fmt-right" width="50" style="display:none" src="/graphic/blueLoader.svg" id="inviteloader"/>
        </div></div>`;
        parent.innerHTML = this.viewcontent;    //for element getters.

        this.emailField = new TextInput('usermailfield','usermail','usermailerror');
        this.passField = new TextInput('userpassfield','userpass','userpasserror');
        this.passConfirmField = new TextInput('userpassconffield','userconfpass','userconfpasserror');

        this.acceptinvite = getElement('acceptInvitation');
        this.rejectinvite = getElement('rejectInvitation');
        this.loader = getElement('inviteloader');

        this.acceptinvite.addEventListener(click,_=>{this.invitationAction(true)});
        this.rejectinvite.addEventListener(click,_=>{this.invitationAction(false)});

        this.emailField.onTextDefocus(_=>{validateTextField(this.emailField,inputType.email,_=>{this.passField.inputFocus()})});
        this.passField.onTextDefocus(_=>{validateTextField(this.passField,inputType.password,_=>{this.passConfirmField.inputFocus()})});
        this.passConfirmField.onTextDefocus(_=>{validateTextField(this.passConfirmField,inputType.match,null,this.passField)});
        
        this.formvalid = stringIsValid(this.emailField.getInput(),inputType.email)&&stringIsValid(this.passField.getInput(),inputType.password)&&stringIsValid(this.passConfirmField.getInput(),inputType.match,this.passField.getInput());
    }            
    invitationAction(accept){
        if(!this.formvalid){
            validateTextField(this.emailField,inputType.email,_=>{this.passField.inputFocus()})
            validateTextField(this.passField,inputType.password,_=>{this.passConfirmField.inputFocus()})
            validateTextField(this.passConfirmField,inputType.match,null,this.passField)
            return;
        }
        visibilityOf(this.loader);
        let usermail = this.emailField.getInput();
        let userpass = this.passField.getInput();
        let confpass = this.passConfirmField.getInput();
        if(accept){
            fetch(`/admin/external/?type=action`,{
                method: 'post',
                headers: {
                "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
                },
                body: `usermail=${usermail}&userpass=${userpass}&confpass=${confpass}&accepted=${action}`,
            })
            .then((res)=>res.json())
            .then((res)=>{
                clog(res);
                visibilityOf(this.loader,false);
            });
        }
    }
}
class Expired{
    constructor(parent,data){
        this.viewcontent = `
        <div class="container" id="userinvitationexpired">
        <div class="heading fmt-center">Expired</div>
        <div class="group-text fmt-row">
            The link that brought you here is no longer accepting invitations (<b>expired on ${data.exp}</b>). If you think this was a mistake,
            then request your admin a new invitation, by filling the details below.
        </div>
        <br/>
        <fieldset class="text-field fmt-row" id="requsermailfield">
            <legend class="field-caption">Your email address</legend>
            <input class="text-input" required spellcheck="false" autocomplete="email" placeholder="youremail@example.domain" type="email" id="requsermail" name="useremail">
            <span class="fmt-right error-caption" id="requsermailerror"></span>
        </fieldset>
        <fieldset class="text-field fmt-row" id="usermessagefield">
            <legend class="field-caption" >Message for Admin</legend>
            <textarea class="text-input" placeholder="Any message for admin?(Optional)" rows="4" id="usermessage" name="usermessage"></textarea>
            <span class="fmt-right error-caption" id="usermessageerror"></span>
        </fieldset>
        <br/>
        <div class="fmt-row">
            <button class="active-button" id="requestInvitation">Request Invitation</button>
            <img class="fmt-spin-fast" width="50" style="display:none" src="/graphic/blueLoader.svg" id="inviteloader"/>
        </div></div>`;
        parent.innerHTML = this.viewcontent;
        this.view = getElement('userinvitationexpired');
        this.useremailfield = new TextInput('requsermailfield','requsermail','requsermailerror');
        this.usermessage = getElement('usermessage');
        this.request = getElement('requestInvitation');
        this.request.addEventListener(click,this.requestInviteAction);
        this.loader = getElement('inviteloader');
    }
    requestInviteAction(){
        if(stringIsValid(this.useremailfield.getInput(),inputType.email)){
            let useremail = this.useremailfield.getInput();
            
        }
    }
}

class Invitation{
    constructor(active,data){
        this.parent = getElement('invitebodyparent');
        window.fragment = (active == true)?new Active(this.parent,data):new Expired(this.parent,data);
    }
}

window.onload =_=>{
    const active = (getElement('active').innerHTML === 'true');
    clog(getElement('expirydate').innerHTML);
    var invitedata = {
        adminname:getElement('adminname').innerHTML,
        adminmail:getElement('adminemail').innerHTML,
        uiid:getElement('uiid').innerHTML,
        instname:getElement('instname').innerHTML,
        target:getElement('target').innerHTML,
        exp:getProperDate(getElement('expirydate').innerHTML)
    }
    window.app = new Invitation(active,invitedata);
}
