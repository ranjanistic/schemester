const mongoose = require("mongoose");
const Schema = mongoose.Schema;
class Institution {
  constructor() {
    this.institutions = "1institutions";
    this.instSchema = new Schema({
      uiid: { type: String, unique: true, required: true },
      default: new Schema({
        admin: new Schema({
          username: { type: String, required: true },
          email: { type: String, unique: true, required: true },
          phone: { type: String, required: true },
        }),
        institute: new Schema({
          instituteName: { type: String, required: true },
          uiid: { type: String, unique: true, required: true },
          subscriptionTill: { type: Date, default: Date.now() },
          active: { type: Boolean, default: false },
        }),
        timings: new Schema({
          startTime: { type: String, required: true },
          endTime: { type: String, required: true },
          breakStartTime: { type: String, required: true },
          startDay: { type: String, required: true },
          periodMinutes: { type: Number, required: true, min: 1, max: 1440 }, //1440 mins = 24 hours (max 1440 minute each period limit, thus 1 minute min period limit/day)
          breakMinutes: { type: Number, required: true, min: 1 },
          periodsInDay: { type: Number, required: true, min: 1, max: 1440 }, //1440 mins = 24 hours (min 1 period each day, thus 1440 max periods limit/day)
          daysInWeek: { type: Number, required: true, min: 1, max: 7 },
        }),
      }),
      users: new Schema({
        teachers: [
          new Schema({
            username: String,
            email: { type: String, required: true, unique: true },
            password: { type: String, required: true },
            createdAt: { type: Date, default: Date.now()}
          }),
        ],
        students: [
          new Schema({
            username: String,
            studentID: { type: String, required: true, unique: true },
            dob: { type: Date, required: true},
            createdAt: { type: Date, default: Date.now()}
          }),
        ],
      }),
      schedule:[
        new Schema({
          day:{type:String,required:true},
          period:[
            new Schema({
              class:{type:String},
              teacherID:{type:String},
              hold:{type:Boolean,default:true},
              subject:{type:String},
              section:[
                new Schema({
                  teacherID:{type:String},
                  hold:{type:Boolean,default:true},
                  subject:{type:String}
                })  //each section
              ]
            })  //each period
          ]
        })  //each day
      ],
    });
  }
  getSchema() {
    return this.instSchema;
  }
  getModel() {
    return mongoose.model(this.institutions, this.getSchema());
  }
}
module.exports = new Institution().getModel();
