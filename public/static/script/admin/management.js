//admin management default script
let admin;
let inst;
let schedule;
let security;
let manage;
let users;
class Management{
    displayIndex = 0;
    constructor(){
        this.tabs = Array(getElement("adminTab"),
        getElement("institutionTab"),
        getElement("scheduleTab"),
        getElement("securityTab"),
        getElement("usersTab"),
        getElement("aboutTab")
        );
        setClassName(this.tabs[this.displayIndex],"leftTabButtonSelected");
        this.chips = Array(
            getElement("madminTab"),
            getElement("minstitutionTab"),
            getElement("mscheduleTab"),
            getElement("msecurityTab"),
            getElement("musersTab"),
            getElement("maboutTab")
        );
        this.chips[this.displayIndex].click();
        this.boxes = Array(
            getElement("accountSettingsBox"),
            getElement("institutionSettingsBox"),
            getElement("scheduleSettingsBox"),
            getElement("securitySettingsBox"),
            getElement("usersSettingsBox"),
            getElement("aboutSettingsBox")
        );
        showElement(this.boxes,this.displayIndex);
        this.back = getElement("backFromSettings");
        this.contactDevs = getElement('contactDevelopers');
    }
}

class Admin{
    constructor(){
        this.name = getElement("adminName");
        this.email = getElement("adminEmailAddress");
        this.phone = getElement("adminPhoneNumber");
        this.creationTime = getElement("adminCreationTime");
    }
    setDetails(name,email,phone,creationTime){
        this.name.textContent = name;
        this.email.textContent = email;
        this.phone.textContent = phone;
        this.creationTime.textContent = creationTime;
    }
    getName(){return this.name.textContent}
    getEmail(){return this.email.textContent;}
    getPhone(){return this.phone.textContent;}
    getCreationTime(){return this.creationTime.textContent;}
}

class Institution{
    constructor(){
        this.name = getElement('instituteName');
        this.uiid = getElement('uiid');
        this.puiid = getElement('puiid');
        this.type = getElement('instituteType');
        this.subscriptionTill = getElement('subscriptionTill');
    }
    setDetails(name = null,uiid = null,puiid = null,type = null,subscriptionTill = null){
        if(name!=null){this.name.textContent = name;}
        if(uiid != null){this.uiid.textContent = uiid;}
        if(puiid != null){this.puiid.textContent = puiid;}
        if(type != null){this.type.textContent = type;}
        if(subscriptionTill != null){this.subscriptionTill.textContent = subscriptionTill;}
    }
    getName(){return this.name.textContent;}
    getUIID(){return this.uiid.textContent;}
    getType(){return this.type.textContent;}
    getSubsciptionTill(){return this.subscriptionTill.textContent;}
}
class Schedule{
    constructor(){
        this.periodDuration = getElement('periodDuration');
        this.weekStartDay = getElement('weekStartDay');
        this.scheduleStartTime = getElement('scheduleStartTime');
        this.scheduleEndTime = getElement('scheduleEndTime');
        this.breakStartTime = getElement('breakStartTime');
        this.breakDuration = getElement('breakDuration');
        this.workDays = getElement('workdays');
        this.totalPeriods = getElement('totalPeriods');
    }
    setDetails(periodDuration,weekStartDay,scheduleStartTime,scheduleEndTime,breakStartTime,breakDuration
        ,totalWorkDays,totalPeriodsInDay){
        this.periodDuration.textContent = periodDuration;
        this.weekStartDay.textContent = weekStartDay;
        this.scheduleStartTime.textContent = scheduleStartTime;
        this.scheduleEndTime.textContent =scheduleEndTime;
        this.breakStartTime.textContent = breakStartTime;
        this.breakDuration.textContent = breakDuration;
        this.workDays.textContent = totalWorkDays;
        this.totalPeriods.textContent = totalPeriodsInDay;
    }

}

class Security{
    constructor(){
        this.resetMail = getElement('resetMailButton');
        this.resetPass = getElement('resetPasswordButton');
        this.lastLogin = getElement('lastLoginTime');
    }
    setButtonText(resetMail,resetPass){
        this.resetMail.textContent = resetMail;
        this.resetPass.textContent = resetPass;
    }
    getLastLogin(){return this.lastLogin.textContent;}
}
class Users{
    constructor(){
        this.invite = getElement('inviteUsers');
    }
}

function initAuthStateListener() {
    
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            let displayName = user.displayName
            let email = user.email;
            let emailVerified = user.emailVerified;
            let photoURL = user.photoURL;
            let uid = user.uid;
            let providerData = user.providerData;
            let creation = user.createdAt;
            reopenDB();
        } else {
            relocate(adminLoginPage);
        }
    });
}

function initializeElements(){
    admin = new Admin();
    inst = new Institution();
    schedule = new Schedule();
    security = new Security();
    manage = new Management();
    users = new Users();
    for(var i= 0;i<manage.tabs.length;i++){
        manage.tabs[i].addEventListener(click,function(){
            handleTabClicks(event,manage.tabs,manage.boxes,"leftTabButtonSelected","leftTabButton");
        },false);
        manage.chips[i].addEventListener(click,function(){
            handleTabClicks(event,manage.chips,manage.boxes);
        },false);
    }
    manage.contactDevs.addEventListener(click,feedBackBox,false);
    manage.back.addEventListener(click,undoAndReturn,false);
    security.resetPass.addEventListener(click,resetPasswordDialog,false);
    security.resetMail.addEventListener(click,changeEmailBox,false);
    users.invite.addEventListener(click,function(){

        var dialog = new Dialog(0);
        dialog.setDisplay(firebase.auth().currentUser.uid,'Copy and share the text above, or send the given QR code.');
        dialog.subHeading.style.textAlign = 'center';
        dialog.setButtonText('Done');
        dialog.positiveAction().onclick = function(){dialog.existence(false);}
        dialog.existence(true);
    },false);
}

function handleTabClicks(event,clickables,showables,showClass,hideClass){
    var e = event.currentTarget;
    for(var k=0;k<clickables.length;k++){
        var condition = e == clickables[k];
        visibilityOf(showables[k],condition);
        if(showClass!=null && hideClass!=null){
            setClassName(clickables[k],showClass,hideClass,condition);
        }
    }
}

function undoAndReturn(){
    showLoader();
    relocate(adminDashPage);
}
window.onload = function() {
    initializeElements();
    initAuthStateListener();
};