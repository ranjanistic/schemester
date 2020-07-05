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

class Codes{
    constructor(){
        this.auth = new Authcodes();
        this.client = new Clientcodes();
        this.server = new Servercodes();
    }
}

module.exports = new Codes();
