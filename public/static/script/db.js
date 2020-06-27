const dbName = appName;
let idb;
let transaction;
class Modes {
  edit = "readwrite";
  view = "readonly";
}
const mode = new Modes();

class ObjectStores {
  default;
  teachers;
  batches;
  today;
  constructor() {
    this.defaultDataName = "defaults";
    this.defaultKey = "type";
    this.teacherScheduleName = "teachers";
    this.teachersKey = "day";
    this.batchesScheduleName = "batches";
    this.batchesKey = "day";
    this.todayScheduleName = "today";
    this.todayKey = "period";
  }
}
let objStore = new ObjectStores();
class Transactions {
  constructor(database) {
    this.default;
    this.teachers;
    this.batches;
    this.today;
    this.db = database;
  }
  getDefaultTx(mode) {
    if (mode != null) {
      return (this.default = this.db.transaction(
        objStore.defaultDataName,
        mode
      ));
    }
    return (this.default = this.db.transaction(objStore.defaultDataName));
  }
  getTeachersTx(mode) {
    if (mode != null) {
      return (this.default = this.db.transaction(
        objStore.teacherScheduleName,
        mode
      ));
    }
    return (this.default = this.db.transaction(objStore.teacherScheduleName));
  }
  getBatchesTx(mode) {
    if (mode != null) {
      return (this.default = this.db.transaction(
        objStore.batchesScheduleName,
        mode
      ));
    }
    return (this.default = this.db.transaction(objStore.batchesScheduleName));
  }
  getTodayTx(mode) {
    if (mode != null) {
      return (this.default = this.db.transaction(
        objStore.todayScheduleName,
        mode
      ));
    }
    return (this.default = this.db.transaction(objStore.todayScheduleName));
  }
}

//to create/update all records in default objectstore at once.
function saveDefaults(defaultData) {
  let defTrans = transaction.getDefaultTx(mode.edit);
  let obStore = defTrans.objectStore(objStore.defaultDataName);
  defaultData.forEach(function (type) {
    let request = obStore.put(type);
    request.onsuccess = function () {
      clog("success added :" + type);
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
