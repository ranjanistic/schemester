//the admin dashboard script

var logOut,settings,dateTime,greeting, teacherChipToday, classChipToday,workboxtoday,
teacherBoxToday, classBoxToday,teacherSearchInput, teacherDropdown, classSearchInput,classDropdown
,dayInput,dayDropdown;

function initializeElements(){    
    logOut = getElement('logoutAdminButton');
    dateTime = getElement('todayDateTime');
    greeting = getElement('greeting');
    settings = getElement('settingsAdminButton');
    dayInput = getElement('dayinput');
    dayDropdown = getElement('daydropdown');
    teacherChipToday = getElement('teacherRadioToday');
    classChipToday = getElement('classRadioToday');
    workboxtoday = getElement('workSectionToday');
    teacherBoxToday = getElement('teacherSectionToday');
    classBoxToday =  getElement('classSectionToday');
    teacherSearchInput = getElement('teachersearchinput');
    teacherDropdown = getElement('teacherDropdown');

    //classSearchInput = getElement('classsearchinput');
    //classDropdown = getElement('classDropdown');
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
        refer(adminSettings);
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
            }
        } else {
            relocate(adminLoginPage);
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


