const MongoClient = require('mongodb').MongoClient;
const dbName = "schemesterDB",
getLocalDBLink = () => `mongodb://localhost:27017/${dbName}`,
getCloudDBLink = () => `mongodb+srv://ranjanistic:ggD2zo319tfQ6M8f@realmcluster.njdl8.mongodb.net/${dbName}?retryWrites=true&w=majority`;

try {
  const client = new MongoClient(getLocalDBLink(), { useNewUrlParser: true , useUnifiedTopology: true, keepAlive: 1});
  client.connect();
  const database = client.db(dbName);
  if(database) console.log("connected to " + database.databaseName);
  module.exports = database;
} catch (e) {
  console.log(e);
}


