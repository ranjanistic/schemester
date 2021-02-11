// For alert & notification management
const cpass = require("./../../config/config.js").db.cpass,
  Alerts = require("./../../config/db").getAlerts(cpass),
  {client} = require("../../public/script/codes");

class Alert{
    constructor(){
        this.type = {
            global:"global",
            admins:client.admin,
            teachers:client.teacher,
            students:client.student,
        }
    }

    async getAlerts(type = this.type.global){
        const alerts = await Alerts.find({scope:type,active:true}).toArray();
        if(type!==this.type.global){
            let global = await this.globalAlerts();
            return global.concat(alerts);
        }
        return alerts;
    }
    async globalAlerts(){
        return await this.getAlerts(this.type.global);
    }
    async adminAlerts(){
        return await this.getAlerts(this.type.admins);
    }
    async teacherAlerts(){
        return this.getAlerts(this.type.teachers);
    }
    async studentAlerts(){
        return await this.getAlerts(this.type.students);
    }
}

module.exports = new Alert();