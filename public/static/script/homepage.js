//Homepage default script
var adminLogin, adminSignup,adminDash,getstarted;

let initializeElements=()=>{
    adminLogin = getElement('adminLogin');
    adminSignup = getElement('registerInstitution');
    adminDash = getElement('adminDashboard');
    getstarted = getElement('getStarted');
    adminSignup.addEventListener(click, ()=>{      
        registrationDialog(true);
    }, false);
    getstarted.addEventListener(click,()=>{refer(registrationPage)},false);
    showGreeting();
}
let initAuthStateListener=()=> {
    firebase.auth().onAuthStateChanged((user)=> {
        if (user) {
            adminLogin.addEventListener(click, ()=>{
                showLoader();
                refer(adminDashPage);
            }, false);
            adminDash.addEventListener(click, ()=>{
                showLoader();
                relocate(adminDashPage);
            }, false);
        } else {
            adminLogin.addEventListener(click, ()=>{
                showLoader();
                refer(adminLoginPage);
            }, false);
            adminDash.addEventListener(click, ()=>{
                showLoader();
                refer(adminLoginPage);
            }, false);
        }
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


window.onload = ()=> {
    initializeElements();
    initAuthStateListener();
};