class Homepage{
    constructor(){
        this.darkmode = new Switch('darkmode');
        this.darkmode.turn(theme.isDark());
        this.darkmode.onTurnChange(_=>{theme.setDark()},_=>{theme.setLight()});
        this.adminLogin = getElement('adminLogin');
        this.teacherLogin = getElement('teacherLogin');
        this.studentLogin = getElement('studentLogin');
        this.adminSignup = getElement('registerInstitution');
        this.teacherSignup = getElement('registerTeacher');
        this.studentSignup = getElement('registerStudent');
        
        this.getstarted = getElement('getStarted');
        
        this.adminSignup.onclick=_=>{showadminregistration()};
        this.teacherSignup.onclick=_=>{showTeacherRegistration()};
        this.studentSignup.onclick=_=>{showStudentRegistration()};
        
        this.getstarted.onclick=this.adminSignup.onclick;
        this.adminLogin.onclick=_=>{refer(locate.admin.login)};
        this.teacherLogin.onclick=_=>{refer(locate.teacher.login)};
        this.studentLogin.onclick=_=>{refer(locate.student.login)};

    }
}

if ('serviceWorker' in window.navigator) {
    // window.addEventListener('load', _=> {
    //     navigator.serviceWorker.register('./sw.js')
    //         .then((registration)=> {
    //             console.log('SW:1:', registration.scope);
    //         }).catch((err)=> {
    //             console.log('SW:0:', err);
    //         });
    // });
}
window.onload = _=> {
    window.app = new Homepage();
    idbSupported();
};