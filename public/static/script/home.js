//Homepage default script
function initAuthStateListener() {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            window.location.replace("admin/admin_dash.html")
            document.getElementById('adminLogin').addEventListener('click', function(){
                window.location.replace("admin/admin_dash.html")
            }, false);
            document.getElementById('adminDashboard').addEventListener('click', function(){
                window.location.replace("admin/admin_dash.html")
            }, false);
        } else {
            document.getElementById('adminLogin').addEventListener('click', function(){
                window.location.replace("admin/admin_login.html")
            }, false);
            document.getElementById('adminDashboard').addEventListener('click', function(){
                window.location.replace("admin/admin_login.html")
            }, false);
        }
    });
}

