/**
 * Maintains the communicable codes between client and server, and among client and server themselves, ensuring uniformity
 * & reducing errors in event reporting, and apart from that, some basic constants too.
 * https://github.com/ranjanistic/schemester-web/blob/master/DOCUMENTATION.md#codesjspublicscriptcodesjs
 */

/**
 * The string codes to communicate with server, and to receive to act accordingly.
 * [See doc](https://github.com/ranjanistic/schemester-web/blob/master/DOCUMENTATION.md#string-codes)
 */
class Codes {
  constructor() {
    // this.domain = "https://localhost:3000";
    // this.domain = "https://192.168.43.56:3000";
    this.domain = "https://schemester.herokuapp.com";
    this.free = "Free";
    this.OK = "OK/true";
    this.NO = "NO/false";

    class Servercodes {
      constructor() {
        this.DATABASE_ERROR = "server/database-error:";
        this.SERVER_ERROR = "server/server-error:";
        this.UIID_TAKEN = "server/uiid-already-taken";
        this.UIID_AVAILABLE = "server/uiid-available";
      }
    }
    class Clientcodes {
      constructor() {
        this.NETWORK_FAILURE = "client/network-error";
        this.INVALID_ACSRF = "client/invalid-acsrf-token";
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

        this.BACKUP_INSTITUTION = "inst/backup-institute-file";

        this.INSTITUTION_DEFAULTS_SET = "inst/institution-defaults-saved";
        this.INSTITUTION_DEFAULTS_UNSET = "inst/institution-defaults-not-saved";

        this.SCHEDULE_UPLOADED = "inst/schedule-upload-success";
        this.SCHEDULE_UPLOAD_FAILED = "inst/schedule-upload-failed";

        this.CLASS_EXISTS = "inst/class-exists";
        this.CLASS_NOT_FOUND = "inst/class-not-found";
        this.CLASS_JOIN_FAILED = "inst/failed-to-join-classroom";
        this.CLASSES_CREATED = "inst/classes-creation-success";
        this.CLASSES_CREATION_FAILED = "inst/classes-creation-failed";
        this.INCHARGE_EXISTS = "inst/class-incharge-found";
        this.INCHARGE_NOT_FOUND = "inst/class-incharge-not-found";
        this.INCHARGE_OCCUPIED = "inst/incharge-assigned-another-class";
      }
    }

    class Mailcodes {
      constructor() {
        this.ACCOUNT_VERIFICATION = "mail/account-verification";
        this.RESET_PASSWORD = "mail/reset-password";
        this.PASSWORD_CHANGED = "mail/password-changed";
        this.EMAIL_CHANGED = "mail/email-address-changed";
        this.ACCOUNT_DELETED = "mail/account-deleted";
        this.TWO_FACTOR_AUTH = "mail/2fa-code";
        this.INSTITUTION_INVITATION = "mail/invite-to-institution";
        this.ERROR_MAIL_NOTSENT = "mail/email-not-sent";
        this.MAIL_SENT = "mail/email-sent-success";
      }
    }
    class ActionCodes {
      constructor() {
        this.ACCOUNT_DELETE = "action/delete-account";
        this.INSTITUTE_DELETE = "action/delete-institute";
        this.CHANGE_PASSWORD = "action/change-password";
        this.CHANGE_ID = "action/change-id-email";
        this.CHANGE_PHONE = "action/change-phone-number";
        this.CHANGE_2FA = "action/change-two-factor-auth";
        this.CHANGE_NAME = "action/change-name";
        this.SEND_INVITE = "action/send-invitation";
        this.ACCOUNT_VERIFY = "action/verify-account";

        this.CHANGE_START_TIME = "action/timing-change-starttime";
        this.CHANGE_BREAK_START_TIME = "action/timing-change-break-starttime";
        this.CHANGE_PERIOD_DURATION = "action/timing-change-period-duration";
        this.CHANGE_BREAK_DURATION = "action/timing-change-break-duration";

        this.CREATE_CLASSES = "action/create-multiple-classes";
        this.CREATE_NEW_CLASS = "action/create-new-class";
        this.RENAME_CLASS = "action/rename-classroom";
        this.RENAME_SUBJECT = "action/rename-subject";
        this.SET_INCHARGE = "action/set-class-incharge";
        this.REMOVE_CLASS = "action/delete-classroom";
        this.REMOVE_DAY = "action/remove-day-schedule";
        this.SWITCH_DAY = "action/switch-day-schedule";
        this.ADD_DAY = "action/add-new-day";
        this.REMOVE_PERIOD = "action/remove-period";
        this.SWITCH_PERIODS = "action/switch-periods";
        this.ADD_PERIOD = "action/add-new-period";
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
        this.WEEKDAY_EXISTS = "schedule/weekday-exists";
        this.INVALID_PERIOD = "schedule/invalid-period";
        this.CREATE_BACKUP = "schedule/generate-backup";
        this.FREE = "Free";
      }
    }

    class Comms{
      constructor(){
        this.ROOM_NOT_FOUND = "comms/room-not-exist";
        this.ROOM_ACCESS_DENIED = "comms/room-not-allowed";
        this.BLOCKED_FROM_ROOM = "comms/blocked-from-room";
        this.CALL_CONNECTED = "comms/call-connected";
        this.CALL_DISCONNECTED = "comms/call-disconnected";
      }
    }
    this.auth = new Authcodes();
    this.client = new Clientcodes();
    this.server = new Servercodes();
    this.mail = new Mailcodes();
    this.action = new ActionCodes();
    this.inst = new InstitutionCodes();
    this.invite = new InvitationCodes();
    this.verify = new VerificationCodes();
    this.schedule = new ScheduleCodes();
    this.comms =new Comms();
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

/**
 * The topmost client types among whole application.
 * @note If in case these are to be renamed, then ensure that any hard files of application are also renamed, if they are of the
 * same names as any of the client, to ensure uniformity, otherwise, errors might occur.
 */
class Client {
  constructor() {
    this.admin = "admin";
    this.teacher = "teacher";
    this.student = "student";
  }
}

/**
 * Constant values for the whole application to use.
 */
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
    this.fetchJsonContent = "application/json";
    this.emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    this.passRegex = /^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9])(?=.*[a-z]).{8,}$/;
    this.sessionID = "id";
    this.sessionUID = "uid";
    this.millisInSecond = 1000;
    this.secondsInMinute = 60;
    this.minutesInHour = 60;
    this.hoursInDay = 24;
    this.minutesInDay = this.hoursInDay * this.minutesInHour;
    this.secondsInDay = this.minutesInDay * this.secondsInMinute;
    this.millisInDay = this.secondsInDay * this.millisInSecond;
    this.weekdays = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    this.weekdayscasual = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    this.shortDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    this.shortDaysCasual = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    this.months = [
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
      "December",
    ];
    this.monthsCasual = [
      "january",
      "february",
      "march",
      "april",
      "may",
      "june",
      "july",
      "august",
      "september",
      "october",
      "november",
      "december",
    ];
    this.shortMonths = [
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
      "Dec",
    ];
    this.shortMonthsCasual = [
      "jan",
      "feb",
      "mar",
      "apr",
      "may",
      "june",
      "july",
      "aug",
      "sep",
      "oct",
      "nov",
      "dec",
    ];
  }
}

/**
 * Maintains general actions for client-server communication
 */
class Action{
  constructor(){
    this.login = "login";
    this.logout = "logout";
    this.signup = "signup";
    this.verify = "verify";
    this.fetch = "fetch";
    this.receive = "receive";
    this.create = "create";
    this.authenticate = "authenticate";
    this.update = "update";
    this.withdraw = "withdraw";
    this.chat = "chat";
    this.upload = "upload";
    this.send = "send";
    this.set = "set";
    this.accept = "accept";
    this.reject = "reject";
    this.remove = "remove";
    this.disable = "disable";
    this.request = "request";
    this.get = "get";
    this.check = "check";
    this.voicecall = "voicecall";
    this.videocall = "videocall";
    this.invite = "invite";
    this.join = "join";
    this.registerInstitute = "registerinstitute";
  }
}

/**
 * The location paths of server endpoints are defined in this class, specially meant for the client to use,
 * along with other target parts of endpoints, for each type of client.
 */
class Locations {
  constructor() {
    this.homepage = "/home";
    this.offline = "/offline";
    this.search = "/search";
    this.root = "/";
    this.tour = "/tour";
    this.planspage = "/plans";
    class Admin {
      constructor() {
        const root = `/${client.admin}`;
        this.session = `${root}/session`;
        this.login = `${root}/auth/login`;
        this.twofactor = `${root}/auth/twofactor`;
        class Target {
          constructor() {
            this.settings = "manage";
            this.dashboard = "dashboard";
            this.manage = this.settings;
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
        const root = `/${client.teacher}`;
        this.session = `${root}/session`;
        this.login = `${root}/auth/login`;
        this.twofactor = `${root}/auth/twofactor`;
        this.fragment = `${root}/fragment`;
        class Target {
          constructor() {
            this.dash = "dash";
            this.settings = "settings";
            this.addschedule = "addschedule";
            this.comms = "comms";
            this.calling = "calling";
            this.chatroom = "chatroom";
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
        const root = `/${client.student}`;
        this.session = `${root}/session`;
        this.login = `${root}/auth/login`;
        this.twofactor = `${root}/auth/twofactor`;
        this.fragment = `${root}/fragment`;
        class Target {
          constructor() {
            this.dash = "dash";
            this.comms = "comms";
            this.calling = "calling";
            this.chatroom = "chatroom";
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

/**
 * Names of original view files in the application, and objects for specific client view files, meant for the sever to use.
 * @note The values in this class must be renamed if any of the original file is renamed, as the server would look for the
 * view paths specified in this class only, and will raise internal 404 error if not done.
 */
class View {
  constructor() {
    this.homepage = "home.ejs";
    this.loader = "loader.ejs";
    this.plans = "plans.ejs";
    this.notfound = "404.ejs";
    this.tour = "tour.ejs";
    this.servererror = "500.ejs";
    this.forbidden = "403.ejs";
    this.ratelimited = "429.ejs";
    this.search = "search.ejs";
    this.offline = "offline.ejs";

    this.userinvitaion = "invitation.ejs";
    this.verification = "verification.ejs";
    this.passwordreset = "resetpassword.ejs";
    this.twofactor = "2FA.ejs";

    class Comms{
      constructor(){
        this.commview = `comms/commview.ejs`;
        this.calling = `comms/calling.ejs`;
        this.chatroom = `comms/chatroom.ejs`;
      }
    }
    this.comms = new Comms();

    /**
     * The paths of admin client view files, for server to use.
     */
    class AdminView {
      constructor() {
        this.landing = `${client.admin}/${client.admin}.ejs`
        this.login = `${client.admin}/${client.admin}_login.ejs`;
        this.dash = `${client.admin}/${client.admin}_dash.ejs`;
        this.settings = `${client.admin}/management.ejs`;
        this.registration = `${client.admin}/edit_detail.ejs`;
        this.addTeacher = `${client.admin}/${client.teacher}_filler.ejs`;
        this.scheduleview = `${client.admin}/schedule_view.ejs`;
        this.users = `${client.admin}/users.ejs`;
        this.target = new Locations().admin.target;
        this.section = new Locations().admin.section;
      }
      getViewByTarget(target = this.target.dashboard) {
        switch (target) {
          case this.target.manage:
            return this.settings;
          case this.target.addteacher:
            return this.addTeacher;
          case this.target.dashboard:
            return this.dash;
          case this.target.register:
            return this.registration;
          case this.target.viewschedule:
            return this.scheduleview;
          case this.target.classes:
            return this.users;
          case this.target.teachers:
            return this.users;
          default:
            return this.getViewByTarget();
        }
      }
    }

    /**
     * The paths of teacher client view files, for server to use.
     */
    class TeacherView {
      constructor() {
        this.login = `${client.teacher}/${client.teacher}_login.ejs`;
        this.dash = `${client.teacher}/${client.teacher}_dash.ejs`;
        this.addschedule = `${client.admin}/${client.teacher}_filler.ejs`;
        this.landing = `${client.teacher}/${client.teacher}.ejs`
        class FragmentView {
          constructor() {
            this.fullschedule = `${client.teacher}/fragments/fullweek.ejs`;
            this.today = `${client.teacher}/fragments/today.ejs`;
            this.about = `${client.teacher}/fragments/about.ejs`;
            this.classroom = `${client.teacher}/fragments/classroom.ejs`;
          }
        }
        this.fragment = new FragmentView();
        this.target = new Locations().teacher.target;
        this.comms = new Comms();
      }
      getViewByTarget(target = this.target.dash) {
        switch (target) {
          case this.target.dash:
            return this.dash;
          case this.target.settings:
            return this.settings;
          case this.target.fullweek:
            return this.fullschedule;
          case this.target.addschedule:
            return this.addschedule;
          case this.target.comms:
            return this.comms.commview;
          case this.target.calling:
            return this.comms.calling;
          case this.target.chatroom:
            return this.comms.chatroom;
          case this.target.fragment.today:
            return this.fragment.today;
          case this.target.fragment.fullweek:
            return this.fragment.fullschedule;
          case this.target.fragment.classroom:
            return this.fragment.classroom;
          case this.target.fragment.about:
            return this.fragment.about;
          default:
            return this.getViewByTarget();
        }
      }
    }

    /**
     * The paths of student client view files, for server to use.
     */
    class StudentView {
      constructor() {
        this.landing = `${client.student}/${client.student}.ejs`
        this.login = `${client.student}/${client.student}_login.ejs`;
        this.dash = `${client.student}/${client.student}_dash.ejs`;
        class FragmentView {
          constructor() {
            this.today = `${client.student}/fragments/today.ejs`;
            this.fullschedule = `${client.student}/fragments/fullweek.ejs`;
            this.classroom = `${client.student}/fragments/classroom.ejs`;
            this.settings = `${client.student}/fragments/about.ejs`;
          }
        }
        this.fragment = new FragmentView();
        this.target = new Locations().student.target;
        this.comms = new Comms();
      }
      getViewByTarget(target = this.target.dash) {
        switch (target) {
          case this.target.dash:
            return this.dash;
          case this.target.fragment.today:
            return this.fragment.today;
          case this.target.comms:
            return this.comms.commview;
          case this.target.calling:
            return this.comms.calling;
          case this.target.chatroom:
            return this.comms.chatroom;
          case this.target.fragment.today:
          case this.target.fragment.fullweek:
            return this.fragment.fullschedule;
          case this.target.fragment.settings:
            return this.fragment.settings;
          case this.target.fragment.classroom:
            return this.fragment.classroom;
          default:
            return this.getViewByTarget();
        }
      }
    }
    this.admin = new AdminView();
    this.teacher = new TeacherView();
    this.student = new StudentView();
  }
  getLoginViewByClient(clientType){
    switch(clientType){
      case client.admin: return this.admin.login;
      case client.teacher: return this.teacher.login;
      case client.student: return this.student.login;
      default: return this.notfound;
    }
  }
}



/**
 * The endpoint paths of GET requests to server, meant for both client (to generate request) & server (to receive request).
 */
class Gets {
  constructor() {
    this.root = locate.root;
    this.home = locate.homepage;
    this.offline = locate.offline;
    this.search = locate.search+"*";
    this.tour = "/tour";
    this.admin = locate.admin;
    this.teacher = locate.teacher;
    this.student = locate.student;
    this.authlogin = "/auth/login*";
    this.session = "/session*";
    this.external = "/external*";
    this.download = "/download*";
    this.fragment = "/fragment*";
    this.notfound = "/404";
    this.servererror = "/500";
    this.forbidden = "/403";
  }
}

class ServerPosts{
  constructor(){
    this.auth = "/auth";
    this.self = "/self";
    this.session = "/session";
    this.schedule = "/schedule";
    this.receivedata = "/receivedata";
    this.dashboard = "/dashboard";
    this.sessionvalidate = "/session/validate";
    this.manage = "/manage";
    this.classroom = "/classroom";
    this.comms = "/comms";
    this.mail = "/mail";
    this.twofactor = "/2FA"
  }
}

/**
 * The endpoint paths of POST requests to server, currently meant for client to generate request.
 */
class Posts {
  constructor() {
    const post = new ServerPosts()

    class Admin {
      constructor() {
        const root = `${locate.root}${client.admin}`;
        this.auth = `${root}${post.auth}`;
        this.self = `${root}${post.self}`;
        this.default = `${root}/default`;
        this.sessionValidate = `${root}${post.sessionvalidate}`;
        this.users = `${root}/users`;
        this.pseudousers = `${root}/pseudousers`;
        this.schedule = `${root}${post.schedule}`;
        this.receivedata = `${root}${post.receivedata}`;
        this.dashboard = `${root}${post.dashboard}`;
        this.manage = `${root}${post.manage}`;
        this.email = `${root}${post.mail}`;
        class Target {
          constructor() {
            this.today = "today";
          }
        }
        this.target = new Target();
        this.action = new Action();
      }
    }
    
    this.admin = new Admin();

    class Teacher {
      constructor() {
        const root = `${locate.root}${client.teacher}`;
        this.auth = `${root}${post.auth}`;
        this.sessionValidate = `${root}${post.sessionvalidate}`;
        this.schedule = `${root}${post.schedule}`;
        this.self = `${root}${post.self}`;
        this.manage = `${root}${post.manage}`;
        this.classroom = `${root}${post.classroom}`;
        this.comms = `${root}${post.comms}`;
        this.twofactor = `${root}${post.twofactor}`
        this.action = new Action();
      }
    }
    this.teacher = new Teacher();

    class Student {
      constructor() {
        const root = `${locate.root}${client.student}`;
        this.auth = `${root}${post.auth}`;
        this.sessionValidate = `${root}${post.sessionvalidate}`;
        this.schedule = `${root}${post.schedule}`;
        this.self = `${root}${post.self}`;
        this.manage = `${root}${post.manage}`;
        this.classroom = `${root}${post.classroom}`;
        this.comms = `${root}${post.comms}`;
        this.twofactor = `${root}${post.twofactor}`
        this.action = new Action();
      }
    }
    this.student = new Student();
  }
  getAuthByClient(clientType){
    switch(clientType){
      case client.admin: return this.admin.auth;
      case client.teacher: return this.teacher.auth;
      case client.student: return this.student.auth;
    }
  }
}


/**
 * Maintains keys for most of the locally stored values, meant for client side only.
 */
class Keys {
  constructor() {
    this.uiid = "uiid";
    this.email = "email";
    this.dark = "dark";
    this.light = "light";
    this.homelogintab = 'homelogintab';
    this.fragment = "fragment";
    this.id = constant.sessionID;
    this.uid = constant.sessionUID;
    this.username = "username";
    this.theme = "theme";
    this.client = "client";
    this.classroom = "classroom";
    class Admin {
      constructor() {
        this.isadmin = "isAdmin";
        this.forgotpassword = "adminforgotpassword";
      }
    }
    class Teacher {
      constructor() {
        this.isteacher = "isAdmin";
        this.rememberuiid = "rememberteacheruiid";
        this.forgotpassword = "teacherforgotpassword";
      }
    }
    class Student {
      constructor() {
        this.isstudent = "isAdmin";
        this.rememberuiid = "rememberstudentuiid";
        this.forgotpassword = "studentforgotpassword";
      }
    }
    this.admin = new Admin();
    this.teacher = new Teacher();
    this.student = new Student();
  }
}


/**
 * This class maintains the theme settings for the whole application. Can be used to assign any element the properties of this class,
 * for theme related settings.
 */
class Theme {
  constructor() {
    this.dark = key.dark;
    this.light = key.light;
    this.key = key.theme;
  }

  setNav(positive = true){
    positive
      ?window.parent.document.getElementById("themecolor").setAttribute("content",colors.raw[localStorage.getItem(theme.key)].positive)
      :window.parent.document.getElementById("themecolor").setAttribute("content",colors.raw[localStorage.getItem(theme.key)].base);
  }

  switch() {
    this.isLight() ? this.setDark() : this.setLight();
  }
  setDark(base = false) {
    this.setTheme(this.dark,base);
  }
  setLight(base = false) {
    this.setTheme(this.light,base);
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
  setTheme(theme = this.light,base = false) {
    localStorage.setItem(this.key, theme);
    window.parent.document
      .getElementById("themecolor")
      .setAttribute("content",base?colors.raw[theme].base:colors.raw[theme].positive);
    document.documentElement.setAttribute("data-theme", theme);
    window.parent.document.documentElement.setAttribute("data-theme", theme);
  }
}

/**
 * The input types for several default input field types, and custom made input types.
 */
class InputType {
  constructor() {
    this.name = "name";
    this.email = "email";
    this.password = "password";
    this.nonempty = "nonempty";
    this.time = "time";
    this.match = "matching";
    this.username = "username";
    this.phone = "phone";
    this.number = "number";
    this.naturalnumber = "greaterthanzero";
    this.wholenumber = "nonnegative";
    this.weekday = "weekday";
  }
  
  /**
   * Returns default html input tag type attribute for custom text types.
   */
  getHTMLInputType(validtype = this.nonempty){
    switch(validtype){
      case this.email:return this.email;
      case this.password:return this.password;
      case this.time:return this.time;
      case this.phone:return this.number;
      case this.wholenumber:return this.number;
      case this.naturalnumber:return this.number;
      default: return "text";
    }
  }
}

/**
 * The global general view type scheme applied througout the application.
 * Also implements subsequent methods to provide style scheme (CSS classes) for specific element, according to the viewtype.
 */
class ViewType {
  constructor() {
    this.neutral = "neutral";
    this.positive = "positive";
    this.negative = "negative";
    this.warning = "warning";
    this.active = "active";
    this.nothing = "nothing";
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
  getSwitchStyle(type) {
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

/**
 * Maintains colors of the application and a type method to get specific color for specific Viewtype.
 * @see ViewType().
 */
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
    this.raw = {
      light:{
        positive: "#216bf3",
        negative: "#c02e2e",
        warning: "#f77f00",
        active: "#18b960",
        base: "#efefef",
        basetext: "#000000",
        secondary:"#ffffff",
        secondarytext:"#121212",
        tertiarytext:"#00000093",
        deadtext:"#343434",
        lightbase:"#eeeeeeee",
      },
      dark:{
        positive: "#5e83ce",
        negative: "#da5f5f",
        warning: "#fcbf49",
        active: "#00cc88",
        base: "#1a1f26",
        basetext: "#ffffff",
        secondary:"#0b0f14",
        secondarytext:"#dedede",
        tertiarytext:"#ffffff6c",
        deadtext:"#dedede",
        lightbase:"#1b1e24",
      }
    }
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

const click = "click",
  change = "change",
  input = "input",
  code = new Codes(),
  client = new Client(),
  value = new Constant(),
  constant = new Constant(),
  locate = new Locations(),
  key = new Keys(),
  action = new Action(),
  theme = new Theme(),
  post = new Posts(),
  colors = new Colors(),
  validType = new InputType(),
  actionType = new ViewType(),
  bodyType = new ViewType();

/**
 * Checks if given string is valid, according to its type given as second parameter.
 * @param {String} value The string value to be checked for validity.
 * @param {String} type The type of string according to which it will be verified. E.g. email, password, nonempty. Defaults to nonempty.
 * @param {String} ifMatchValue This optional parameter becomes neccessary, when the given value is to be checked for equality. This parameter works as the second string, against which
 * the given value will be checked. In this case, the type parameter should be 'matching'.
 * @note The type parameter can be passed using the InputType class object available in Schemester.
 */
const stringIsValid = (
  value = String,
  type = validType.nonempty,
  ifMatchValue = String
) => {
  switch (type) {
    case validType.name:
      return stringIsValid(String(value).trim());
    case validType.email:
      return String(value).length<=320&&constant.emailRegex.test(String(value).toLowerCase());
    case validType.phone:
      return !isNaN(value) && stringIsValid(String(value).trim());
    case validType.number:
      return !isNaN(value) && stringIsValid(String(value).trim());
    case validType.naturalnumber:
      return (
        stringIsValid(String(value).trim(), validType.number) &&
        Number(value) > 0
      );
    case validType.wholenumber:
      return (
        stringIsValid(String(value).trim(), validType.number) &&
        Number(value) >= 0
      );
    case validType.password:
      return String(value).length<=1000
      // &&constant.passRegex.test(String(value))
      &&String(value).length>=8;
    case validType.username:
      return stringIsValid(String(value).trim());
    case validType.match:
      return value === ifMatchValue;
    case validType.weekday:
      return constant.weekdayscasual.includes(value.toLowerCase());
    default:
      return value != null && value != constant.nothing;
  }
};

try {
  module.exports = {
    code: new Codes(),
    client: new Client(),
    view: new View(),
    action:new Action(),
    get: new Gets(),
    post:new ServerPosts(),
    key: new Keys(),
    validType: new InputType(),
    stringIsValid,
    isOK(val) {
      return String(val) == String(code.OK);
    },
    clog(msg) {
      console.log(msg);
    },
  };
} catch {}
