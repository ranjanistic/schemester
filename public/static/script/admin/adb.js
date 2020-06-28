let reopenDB = function () {
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
          let cursor = e.target.result;
          if(cursor){
            switch(cursor.value.type){
              case def.admin:{
                admin.setDetails(cursor.value.adminname,cursor.value.email,cursor.value.phone)
              };break;
              case def.institution:{
                inst.setDetails(cursor.value.institutename,cursor.value.uiid);
              };break;
              case def.timings:{
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
  
      request.onupgradeneeded = function (e) {
        clog("Database needs upgrade");
        relocate(registrationPage);
      };
    }
  };
  