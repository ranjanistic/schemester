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
        this.passwordreset = 'resetpassword.ejs';

        this.admin = new AdminView();
        this.teacher = new TeacherView();
        this.student = new StudentView();
    }
}

class AdminView{
    constructor(){
        this.login = 'admin/admin_login.ejs';
        this.dash = 'admin/admin_dash.ejs';
        this.settings = 'admin/management.ejs';
        this.registration = 'admin/edit_detail.ejs';
        this.addTeacher = 'admin/teacher_filler.ejs';
        this.scheduleview = 'admin/schedule_view.ejs';
        class Target{
            constructor(){
              this.dashboard = 'dashboard';
              this.addteacher = 'addteacher';
              this.viewschedule = 'viewschedule';
              this.manage = 'manage';
              this.register = 'registration';
            }
        }
        this.target = new Target();
        class Section{
            constructor(){
                this.account = 'setting/account';
                this.institute = 'setting/institute';
                this.schedule = 'setting/schedule';
                this.users = 'setting/users';
                this.security = 'settting/security';
                this.about = 'setting/about';
            }
        }
        this.section = new Section();
    }
    getViewByTarget(target = this.target.dashboard){
        switch(target){
            case this.target.manage:return this.settings;
            case this.target.addteacher:return this.addTeacher;
            case this.target.dashboard:return this.dash;
            case this.target.register:return this.registration;
            case this.target.viewschedule:return this.scheduleview;
            default:return this.getViewByTarget();
        }
    }
}

class TeacherView{
    constructor(){
        this.login = 'teacher/teacher_login.ejs';
        this.dash = 'teacher/teacher_dash.ejs';
        this.settings = 'teacher/teacher_settings.ejs';
        this.addschedule = 'admin/teacher_filler.ejs';
        class FragmentView{
            constructor(){
                this.fullschedule = 'teacher/fragments/fullweek.ejs';
                this.today = 'teacher/fragments/today.ejs';
                this.about = 'teacher/fragments/about.ejs';
                this.classroom = 'teacher/fragments/classroom.ejs';
            }
        }
        this.fragment = new FragmentView();
        class Target {
            constructor() {
              this.dash = "dashboard";
              this.addschedule = 'addschedule';
              this.settings = 'settings';
              class Fragment{
                constructor(){
                    this.today = "today";
                    this.fullweek = "fullschedule";
                    this.classroom =  "classroom";
                    this.about = "about";
                }
              }
              this.fragment = new Fragment()
            }
        }
        this.target = new Target();
    }
    getViewByTarget(target = this.target.dash){
        switch(target){
            case this.target.dash:return this.dash;
            case this.target.settings:return this.settings;
            case this.target.fullweek:return this.fullschedule;
            case this.target.addschedule:return this.addschedule;
            case this.target.fragment.today:return this.fragment.today;
            case this.target.fragment.fullweek:return this.fragment.fullschedule;
            case this.target.fragment.classroom:return this.fragment.classroom;
            case this.target.fragment.about:return this.fragment.about;
            default:return this.getViewByTarget();
        }
    }
}

class StudentView{
    constructor(){
        this.login = 'student/student_login.ejs';
        this.dash = 'student/student_dash.ejs';
        class FragmentView{
            constructor(){
                this.fullschedule = 'student/fragments/fullweek.ejs';
                this.today = 'student/fragments/today.ejs';
                this.settings = 'student/fragments/settings.ejs';
            }
        }
        this.fragment = new FragmentView();
        class Target {
            constructor() {
              this.dash = "dashboard";
              class Fragment{
                constructor(){
                    this.today = "today";
                    this.fullweek = "fullschedule";
                    this.settings = "settings";
                }
              }
              this.fragment = new Fragment()
            }
        }
        this.target = new Target();
    }
    getViewByTarget(target = this.target.dash){
        switch(target){
            case this.target.dash:return this.dash;
            case this.target.fragment.today:return this.fragment.today;
            case this.target.fragment.fullweek:return this.fragment.fullschedule;
            case this.target.fragment.settings:return this.fragment.settings;
            default:return this.getViewByTarget();
        }
    }
}

module.exports = new View();