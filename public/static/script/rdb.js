
//to create/update all records in default objectstore at once.
function saveDefaults(defaultData,executor) {
  let defTrans = transaction.getDefaultTx(mode.edit);
  defTrans.onerror = function(e){
    
  }
  let obStore = defTrans.objectStore(objStore.defaultDataName);
  defaultData.forEach(function (type) {
    clog(type.type);
    let request = obStore.put(type);
    request.onsuccess = function () {
      clog("success added :" + type.type);
      executor();
    };
    request.oncomplete = function () {
      clog("complete adding defaults");
    };
    request.onerror = function () {
      clog("error adding defaults");
    };
  });
}

//to update given key value in given type under default objectstore.
let saveCustomDefaults = function (type, key, newValue) {
  let defTrans = transaction.getDefaultTx(mode.edit);
  let obStore = defTrans.objectStore(objStore.defaultDataName);
  obStore.openCursor().onsuccess = function (event) {
    let cursor = event.target.result;
    clog("cursortype:" + cursor.value.type);
    if (cursor.value.type == type) {
      const updateData = cursor.value;
      updateData[key] = newValue;
      cursor.update(updateData).onsuccess = function () {
        clog("done");
      };
    } else {
      cursor.continue();
    }
  };

};

let initiateIDB = function () {
  if (!window.indexedDB) {
    clog("IDB:0");
    snackBar(
      true,
      "This browser is outdated for Schemester to work. Switch to Chrome/Edge/Safari/Firefox, or any modern browser.",
      false,
      nothing,
      false
    );
  } else {
    let request = window.indexedDB.open(dbName, 1);

    request.onerror = function () {
      clog("Database failed to open");
    };

    request.onsuccess = function () {
      clog("Database opened successfully");
      idb = request.result;
      transaction = new Transactions(idb);
      let object = transaction.getDefaultTx().objectStore(objStore.defaultDataName);
      object.openCursor().onsuccess = function(e){
        let s1  = new Stage1();
        let s2  = new Stage2();
        let cursor = e.target.result;
        if(cursor){
          switch(cursor.value.type){
            case def.admin:{
              s1.setAdminValues(cursor.value.adminname,cursor.value.phone);
            };break;
            case def.institution:{
              s1.setInstValues(cursor.value.institutename,cursor.value.uiid);
            };break;
            case def.timings:{
              s2.setTimingValues(
                cursor.value.startTime,
                cursor.value.endTime,
                cursor.value.breakStartTime,
                cursor.value.startDay,
                cursor.value.periodMinutes,
                cursor.value.breakMinutes,
                cursor.value.totalDays,
                cursor.value.totalPeriods
              );
            };break;
          }
          cursor.continue();
        }
      }
      
    };

    request.onupgradeneeded = function (e) {
      idb = e.target.result;
      objStore.default = idb.createObjectStore(objStore.defaultDataName, {
        keyPath: objStore.defaultKey,
      });
      objStore.teachers = idb.createObjectStore(objStore.teacherScheduleName, {
        keyPath: objStore.teachersKey,
        autoIncrement: true,
      });
      objStore.batches = idb.createObjectStore(objStore.batchesScheduleName, {
        keyPath: objStore.batchesKey,
        autoIncrement: true,
      });
      objStore.today = idb.createObjectStore(objStore.todayScheduleName, {
        keyPath: objStore.todayKey,
        autoIncrement: true,
      });
      transaction = new Transactions(idb);
      clog("Database setup complete");
    };
  }
};
