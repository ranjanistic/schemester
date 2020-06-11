//The admin login page script
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
            window.location.replace("admin_dash.html")
            //alert(email);
        } else {
            //alert("signedOut")
        }
    });
    // [END authstatelistener]
    document.getElementById('loginAdminButton').addEventListener('click', adminLogin, false);
}

function adminLogin() {
    if (firebase.auth().currentUser) {
        // [START signout]
        alert("signingout")
        firebase.auth().signOut();
        // [END signout]
    } 
    
    var email = document.getElementById('adminemail').value;
    var password = document.getElementById('adminpassword').value;
    if (email.length < 4) {
    alert('Please enter an email address.');
    return;
    } else if (password.length < 4) {
    alert('Please enter a password.');
    return;
    } else{
        document.getElementById('loginAdminButton').textContent = "Wait..."
           // Sign in with email and pass.
        firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            if (errorCode === 'auth/wrong-password') {
                alert('Wrong credentials.');
            } else {
                alert(errorMessage);
            }
            console.log(error);
        });
    }

}