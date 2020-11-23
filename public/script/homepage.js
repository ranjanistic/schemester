class Homepage{
    constructor(){
        new ThemeSwitch('darkmode');
        this.logintabs = getElement('logintabs');
        const adminlogintab = `<div class="fmt-col fmt-third fmt-padding-small fmt-animate-top">
        <button
          class="image-text-button"
          style="margin-bottom: 22px"
          id="adminLogin"
        >
          <div  style="border-radius: 8px" class=" fmt-animate-right">
            <img
              src="/graphic/illustrations/adminloginview.svg"
              width="100%"
              alt="Administrator Illustration"
            />
          </div>
          <div class="fmt-padding-large fmt-col fmt-animate-left">
            <span class="group-heading fmt-row"
              >Continue as Administrator</span
            >
            <span class="group-text fmt-row">
              Sign in here to access your institution.
            </span>
          </div>
        </button>
      </div>`;

    const teacherlogintab = `
      <div class="fmt-col fmt-third fmt-padding-small fmt-animate-top">
        <button
          class="image-text-button"
          style="margin-bottom: 22px"
          id="teacherLogin"
        >
          <div style="border-radius: 8px" class=" fmt-animate-right">
            <img
              src="/graphic/illustrations/teacherloginview.svg"
              width="100%"
              alt="Teacher Illustration"
            />
          </div>
          <div class="fmt-padding-large fmt-col  fmt-animate-left">
            <span class="group-heading fmt-row">Continue as Teacher</span>
            <span class="group-text fmt-row">
              Sign in here to access your schedule.
            </span>
          </div>
        </button>
      </div>`;
      const studentlogintab = `
      <div class="fmt-col fmt-third fmt-padding-small fmt-animate-top">
        <button
          class="image-text-button"
          style="margin-bottom: 22px"
          id="studentLogin"
        >
          <div  style="border-radius: 8px" class=" fmt-animate-right">
            <img
              src="/graphic/illustrations/studentloginview.svg"
              width="100%"
              alt="Teacher Illustration"
            />
          </div>
          <div class="fmt-padding-large fmt-col  fmt-animate-left">
            <span class="group-heading fmt-row">Continue as Student</span>
            <span class="group-text fmt-row">
              See what's on your day today.
            </span>
          </div>
        </button>
      </div>`;
        this.tabs = [adminlogintab,teacherlogintab,studentlogintab];
        if(localStorage.getItem('homelogintab')){
            this.logintabs.innerHTML = this.tabs[Number(localStorage.getItem('homelogintab'))];
            this.tabs.forEach((tabcont,t)=>{
                if(t!=Number(localStorage.getItem('homelogintab'))){
                    this.logintabs.innerHTML+= tabcont;
                }
            })
        } else {
            this.tabs.forEach((tabcont,t)=>{
                this.logintabs.innerHTML+= tabcont;
            });
        }
        this.adminLogin = getElement('adminLogin');
        this.teacherLogin = getElement('teacherLogin');
        this.studentLogin = getElement('studentLogin');
        this.adminLogin.onclick=_=>{showLoader();localStorage.setItem(key.homelogintab,this.tabs.indexOf(adminlogintab)); refer(locate.admin.login)};
        this.teacherLogin.onclick=_=>{showLoader();localStorage.setItem(key.homelogintab,this.tabs.indexOf(teacherlogintab));refer(locate.teacher.login)};
        this.studentLogin.onclick=_=>{showLoader();localStorage.setItem(key.homelogintab,this.tabs.indexOf(studentlogintab));refer(locate.student.login)};
        this.adminSignup = getElement('registeradmin');
        this.teacherSignup = getElement('registerteacher');
        this.studentSignup = getElement('registerstudent');

        this.getstarted = getElement('getStarted'); 
        
        this.adminSignup.onclick=_=>{showadminregistration()};
        this.teacherSignup.onclick=_=>{showTeacherRegistration()};
        this.studentSignup.onclick=_=>{showStudentRegistration()};
        
        this.getstarted.onclick=_=> refer(locate.tour);
    }
}

window.onload = _=> {
    window.app = new Homepage();
    idbSupported();
};