const {MongoClient} = require('mongodb'),
  {db,ssh} = require('./config.json'),
  jwt = require("jsonwebtoken");

var _db;
module.exports = {
  connectToDB: ( callback )=>{
    MongoClient.connect(
      true
      ?`mongodb+srv://${db.username}:${jwt.decode(db.pass,ssh)}@realmcluster.njdl8.mongodb.net/${db.name}?retryWrites=true&w=majority`
      :`mongodb://localhost:27017/${db.name}`,
      { useNewUrlParser: true , useUnifiedTopology: true}, ( err, client )=> {
      _db = client.db(db.name);
      return callback( err );
    });
  },
  getDb:()=> _db,
  getAdmin:()=>_db.collection(db.admin_collection),
  getInstitute:()=>_db.collection(db.institute_collection),
};
