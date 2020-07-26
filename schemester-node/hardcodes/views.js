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

        this.admin = new AdminViews();
        this.teacher = new TeacherViews();
    }
}

class AdminViews{
    constructor(){
        this.login = 'admin/admin_login.ejs';
        this.dash = 'admin/admin_dash.ejs';
        this.settings = 'admin/management.ejs';
        this.setup = 'admin/edit_detail.ejs';
        this.addTeacher = 'admin/teacher_filler.ejs';
    }
}

class TeacherViews{
    constructor(){
        this.login = 'teacher/teacher_login.ejs';
        this.today = 'teacher/teacher_dash.ejs';
        this.settings = 'teacher/teacher_settings.ejs';
        this.addschedule = 'admin/schedule_filler.ejs';
    }
}

module.exports = new View();