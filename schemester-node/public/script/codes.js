class Codes{
    constructor(){
        this.OK = 'OK/true';
        this.NO = 'NO/false';
        class Servercodes{
            constructor(){
                this.DATABASE_ERROR = 'server/database-error:';        
                this.UIID_TAKEN = 'server/uiid-already-taken';
                this.UIID_AVAILABLE = 'server/uiid-available';
            }
        }
        class Clientcodes{
            constructor(){
                this.NETWORK_FAILURE = 'client/network-error';
                this.NOT_SIGNED_IN = 'client/not-signed-in';
            }
        }
        
        class Authcodes{
            constructor(){
                this.WRONG_PASSWORD = 'auth/wrong-password';
                this.WEAK_PASSWORD = 'auth/weak-password';
                this.USER_NOT_EXIST = 'auth/no-user-found';
                this.USER_NOT_VERIFIED = 'auth/user-not-verified';
                this.USER_VERIFIED = 'auth/user-is-verified';
                this.USER_EXIST = 'auth/user-found';
                this.AUTH_FAILED = 'auth/authentication-failed';
                this.SESSION_VALID = 'auth/user-logged-in';
                this.SESSION_INVALID = 'auth/user-not-logged-in';
                this.EMAIL_INVALID = 'auth/invalid-email';
                this.PASSWORD_INVALID = 'auth/invalid-password';
                this.SAME_EMAIL = 'auth/same-email-address';
                this.LOGGED_OUT = 'auth/logged-out';
                this.ACCOUNT_CREATED = 'auth/account-created';
                this.NAME_INVALID = 'auth/invalid-name';
                this.ACCOUNT_CREATION_FAILED = 'auth/account-not-created';
                this.AUTH_SUCCESS = 'auth/sign-in-success';
                this.ACCOUNT_RESTRICTED = "auth/account-disabled";
                this.AUTH_REQ_FAILED = "auth/request-failed";
                this.REQ_LIMIT_EXCEEDED = "auth/too-many-requests";
                this.UIID_INVALID = "auth/invalid-uiid";
                this.WRONG_UIID = "auth/wrong-uiid";
            }
        }
        
        class InstitutionCodes{
            constructor(){
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
                
                this.INSTITUTION_NOT_EXISTS = 'inst/institution-not-exists';
                this.INSTITUTION_EXISTS = 'inst/institution-exists';
                this.INSTITUTION_CREATED = 'inst/institution-created';
                this.INSTITUTION_CREATION_FAILED = 'inst/institution-not-created';
        
                this.INSTITUTION_DEFAULTS_SET = 'inst/institution-defaults-saved';
                this.INSTITUTION_DEFAULTS_UNSET = 'inst/institution-defaults-not-saved';
        
                this.SCHEDULE_UPLOADED = 'inst/schedule-upload-success';
                this.SCHEDULE_UPLOAD_FAILED = 'inst/schedule-upload-failed';
            }
        }
        
        
        class Mailcodes{
            constructor(){
                this.ACCOUNT_VERIFICATION = 'mail/account-verification';
                this.RESET_PASSWORD = 'mail/reset-password';
                this.PASSWORD_CHANGED = 'mail/password-changed';
                this.EMAIL_CHANGED = 'mail/email-address-changed';
                this.ACCOUNT_DELETED = 'mail/account-deleted';
                this.INSTITUTION_INVITATION = 'mail/invite-to-institution';
                this.ERROR_MAIL_NOTSENT = 'mail/email-not-sent';
                this.MAIL_SENT = 'mail/email-sent-success';
            }
        }
        class ActionCodes{
            constructor(){
                this.ACCOUNT_DELETE = 'action/delete-account';
                this.CHANGE_PASSWORD = 'action/change-password';
                this.CHANGE_ID = 'action/change-id-email';
                this.SEND_INVITE = 'action/send-invitation';
                this.ACCOUNT_VERIFY = 'action/verify-account';
            }
        };
        class InvitationCodes{
            constructor(){
                this.LINK_EXPIRED = 'invite/link-is-expired';
                this.LINK_INVALID = 'invite/link-is-invalid';
                this.LINK_ACTIVE = 'invite/link-is-active';
                this.LINK_EXISTS = 'invite/link-already-exists';
                this.LINK_CREATED = 'invite/link-creation-success';
                this.LINK_CREATION_FAILED = 'invite/link-creation-failed';
                this.LINK_DISABLED = 'invite/link-disabled';
                this.LINK_DISABLE_FAILED = 'invite/link-disable-failed';
            }
        };
        class VerificationCodes{
            constructor(){
                this.LINK_GENERATED = 'verify/link-generated';
                this.LINK_VALID = 'verify/link-is-valid';
                this.LINK_EXPIRED = 'verify/link-is-expired';
                this.LINK_INVALID = 'verify/invalid-illegal-link';
                this.VERIFIED = 'verify/verification-success';
                this.NOT_VERIFIED = 'verify/verification-failed';
            }
        
        }
        class ScheduleCodes{
            constructor(){
                this.SCHEDULE_EXISTS = 'schedule/schedule-exists';
                this.SCHEDULE_CREATED = 'schedule/schedule-created';
                this.SCHEDULE_NOT_EXIST = 'schedule/schedule-not-available';
                this.SCHEDULE_NOT_CREATED = 'schedule/creation-failed';
                this.SCHEDULE_UPDATED = 'schedule/update-sucess';
                this.BATCH_EXISTS = 'schedule/batch-or-class-exists';
                this.BATCH_NOT_FOUND = 'schedule/batch-or-class-not-exist';
                this.SCHEDULE_CLASHED = 'schedule/conflicting-schedule';
            }
        }
        this.auth = new Authcodes();
        this.client = new Clientcodes();
        this.server = new Servercodes();
        this.mail = new Mailcodes();
        this.action  = new ActionCodes();
        this.inst = new InstitutionCodes();
        this.invite = new InvitationCodes();
        this.verify = new VerificationCodes();
        this.schedule = new ScheduleCodes();
    }
    event(code){
        return {
            event:code
        }
    }
    eventmsg(code,msg){
        return {
            event:code,
            msg:msg
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
      this.shortDays = Array(
        "Sun",
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat"
      );
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
          this.session = "/admin/session";
          this.login = "/admin/auth/login";
  
          class Target {
            constructor() {
              this.dashboard = "dashboard";
              this.settings = "manage";
              this.manage = "manage";
              this.addteacher = "addteacher";
              this.register = "registration";
              this.viewschedule = 'viewschedule';
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
          this.session = "/teacher/session";
          this.login = "/teacher/auth/login";
          this.fragment = "/teacher/fragment";
          class Target {
            constructor() {
              this.dash = "dash";
              this.settings = "settings";
              this.addschedule = "addschedule";
              class Fragment{
                constructor(){
                    this.today = "today";
                    this.fullweek = "fullschedule";
                    this.about = "about";
                }
              }
              this.fragment = new Fragment()
            }
          }
          this.target = new Target();
        }
      }
      this.teacher = new Teacher();

      class Student {
        constructor() {
          this.session = "/student/session";
          this.login = "/student/auth/login";
          this.fragment = "/student/fragment";
          class Target {
            constructor() {
              this.dash = "dash";
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
      }
      this.student = new Student();
    }
  }
  class Posts {
    constructor() {
      class Admin {
        constructor() {
          this.login = "/admin/auth/login";
          this.logout = "/admin/auth/logout";
          this.signup = "/admin/auth/signup";
          this.manage = "/admin/manage";
          this.self = "/admin/self";
          this.default = "/admin/default";
          this.sessionValidate = "/admin/session/validate";
          this.register = "/admin/session/registerinstitution";
          this.schedule = "/admin/schedule";

          class Action{
            constructor(){
              this.registerInstitute = "registerinstitute";
            }
          }
          this.action = new Action();
        }
      }
      this.admin = new Admin();
  
      class Teacher {
        constructor() {
          this.login = "/teacher/auth/login";
          this.logout = "/teacher/auth/logout";
          this.sessionValidate = "/teacher/session/validate";
          this.schedule = "/teacher/schedule";
        }
      }
      this.teacher = new Teacher();

      class Student {
        constructor() {
          this.login = "/student/auth/login";
          this.logout = "/student/auth/logout";
          this.signup = "/student/auth/signup"
          this.sessionValidate = "/student/session/validate";
          this.schedule = "/student/schedule";
        }
      }
      this.student = new Student();
  
      this.sessionValidate = "/admin/session/validate";
      this.authlogin = "/admin/auth/login";
      this.authlogout = "/admin/auth/logout";
      this.authsignup = "/admin/auth/signup";
    }
  }
  class Theme{
    constructor(){
      this.dark = 'dark';
      this.light = 'light';
      this.key = 'theme';
    }
    setDark(){
      this.setTheme(this.dark);
    }
    setLight(){
      this.setTheme(this.light);
    }
    switch(){
      this.isLight()?this.setDark():this.setLight();
    }
    isLight(){
      return this.getTheme() == this.light;
    }
    isDark(){
      return this.getTheme() == this.dark;
    }
    
    getTheme(){
      return localStorage.getItem(this.key);
    }
    setTheme(theme = new Theme().light){
      localStorage.setItem(this.key,theme);
      document.documentElement.setAttribute('data-theme', theme);
      window.parent.document.documentElement.setAttribute('data-theme', theme);
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
  }
  const click = "click",
  change = "change",
  input = "input";
try{
    module.exports = new Codes();
}catch{

}