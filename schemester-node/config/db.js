const mongoose = require("mongoose"),
  dbName = "schemesterDB",
  initiateServer = async () => {
    try {
      return await mongoose.connect(getLocalDBLink(), {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
      });
    } catch (e) {
      console.log(e);
    }
  },
  getLocalDBLink = () => {
    return `mongodb://localhost:27017/${dbName}`;
  },
  getCloudDBLink = () => {
    //`mongodb+srv://ranjanistic:ggD2zo319tfQ6M8f@realmcluster.njdl8.mongodb.net/${dbName}?retryWrites=true&w=majority`
    return `mongodb+srv://tempdbuser:sz58UgReMdMoDdBd@cluster0.zspfk.mongodb.net/${dbName}?retryWrites=true&w=majority`;
  };

class Database {
  async getServer() {
    return await initiateServer();
  }
}
module.exports = new Database();
