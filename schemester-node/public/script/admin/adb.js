let reopenDB = ()=> {
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
          let cursor = e.target.result;
          if(cursor){
            switch(cursor.value.type){
              case kpath.admin:{
                admin.setDetails(cursor.value.adminname,cursor.value.email,cursor.value.phone)
              };break;
              case kpath.institution:{
                inst.setDetails(cursor.value.institutename,cursor.value.uiid);
              };break;
              case kpath.timings:{
                  schedule.setDetails(
                    cursor.value.periodMinutes,
                    cursor.value.startDay,
                    cursor.value.startTime,
                    cursor.value.endTime,
                    cursor.value.breakStartTime,
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
  
      request.onupgradeneeded = (e) =>{
        clog("Database needs upgrade");
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
      };
    }
  };
  