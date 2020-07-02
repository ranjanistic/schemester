//const { app } = require("firebase");
class Plans {
  constructor() {
    this.logout = getElement("logoutAdmin");
    this.selectPlan = getElement("selectPlan");
    this.newuiid = getElement('createuiid');
    this.back = getElement('backFromPlans');
    this.logout.addEventListener(click, this.signOut);
    this.back.addEventListener(click, ()=>relocate(homepage));
    firebase.auth().onAuthStateChanged(this.authstateListener.bind(this));
  }
  signOut() {
    firebase.auth().signOut();
  }
  authstateListener(user) {
    visibilityOf(this.logout,user);
  }
  createCollection(uiid) {      
  }
};

let createLocalDB = (uiid,action) => {
  if (idbSupported()) {
    let request = window.indexedDB.open(localDB, 1);
    request.onerror = () => {
      clog("L Database failed to open plans");
    };
    request.onupgradeneeded = (e) => {
      clog("L Database need upgrade plans");
      lidb = e.target.result;
      lidb.createObjectStore(objStore.localDataName, {
        keyPath: objStore.localDBKey,
      });
      localTransaction = new Transactions(lidb);
    };
  }
};
window.onload = ()=>{
    window.app = new Plans();
}
