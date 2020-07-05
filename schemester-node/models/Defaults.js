const mongoose = require('mongoose')
const Schema = mongoose.Schema
class Default {
  constructor() {
    var admin = {
      adminName: String,
      email: String,
      phone: String,
    };
    var institute = {
      instituteName: String,
      uiid: {type:String, unique:true},
      subscriptionTill: Date,
      active: Boolean,
    };
    var timings = {
      startTime: String,
      endTime: String,
      breakStartTime: String,
      startDay: String,
      periodMinutes: Number,
      breakMinutes: Number,
      periodsInDay: Number,
      daysInWeek: Number,
    };
    this.defaultSchema = new Schema({
      defaults: {
        admin,
        institute,
        timings,
      },
    }); 
  }
  getModelOf(InstCollection){
    return mongoose.model(InstCollection,this.defaultSchema);
  }
}
module.exports = new Default();
