
//to create/update all records in default objectstore at once.
let saveDefaults = (defaultData,executor)=> {
  let defTrans = transaction.getDefaultTx(mode.edit);
  defTrans.onerror = (e)=>{
  }
  let obStore = defTrans.objectStore(objStore.defaultDataName);
  defaultData.forEach((type)=> {
    clog(type.type);
    let request = obStore.put(type);
    request.onsuccess = ()=> {
      clog("success added :" + type.type);
      executor();
    };
    request.oncomplete = ()=> {
      clog("complete adding defaults");
    };
    request.onerror = ()=> {
      clog("error adding defaults");
    };
  });
}

//to update given key value in given type under default objectstore.
let saveCustomDefaults = (type, key, newValue)=>{
  let defTrans = transaction.getDefaultTx(mode.edit);
  let obStore = defTrans.objectStore(objStore.defaultDataName);
  obStore.openCursor().onsuccess = (event)=> {
    let cursor = event.target.result;
    clog("cursortype:" + cursor.value.type);
    if (cursor.value.type == type) {
      const updateData = cursor.value;
      updateData[key] = newValue;
      cursor.update(updateData).onsuccess = ()=> {
        clog("done");
      };
    } else {
      cursor.continue();
    }
  };

};

let initiateIDB = ()=> {
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

    request.onerror = ()=> {
      clog("Database failed to open");
    };

    request.onsuccess = ()=> {
      clog("Database opened successfully");
      idb = request.result;
      transaction = new Transactions(idb);
      let object = transaction.getDefaultTx().objectStore(objStore.defaultDataName);
      object.openCursor().onsuccess = (e)=>{
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

    request.onupgradeneeded = (e)=> {
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
