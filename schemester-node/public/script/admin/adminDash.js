//the admin dashboard script

var logOut,settings,dateTime,greeting, teacherChipToday, classChipToday,workboxtoday,
teacherBoxToday, classBoxToday,teacherSearchInput, teacherDropdown, classSearchInput,classDropdown
,dayInput,dayDropdown;

let initializeElements=_=>{
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
    classChipToday.addEventListener(click,_=>{
        visibilityOf(workboxtoday,true);
        visibilityOf(teacherBoxToday,false);
        visibilityOf(classBoxToday,true);
    });
    teacherChipToday.addEventListener(click,_=>{
        visibilityOf(workboxtoday,true);
        visibilityOf(classBoxToday,false);
        visibilityOf(teacherBoxToday,true);
    });
    logOut.addEventListener(click, _=>{
        showLoader();
        logoutUser();
    }, false);
    settings.addEventListener(click,_=>{
        showLoader();
        refer(adminSettings);
    },false);

    dayInput.addEventListener(click,_=>{
        visibilityOf(dayDropdown,false);
    });

    dayInput.oninput = _=>{
        visibilityOf(dayDropdown,true)
        filterFunction(dayInput,dayDropdown);
    }
    loadLocalContent()
}

let initAuthStateListener=_=>{
    firebase.auth().onAuthStateChanged((user)=> {
        if (user) {
            if(user.emailVerified){
                loadRemoteContent(user);
            }else{
                accountVerificationDialog(true,false,_=>{
                    logoutUser();
                });
            }
        } else {
            relocate(adminLoginPage);
        }
    });
}

let loadLocalContent=_=>{
    var today = new Date();
    var date = getDayName(today.getDay())+','+space+getMonthName(today.getMonth()) + space + today.getDate() +','+space + today.getFullYear()+","+space+ today.getHours()+':'+today.getMinutes();
    dateTime.textContent = date;
    dayInput.placeholder = getDayName(today.getDay());
    var today = new Date();
    var greeting = getElement('homeGreeting');
    if(today.getHours()<4){
        greeting.textContent = "Good night!"
    } else if(today.getHours()<11){
        greeting.textContent = "Good morning!"
    } else if(today.getHours()<15){
        greeting.textContent = "Good afternoon"
    } else if(today.getHours()<20){
        greeting.textContent = "Good evening"
    }else {
        greeting.textContent = "Schemester"
    }
}

let loadRemoteContent=(user)=>{
    var displayName = user.displayName;
    var email = user.email;
    var emailVerified = user.emailVerified;
    var photoURL = user.photoURL;
    var uid = user.uid;
    var providerData = user.providerData;
    greeting.textContent = email;
}

let filterFunction = (input,dropdown) =>{
    var input, filter, a;
    filter = input.value.toUpperCase();
    a = dropdown.getElementsByTagName("a");
    for (var i = 0; i < a.length; i++) {
        var txtValue = a[i].textContent || a[i].innerText;
        visibilityOf(a[i],txtValue.toUpperCase().indexOf(filter) > -1)
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            a[i].onclick = _=>{
                input.value = txtValue;
                visibilityOf(dayDropdown,false);
            }
            break;
        }
    }
}

var prevScrollpos = window.pageYOffset;
window.onscroll = _=> {
    var currentScrollPos = window.pageYOffset;
    replaceClass(dateTime,"fmt-animate-opacity-off","fmt-animate-opacity",prevScrollpos > currentScrollPos);
    prevScrollpos = currentScrollPos;
}

window.onload = _=> {    
    initializeElements()
    //initAuthStateListener();
};