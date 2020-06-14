//the admin dashboard script
var logOut,settings,dateTime, greeting;
const click = 'click', nothing = '',space = ' ',tab = '   ';

function initializeElements(){
    logOut = document.getElementById('logoutAdminButton');
    dateTime = document.getElementById('todayDateTime');
    greeting = document.getElementById('greeting');
    settings = document.getElementById('settingsAdminButton');
    logOut.addEventListener(click, function(){
        window.location.replace("../")
        firebase.auth().signOut();
    }, false);
    settings.addEventListener(click,function(){
        window.location.replace("management.html");
    },false);
    loadLocalContent()
}

function initAuthStateListener() {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            loadRemoteContent(user);
        } else {
            window.location.replace("../")
        }
    });
}

window.onload = function() {    
    initializeElements()
    initAuthStateListener();
};

function loadLocalContent(){
    var today = new Date();
    var date = getDayName(today.getDay())+','+space+getMonthName(today.getMonth()) + space + today.getDate() +','+space + today.getFullYear()+","+space+ today.getHours()+':'+today.getMinutes();
    dateTime.textContent = date
}

function loadRemoteContent(user){
    var displayName = user.displayName;
    var email = user.email;
    var emailVerified = user.emailVerified;
    var photoURL = user.photoURL;
    var uid = user.uid;
    var providerData = user.providerData;
    document.title = email+" · Admin";
    greeting.textContent = "Welcome";
    //document.getElementById('adminImage').style.backgroundImage = photoURL
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
        default: return "Error";
    }
}

var prevScrollpos = window.pageYOffset;
window.onscroll = function() {
    var currentScrollPos = window.pageYOffset;
    if (prevScrollpos > currentScrollPos) {
        dateTime.style.color = "white"
        dateTime.style.backgroundColor = "#216bf3"
    } else {
        dateTime.style.color = "#1f1f1f55"
        dateTime.style.backgroundColor = "transparent"
    }
    prevScrollpos = currentScrollPos;
}
