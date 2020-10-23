const {code,clog} = require('../public/script/codes'),
  {MongoClient} = require('mongodb'),
  config = require('./config.json'),
getLink=(cloud=false)=>cloud?`mongodb+srv://${config.name}:${config.pass}@realmcluster.njdl8.mongodb.net/${code.db.DBNAME}?retryWrites=true&w=majority`:`mongodb://localhost:27017/${code.db.DBNAME}`;
var _db;
module.exports = {
  connectToServer: ( callback )=>{
    MongoClient.connect(
      getLink(true),
      { useNewUrlParser: true , useUnifiedTopology: true}, function( err, client ) {
      _db  = client.db(code.db.DBNAME);
      return callback( err );
    });
  },
  getDb:()=> _db,
  getAdmin:()=>_db.collection(code.db.ADMIN_COLLECTION),
  getInstitute:()=>_db.collection(code.db.INSTITUTE_COLLECTION),
};