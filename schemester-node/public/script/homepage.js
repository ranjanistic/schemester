class Homepage{
    constructor(){
        this.adminLogin = getElement('adminLogin');
        this.adminSignup = getElement('registerInstitution');
        this.plans = getElement('plansPricing');
        this.getstarted = getElement('getStarted');

        this.adminSignup.addEventListener(click,_=>registrationDialog());
        this.plans.addEventListener(click,_=>refer(planspage));
        this.getstarted.addEventListener(click,_=>refer(registrationPage));
        this.adminLogin.addEventListener(click,_=>refer(adminLoginPage));
        this.showGreeting();
    }
    showGreeting(){
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
}

if ('serviceWorker' in navigator) {
    window.addEventListener('load', _=> {
        navigator.serviceWorker.register('./sw.js')
            .then((registration)=> {
                console.log('SW:1:', registration.scope);
            }).catch((err)=> {
                console.log('SW:0:', err);
            });
    });
}
window.onload = _=> {
    window.app = new Homepage();
};