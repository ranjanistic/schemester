class Codes{
    constructor(){
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
        class ScheduleCodes{
            constructor(){
                this.SCHEDULE_EXISTS = 'schedule/schedule-exists';
                this.SCHEDULE_CREATED = 'schedule/schedule-created';
                this.SCHEDULE_NOT_EXIST = 'schedule/schedule-not-available';
                this.SCHEDULE_NOT_CREATED = 'schedule/creation-failed';
                this.SCHEDULE_UPDATED = 'schedule/update-sucess';
            }
        }
        this.auth = new Authcodes();
        this.client = new Clientcodes();
        this.server = new Servercodes();
        this.mail = new Mailcodes();
        this.action  = new ActionCodes();
        this.inst = new InstitutionCodes();
        this.invite = new InvitationCodes();
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


module.exports = new Codes();
