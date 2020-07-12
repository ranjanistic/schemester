const mongoose = require("mongoose");
const Schema = mongoose.Schema;
class Institution {
  constructor() {
    this.instituteSchema = new Schema({
      defaults: {
        administrator:admin,
        institute:institute,
        timings:timings
      },
      users:{
        teacher:teachers,
        student:students
      },
      schedule:schedule,

    });

    var admin = new Schema({
      username: { type: String, required: true },
      email: { type: String, unique: true, required: true },
      phone:{ type: String, required: true }
    });
    var institute = new Schema({
      instituteName: { type: String, required:true},
      uiid: { type: String, unique: true, required:true},
      subscriptionTill: { type: Date, default:Date.now()},
      active: {type:Boolean,default:false},
    });
    var timings = new Schema({
      startTime: {type:String,required:true},
      endTime: {type:String,required:true},
      breakStartTime: {type:String,required:true},
      startDay: {type:String,required:true},
      periodMinutes: {type:Number,required:true,min:1,max:1440},//1440 mins = 24 hours (max 1440 minute each period limit, thus 1 minute min period limit/day)
      breakMinutes: {type:Number,required:true,min:1},
      periodsInDay: {type:Number,required:true,min:1,max:1440},//1440 mins = 24 hours (min 1 period each day, thus 1440 max periods limit/day)
      daysInWeek: {type:Number,required:true,min:1,max:7},
    });

    var teachers = new Schema({
      teachername: { type: String, required: true },
      temail: { type: String, unique: true, required: true },
      tpassword:{ type: String, required: true },
      createdAt:{type:Date, default:Date.now()}
    });
    var students = new Schema({
      studentid:{type:String,required:true,unique:true},
      dob:{type:Date,required:true},
      createdAt:{type:Date,default:Date.now()}
    });

    var schedule = new Schema({
      day:{type:Array}=[
        {
          class:{type:Map}={
            section:{type:Map}={
              teacher:{type:String},
              subject:{type:String}
            }
          }
        }
      ],
    });

  }
  getSchema() {
    return this.instituteSchema;
  }
  getModel(instName) {
    return mongoose.model(instName, this.instituteSchema);
  }
}
module.exports = new Institution();
