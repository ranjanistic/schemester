class View{
    constructor(){

        this.homepage = 'home.ejs';
        this.loader = 'loader.ejs';
        this.plans = 'plans.ejs';
        this.notfound = '404.ejs';
        this.servererror = '500.ejs';
        this.forbidden = '403.ejs';
        this.offline = 'offline.ejs';

        this.userinvitaion = 'invitation.ejs';
        this.verification = 'verification.ejs';
        this.admin = new AdminViews();
        this.teacher = new TeacherViews();
    }
}

class AdminViews{
    constructor(){
        this.login = 'admin/admin_login.ejs';
        this.dash = 'admin/admin_dash.ejs';
        this.settings = 'admin/management.ejs';
        this.registration = 'admin/edit_detail.ejs';
        this.addTeacher = 'admin/teacher_filler.ejs';
        class Target{
            constructor(){
              this.dashboard = 'dashboard';
              this.settings = 'manage';
              this.addteacher = 'addteacher';
              this.manage = 'manage';
              this.register = 'registration';
            }
        }
        this.target = new Target();
        class SettingSections{
            constructor(){
                this.account = 'setting/account';
                this.institute = 'setting/institute';
                this.schedule = 'setting/schedule';
                this.users = 'setting/users';
                this.security = 'settting/security';
                this.about = 'setting/about';
            }
        }
        this.section = new SettingSections();
    }
    getViewByTarget(target = this.target.dashboard){
        console.log(target);
        switch(target){
            case this.target.settings:return this.settings;
            case this.target.addteacher:return this.addTeacher;
            case this.target.dashboard:return this.dash;
            case this.target.register:return this.registration;
            default:throw "viewnotfound";
        }
    }
}

class TeacherViews{
    constructor(){
        this.login = 'teacher/teacher_login.ejs';
        this.today = 'teacher/teacher_dash.ejs';
        this.settings = 'teacher/teacher_settings.ejs';
        this.addschedule = 'admin/teacher_filler.ejs';
        this.fullschedule = 'teacher/full_schedule.ejs'
        class Target {
            constructor() {
              this.today = "today";
              this.fullweek = "fullschedule";
              this.settings = "settings";
              this.addschedule = 'addschedule';
            }
          }
          this.target = new Target();
    }
    getViewByTarget(target = this.target.today){
        console.log(target);
        switch(target){
            case this.target.today:return this.today;
            case this.target.settings:return this.settings;
            case this.target.fullweek:return this.fullschedule;
            case this.target.addschedule:return this.addschedule;
            default:throw "viewnotfound";
        }
    }
}

module.exports = new View();