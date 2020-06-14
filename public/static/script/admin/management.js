//admin management default script
var adminName,mAdminName,adminEmail,mAdminEmail,verification;
var tabs,boxes;
const block = "block", none = "none", click='click';

function initializeElements(){
    adminName = document.getElementById("adminName");
    mAdminName = document.getElementById("madminName");
    adminEmail = document.getElementById("adminEmailAddress");
    mAdminEmail = document.getElementById("madminEmailAddress");
    verification = document.getElementById("verificationButton");
    tabs = Array(document.getElementById("adminTab"),
        document.getElementById("institutionTab"),
        document.getElementById("scheduleTab"),
        document.getElementById("securityTab")
    )
    boxes = Array(
        document.getElementById("accountSettingsBox"),
        document.getElementById("institutionSettingsBox"),
        document.getElementById("scheduleSettingsBox"),
        document.getElementById("securitySettingsBox")
    )
    tabs[0].className = "leftTabButtonSelected";
    boxes[0].style.display = block;
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
            if(emailVerified){
                verification.classList.replace("warning-button","positive-button");
                verification.textContent = "Verified";
            } else {
                verification.classList.replace("positive-button","warning-button");
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
function handleTabClicks(event){
    var e = event.currentTarget;
    for(var k=0;k<tabs.length;k++){
        if(e == tabs[k]){
            tabs[k].className = "leftTabButtonSelected";
            boxes[k].style.display = block;
        } else {
            tabs[k].className = "leftTabButton";
            boxes[k].style.display = none;
        }
    }
}

function setEventListeners(){
    for(var i= 0;i<tabs.length;i++){
        console.log(i)
        tabs[i].addEventListener(click,handleTabClicks,false);
    }

    document.getElementById("cancelAndReturn").addEventListener(click,function(){
        undoAndReturn()
    },false);
    document.getElementById("backFromSettings").addEventListener(click,function(){
        //Ask user to save
        undoAndReturn()
    },false);
}
function undoAndReturn(){
    window.location.replace("admin_dash.html");
}