class View{
    constructor(){
        this.homepage = 'home.ejs';
        this.loader = 'loader.ejs';
        this.adminlogin = 'admin/admin_login.ejs';
        this.admindash = 'admin/admin_dash.ejs';
        this.adminsettings = 'admin/management.ejs';
        this.adminsetup = 'admin/edit_detail.ejs';
        this.plans = 'plans.ejs';
        this.notfound = '404.ejs';
        this.servererror = '500.ejs';
        this.forbidden = '403.ejs';
        this.offline = 'offline.ejs';
    }
}

module.exports = new View();