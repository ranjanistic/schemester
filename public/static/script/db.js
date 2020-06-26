if (!window.indexedDB) {
  log("IDB:0");
  snackBar(
    true,
    "This browser is outdated for Schemester to work. Switch to Chrome/Edge/Safari/Firefox, or any modern browser.",
    false,
    nothing,
    false
  );
}
const dbName = appName;

let createDefaultValues = function (defaultData, version) {
  var request = window.indexedDB.open(dbName, version);
  request.onsuccess = function (event) {

  };
  request.onupgradeneeded = function (event) {
    var db = event.target.result;
    var objectStore;
    try{
      objectStore = db.createObjectStore(defaults, { keyPath: "type" });
      objectStore.transaction.oncomplete = function (event) {
        log(event);
        var defaultObjectStore = db
          .transaction(defaults, "readwrite")
          .objectStore(defaults);
        defaultData.forEach(function (field) {
          defaultObjectStore.add(field);
        });
        db.close();
      };
    } catch{
      defaultData.forEach(function(field){
        console.log(field.type);
        updateDefaultValues(field.type,field);
      });
    }
  };
  request.onerror = function (event) {

  };
};

//works first time update
let updateDefaultValues = function(type,field){
  var request = window.indexedDB.open(dbName);
  request.onsuccess = function (event) {
  var db = event.target.result;
  var objectStore = db.transaction(defaults, "readwrite").objectStore(defaults);
  var request = objectStore.get(type);
  request.onerror = function(event) {
    // Handle errors!
  };
  request.onsuccess = function(event) {
    var requestUpdate = objectStore.put(field);
    requestUpdate.onerror = function(event) {
      console.log(event);
    };
    requestUpdate.onsuccess = function(event) {
      
    };
  };
};
}

let createTeacherSchedule = function (
  objectName,
  scheduleData,
  kpath,
  version
) {
  var request = indexedDB.open(dbName, version);
  request.onupgradeneeded = function (event) {
    var db = event.target.result;
    console.log("upgradeTeacher");
    db.createObjectStore(objectName, { keyPath: kpath });
  };

  request.onsuccess = function (event) {
    var db = event.target.result;
    log("successTeacher");
    var tx = db.transaction(objectName, "readwrite");
    var store = tx.objectStore(objectName);
    scheduleData.forEach(function (field) {
      store.add(field);
    });
    db.close();
  };
  request.onerror = function (event) {
    log(event);
  };
};

let getDefaultPreference = function (type, key) {
  var ans = null;
  var request = indexedDB.open(dbName);
  request.onsuccess = function (event) {
    event.target.result.transaction(defaults)
    .objectStore(defaults)
    .get(type).onsuccess = function (event) {
        ans = event.target.result[key];
        console.log(ans);
    };
  };
  return ans;
};
