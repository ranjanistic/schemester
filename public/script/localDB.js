
class IDB{
    constructor(version = 1){
        this.version = version;
        this.dbName = code.db.DBNAME;
        this.keypath = new KeyPath();
        this.txmode  = new TXMode();
        this.objStore = new ObjectStore();
        this.transaction = new Transaction(this.dbName,this.objStore);
        this.openDatabase();
    }
    openDatabase(success=_=>{clog('Opened')},error=_=>{clog("failed")},upgrade=_=>{clog("upgrade needed")}){
        let request = window.indexedDB.open(this.dbName,this.version);
        request.onerror =_=>{
          error();
        }
        request.onupgradeneeded =_=>{
          upgrade();
        }
        request.onsuccess =_=>{
          success();
          this.database = request.result;
        }
    }
    deleteDatabase(success =_=>{clog("DB deleted")},blocked=_=>{clog("Deletion blocked")},error=_=>{clog("error deleting db")}){
        let req = window.indexedDB.deleteDatabase(this.dbName);
        req.onerror=_=>{
          error()
        }
        req.onblocked =_=>{
          blocked();
        }
        req.onsuccess =_=>{
          success();
        }
        return req.result==null;
    }
}


class KeyPath {
  constructor() {
    this.default = new DefaultKey();
    // this.schedule = new ScheduleKey();
    // this.teacherschedule = new TeacherscheduleKey();
    // this.users = new UsersKey();
  }
}


class DefaultKey{
  constructor(){   
    this.admin = "admin";
    class AdminKey{
        constructor(){
            this.email = "email";
            this.phone = "phone";
            this.username = "username";
        }
    }
    this.adminkey = new AdminKey();

    this.instituteKey = "institute";
    this.timingsKey = "timings";
    this.uiid = "uiid";
  }
}


class TXMode {
  edit = "readwrite";
  view = "readonly";
}

class ObjectStore {
  constructor() {
    this.default = "defaults";
    this.defaultKey = "type";

    this.teacherSchedule = "teacherschedule";
    this.teachersKey = "day";

    this.schedule = "schedule";
    this.schedulekey = "day";

    this.users = "users";
    this.usersKey = "type";
  }
}


class Transaction {
  constructor(database) {
    this.db = database;
    this.obstore = new ObjectStore();
  }  
  getDefaultTx = (mode = null)=> mode?this.db.transaction(this.obstore.default,mode):this.db.transaction(this.obstore.default);

  getTeacherscheduleTx=(mode)=>mode?this.db.transaction(this.obstore.teacherSchedule,mode):this.db.transaction(this.obstore.teacherSchedule);
  
  getScheduleTx=(mode)=>mode?this.db.transaction(this.obstore.schedule,mode):this.db.transaction(this.obstore.schedule);
  
  getUsersTx = (mode) => mode?this.db.transaction(this.obstore.users,mode):this.db.transaction(this.obstore.users);
  
}
const idb = new IDB();