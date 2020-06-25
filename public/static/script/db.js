
if (!window.indexedDB) {
  log('IDB:0');
  snackBar(true,'This browser is outdated for Schemester to work. Switch to Chrome/Edge/Safari/Firefox, or any modern browser.',false,nothing,false);
}
const dbName = appName;
let createDefaultValues = function(objectName,defaultData,kpath,version){
  var request = window.indexedDB.open(dbName,version);
  request.onsuccess = function(event){
    log('IDB:S:'+event);
  }
  request.onupgradeneeded = function(event){
    var db = event.target.result;
    var objectStore = db.createObjectStore(objectName, { keyPath: kpath});
    objectStore.transaction.oncomplete = function(event) {
      log(event);
      var defaultObjectStore = db.transaction(objectName, "readwrite")
        .objectStore(objectName);
      defaultData.forEach(function(field) {
        defaultObjectStore.add(field);
      });
      db.close();
    };
  }
  request.onerror = function(event){
    log('IDB:E:'+event);
   }
}
let createScheduleValues = function(objectName,scheduleData,kpath,version){
  var request = indexedDB.open(dbName, version);
  request.onupgradeneeded = function(event) {
    var db = event.target.result;
    log('upgrade');
    db.createObjectStore(objectName,{keyPath:kpath});
  };

  request.onsuccess = function(event) {
    var db = event.target.result;
    log('success');
    var tx = db.transaction(objectName,"readwrite");
    var store = tx.objectStore(objectName);
      scheduleData.forEach(function(field){
        store.add(field);
      });  
      db.close();
    }
    request.onerror = function(event){
      log(event);
    }       
}

let createTeacherSchedule = function(objectName,scheduleData,kpath,version){
  var request = indexedDB.open(dbName, version);
  request.onupgradeneeded = function(event) {
    var db = event.target.result;
    log('upgradeTeacher');
    db.createObjectStore(objectName,{keyPath:kpath});
  };

  request.onsuccess = function(event) {
    var db = event.target.result;
    log('successTeacher');
    var tx = db.transaction(objectName,"readwrite");
    var store = tx.objectStore(objectName);
      scheduleData.forEach(function(field){
        store.add(field);
      });  
      db.close();
    }
    request.onerror = function(event){
      log(event);
    }       
}