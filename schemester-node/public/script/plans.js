//const { app } = require("firebase");

var db;
class Plans {
  constructor() {
    this.logout = getElement("logoutAdmin");
    this.selectPlan = getElement("selectPlan");
    this.newuiid = getElement('createuiid');
    this.back = getElement('backFromPlans');
    this.logout.addEventListener(click, this.signOut);
    this.back.addEventListener(click, _=>relocate(homepage));
    this.selectPlan.addEventListener(click,this.createCollection(this.newuiid.value));
    //firebase.auth().onAuthStateChanged(this.authstateListener.bind(this));
  }
  signOut() {
    firebase.auth().signOut();
  }
  authstateListener(user) {
    visibilityOf(this.logout,user);
  }
  createCollection(uiid) {
    // const docRef = db.doc('membership/ahem');
    // docRef.get().then(function(doc) {
    //   if (doc.exists) {
    //     const data = doc.data()
    //       data[UIID] = uiid
    //       docRef.set(data);
    //       clog('oh yeaass');
    //   } else {
    //     clog('oh noo');
    //   }
    // }).catch(_=>{
    //   clog('oooooof catch');
    // });
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

window.onload = _=>{
    window.app = new Plans();
}
