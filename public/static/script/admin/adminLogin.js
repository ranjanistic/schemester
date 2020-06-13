//The admin login page script
function initAuthStateListener() {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            window.location.replace("admin_dash.html")
        }
    });
    document.getElementById('loginAdminButton').addEventListener('click', adminLogin, false);
}

function adminLogin() {
    if (firebase.auth().currentUser) {
        firebase.auth().signOut();
    } 
    var email = document.getElementById('adminemail').value;
    var password = document.getElementById('adminpassword').value;
    var element = document.getElementById('loginAdminButton')
    if (email.length < 4) {
        alert('Please enter an email address.');
        element.textContent = "Retry";
        return;
    } else if (password.length < 4) {
        alert('Please enter a password.');
        element.textContent = "Retry";
        return;
    } else{
        element.textContent = "Wait...";
           // Sign in with email and pass.
        firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            if (errorCode === 'auth/wrong-password') {
                element.textContent = "Retry";
                alert('Wrong credentials.');
            } else {
                element.textContent = "Retry";
                alert(errorMessage);
            }
            //console.log(error);
        });

    }
}