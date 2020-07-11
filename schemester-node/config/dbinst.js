var mongoose = require('mongoose');
mongoose.createConnection('mongodb://localhost:27017/institutions',{ useNewUrlParser: true , useUnifiedTopology: true,useCreateIndex:true });
module.exports = exports = mongoose.connection;