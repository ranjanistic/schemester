class Codes {
  constructor() {
    this.dbname = "schemesterDB";
    this.domain = "http://localhost:3000";
    // this.domain = "https://schemester.herokuapp.com";
    this.OK = "OK/true/200";
    this.NO = "NO/false/400";
    this.free = "Free";

    class Servercodes {
      constructor() {
        this.DATABASE_ERROR = "server/database-error:";
        this.UIID_TAKEN = "server/uiid-already-taken";
        this.UIID_AVAILABLE = "server/uiid-available";
      }
    }

    class Database{
      constructor(){
        this.DBNAME = "schemesterDB";
        this.ADMIN_COLLECTION = "0administrators";
        this.INSTITUTE_COLLECTION = "1institutions";
      }
    }
    class Clientcodes {
      constructor() {
        this.NETWORK_FAILURE = "client/network-error";
        this.NOT_SIGNED_IN = "client/not-signed-in";
      }
    }

    class Authcodes {
      constructor() {
        this.WRONG_PASSWORD = "auth/wrong-password";
        this.WEAK_PASSWORD = "auth/weak-password";
        this.USER_NOT_EXIST = "auth/no-user-found";
        this.USER_NOT_VERIFIED = "auth/user-not-verified";
        this.USER_VERIFIED = "auth/user-is-verified";
        this.USER_EXIST = "auth/user-found";
        this.AUTH_FAILED = "auth/authentication-failed";
        this.SESSION_VALID = "auth/user-logged-in";
        this.SESSION_INVALID = "auth/user-not-logged-in";
        this.EMAIL_INVALID = "auth/invalid-email";
        this.PASSWORD_INVALID = "auth/invalid-password";
        this.SAME_EMAIL = "auth/same-email-address";
        this.LOGGED_OUT = "auth/logged-out";
        this.ACCOUNT_CREATED = "auth/account-created";
        this.NAME_INVALID = "auth/invalid-name";
        this.ACCOUNT_CREATION_FAILED = "auth/account-not-created";
        this.AUTH_SUCCESS = "auth/sign-in-success";
        this.ACCOUNT_RESTRICTED = "auth/account-disabled";
        this.AUTH_REQ_FAILED = "auth/request-failed";
        this.REQ_LIMIT_EXCEEDED = "auth/too-many-requests";
        this.UIID_INVALID = "auth/invalid-uiid";
        this.WRONG_UIID = "auth/wrong-uiid";
        this.CLASS_EXISTS = "auth/classroom-found";
        this.CLASS_NOT_EXIST = "auth/classroom-not-found";
      }
    }

    class InstitutionCodes {
      constructor() {
        this.INVALID_ADMIN_PHONE = "inst/invalid-phone-number";
        this.INVALID_ADMIN_EMAIL = "inst/invalid-email-address";
        this.INVALID_ADMIN_NAME = "inst/invalid-name";

        this.INVALID_INST_NAME = "inst/invalid-institution-name";
        this.INVALID_INST_UIID = "inst/invalid-institution-uiid";
        this.INVALID_INST_PHONE = "inst/invalid-institution-phone";

        this.INVALID_TIME = "inst/invalid-time-value";
        this.INVALID_TIME_START = "inst/invalid-start-time";
        this.INVALID_TIME_END = "inst/invalid-end-time";
        this.INVALID_TIME_BREAKSTART = "inst/invalid-breakstart-time";

        this.INVALID_DURATION = "inst/invalid-duration";
        this.INVALID_DURATION_PERIOD = "inst/invalid-period-duration";
        this.INVALID_DURATION_BREAK = "inst/invalid-break-duration";
        this.INVALID_WORKING_DAYS = "inst/invalid-working-days";
        this.INVALID_PERIODS = "inst/invalid-periods-a-day";

        this.INVALID_DATE = "inst/invalid-date-value";
        this.INVALID_DAY = "inst/invalid-day-name";
        this.INVALID_PERIOD = "inst/invalid-period";
        this.INVALID_CLASS = "inst/invalid-class-name";
        this.INVALID_SECTION = "inst/invalid-section-name";

        this.INSTITUTION_NOT_EXISTS = "inst/institution-not-exists";
        this.INSTITUTION_EXISTS = "inst/institution-exists";
        this.INSTITUTION_CREATED = "inst/institution-created";
        this.INSTITUTION_CREATION_FAILED = "inst/institution-not-created";

        this.INSTITUTION_DEFAULTS_SET = "inst/institution-defaults-saved";
        this.INSTITUTION_DEFAULTS_UNSET = "inst/institution-defaults-not-saved";

        this.SCHEDULE_UPLOADED = "inst/schedule-upload-success";
        this.SCHEDULE_UPLOAD_FAILED = "inst/schedule-upload-failed";

        this.CLASS_EXISTS = "inst/class-exists";
        this.CLASS_NOT_FOUND = "inst/class-not-found";
        this.CLASSES_CREATED = "inst/classes-creation-success";
        this.CLASSES_CREATION_FAILED = "inst/classes-creation-failed";
        this.INCHARGE_EXISTS = 'inst/class-incharge-found';
        this.INCHARGE_OCCUPIED = 'inst/incharge-assigned-another-class';
        
      }
    }

    class Mailcodes {
      constructor() {
        this.ACCOUNT_VERIFICATION = "mail/account-verification";
        this.RESET_PASSWORD = "mail/reset-password";
        this.PASSWORD_CHANGED = "mail/password-changed";
        this.EMAIL_CHANGED = "mail/email-address-changed";
        this.ACCOUNT_DELETED = "mail/account-deleted";
        this.INSTITUTION_INVITATION = "mail/invite-to-institution";
        this.ERROR_MAIL_NOTSENT = "mail/email-not-sent";
        this.MAIL_SENT = "mail/email-sent-success";
      }
    }
    class ActionCodes {
      constructor() {
        this.ACCOUNT_DELETE = "action/delete-account";
        this.CHANGE_PASSWORD = "action/change-password";
        this.CHANGE_ID = "action/change-id-email";
        this.CHANGE_PHONE = "action/change-phone-number";
        this.CHANGE_NAME = "action/change-name";
        this.SEND_INVITE = "action/send-invitation";
        this.ACCOUNT_VERIFY = "action/verify-account";

        this.CHANGE_START_TIME = "action/timing-change-starttime";
        this.CHANGE_BREAK_START_TIME = "action/timing-change-break-starttime";
        this.CHANGE_PERIOD_DURATION = "action/timing-change-period-duration";
        this.CHANGE_BREAK_DURATION = "action/timing-change-break-duration";
        this.CHANGE_TOTAL_PERIODS = "action/timing-change-periods";
        this.CHANGE_WORKING_DAYS = "action/timing-change-working-days";

        this.CREATE_CLASSES = 'action/create-multiple-classes';
        this.CREATE_NEW_CLASS = 'action/create-new-class';
        this.RENAME_CLASS = "action/rename-classroom";
        this.RENAME_SUBJECT = "action/rename-subject";
        this.SET_INCHARGE = "action/set-class-incharge"
      }
    }
    class InvitationCodes {
      constructor() {
        this.LINK_EXPIRED = "invite/link-is-expired";
        this.LINK_INVALID = "invite/link-is-invalid";
        this.LINK_ACTIVE = "invite/link-is-active";
        this.LINK_EXISTS = "invite/link-already-exists";
        this.LINK_CREATED = "invite/link-creation-success";
        this.LINK_CREATION_FAILED = "invite/link-creation-failed";
        this.LINK_DISABLED = "invite/link-disabled";
        this.LINK_DISABLE_FAILED = "invite/link-disable-failed";
      }
    }
    class VerificationCodes {
      constructor() {
        this.LINK_GENERATED = "verify/link-generated";
        this.LINK_VALID = "verify/link-is-valid";
        this.LINK_EXPIRED = "verify/link-is-expired";
        this.LINK_INVALID = "verify/invalid-illegal-link";
        this.VERIFIED = "verify/verification-success";
        this.NOT_VERIFIED = "verify/verification-failed";
      }
      /**
       * Checks if given response event is valid for link validation.
       * @param {JSON} response This should contain a key 'event' with some link validity code value.
       * @returns A boolean value, if valid, true, otherwise false.
       */
      isValid(response) {
        return response.event == this.LINK_VALID;
      }

      /**
       * Checks if given response event is expired for link validation.
       * @param {JSON} response This should contain a key 'event' with some link validity code value.
       * @returns A boolean value, if expired, true, otherwise false.
       */
      isExpired(response) {
        return response.event == this.LINK_EXPIRED;
      }

      /**
       * Checks if given response event is invalid for link validation.
       * @param {JSON} response This should contain a key 'event' with some link validity code value.
       * @returns A boolean value, if invalid, true, otherwise false.
       */
      isInvalid(response) {
        return response.event == this.LINK_INVALID;
      }
    }
    class ScheduleCodes {
      constructor() {
        this.SCHEDULE_EXISTS = "schedule/schedule-exists";
        this.SCHEDULE_CREATED = "schedule/schedule-created";
        this.SCHEDULE_NOT_EXIST = "schedule/schedule-not-available";
        this.SCHEDULE_NOT_CREATED = "schedule/creation-failed";
        this.SCHEDULE_UPDATED = "schedule/update-sucess";
        this.BATCH_EXISTS = "schedule/batch-or-class-exists";
        this.BATCH_NOT_FOUND = "schedule/batch-or-class-not-exist";
        this.SCHEDULE_CLASHED = "schedule/conflicting-schedule";
        this.FREE = "Free";
      }
    }
    this.auth = new Authcodes();
    this.client = new Clientcodes();
    this.server = new Servercodes();
    this.db = new Database();
    this.mail = new Mailcodes();
    this.action = new ActionCodes();
    this.inst = new InstitutionCodes();
    this.invite = new InvitationCodes();
    this.verify = new VerificationCodes();
    this.schedule = new ScheduleCodes();

  }
  event(code) {
    return {
      event: code,
    };
  }
  eventmsg(code, msg) {
    return {
      event: code,
      msg: msg,
    };
  }
}
class Client {
  constructor() {
    this.admin = "admin";
    this.teacher = "teacher";
    this.student = "student";
  }
}
class Constant {
  constructor() {
    this.appName = "Schemester";
    this.hide = "none";
    this.show = "block";
    this.nothing = "";
    this.space = " ";
    this.tab = "  ";
    this.post = "post";
    this.get = "get";
    this.put = "put";
    this.backbluecovered = false;
    this.fetchContentType = "application/x-www-form-urlencoded; charset=UTF-8";
    this.emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    this.passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#()])[A-Za-z\d@$!%*?&#()]{8,}$/;
    this.sessionID = "id";
    this.sessionUID = "uid";
    this.weekdays = Array(
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday"
    );
    this.weekdayscasual = Array(
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday"
    );
    this.shortDays = Array("Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat");
    this.shortDaysCasual = Array("sun", "mon", "tue", "wed", "thu", "fri", "sat");
    this.months = Array(
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    );
    this.shortMonths = Array(
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "June",
      "July",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec"
    );
  }
}

class Locations {
  constructor() {
    this.homepage = "/home";
    this.root = "/";
    this.planspage = "/plans";
    class Admin {
      constructor() {
        const root = '/admin';
        this.session = `${root}/session`;
        this.login = `${root}/auth/login`;
        class Target {
          constructor() {
            this.settings = "manage";
            this.dashboard = "dashboard";
            this.manage = "manage";
            this.addteacher = "addteacher";
            this.register = "registration";
            this.viewschedule = "viewschedule";
            this.classes = "classrooms";
            this.teachers = "teachers";
          }
        }
        this.target = new Target();

        class SettingSections {
          constructor() {
            this.account = "setting/account";
            this.institute = "setting/institute";
            this.schedule = "setting/schedule";
            this.users = "setting/users";
            this.security = "setting/security";
            this.about = "setting/about";
          }
        }
        this.section = new SettingSections();
      }
    }
    this.admin = new Admin();

    class Teacher {
      constructor() {
        const root = '/teacher';
        this.session = `${root}/session`;
        this.login = `${root}/auth/login`;
        this.fragment = `${root}/fragment`;
        class Target {
          constructor() {
            this.dash = "dash";
            this.settings = "settings";
            this.addschedule = "addschedule";
            class Fragment {
              constructor() {
                this.today = "today";
                this.fullweek = "fullschedule";
                this.classroom = "classroom";
                this.about = "about";
                this.settings = "about";
              }
            }
            this.fragment = new Fragment();
          }
        }
        this.target = new Target();
      }
    }
    this.teacher = new Teacher();

    class Student {
      constructor() {
        const root = '/student';
        this.session = `${root}/session`;
        this.login = `${root}/auth/login`;
        this.fragment = `${root}/fragment`;
        class Target {
          constructor() {
            this.dash = "dash";
            class Fragment {
              constructor() {
                this.today = "today";
                this.settings = "settings";
                this.fullweek = "fullschedule";
                this.classroom = "classroom";
              }
            }
            this.fragment = new Fragment();
          }
        }
        this.target = new Target();
      }
    }
    this.student = new Student();
  }
}

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
      this.users = 'admin/users.ejs';

      this.target = new Locations().admin.target;
      this.section = new Locations().admin.section;
  }
  getViewByTarget(target = this.target.dashboard){
      switch(target){
          case this.target.manage:return this.settings;
          case this.target.addteacher:return this.addTeacher;
          case this.target.dashboard:return this.dash;
          case this.target.register:return this.registration;
          case this.target.viewschedule:return this.scheduleview;
          case this.target.classes:return this.users;
          case this.target.teachers:return this.users;
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
      this.target = new Locations().teacher.target;
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
              this.today = 'student/fragments/today.ejs';
              this.fullschedule = 'student/fragments/fullweek.ejs';
              this.classroom = 'student/fragments/classroom.ejs';
              this.settings = 'student/fragments/about.ejs';
          }
      }
      this.fragment = new FragmentView();
      this.target = new Locations().student.target;
  }
  getViewByTarget(target = this.target.dash){
      switch(target){
          case this.target.dash:return this.dash;
          case this.target.fragment.today:return this.fragment.today;
          case this.target.fragment.fullweek:return this.fragment.fullschedule;
          case this.target.fragment.settings:return this.fragment.settings;
          case this.target.fragment.classroom:return this.fragment.classroom;
          default:return this.getViewByTarget();
      }
  }
}



class Gets{
  constructor(){
    const locate = new Locations();
    this.root = locate.root;
    this.home = locate.homepage;
    this.authlogin = '/auth/login*';
    this.session = '/session*';
    this.external = '/external*';
    this.fragment = '/fragment*';
    this.notfound = '/404';
    this.servererror = '/500';
    this.forbidder = '/403';
  }
}

class Posts {
  constructor() {
    this.logout = '/logout';
    class Admin {
      constructor() {
        const root = "/admin"
        this.login = `${root}/auth/login`;
        this.logout = `${root}/auth/logout`;
        this.signup = `${root}/auth/signup`;

        this.auth = `${root}/auth`;
        this.self = `${root}/self`;
        this.default = `${root}/default`;
        this.sessionValidate = `${root}/session/validate`;
        this.manage = `${root}/manage`;
        this.users = `${root}/users`;
        this.register = `${root}/session/registerinstitution`;
        this.schedule = `${root}/schedule`;
        this.receivedata = `${root}/receivedata`;
        this.pseudousers = `${root}/pseudousers`;
        this.dashboard = `${root}/dashboard`;

        class Target{
          constructor(){
            this.today = "today";
          }
        }
        this.target = new Target();
        class Action {
          constructor() {
            this.registerInstitute = "registerinstitute";
            this.login = "login";
            this.logout = "logout";
            this.signup = "signup";
            this.fetch = "fetch";
            this.update = "update";
          }
        }
        this.action = new Action();
      }
    }
    this.admin = new Admin();

    class Teacher {
      constructor() {
        const root = "/teacher"
        this.auth = `${root}/auth`;
        this.sessionValidate = `${root}/session/validate`;
        this.schedule = `${root}/schedule`;
        this.self = `${root}/self`;
        this.manage = `${root}/manage`;
        this.classroom = `${root}/classroom`;
        class Action {
          constructor() {
            this.login = "login";
            this.logout = "logout";
            this.signup = "signup";
          }
        }
        this.action = new Action();
      }
    }
    this.teacher = new Teacher();

    class Student {
      constructor() {
        const root = '/student';
        this.auth = `${root}/auth`;
        this.sessionValidate = `${root}/session/validate`;
        this.schedule = `${root}/schedule`;
        this.self = `${root}/self`;
        this.manage = `${root}/manage`;
        class Action {
          constructor() {
            this.login = "login";
            this.logout = "logout";
            this.signup = "signup";
          }
        }
        this.action = new Action();
      }
    }
    this.student = new Student();
  }
}
class Theme {
  constructor() {
    this.dark = "dark";
    this.light = "light";
    this.key = "theme";
  }
  setDark() {
    this.setTheme(this.dark);
  }
  setLight() {
    this.setTheme(this.light);
  }
  switch() {
    this.isLight() ? this.setDark() : this.setLight();
  }
  isLight() {
    return this.getTheme() == this.light;
  }
  isDark() {
    return this.getTheme() == this.dark;
  }

  getTheme() {
    return localStorage.getItem(this.key);
  }
  setTheme(theme = this.light) {
    localStorage.setItem(this.key, theme);
    window.parent.document.getElementById('themecolor').setAttribute('content',theme == this.dark?'#739dec':'#216bf3')
    document.documentElement.setAttribute("data-theme", theme);
    window.parent.document.documentElement.setAttribute("data-theme", theme);
  }
}

class Colors {
  constructor() {
    this.positive = "var(--positive)";
    this.negative = "var(--negative)";
    this.active = "var(--active)";
    this.warning = "var(--warning)";
    this.white = "#ffffff";
    this.black = "#000000";
    this.transparent = "#00000056";
    this.base = this.positive;
  }
  getColorByType(type) {
    switch (type) {
      case actionType.positive:
        return this.positive;
      case actionType.negative:
        return this.negative;
      case actionType.neutral:
        return this.white;
      case actionType.active:
        return this.active;
      case actionType.nothing: {
        return this.transparent;
      }
      default: {
        return type == false
          ? this.getColorByType(actionType.negative)
          : this.getColorByType(actionType.positive);
      }
    }
  }
}
class InputType {
  constructor() {
    this.name = "name";
    this.email = "email";
    this.password = "password";
    this.nonempty = "nonempty";
    this.match = "matching";
    this.username = "username";
    this.phone = "phone";
    this.weekday = "weekday";
  }
}
class ViewType {
  constructor() {
    this.neutral = "neutral";
    this.positive = "positive";
    this.negative = "negative";
    this.warning = "warning";
    this.active = "active";
    this.nothing = "nothing";
  }
  getCheckStyle(type = new ViewType()) {
    switch (type) {
      case this.neutral:
        return "tickmark-positive";
      case this.positive:
        return "tickmark-positive";
      case this.negative:
        return "tickmark-negative";
      case this.warning:
        return "tickmark-warning";
      case this.active:
        return "tickmark-active";
      default:
        return "tickmark-positive";
    }
  }
  getButtonStyle(type) {
    switch (type) {
      case this.neutral:
        return "neutral-button";
      case this.positive:
        return "positive-button";
      case this.negative:
        return "negative-button";
      case this.warning:
        return "warning-button";
      case this.active:
        return "active-button";
      default:
        return "positive-button";
    }
  }
  getFieldStyle(type) {
    switch (type) {
      case this.neutral:
        return "text-field";
      case this.positive:
        return "text-field";
      case this.negative:
        return "text-field-error";
      case this.warning:
        return "text-field-warn";
      case this.active:
        return "text-field-active";
      default:
        return "text-field";
    }
  }
  getSnackStyle(type) {
    switch (type) {
      case this.neutral:
        return "snack-neutral";
      case this.positive:
        return "snack-positive";
      case this.negative:
        return "snack-negative";
      case this.warning:
        return "snack-warn";
      case this.active:
        return "snack-active";
      default:
        return "snack-positive";
    }
  }
  getSwitchStyle(type){
    switch (type) {
      case this.positive:
        return "switch-positive";
      case this.negative:
        return "switch-negative";
      case this.warning:
        return "switch-warning";
      case this.active:
        return "switch-active";
      default:
        return "switch-positive";
    }
  }
}
const click = "click",
  change = "change",
  input = "input";
const code = new Codes();
const client = new Client();
const value = new Constant();
const constant = new Constant();
const locate = new Locations();
const theme = new Theme();
const post = new Posts();
const colors = new Colors();
const validType = new InputType();
const actionType = new ViewType();
const bodyType = new ViewType();
try {
  module.exports = {code:new Codes(),client:new Client(),view:new View(),get:new Gets(),isOK(val){return String(val)==String(code.OK)},clog(msg){console.log(msg)}};
} catch {
  
}
