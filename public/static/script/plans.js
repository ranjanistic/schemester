let initializeElements = () => {
  let logout = getElement("logoutAdmin");
  let selectPlan = getElement("selectPlan");
  logout.onclick = () =>{
      firebase.auth().signOut();
  }
  selectPlan.onclick = () => {
    clog("Payment done");
    createLocalDB(()=>{relocate(registrationPage);});
  };
};

let authstateListener = () =>{
    firebase.auth().onAuthStateChanged((user) => {
        if (!user) {
            relocate(adminLoginPage);
        }
    });
}
let createLocalDB = (action) => {
  if (idbSupported()) {
    let request = window.indexedDB.open(localDB, 1);
    request.onerror = () => {
      clog("L Database failed to open plans");
    };
    request.onsuccess = () => {
      clog("L Database opened success plans");
      action();
    };
    request.onupgradeneeded = (e) => {
      clog("L Database need upgrade plans");
      lidb = e.target.result;
      lidb.createObjectStore(objStore.localDataName, {
        keyPath: objStore.localDBKey,
      });
      localTransaction = new Transactions(lidb);
      action();
    };
  }
};
window.onload = ()=>{
    initializeElements();
    createLocalDB();
}
