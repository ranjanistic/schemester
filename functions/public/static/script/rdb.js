//to create/update all records in default objectstore at once.
let saveDefaults = (defaultData, executor) => {
  let obStore = transaction.getDefaultTx(mode.edit).objectStore(objStore.defaultDataName);
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

let initiateIDB = (uiidbname,action) => {
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
      lobject.openCursor().onsuccess = (e)=>{
        clog('L cursor open success');
        let lcursor = e.target.result;
        clog('L cursor:'+lcursor);
        clog('L e:'+e.target.result);
        if (lcursor) {
          clog('L cursor switch ');
          switch (lcursor.value.localuiid) {
            case kpath.localUIID:{
              clog('L cursor kpath case localuiid');
              if (lcursor.value.uiid != null) {
                clog('L uiid !null ');
                if (lcursor.value.uiid != uiidbname) {
                  alert("You cannot change the uiid");
                }
                openAdminDatabase(lcursor.value.uiid,()=>{action()}); //open database of given stored institituion uiid name.
              } else {
                clog('L uiid null ');
                let editobStore = localTransaction.getLocalTx(mode.edit).objectStore(objStore.defaultDataName);
                let data = {
                  [objStore.defaultKey]:uiidbname
                }
                clog(data);
                let lerequest = editobStore.put(data);
                lerequest.onsuccess = ()=>{
                  clog("success added :" + data+",opening db" + lcursor.value.uiid);
                  openAdminDatabase(lcursor.value.uiid,()=>{action()});
                };
                lerequest.onerror = ()=>{
                  clog("error adding :" + data);
                }
              }
              //TODO: create uiid path value from admin input of uiid, then call the following function.
            }break;
            default: {
              clog("L no local uiid path register");
            }
          }
          lcursor.continue();
        }
      };
    };
    lrequest.onupgradeneeded = (e)=>{
      clog("L needs upgrade in register");
      lidb = e.target.result;
      lidb.createObjectStore(objStore.localDataName, {
        keyPath: objStore.localDBKey,
      });
      localTransaction = new Transactions(lidb);
    };
  }
};

let openAdminDatabase = (uiidDbName,action) => {
  let request = window.indexedDB.open(uiidDbName, 1);
  request.onerror = () => {
    clog("Admin Database failed to open");
  };
  request.onsuccess = () => {
    clog('admin db open success:'+uiiDbName);
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
    clog('executing save action in openDB');
    action();
  };
  request.onupgradeneeded = (e) => {
    clog('admin db upgrade');
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
    clog("Database setup complete, executing save action");
    action();
  };
};
