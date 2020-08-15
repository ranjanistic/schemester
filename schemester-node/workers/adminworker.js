const Admin = require("../collections/Admins"),
  Institute = require("../collections/Institutions"),
  view = require("../hardcodes/views"),
  code = require("../public/script/codes");

class AdminWorker {
  constructor() {
    this.schedule = new Schedule();
    this.users = new Users();
  }
  toSession = (u, query = { target: view.admin.target.dashboard }) => {
    let path = `/admin/session?u=${u}`;
    for (var key in query) {
      if (query.hasOwnProperty(key)) {
        path = `${path}&${key}=${query[key]}`;
      }
    }
    return path;
  };
  toLogin = (query = { target: view.admin.target.dashboard }) => {
    let i = 0;
    let path = "/admin/auth/login";
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

/**
 * For work under 'users' subdocument.
 */
class Users {
  constructor() {
    this.teachers;
    this.classes;
  }
}

/**
 * For work under 'schedule' subdocument.
 */
class Schedule {
  constructor() {
    this.teacher = new TeacherAction();
    this.classes = new ClassAction();
  }
  handleScheduleTeachersAction = async (inst, body) => {
    switch (body.action) {
      case "upload": return await this.teacher.scheduleUpload(inst, body);
      case "receive":return await this.teacher.scheduleReceive(inst, body);
      case "update": return await this.teacher.scheduleUpdate(inst, body);
      default: return code.event(code.server.DATABASE_ERROR);
    }
  };
  handleScheduleClassesAction = async (inst, body) => {
    switch (body.action) {
      case "receive": return await this.classes.scheduleReceive(inst, body);
      case "update": return await this.classes.scheduleUpdate(inst, body);
      default: return code.event(code.server.DATABASE_ERROR);
    }
  };
}

class TeacherAction {
  constructor() {}
  async scheduleUpload(inst, body) {
    let overwriting = false; //if existing teacher schedule being overwritten after completion.
    let incomplete = false; //if existing teacher schedule being rewritten without completion.
    let found = inst.schedule.teachers.some((teacher, index) => {
      if (teacher.teacherID == body.teacherID) {
        overwriting =
          teacher.days.length == inst.default.timings.daysInWeek.length;
        if (!overwriting) {
          incomplete = teacher.days.some((day, index) => {
            if (body.data.dayIndex <= day.dayIndex) {
              return true;
            }
          });
        }
        return true;
      }
    });
    if (overwriting) {
      //completed schedule, must be edited from schedule view.
      return code.event(code.schedule.SCHEDULE_EXISTS);
    }
    if (incomplete) {
      //remove teacher schedule
      Institute.findOneAndUpdate(
        { uiid: inst.uiid },
        {
          $pull: {
            "schedule.teachers": { teacherID: body.teacherID },
          },
        }
      );
      found = false; //add as a new teacher schedule
    }
    let clashClass, clashPeriod, clashTeacher;
    let clashed = inst.schedule.teachers.some((teacher, _) => {
      let clashed = teacher.days.some((day, _) => {
        if (day.dayIndex == body.data.dayIndex) {
          let clashed = day.period.some((period, pindex) => {
            if (period.classname == body.data.period[pindex].classname) {
              clashClass = period.classname;
              clashPeriod = pindex;
              return true;
            }
          });
          if (clashed) {
            return true;
          }
        }
      });
      if (clashed) {
        clashTeacher = teacher.teacherID;
        return true;
      }
    });
    if (clashed) {
      //if some period clashed with an existing teacher.
      return {
          event: code.schedule.SCHEDULE_CLASHED,
          clash: {
            classname: clashClass,
            period: clashPeriod,
            teacherID: clashTeacher,
          }
      };
    }
    if (found) {
      //existing teacher schedule, incomplete (new day index)
      const doc = await Institute.findOneAndUpdate(
        {
          uiid: inst.uiid,
          "schedule.teachers": {
            $elemMatch: { teacherID: body.teacherID },
          },
        },
        {
          $push: { "schedule.teachers.$[outer].days": body.data }, //new day push
        },
        {
          arrayFilters: [{ "outer.teacherID": body.teacherID }],
        }
      );
      clog("schedule appended?");
      if (doc)
        return code.event(code.schedule.SCHEDULE_CREATED);//new day created.
    } else {
      //no existing schedule teacherID
      const doc = await Institute.findOneAndUpdate(
        { uiid: inst.uiid },
        {
          $push: {
            "schedule.teachers": {
              teacherID: body.teacherID,
              days: [body.data],
            },
          }, //new teacher schedule push
        }
      );
      clog("schedule created?");
      if (doc)
        return code.event(code.schedule.SCHEDULE_CREATED); //new teacher new day created.
    }
  }
  /**
   * To receive data under schedule.teachers
   * @param {Document} inst
   * @param {JSON} body
   */
  async scheduleReceive(inst, body) {
    let filter, options;
    console.log(body);
    switch (body.specific) {
      case "single": {
        filter = {
          uiid: inst.uiid,
          "schedule.teachers": {
            $elemMatch: { teacherID: body.teacherID },
          },
        };
        options = { projection: { "_id": 0, "schedule.teachers.$": 1 } };
      }break;
      case "classes": {
        let newClasses = Array();
        inst.schedule.teachers.forEach((teacher, tindex) => {
          teacher.days.forEach((day, _) => {
            day.period.forEach((period, _) => {
              if (!newClasses.includes(period.classname)) {
                newClasses.push(period.classname);
              }
            });
          });
        });
        clog(newClasses);
        return {
            event: code.OK,
            classes: newClasses
        };
      }break;
      default: {
        filter = { uiid: inst.uiid };
        options = { projection: { _id: 0, "schedule.teachers": 1 } };
      }
    }
    const teacherInst = await Institute.findOne(filter, options);
    if (!teacherInst) {
      console.log("no");
      return code.event(code.schedule.SCHEDULE_NOT_EXIST);
    }
    switch (body.specific) {
      case "single": {
        console.log(teacherInst.schedule.teachers[0]);
        return {
          event: code.OK,
          schedule: teacherInst.schedule.teachers[0]
        };
      }break;
      case "classes": {
      }break;
      default:
        return {
            event: code.OK,
            teachers: teacherInst.schedule.teachers
        };
    }
  }
  async scheduleUpdate(inst, body) {
    return;
  }
}

class ClassAction {
  constructor() {}
  async scheduleReceive(inst, body) {
    let newClasses = Array();
    inst.schedule.teachers.forEach((teacher, tindex) => {
      teacher.days.forEach((day, _) => {
        day.period.forEach((period, _) => {
          if (
            // !existingclasses.includes(period.classname) &&
            !newClasses.includes(period.classname)
          ) {
            newClasses.push(period.classname);
          }
        });
      });
    });
    clog(newClasses);
    return {
        event: code.OK,
        classes: newClasses
    };
  }
  async scheduleUpdate(inst, body) {
    let existingclasses = Array();
    //getting existing classes
    inst.schedule.classes.forEach((Class, _) => {
      existingclasses.push(Class.classname);
    });
    clog(existingclasses);
    let newClasses = Array();
    inst.schedule.teachers.forEach((teacher, tindex) => {
      teacher.days.forEach((day, _) => {
        day.period.forEach((period, _) => {
          if (
            !existingclasses.includes(period.classname) &&
            !newClasses.includes(period.classname)
          ) {
            newClasses.push(period.classname);
          }
        });
      });
    });
    clog(newClasses);
    if (!body.confirmed) {
      return {
          event: code.OK,
          classes: newClasses
      };
    } else {
      try {
        let done = false;
        inst.schedule.teachers.forEach((teacher, tindex) => {
          teacher.days.forEach((day, dindex) => {
            day.period.forEach((__, _) => {
              body.data.forEach(async (c, _) => {
                const setter = `schedule.teachers.${tindex}.days.${dindex}.period.$[outer].classname`;
                const filter = {
                  uiid: inst.uiid,
                };
                const newdocument = {
                  $set: { [setter]: c.renamed },
                };
                const options = {
                  arrayFilters: [{ "outer.classname": c.classname }],
                };
                const doc = await Institute.findOneAndUpdate(
                  filter,
                  newdocument,
                  options
                );
                done = doc ? true : false;
              });
            });
          });
        });
        clog(done);
        return code.event(done?code.OK:code.NO);
      } catch (e) {
        return code.eventmsg(code.NO, e);
      }
    }
  }
}
let clog = (msg)=>console.log(msg);
module.exports = new AdminWorker();
