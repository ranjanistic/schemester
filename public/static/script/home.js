//Homepage default script
function initAuthStateListener() {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            adminSignedInSetup(user)
        } else {
            adminSignedOutSetup()            
        }
    });
    document.getElementById('registrationClickable').addEventListener('click', function(){
        window.location.replace("registration.html")
    }, false);
}
function adminSignedInSetup(user){
    var displayName = user.displayName;
    var email = user.email;
    var emailVerified = user.emailVerified;
    var photoURL = user.photoURL;
    var uid = user.uid;
    var providerData = user.providerData;
    document.getElementById('adminLogin').addEventListener('click', function(){
        window.location.replace("admin/admin_dash.html")
    }, false);
    document.getElementById('adminDashboard').addEventListener('click', function(){
        window.location.replace("admin/admin_dash.html")
    }, false);
}
function adminSignedOutSetup(){
    document.getElementById('adminLogin').addEventListener('click', function(){
        window.location.replace("admin/admin_login.html")
    }, false);
    document.getElementById('adminDashboard').addEventListener('click', function(){
        window.location.replace("admin/admin_login.html")
    }, false);
}