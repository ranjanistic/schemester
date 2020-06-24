//the admin dashboard script

var logOut,settings,dateTime,greeting, teacherChipToday, classChipToday,workboxtoday,
teacherBoxToday, classBoxToday,teacherSearchInput, teacherDropdown, classSearchInput,classDropdown
,dayInput,dayDropdown;

function initializeElements(){

    
    logOut = document.getElementById('logoutAdminButton');
    dateTime = document.getElementById('todayDateTime');
    greeting = document.getElementById('greeting');
    settings = document.getElementById('settingsAdminButton');
    dayInput = document.getElementById('dayinput');
    dayDropdown = document.getElementById('daydropdown');
    teacherChipToday = document.getElementById('teacherRadioToday');
    classChipToday = document.getElementById('classRadioToday');
    workboxtoday = document.getElementById('workSectionToday');
    teacherBoxToday = document.getElementById('teacherSectionToday');
    classBoxToday =  document.getElementById('classSectionToday');
    teacherSearchInput = document.getElementById('teachersearchinput');
    teacherDropdown = document.getElementById('teacherDropdown');

    //classSearchInput = document.getElementById('classsearchinput');
    //classDropdown = document.getElementById('classDropdown');
    visibilityOf(workboxtoday,false);
    //visibilityOf(teacherBoxToday,false);
    classChipToday.addEventListener(click,function(){
        visibilityOf(workboxtoday,true);
        visibilityOf(teacherBoxToday,false);
        visibilityOf(classBoxToday,true);
    });
    teacherChipToday.addEventListener(click,function(){
        visibilityOf(workboxtoday,true);
        visibilityOf(classBoxToday,false);
        visibilityOf(teacherBoxToday,true);
    });
    logOut.addEventListener(click, function(){
        showLoader();
        logoutUser();
    }, false);
    settings.addEventListener(click,function(){
        showLoader();
        window.location.href = "management.html";
    },false);

    dayInput.addEventListener(click,function(){
        visibilityOf(dayDropdown,false);
    });

    dayInput.oninput = function(){
        visibilityOf(dayDropdown,true)
        filterFunction(dayInput,dayDropdown);
    }
    loadLocalContent()
}

function initAuthStateListener() {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            if(user.emailVerified){
                loadRemoteContent(user);
            }else{
                accountVerificationDialog(true,false);
                var verif = new ConfirmDialog()
                verif.positiveAction().onclick = function(){
                    verif.loader();
                    snackBar(false);
                    if(firebase.auth().currentUser.emailVerified){
                        window.location.replace("/");
                    } else {
                        snackBar(true,'Not yet verified',false,nothing,false);
                        verif.loader(false);
                    }
                }
                verif.negativeAction().onclick = function(){
                    verif.loader();
                    logoutUser();
                }
            }
        } else {
            window.location.replace("/admin/admin_login.html")
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
    dateTime.textContent = date;
    dayInput.placeholder = getDayName(today.getDay());
}

function loadRemoteContent(user){
    var displayName = user.displayName;
    var email = user.email;
    var emailVerified = user.emailVerified;
    var photoURL = user.photoURL;
    var uid = user.uid;
    var providerData = user.providerData;
    greeting.textContent = email;
}

function filterFunction(input,dropdown) {
    var input, filter, a;
    filter = input.value.toUpperCase();
    a = dropdown.getElementsByTagName("a");
    for (var i = 0; i < a.length; i++) {
        var txtValue = a[i].textContent || a[i].innerText;
        visibilityOf(a[i],txtValue.toUpperCase().indexOf(filter) > -1)
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            a[i].onclick = function(){
                input.value = txtValue;
                visibilityOf(dayDropdown,false);
            }
            break;
        }
    }
}

var prevScrollpos = window.pageYOffset;
window.onscroll = function() {
    var currentScrollPos = window.pageYOffset;
    replaceClass(dateTime,"fmt-animate-opacity-off","fmt-animate-opacity",prevScrollpos > currentScrollPos);
    prevScrollpos = currentScrollPos;
}


