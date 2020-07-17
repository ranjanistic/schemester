class Servercodes{
    constructor(){
        this.DATABASE_ERROR = 'server/database-error:';
        this.INSTITUTION_EXISTS = 'server/institution-collection-exists';
        this.INSTITUTION_CREATED = 'server/institution-collection-created';
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

class ActionCodes{
    constructor(){
        this.ACCOUNT_DELETE = 'action/delete-account';
        this.CHANGE_PASSWORD = 'action/change-password';
        this.CHANGE_ID = 'action/change-id-email';
        this.SEND_INVITE = 'action/send-invitation';
        this.ACCOUNT_VERIFY = 'action/verify-account';
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

class Codes{
    constructor(){
        this.auth = new Authcodes();
        this.client = new Clientcodes();
        this.server = new Servercodes();
        this.mail = new Mailcodes();
        this.action  = new ActionCodes();
    }
}


module.exports = new Codes();
