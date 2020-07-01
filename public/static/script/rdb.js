//to create/update all records in default objectstore at once.
let saveDefaults = (defaultData, executor) => {
  let defTrans = transaction.getDefaultTx(mode.edit);
  defTrans.onerror = (e) => {};
  let obStore = defTrans.objectStore(objStore.defaultDataName);
  defaultData.forEach((type) => {
    clog(type.type);
    let request = obStore.put(type);
    request.onsuccess = () => {
      clog("success added :" + type.type);
      executor();
    };
    request.oncomplete = () => {
      clog("complete adding defaults");
    };
    request.onerror = () => {
      clog("error adding defaults");
    };
  });
};

//to update given key value in given type under default objectstore.
let saveCustomDefaults = (type, key, newValue) => {
  let defTrans = transaction.getDefaultTx(mode.edit);
  let obStore = defTrans.objectStore(objStore.defaultDataName);
  obStore.openCursor().onsuccess = (event) => {
    let cursor = event.target.result;
    clog("cursortype:" + cursor.value.type);
    if (cursor.value.type == type) {
      const updateData = cursor.value;
      updateData[key] = newValue;
      cursor.update(updateData).onsuccess = () => {
        clog("done");
      };
    } else {
      cursor.continue();
    }
  };
};

let initiateIDB = () => {
  if (idbSupported()) {
    let lrequest = window.indexedDB.open(localDB, 1);
    lrequest.onerror = () => {
      clog("L Database failed to open register");
    };

    lrequest.onsuccess = () => {
      clog("L Database opened successfully register");
      lidb = lrequest.result;
      localTransaction = new Transactions(lidb);
      let lobject = localTransaction.getLocalTx().objectStore(objStore.localDataName);
      lobject.openCursor().onsuccess = (e) => {
        let lcursor = e.target.result;
        if (lcursor) {
          switch (lcursor.value.type) {
            case kpath.localUIID:{
              //TODO: create uiid path value from admin input of uiid, then call the following function.
              openAdminDatabase(lcursor.value.uiid);  //open database of given stored institituion uiid name.
            }break;
            default: {
              clog("L no local uiid path register");
            }
          }
          lcursor.continue();
        }
      };
    };
    lrequest.onupgradeneeded = (e) =>{
      clog('L needs upgrade in register');
      lidb = e.target.result;
      lidb.createObjectStore(objStore.localDataName, {
        keyPath: objStore.localDBKey,
      });
      localTransaction = new Transactions(lidb);
    }
  }
};

let openAdminDatabase = (uiidDbName) => {
  let request = window.indexedDB.open(uiidDbName, 1);
  request.onerror = () => {
    clog("Database failed to open");
  };
  request.onsuccess = () => {
    let s1 = new Stage1();
    let s2 = new Stage2();
    idb = request.result;
    transaction = new Transactions(lidb);
    let object = transaction.getLocalTx().objectStore(objStore.defaultDataName);
    object.openCursor().onsuccess = (e) => {
      let cursor = e.target.result;
      if (cursor) {
        switch (cursor.value.type) {
          case kpath.admin:
            {
              s1.setAdminValues(cursor.value.adminname, cursor.value.phone);
            }
            break;
          case kpath.institution:
            {
              s1.setInstValues(cursor.value.institutename, cursor.value.uiid);
            }
            break;
          case kpath.timings:
            {
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
            }
            break;
        }
        cursor.continue();
      }
    };
  };
  request.onupgradeneeded = (e) => {
    idb = e.target.result;
    idb.createObjectStore(objStore.defaultDataName, {
      keyPath: objStore.defaultKey,
    });
    idb.createObjectStore(objStore.teacherScheduleName, {
      keyPath: objStore.teachersKey,
      autoIncrement: true,
    });
    idb.createObjectStore(objStore.batchesScheduleName, {
      keyPath: objStore.batchesKey,
      autoIncrement: true,
    });
    idb.createObjectStore(objStore.todayScheduleName, {
      keyPath: objStore.todayKey,
      autoIncrement: true,
    });
    transaction = new Transactions(idb);
    clog("Database setup complete");
  };
};
