const MongoClient = require('mongodb').MongoClient;
const dbName = "schemesterDB",
getLink=(cloud=false)=>cloud?`mongodb+srv://ranjanistic:ggD2zo319tfQ6M8f@realmcluster.njdl8.mongodb.net/${dbName}?retryWrites=true&w=majority`:`mongodb://localhost:27017/${dbName}`;
var _db;
const adcoll = "0administrators",instcoll = "1institutions";
module.exports = {
  connectToServer: ( callback )=>{
    MongoClient.connect(
       getLink(true), 
      { useNewUrlParser: true , useUnifiedTopology: true}, function( err, client ) {
      _db  = client.db(dbName);
      return callback( err );
    });
  },

  getDb: ()=>{
    return _db;
  },
  getAdmin:()=>{
    return _db.collection(adcoll)
  },
  getInstitute:()=>{
    return _db.collection(instcoll)
  }
};