
if (!window.indexedDB) {
  log('IDB:0');
  snackBar(true,'This browser is outdated for Schemester to work. Switch to Chrome/Edge/Safari/Firefox, or any modern browser.',false,nothing,false);
}
const dbName = 'schemester';
function createDefaultValues(objectName,defaultData,kpath){
  var request = window.indexedDB.open(dbName,1);
  request.onerror = function(event){
      snackBar(true,event.target.errorCode+':Storage permission denied.',true,'Help',false);
  }
  request.onsuccess = function(event){
    log('IDB:Granted');
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
      alert('done');
    };
  }
}
function createScheduleValues(objectName,scheduleData,kpath){
  var request = window.indexedDB.open(dbName,1);
  request.onerror = function(event){
      snackBar(true,event.target.errorCode+':Storage permission denied.',true,'Help',false);
  }
  request.onsuccess = function(event){
    log('IDB:Granted'+event);
  }
  request.onupgradeneeded = function(event){
    var db = event.target.result;
    var objectStore = db.createObjectStore(objectName, { keyPath: kpath});
    objectStore.transaction.oncomplete = function(event) {
      log(event);
      var scheduleObjectStore = db.transaction(objectName, "readwrite")
        .objectStore(objectName);
      scheduleData.forEach(function(field) {
        scheduleObjectStore.add(field);
      });
    }
  }
}