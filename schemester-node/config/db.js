const mongoose = require("mongoose");

const dbName = "schemesterDB";

const InitiateServer = async () => {
  try {
    return await mongoose.connect(getLocalDBLink(), {
      useNewUrlParser: true, useCreateIndex:true, useUnifiedTopology:true
    });
  } catch (e) {
    console.log(e);
    throw e;
  }
};

var getLocalDBLink = () =>{
  return `mongodb://localhost:27017/${dbName}`;
}
let getCloudDBLink = () =>{
  //`mongodb+srv://ranjanistic:ggD2zo319tfQ6M8f@realmcluster.njdl8.mongodb.net/${dbName}?retryWrites=true&w=majority`
  return `mongodb+srv://tempdbuser:sz58UgReMdMoDdBd@cluster0.zspfk.mongodb.net/${dbName}?retryWrites=true&w=majority`
}

class Database{
  getServer(){
    return InitiateServer();
  }
}
module.exports = new Database();