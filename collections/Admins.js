const database = require("../config/db");
class Administrator{
    constructor(){
        var collection = '0administrators'
        this.Admin = database.collection(collection);
        //database.command({dropIndexes: collection, index: "*"});
    }
}

module.exports = new Administrator().Admin;