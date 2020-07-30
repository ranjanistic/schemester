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

    this.addTeacher.addEventListener(click,_=>{relocate(locate.admin.session,{target:'addteacher'})});
    this.inviteTeacher.addEventListener(click,_=>{this.linkGenerator('teachers')});
  }
  linkGenerator =(target)=> {
    clog("link generator");
    loadingBox(true,'Generating Link',`A link is being created for your to share with ${target}s of ${localStorage.getItem('uiid')} institute`);
    postData('/admin/manage',{
      type:'invitation',
      action:'create',
      target:target,
    }).then((response)=>{
      clog("link generate response");
      clog(response);
      if(response.event == code.invite.LINK_EXISTS|| response.event == code.invite.LINK_CREATED){
        clog("link generated box");
        let linkdialog = new Dialog();
        linkdialog.setDisplay('Invitation Link',
          `<center><a href="${response.link}">${response.link}</a>
            <br/>This Link will automatically expire on <b>${getProperDate(String(response.exp))}</b>.
          </center>`
        );
        linkdialog.createActions(
          Array("Disable Link", "Copy", "Done"),
          Array(actionType.negative, actionType.positive, actionType.neutral)
        );
        linkdialog.onButtonClick(Array( 
          _=> {
          this.revokeLink(target);
        }, _=> {
          navigator.clipboard.writeText(response.link).then(_=>{snackBar("Link copied to clipboard.")})
          .catch(err=>{
            snackBar("Failed to copy, please do it manually.",null,false);
          });
        }, _=> {
          linkdialog.existence(false);  
        }));
        linkdialog.show();
      }
      switch(response.event){
        case code.invite.LINK_EXISTS:{
          snackBar('This link already exists and can be shared.');
        }break;
        case code.invite.LINK_CREATED:{
          snackBar('Share this with teachers of your institution.');
        }break;
        case code.invite.LINK_CREATION_FAILED:{
          snackBar(`Unable to generate link:${response.msg}`,'Report');
        }
        default:{
          snackBar(`Error:${response.event}:${response.msg}`,"Report");
        }
      }
    }).catch(error=>{
      clog(error);
      snackBar(error);
    })
  };

  revokeLink(target){
    clog("revoke link");
    postData('/admin/manage',{
      type:'invitation',
      action:'disable',
      target:target
    }).then(response=>{
      clog("revoke link response");
      clog(response);
      if(response.event == code.invite.LINK_DISABLED){
        clog("link disabled");
        snackBar('All links are inactive now.',null,false);
        let nolinkdialog = new Dialog();
        nolinkdialog.setDisplay('Generate Link',`Create a link to share with ${target}s of ${localStorage.getItem('uiid')} institute, 
          so that they can access and take part in schedule management.`);
        nolinkdialog.createActions(Array('Create Link','Abort'),
          Array(actionType.positive,actionType.negative));
        nolinkdialog.onButtonClick(Array(_=>{
          nolinkdialog.hide();
          this.linkGenerator(target);
        },_=>{
          nolinkdialog.hide();
        }));
        nolinkdialog.show();
      } else {
        clog("disabled:false");
        snackBar(`Link couldn't be disabled.`,'Try again',false,_=>{
          this.revokeLink(target);
        });
      }
    }).catch(error=>{
      clog(error);
      snackBar(error);
    });
  }
}

class BaseView{
  constructor(){
    this.navicon = getElement("navicon")
    this.navicon.onclick=_=>{
      relocate(locate.root,{client:client.admin});
    }
    this.greeting = getElement("greeting");
    this.logOut = getElement("logoutAdminButton");
    this.dateTime = getElement("todayDateTime");
    this.greeting = getElement("greeting");
    this.settings = getElement("settingsAdminButton");
    this.logOut.addEventListener(click,(_) => {showLoader();
      let email = localStorage.getItem(constant.sessionID);
      let uiid = localStorage.getItem('uiid');
      finishSession(client.admin,_=>{relocate(locate.admin.login,{email:email,uiid:uiid,target:locate.admin.target.dashboard})});
    });
    this.settings.addEventListener(click,(_) => { showLoader();
      refer(locate.admin.session,{
        u:localStorage.getItem(constant.sessionUID),
        target:locate.admin.target.settings,
        section:0
      });
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
      window.app =new NoDataView();
    }catch{
      window.app = new Dashboard();
    }
};
