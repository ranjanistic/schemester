var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/administrators',{ useNewUrlParser: true , useUnifiedTopology: false });

module.exports = exports = mongoose.connection;
const adb = mongoose.connection;
