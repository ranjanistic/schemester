function initAuthStateListener() {
    firebase.auth().onAuthStateChanged(function(user) {
        //document.getElementById('quickstart-verify-email').disabled = true;
        if (user) {
            // User is signed in.
            var displayName = user.displayName;
            var email = user.email;
            var emailVerified = user.emailVerified;
            var photoURL = user.photoURL;
            var uid = user.uid;
            var providerData = user.providerData;
            if(emailVerified){
                document.getElementById("verificationButton").classList.replace("warning-button","positive-button");
                document.getElementById("verificationButton").textContent = "Verified";
            } else {
                document.getElementById("verificationButton").classList.replace("positive-button","warning-button");
                document.getElementById("verificationButton").textContent = "Verify now";
            }
            if(displayName==null){
                document.getElementById("adminName").textContent = "Name not provided.";
                document.getElementById("madminName").textContent = "Name not provided.";
                document.getElementById("adminName").classList.remove("editable");
                document.getElementById("madminName").classList.remove("editable");
            } else {
                document.getElementById("adminName").textContent = displayName
                document.getElementById("madminName").textContent = displayName
                document.getElementById("madminName").classList.add("editable");
            }
            document.getElementById("adminEmailAddress").textContent = email
            document.getElementById("madminEmailAddress").textContent = email
        } else {
            window.location.replace("admin_login.html")
        }
    });
}
function setEventListeners(){
    const block = "block";
    const none = "none";
    //document.getElementById('tabgroup').firstChild.classList.replace("leftTabButton","leftTabButtonSelected")
    document.getElementById("adminTab").classList.replace("leftTabButton","leftTabButtonSelected")
    document.getElementById("accountSettingsBox").style.display = block;
    document.getElementById("institutionSettingsBox").style.display = none;
    document.getElementById("scheduleSettingsBox").style.display = none;
    document.getElementById("securitySettingsBox").style.display = none;
    document.getElementById("adminTab").addEventListener('click',function(){
        document.getElementById("adminTab").classList.replace("leftTabButton","leftTabButtonSelected");
        document.getElementById("institutionTab").classList.replace("leftTabButtonSelected","leftTabButton");
        document.getElementById("scheduleTab").classList.replace("leftTabButtonSelected","leftTabButton");
        document.getElementById("securityTab").classList.replace("leftTabButtonSelected","leftTabButton");
        document.getElementById("accountSettingsBox").style.display = block;
        document.getElementById("institutionSettingsBox").style.display = none;
        document.getElementById("scheduleSettingsBox").style.display = none;
        document.getElementById("securitySettingsBox").style.display = none;
    },false);
    document.getElementById("institutionTab").addEventListener('click',function(){
        document.getElementById("adminTab").classList.replace("leftTabButtonSelected","leftTabButton");
        document.getElementById("institutionTab").classList.replace("leftTabButton","leftTabButtonSelected");
        document.getElementById("scheduleTab").classList.replace("leftTabButtonSelected","leftTabButton");
        document.getElementById("securityTab").classList.replace("leftTabButtonSelected","leftTabButton");
        document.getElementById("accountSettingsBox").style.display = none;
        document.getElementById("institutionSettingsBox").style.display = block;
        document.getElementById("scheduleSettingsBox").style.display = none;
        document.getElementById("securitySettingsBox").style.display = none;
    },false);
    document.getElementById("scheduleTab").addEventListener('click',function(){
        document.getElementById("adminTab").classList.replace("leftTabButtonSelected","leftTabButton");
        document.getElementById("institutionTab").classList.replace("leftTabButtonSelected","leftTabButton");
        document.getElementById("scheduleTab").classList.replace("leftTabButton","leftTabButtonSelected");
        document.getElementById("securityTab").classList.replace("leftTabButtonSelected","leftTabButton");
        document.getElementById("accountSettingsBox").style.display = none;
        document.getElementById("institutionSettingsBox").style.display = none;
        document.getElementById("scheduleSettingsBox").style.display = block;
        document.getElementById("securitySettingsBox").style.display = none;
    },false);
    document.getElementById("securityTab").addEventListener('click',function(){
        document.getElementById("adminTab").classList.replace("leftTabButtonSelected","leftTabButton");
        document.getElementById("institutionTab").classList.replace("leftTabButtonSelected","leftTabButton");
        document.getElementById("scheduleTab").classList.replace("leftTabButtonSelected","leftTabButton");
        document.getElementById("securityTab").classList.replace("leftTabButton","leftTabButtonSelected");
        document.getElementById("accountSettingsBox").style.display = none;
        document.getElementById("institutionSettingsBox").style.display = none;
        document.getElementById("scheduleSettingsBox").style.display = none;
        document.getElementById("securitySettingsBox").style.display = block;
    },false);
    document.getElementById("cancelAndReturn").addEventListener('click',function(){
        undoAndReturn()
    },false);
    document.getElementById("backFromSettings").addEventListener('click',function(){
        //Ask user to save
        undoAndReturn()
    },false);
}
window.onload = function() {
    initAuthStateListener();
    setEventListeners();
};
function undoAndReturn(){
    window.location.replace("admin_dash.html");
}