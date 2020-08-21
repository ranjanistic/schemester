const Institute = require("../collections/Institutions"),
  view = require("../hardcodes/views"),
  code = require("../public/script/codes"),
  { ObjectId } = require("mongodb");
class TeacherWorker {
  constructor() {
    this.self = new Self();
    this.schedule = new Schedule();
  }
  toSession = (u, query = { target: view.teacher.target.dash }) => {
    let path = `/teacher/session?u=${u}`;
    for (var key in query) {
      if (query.hasOwnProperty(key)) {
        path = `${path}&${key}=${query[key]}`;
      }
    }
    return path;
  };
  toLogin = (query = { target: view.teacher.target.dash }) => {
    let i = 0;
    let path = "/teacher/auth/login";
    for (var key in query) {
      if (query.hasOwnProperty(key)) {
        path =
          i > 0
            ? `${path}&${key}=${query[key]}`
            : `${path}?${key}=${query[key]}`;
        i++;
      }
    }
    return path;
  };
}

class Self {
  constructor() {}
}

class Schedule{
  constructor(){}
  getSchedule = async (user, dayIndex = null) => {
    const teacheruser = await Institute.findOne(
      {
        uiid: user.uiid,
        "users.teachers": { $elemMatch: { "_id": ObjectId(user.id) } },
      },
      { projection: { "_id": 0, "users.teachers.$": 1 } }
    );
    if (!teacheruser)
      return session.finish(res).then((response) => {
        if (response) res.redirect(this.toLogin());
      });
    const teacher = teacheruser.users.teachers[0];
    const teacherschedule = await Institute.findOne(
      {
        uiid: user.uiid,
        "schedule.teachers": { $elemMatch: { teacherID: teacher.teacherID } },
      },
      {
        projection: {
          "_id":0,
          "default": 1,
          "schedule.teachers.$": 1,
        },
      }
    );
    clog(teacherschedule);
    if (!teacherschedule) return false;
    const schedule = teacherschedule.schedule.teachers[0].days;
    const timings = teacherschedule.default.timings;
    if (dayIndex==null) return { schedule: schedule, timings:timings};
    let today = teacherschedule.schedule.teachers[0].days[0];
    const found = schedule.some((day, index) => {
      if (day.dayIndex == dayIndex) {
        today = day;
        return true;
      }
    });
    if (!found) return { schedule: false, timings:timings};
    return { schedule: today, timings:timings};
  };
  

}

const clog = (m) =>console.log(m);
module.exports = new TeacherWorker();