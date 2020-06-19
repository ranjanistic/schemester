//admin management default script
var adminName,mAdminName,adminEmail,mAdminEmail,verification,resetPass,mResetPass,snackBtn;
var tabs,boxes,chips,sections;


function initializeElements(){
    adminName = document.getElementById("adminName");
    mAdminName = document.getElementById("madminName");
    adminEmail = document.getElementById("adminEmailAddress");
    mAdminEmail = document.getElementById("madminEmailAddress");
    verification = document.getElementById("verificationButton");
    resetPass = document.getElementById('resetPasswordButton');
    mResetPass = document.getElementById('mresetPasswordButton');
    snackBtn = document.getElementById('snackButton');
    tabs = Array(document.getElementById("adminTab"),
        document.getElementById("institutionTab"),
        document.getElementById("scheduleTab"),
        document.getElementById("securityTab"),
        document.getElementById("usersTab")
    );
    setClassName(tabs[0],"leftTabButtonSelected");
    boxes = Array(
        document.getElementById("accountSettingsBox"),
        document.getElementById("institutionSettingsBox"),
        document.getElementById("scheduleSettingsBox"),
        document.getElementById("securitySettingsBox"),
        document.getElementById("usersSettingsBox")
    );
    showElement(boxes,0)
    chips = Array(
        document.getElementById("madminTab"),
        document.getElementById("minstitutionTab"),
        document.getElementById("mscheduleTab"),
        document.getElementById("msecurityTab"),
        document.getElementById("musersTab")
    );
    chips[0].click();
    sections = Array(
        document.getElementById("maccountSettingsBox"),
        document.getElementById("minstitutionSettingsBox"),
        document.getElementById("mscheduleSettingsBox"),
        document.getElementById("msecuritySettingsBox"),
        document.getElementById("musersSettingsBox")
    );
    showElement(sections,0)
    setEventListeners()
}

function initAuthStateListener() {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            var displayName = user.displayName;
            var email = user.email;
            var emailVerified = user.emailVerified;
            var photoURL = user.photoURL;
            var uid = user.uid;
            var providerData = user.providerData;
            replaceClass(verification,"warning-button","positive-button",emailVerified);
            if(emailVerified){
                verification.textContent = "Verified";
            } else {
                verification.textContent = "Verify now";
            }
            if(displayName==null){
                adminName.textContent = "Name not provided.";
                mAdminName.textContent = adminName.textContent;
                adminName.classList.remove("editable");
                mAdminName.classList.remove("editable");
            } else {
                adminName.textContent = displayName
                mAdminName.textContent = adminName.textContent
                mAdminName.classList.add("editable");
            }
            adminEmail.textContent = email
            mAdminEmail.textContent = email
        } else {
            window.location.replace("admin_login.html")
        }
    });
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

function setEventListeners(){
    for(var i= 0;i<tabs.length;i++){
        tabs[i].addEventListener(click,function(){
            handleTabClicks(event,tabs,boxes,"leftTabButtonSelected","leftTabButton");
        },false);
        chips[i].addEventListener(click,function(){
            handleTabClicks(event,chips,sections);
        },false);
    }
    document.getElementById("cancelAndReturn").addEventListener(click,function(){
        undoAndReturn()
    },false);
    document.getElementById("backFromSettings").addEventListener(click,function(){
        //Ask user to save
        undoAndReturn()
    },false);
    mResetPass.addEventListener(click,function(){resetPasswordBox(true,'Tell us your email address and we\'ll send you a link to help you reset your password.',
    '/static/graphic/icons/schemester512.svg','Your email address','someone@example.domain','Invalid email address','Send link','Cancel');},false);
    resetPass.addEventListener(click,function(){resetPasswordBox(true,'Tell us your email address and we\'ll send you a link to help you reset your password.',
    '/static/graphic/icons/schemester512.svg','Your email address','someone@example.domain','Invalid email address','Send link','Cancel');},false);
}
function undoAndReturn(){
    showLoader();
    window.location.replace("admin_dash.html");
}