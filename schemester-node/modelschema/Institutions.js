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
      uiid: { type: String, unique: true },
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
    });

    var instituteschema = new Schema({
      instituteName: { type: String,  },
      phone: { type: String },
      email:{type:String},
      subscriptionTill: { type: Date },
    });

    var timingschema = new Schema({
      startTime: { type: String,  },
      endTime: { type: String,  },
      breakStartTime: { type: String,  },
      startDay: { type: String,  },
      periodMinutes: { type: Number,  min: 1, max: 1440 }, //1440 mins = 24 hours (max 1440 minute each period limit, thus 1 minute min period limit/day)
      breakMinutes: { type: Number,  min: 1 },
      periodsInDay: { type: Number,  min: 1, max: 1440 }, //1440 mins = 24 hours (min 1 period each day, thus 1440 max periods limit/day)
      daysInWeek: { type: Number,  min: 1, max: 7 },
    });

    this.defaultSchema = new Schema({
      admin: adminschema,
      institute: instituteschema,
      timings: timingschema,
    });
  }
}

class Users {
  constructor() {
    var teacherschema = new Schema({
      teacher: new Schema({
        teacherID: { type: String, unique: true },
        username: String,
        password: { type: String},
        createdAt: { type: Date, default: Date.now() },
      }),
    });
    var studentschema = new Schema({
      student: new Schema({
        studentID: { type: String, unique: true },
        username: String,
        password: { type: String },
        createdAt: { type: Date, default: Date.now() },
      }),
    });

    this.userschema = new Schema({
      teachers: teacherschema,
      students: studentschema,
    });
  }
}

class Schedule {
  constructor() {
    var sectionschema = new Schema({
      sectionname: { type: String, unique: true },
      teacherID: { type: String },
      hold: { type: Boolean, default: true },
      subject: { type: String },
    }); //each section

    var classschema = new Schema({
      classname: { type: String, unique: true },
      section: sectionschema,
    }); //each class

    var periodschema = new Schema({
      number: { type: Number, unique: true },
      class: classschema,
    }); //each period

    var dayschema = new Schema({
      dayname: { type: String, unique: true },
      period: periodschema,
    }); //each day

    this.scheduleschema = new Schema({
      day: dayschema,
    });
  }
}

class Teachers {
  constructor() {
    var teacherperiodschema = new Schema({
      number: { type: Number, unique: true },
      classname: { type: String },
      hold: { type: Boolean, default: true },
      subject: { type: String },
    }); //each period

    var teacherdayschema = new Schema({
      dayname: { type: String, unique: true },
      period: teacherperiodschema,
    }); //each day

    var scheduleteacherschema = new Schema({
      teacherID: { type: String,  unique: true },
      day: teacherdayschema,
    }); //each teacher

    this.teacherscheduleschema = new Schema({
      teacher: scheduleteacherschema,
    });
  }
}

module.exports = new Institution().getModel();
