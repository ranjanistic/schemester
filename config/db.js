const {clog} = require('../public/script/codes'),
  {MongoClient} = require('mongodb'),
  {db,ssh} = require('./config.json'),
  jwt = require("jsonwebtoken"),
  getLink=(cloud=false)=>{
    if(!cloud) return `mongodb://localhost:27017/${db.name}`;
    return `mongodb+srv://${db.username}:${jwt.decode(db.pass,ssh)}@realmcluster.njdl8.mongodb.net/${db.name}?retryWrites=true&w=majority`;
  };

var _db;
module.exports = {
  connectToDB: ( callback )=>{
    MongoClient.connect(
      getLink(true),
      { useNewUrlParser: true , useUnifiedTopology: true}, function( err, client ) {
      _db  = client.db(db.name);
      return callback( err );
    });
  },
  getDb:()=> _db,
  getAdmin:()=>_db.collection(db.admin_collection),
  getInstitute:()=>_db.collection(db.institute_collection),
};
