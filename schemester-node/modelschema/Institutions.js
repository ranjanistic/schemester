const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const database = require("../config/db");
// setInterval(() => {
//   database.collection('1institutions').countDocuments().then(value=>{
//     console.log(value);
//   })
// }, 1000);
class Institution {
  constructor() {
    this.Institute = database.collection('1institutions');
    var defaults = new Defaults();
    var users = new Users();
    var schedule = new Schedule();
    var teachers = new Teachers();
    var invite = new Invite();

    var scheduleSchema = new Schema({
      teachers:[teachers.teacherscheduleschema],
      students:[schedule.scheduleschema],
    },{_id:false});
    this.instSchema = new Schema({
      uiid: { type: String, unique : true },
      default: defaults.defaultSchema,
      schedule: scheduleSchema,
      users: users.userschema,
      invite:invite.invitationschema,
      active:{type:Boolean,default:false}
    });
  }
  getModel() {
    return mongoose.model(this.institutions, this.instSchema);
  }
}

class Defaults {
  constructor() {
    var adminschema = new Schema({
      email: { type: String },
      username: { type: String },
      phone: { type: String },
    },{_id:false});

    var instituteschema = new Schema({
      instituteName: { type: String,  },
      phone: { type: String },
      email:{type:String},
      subscriptionTill: { type: Date },
    },{_id:false});

    var timingschema = new Schema({
      startTime: { type: String},
      endTime: { type: String},
      breakStartTime: { type: String},
      periodMinutes: { type: Number,  min: 1, max: 1440 }, //1440 mins = 24 hours (max 1440 minute each period limit, thus 1 minute min period limit/day)
      breakMinutes: { type: Number,  min: 1 },
      periodsInDay: { type: Number,  min: 1, max: 1440 }, //1440 mins = 24 hours (min 1 period each day, thus 1440 max periods limit/day)
      daysInWeek: { type: Array },  
    },{_id:false});

    this.defaultSchema = new Schema({
      admin: adminschema,
      institute: instituteschema,
      timings: timingschema,
    },{_id:false});
  }
}

class Users {
  constructor() {
    var Teacherschema = new Schema({
      teacherID: { type: String },
      username: {type: String},
      password: { type: String},
      verified:{type:Boolean,default:false},
      vlinkexp:{type:Number,default:0},
      createdAt: { type: Date, default: Date.now() },
    });
    var studentschema = new Schema({
      studentID: { type: String },
      username: {type:String},
      password: { type: String },
      verified:{type:Boolean,default:false},
      vlinkexp:{type:Number,default:0},
      createdAt: { type: Date, default: Date.now() },
    });

    this.userschema = new Schema({
      teachers: [Teacherschema],
      students: [studentschema],
    },{_id:false});
  }
}

class Schedule {
  constructor() {
    var sectionschema = new Schema({
      sectionname: { type: String, default:''},
      teacherID: { type: String },
      subject: { type: String },
      hold: { type: Boolean, default: true },
    },{_id:false}); //each section

    var classschema = new Schema({
      classname: { type: String},
      section: [sectionschema],
    },{_id:false}); //each class

    var periodschema = new Schema({
      class: [classschema],
    },{_id:false}); //each period

    var dayschema = new Schema({
      dayIndex: { type: String },
      period: [periodschema],
    },{_id:false}); //each day

    this.scheduleschema = new Schema({
      day: dayschema,
    },{_id:false});
  }
}

class Teachers {
  constructor() {
    var teacherperiodschema = new Schema({
      classname: { type: String },
      subject: { type: String },
      hold: { type: Boolean, default: true },
    },{_id:false}); //each period

    var teacherdayschema = new Schema({
      dayIndex: { type: Number },
      period: [teacherperiodschema],
    },{_id:false}); //each day

    this.teacherscheduleschema = new Schema({
      teacherID: { type: String },
      day: [teacherdayschema],
    },{_id:false});
  }
}

class Invite{
  constructor(){
    var linkschema = new Schema({
      active:{type:Boolean, default:false},
      createdAt:{type:Number,default:0},
      expiresAt:{type:Number,default:0}
    },{_id:false})
    var invteacher = linkschema;
    var invstudent = linkschema;
    this.invitationschema = new Schema({
      teacher:invteacher,
      student:invstudent,
    },{_id:false});
  }
}

module.exports = new Institution().Institute;
