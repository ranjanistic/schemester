const { Db } = require('mongodb');

const MongoClient = require('mongodb').MongoClient;
//const mongoose = require("mongoose"),
const dbName = "schemesterDB",
getLocalDBLink = () => {
  return `mongodb://localhost:27017/${dbName}`;
},
getCloudDBLink = () => {
  //`mongodb+srv://ranjanistic:ggD2zo319tfQ6M8f@realmcluster.njdl8.mongodb.net/${dbName}?retryWrites=true&w=majority`
  return `mongodb+srv://tempdbuser:sz58UgReMdMoDdBd@cluster0.zspfk.mongodb.net/${dbName}?retryWrites=true&w=majority`;
};

try {
  const client = new MongoClient(getLocalDBLink(), { useNewUrlParser: true , useUnifiedTopology: true });
  client.connect();
  const database = client.db(dbName);
  if(database)console.log("connected to " + database.databaseName);


  module.exports = database;
  // return await mongoose.connect(getLocalDBLink(), {
  //   useNewUrlParser: true,
  //   useCreateIndex: true,
  //   useUnifiedTopology: true,
  // });
} catch (e) {
  console.log(e);
}

// run().then(db=>{
//   console.log(`Connected to: ${db.databaseName}`);
//   collection = new Collections(db);
// }).catch(console.dir);


