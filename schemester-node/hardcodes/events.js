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
        this.EMAIL_INVALID = 'auth/invalid-email';
        this.LOGGED_OUT = 'auth/logged-out';
        this.ACCOUNT_CREATED = 'auth/account-created'
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
    }
}


module.exports = new Codes();
