const mongoose = require("mongoose");

// Replace this with your MONGOURI.



const InitiateAdminServer = async () => {
  try {
    return await mongoose.connect(getLocalDBLink('administrators'), {
      useNewUrlParser: true,useCreateIndex:true,useUnifiedTopology:false
    });
  } catch (e) {
    console.log(e);
    throw e;
  }
};
const InitiateInstituteServer = async ()=>{
  try{
    return await mongoose.connect(getLocalDBLink('Institution'),{
       useNewUrlParser: true, useUnifiedTopology: false,useCreateIndex:true 
    });
  //console.log("Connected to Institutes");
  }catch(e){
    console.log(e);
    throw e;
  }
}

var getLocalDBLink = (dbName) =>{
  return `mongodb://localhost:27017/${dbName}`;
}
let getCloudDBLink = (dbName) =>{
  //`mongodb+srv://ranjanistic:ggD2zo319tfQ6M8f@realmcluster.njdl8.mongodb.net/${dbName}?retryWrites=true&w=majority`
  return `mongodb+srv://tempdbuser:sz58UgReMdMoDdBd@cluster0.zspfk.mongodb.net/${dbName}?retryWrites=true&w=majority`
}

class Database{
  getInstitution(){
    return InitiateInstituteServer()
  }
  getAdmin(){
    return InitiateAdminServer();
  }
}
module.exports = new Database();