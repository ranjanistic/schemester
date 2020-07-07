var mongoose = require('mongoose');
mongoose.createConnection('mongodb://localhost/institutions',{ useNewUrlParser: true , useUnifiedTopology: false });
module.exports = exports = mongoose.connection;