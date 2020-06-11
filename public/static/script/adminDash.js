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
            //window.location.replace("admin_dash.html")
            document.getElementById('greeting').textContent = email;
            //alert(email);
        } else {
            window.location.replace("admin_login.html")
            //alert("signedOut")
        }
    });
    // [END authstatelistener]
    document.getElementById('logoutAdminButton').addEventListener('click', adminLogout, false);
}