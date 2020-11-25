const {MongoClient} = require('mongodb'),
  {db,ssh} = require('./config.json'),
  jwt = require("jsonwebtoken");

var _db;
module.exports = {
  connectToDB: (key, callback )=>{
    try{
      if(!jwt.verify(key,ssh)) throw e;
    } catch(e){
      return callback("ACCESS DENIED:DATABASE MIGRATED")
    }
    MongoClient.connect(
      true
      ?`mongodb+srv://${db.username}:${jwt.decode(db.pass,ssh)}@realmcluster.njdl8.mongodb.net/${db.name}?retryWrites=true&w=majority`
      :`mongodb://localhost:27017/${db.name}`,
      { useNewUrlParser: true , useUnifiedTopology: true}, ( err, client )=> {
      _db = client.db(db.name);
      return callback( err,db.name );
    });
  },
  getAdmin:(key)=>{
    if(!jwt.verify(key,ssh)) return null;
    return _db.collection(db.admin_collection)
  },
  getInstitute:(key)=>{
    if(!jwt.verify(key,ssh)) return null;
    return _db.collection(db.institute_collection)
  }
};
