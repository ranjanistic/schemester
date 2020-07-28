class Today{
    constructor(){
        this.logout = getElement("logout");
        this.logout.onclick =_=>{
            showLoader();
            finishSession(client.teacher,_=>{
                relocate(locate.teacher.login);
            });
        }
    }
}

window.onload=_=>window.app = new Today();