const MongoClient = require('mongodb').MongoClient;
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
} catch (e) {
  console.log(e);
}


