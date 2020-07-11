var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/administrators',{ useNewUrlParser: true , useUnifiedTopology: false,useCreateIndex:true });

module.exports = exports = mongoose.connection;
const adb = mongoose.connection;
