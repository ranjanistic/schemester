class ResetPassword{
    constructor(){
        backRoot();
        this.data = new ReceiveData();
        new ThemeSwitch('darkmode');
        if(this.data.expired){
            return new Expired();
        }
        this.passField = new TextInput("passfield","New password","Create a strong password",validType.password);
        this.passField.validate();
        this.view = getElement("workbox");
        this.savepass = getElement("savepassword");
        this.loader = getElement("loader");
        this.savepass.onclick=_=>{
            if(!this.passField.isValid()) return this.passField.validateNow();
            this.load();
            switch(this.data.client){
                case client.admin:{
                    postJsonData(post.admin.self,{
                        target:"account",
                        action:code.action.CHANGE_PASSWORD,
                        external:true,
                        user:{
                            id:this.data.userid,
                        },
                        newpassword:this.passField.getInput()
                    }).then(response=>{
                        this.load(false);
                        if(response.event == code.OK){
                            this.view.innerHTML = `Password was changed successfully for ${this.data.email}.`
                        } else {
                            snackBar('An error occurred','Report');
                        }
                    })
                }break;
                case client.teacher:{
                    postJsonData(post.teacher.self,{
                        target:"account",
                        action:code.action.CHANGE_PASSWORD,
                        external:true,
                        user:{
                            id:this.data.userid,
                            uiid:this.data.uiid
                        },
                        newpassword:this.passField.getInput()
                    }).then(response=>{
                        this.load(false);
                        if(response.event == code.OK){
                            this.view.innerHTML = `Password was changed successfully for ${this.data.email}.`
                        } else {
                            snackBar('An error occurred','Report');
                        }
                    })
                }break;
                case client.student:{
                    postJsonData(post.student.self,{
                        target:"account",
                        action:code.action.CHANGE_PASSWORD,
                        external:true,
                        user:{
                            id:this.data.userid,
                            uiid:this.data.uiid,
                            classname:this.data.classname
                        },
                        newpassword:this.passField.getInput()
                    }).then(response=>{
                        this.load(false);
                        if(response.event == code.OK){
                            this.view.innerHTML = `Password was changed successfully for ${this.data.email}.`
                        } else {
                            snackBar('An error occurred','Report');
                        }
                    })
                }break;
            }
        }
        this.load(false);
    }
    load(show = true) {
        visibilityOf(this.savepass, !show);
        visibilityOf(this.loader, show);
        opacityOf(this.view, show ? 0.5 : 1);
      }
}


class Expired {
    constructor(data) {
      backRoot("backroot1");
      new ThemeSwitch('darkmode')
    }
  }
  
  class ReceiveData {
    constructor() {
      this.expired = getElement("expired").innerHTML ? true : false;
      if(!this.expired){
          this.client = getElement("client").innerHTML;
          if(this.client == client.student){
              this.classname = getElement("classname").innerHTML;
          }
      }
      this.username = getElement("username").innerHTML;
      this.email = getElement("email").innerHTML;
      this.userid = getElement("uid").innerHTML;
      this.uiid = getElement("uiid").innerHTML;
      localStorage.setItem("client", this.client);
      localStorage.setItem("username", this.username);
      localStorage.setItem("id", this.email);
      localStorage.setItem("uid", this.userid);
      localStorage.setItem("uiid", this.uiid);
    }
  }
  window.onload = (_) =>{
    theme.setNav();
    window.app = new ResetPassword();
  }
