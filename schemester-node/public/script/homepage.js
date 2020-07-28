class Homepage{
    constructor(){
        this.adminLogin = getElement('adminLogin');
        this.teacherLogin = getElement('teacherLogin');
        this.adminSignup = getElement('registerInstitution');
        this.plans = getElement('plansPricing');
        this.getstarted = getElement('getStarted');
        
        this.adminSignup.addEventListener(click,_=>registrationDialog());
        this.plans.addEventListener(click,_=>refer(locate.planspage));
        this.getstarted.addEventListener(click,_=>registrationDialog());
        this.adminLogin.addEventListener(click,_=>refer(locate.admin.login));
        this.teacherLogin.addEventListener(click,_=>refer(locate.teacher.login));
    }    
}

if ('serviceWorker' in navigator) {
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