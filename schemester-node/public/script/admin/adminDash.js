//the admin dashboard script
class Dashboard {
  constructor() {
    
    this.dayInput = getElement("dayinput");
    this.dayDropdown = getElement("daydropdown");
    this.teacherChipToday = getElement("teacherRadioToday");
    this.classChipToday = getElement("classRadioToday");
    this.workboxtoday = getElement("workSectionToday");
    this.teacherBoxToday = getElement("teacherSectionToday");
    this.classBoxToday = getElement("classSectionToday");
    this.teacherSearchInput = getElement("teachersearchinput");
    this.teacherDropdown = getElement("teacherDropdown");
    this.dayInput.placeholder = getDayName(today.getDay());    
    
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

    this.dayInput.addEventListener(click, (_) => {
      visibilityOf(this.dayDropdown, false);
    });

    this.dayInput.oninput = (_) => {
      visibilityOf(this.dayDropdown, true);
      this.filterFunction(this.dayInput, this.dayDropdown);
    };
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

class NoDataView{
  constructor(){
    this.addTeacher = getElement("addteacher");
    this.inviteTeacher = getElement("inviteteacher");

    this.addTeacher.addEventListener(click,_=>{
      relocate(locate.adminDashPage,{target:'addteacher'});
    });
    this.inviteTeacher.addEventListener(click,_=>{
        postData(`/admin/external/`,{
          type:'invitation',
          target:'teacher'
        }).then(res=>{
          let dialog = new Dialog();
            let result = JSON.parse(res.linkdata);
            dialog.setDisplay(
              "Invitation link",
              `<center><a href="${result.link}">${
                result.link
              }</a><br/>This Link will automatically expire on <b>${getProperDate(
                String(result.time)
              )}</b>.</center>`
            );
            dialog.createActions(
              Array("Disable Link", "Copy", "Done"),
              Array(actionType.negative, actionType.positive, actionType.neutral)
            );
            dialog.onButtonClick(0, _=> {
              dialog.setDisplay(
                "Generate link",
                `<center>Create a link and share that with ${target} of your institution.</center>`
              );
              dialog.createActions(
                Array("Create Link", "Cancel"),
                Array(actionType.active, actionType.negative)
              );
              dialog.onButtonClick(0, _=> {
                this.linkGenerator(target);
              });
              dialog.onButtonClick(1, _=> {
                dialog.existence(false);  
              });
            });
            dialog.onButtonClick(1, _=> {
              navigator.clipboard.writeText(result.link).
              then(_=>{snackBar("Link Copied to clipboard.");dialog.existence(false);})
              .catch((err)=>{
                snackBar("Failed to copy, please do it manually.","Report",false,_=>{feedBackBox(true,err+":Failed to copy, please do it manually.")})
              });
            });
            dialog.onButtonClick(2, _=> {
              dialog.existence(false);
            });
            dialog.existence(true);
        }).catch((error) => {
          snackBar("Failed to generate invite link", "Report")
        });
    });
  }
}

class BaseView{
  constructor(){
    this.greeting = getElement("greeting");
    this.logOut = getElement("logoutAdminButton");
    this.dateTime = getElement("todayDateTime");
    this.greeting = getElement("greeting");
    this.settings = getElement("settingsAdminButton");
    this.logOut.addEventListener(click,(_) => {showLoader();
      let email = localStorage.getItem(constant.sessionID);
      let uiid = localStorage.getItem('uiid');
      finishSession(_=>{ relocate(locate.adminLoginPage,{email:email,uiid:uiid})})
    });
    this.settings.addEventListener(click,(_) => { showLoader();
      refer(locate.adminSettings,{u:localStorage.getItem(constant.sessionUID),target:'manage'});
    });
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
    setTimeGreeting(this.greeting);
    var today = new Date();
    this.dateTime.textContent = `${getDayName(today.getDay())}, ${getMonthName(today.getMonth())} ${today.getDate()}, ${today.getFullYear()}, ${today.getHours()}:${today.getMinutes()}`;;
  }
}

window.onload = (_) => {
  window.fragment = new BaseView();
    try{
      window.app = new Dashboard();
    }catch{
      window.app =new NoDataView();
    }
};
