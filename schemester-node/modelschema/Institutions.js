const mongoose = require("mongoose");
const Schema = mongoose.Schema;

class Institution {
  constructor() {
    this.institutions = "1institutions";

    var defaults = new Defaults();
    var users = new Users();
    var schedule = new Schedule();
    var teachers = new Teachers();

    this.instSchema = new Schema({
      uiid: { type: String, unique : true },
      default: defaults.defaultSchema,
      users: users.userschema,
      schedule: schedule.scheduleschema,
      teacherSchedule: teachers.teacherscheduleschema,
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
      startTime: { type: String,  },
      endTime: { type: String,  },
      breakStartTime: { type: String,  },
      startDay: { type: String,  },
      periodMinutes: { type: Number,  min: 1, max: 1440 }, //1440 mins = 24 hours (max 1440 minute each period limit, thus 1 minute min period limit/day)
      breakMinutes: { type: Number,  min: 1 },
      periodsInDay: { type: Number,  min: 1, max: 1440 }, //1440 mins = 24 hours (min 1 period each day, thus 1440 max periods limit/day)
      daysInWeek: { type: Number,  min: 1, max: 7 },  
    },{_id:false},);

    this.defaultSchema = new Schema({
      admin: adminschema,
      institute: instituteschema,
      timings: timingschema,
    },{_id:false});
  }
}

class Users {
  constructor() {
    var teacherschema = new Schema({
      teacher: new Schema({
        teacherID: { type: String },
        username: String,
        password: { type: String},
        createdAt: { type: Date, default: Date.now() },
      }),
    },{_id:false});
    var studentschema = new Schema({
      student: new Schema({
        studentID: { type: String },
        username: String,
        password: { type: String },
        createdAt: { type: Date, default: Date.now() },
      }),
    },{_id:false});

    this.userschema = new Schema({
      teachers: teacherschema,
      students: studentschema,
    },{_id:false});
  }
}

class Schedule {
  constructor() {
    var sectionschema = new Schema({
      sectionname: { type: String, unique: false, default:''},
      teacherID: { type: String },
      hold: { type: Boolean, default: true },
      subject: { type: String },
    }); //each section

    var classschema = new Schema({
      classname: { type: String, unique: false },
      section: sectionschema,
    }); //each class

    var periodschema = new Schema({
      number: { type: Number, unique: false },
      class: classschema,
    },{_id:false}); //each period

    var dayschema = new Schema({
      dayname: { type: String, unique: false },
      period: periodschema,
    },{_id:false}); //each day

    this.scheduleschema = new Schema({
      day: dayschema,
    },{_id:false});
  }
}

class Teachers {
  constructor() {
    var teacherperiodschema = new Schema({
      number: { type: Number, unique: false },
      classname: { type: String },
      hold: { type: Boolean, default: true },
      subject: { type: String },
    }); //each period

    var teacherdayschema = new Schema({
      dayname: { type: String, unique: false },
      period: teacherperiodschema,
    }); //each day

    var scheduleteacherschema = new Schema({
      teacherID: { type: String,  unique: false },
      day: teacherdayschema,
    }); //each teacher

    this.teacherscheduleschema = new Schema({
      teacher: scheduleteacherschema,
    });
  }
}

module.exports = new Institution().getModel();
