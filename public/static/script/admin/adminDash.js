//the admin dashboard script

function initAuthStateListener() {
    firebase.auth().onAuthStateChanged(function(user) {
        //document.getElementById('quickstart-verify-email').disabled = true;
        if (user) {
            // User is signed in.
            loadRemoteContent(user);
        } else {
            window.location.replace("../index.html")
        }
    });
    document.getElementById('logoutAdminButton').addEventListener('click', function(){
        window.location.replace("../index.html")
        firebase.auth().signOut();
    }, false);
}

window.onload = function() {
    
    loadLocalContent()
    initAuthStateListener();
};
let space = ' '
function loadLocalContent(){
    var today = new Date();
    var date = getDayName(today.getDay())+','+space+getMonthName(today.getMonth()) + space + today.getDate() +','+space + today.getFullYear()+","+space+ today.getHours()+':'+today.getMinutes();
    console.log(date)
    document.getElementById('todayDateTime').textContent = date
}
let nothing = ''
let title = nothing
function loadRemoteContent(user){
    var displayName = user.displayName;
    var email = user.email;
    var emailVerified = user.emailVerified;
    var photoURL = user.photoURL;
    var uid = user.uid;
    var providerData = user.providerData;
    document.title = email+" · Admin";
    document.getElementById('greeting').textContent = "Welcome";
    //document.getElementById('adminImage').style.backgroundImage = photoURL
}
function titleLoader() {
    let i = 1;
    while(title==nothing){
        let j = i+1
        setTimeout(function(){ 
            document.title = i+nothing+j;
        }, 800);
        i=j;
    }
}
function getDayName(dIndex){
    switch(dIndex){
        case 0: return "Sunday";
        case 1: return "Monday";
        case 2: return "Tuesday";
        case 3: return "Wednesday";
        case 4: return "Thursday";
        case 5: return "Friday";
        case 6: return "Saturday";
        default:return "Error";
    }
}
function getMonthName(mIndex){
    switch(mIndex){
        case 0: return "January";
        case 1: return "February";
        case 2: return "March";
        case 3: return "April";
        case 4: return "May";
        case 5: return "June";
        case 6: return "July";
        case 7: return "August";
        case 8: return "September";
        case 9: return "October";
        case 10: return "November";
        case 11: return "December";
        default: return "Error"
    }
}

var prevScrollpos = window.pageYOffset;
window.onscroll = function() {
var currentScrollPos = window.pageYOffset;
if (prevScrollpos > currentScrollPos) {
    document.getElementById("todayDateTime").style.color = "white"
    document.getElementById("todayDateTime").style.backgroundColor = "#216bf3"
} else {
    document.getElementById("todayDateTime").style.color = "#1f1f1f55"
    document.getElementById("todayDateTime").style.backgroundColor = "transparent"
}
    prevScrollpos = currentScrollPos;
}
