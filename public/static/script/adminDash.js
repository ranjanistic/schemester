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
            document.getElementById('greeting').textContent = email;
        } else {
            window.location.replace("admin_login.html")
        }
    });
    document.getElementById('logoutAdminButton').addEventListener('click', adminLogout, false);
    /* When the user clicks on the button, toggle between hiding and showing the dropdown content */
    document.getElementById("settingButton").addEventListener('click', 
    function(){
        document.getElementById("settingButton").classList.toggle("show");
    }, false);
}

// Close the dropdown menu if the user clicks outside of it
