//Homepage default script
var adminLogin, adminSignup,plans,getstarted;

let initializeElements=()=>{
    adminLogin = getElement('adminLogin');
    adminSignup = getElement('registerInstitution');
    plans = getElement('plansPricing');
    getstarted = getElement('getStarted');
    adminSignup.addEventListener(click, ()=>{      
        registrationDialog(true);
    }, false);
    plans.addEventListener(click,()=>{refer(planspage);},false);
    getstarted.addEventListener(click,()=>{refer(registrationPage)},false);
    showGreeting();
}
//remove
let initAuthStateListener=()=> {
    firebase.auth().onAuthStateChanged((user)=> {
        adminLogin.addEventListener(click, ()=>{
            showLoader();
            if (user) {
                refer(adminDashPage);
            } else{
                refer(adminLoginPage);
            }
        }, false);
    });
}
let showGreeting=()=>{
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
window.onload = ()=> {
    initializeElements();
  //  initAuthStateListener();
};