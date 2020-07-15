//the admin dashboard script
class Dashboard {
  constructor() {
    this.greeting = getElement("greeting");
    this.logOut = getElement("logoutAdminButton");
    this.dateTime = getElement("todayDateTime");
    this.greeting = getElement("greeting");
    this.settings = getElement("settingsAdminButton");
    this.dayInput = getElement("dayinput");
    this.dayDropdown = getElement("daydropdown");
    this.teacherChipToday = getElement("teacherRadioToday");
    this.classChipToday = getElement("classRadioToday");
    this.workboxtoday = getElement("workSectionToday");
    this.teacherBoxToday = getElement("teacherSectionToday");
    this.classBoxToday = getElement("classSectionToday");
    this.teacherSearchInput = getElement("teachersearchinput");
    this.teacherDropdown = getElement("teacherDropdown");
    var prevScrollpos = window.pageYOffset;

    window.onscroll = (_) => {
        var currentScrollPos = window.pageYOffset;
        replaceClass(
            this.dateTime,
            "fmt-animate-opacity-off",
            "fmt-animate-opacity",
            prevScrollpos > currentScrollPos
        );
        prevScrollpos = currentScrollPos;
    };
    //classSearchInput = getElement('classsearchinput');
    //classDropdown = getElement('classDropdown');
    visibilityOf(this.workboxtoday, false);
    //visibilityOf(teacherBoxToday,false);
    this.classChipToday.addEventListener(click, (_) => {
      visibilityOf(this.workboxtoday, true);
      visibilityOf(this.teacherBoxToday, false);
      visibilityOf(this.classBoxToday, true);
    });
    this.teacherChipToday.addEventListener(click, (_) => {
      visibilityOf(this.workboxtoday, true);
      visibilityOf(this.classBoxToday, false);
      visibilityOf(this.teacherBoxToday, true);
    });
    this.logOut.addEventListener(click,(_) => {
        showLoader();
        postData(post.authlogout)
        .then((res)=>{
          if(res.result.event == code.auth.LOGGED_OUT){
            relocate(locate.adminLoginPage,{
              email:localStorage.getItem(constant.sessionID)
            })

          }
        });
    },false);
    this.settings.addEventListener(
      click,
      (_) => {
        showLoader();
        refer(locate.adminSettings,{
          u:localStorage.getItem(constant.sessionUID),
          target:'manage'
        });
      },
      false
    );

    this.dayInput.addEventListener(click, (_) => {
      visibilityOf(this.dayDropdown, false);
    });

    this.dayInput.oninput = (_) => {
      visibilityOf(this.dayDropdown, true);
      this.filterFunction(this.dayInput, this.dayDropdown);
    };
    setTimeGreeting(this.greeting);
    var today = new Date();
    this.dayInput.placeholder = getDayName(today.getDay());
    this.dateTime.textContent = `${getDayName(today.getDay())}, ${getMonthName(today.getMonth())} ${today.getDate()}, ${today.getFullYear()}, ${today.getHours()}:${today.getMinutes()}`;;
  }
  
  

  filterFunction = (input, dropdown) => {
    var input, filter, a;
    filter = input.value.toUpperCase();
    a = dropdown.getElementsByTagName("a");
    for (var i = 0; i < a.length; i++) {
      var txtValue = a[i].textContent || a[i].innerText;
      visibilityOf(a[i], txtValue.toUpperCase().indexOf(filter) > -1);
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        a[i].onclick = (_) => {
          input.value = txtValue;
          visibilityOf(this.dayDropdown, false);
        };
        break;
      }
    }
  };

}

let loadRemoteContent = () => {};

window.onload = (_) => {
    //checkSessionVaildation(_=>{window.app = new Dashboard()})
    window.app = new Dashboard()
};
