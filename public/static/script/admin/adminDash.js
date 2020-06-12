//the admin dashboard script

function adminLogout(){
    firebase.auth().signOut();
    window.location.replace("admin_login.html")
}

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
            document.title = email
            document.getElementById('greeting').textContent = "Hey "+email;
        } else {
            window.location.replace("../index.html")
        }
    });
    document.getElementById('logoutAdminButton').addEventListener('click', adminLogout, false);
}

window.onload = function() {
    initAuthStateListener();
};

var prevScrollpos = window.pageYOffset;
window.onscroll = function() {
var currentScrollPos = window.pageYOffset;
if (prevScrollpos > currentScrollPos) {
    //document.getElementById("bottomBar").style.bottom = "0";
    document.getElementById("todayDateTime").style.color = "white"
    document.getElementById("todayDateTime").style.backgroundColor = "#2196F3"
} else {
    //document.getElementById("bottomBar").style.bottom = "-50px";
    document.getElementById("todayDateTime").style.color = "#1f1f1f55"
    document.getElementById("todayDateTime").style.backgroundColor = "transparent"
}
    prevScrollpos = currentScrollPos;
}
