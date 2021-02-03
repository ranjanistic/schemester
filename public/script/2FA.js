class TwoFactor{
    constructor(){
        const data = new ReceiveData();
        new ThemeSwitch("darkmode");
        this.logout = getElement("backlogout");
        this.view = getElement("workbox");
        this.loader = getElement("loader");
        this.logout.onclick=_=>{
            finishSession(data.client,_=>{
                window.history.back();
            });
        }
        this.codeinput = new TextInput("codefield","2FA Code","Secret Code",validType.nonempty,false,true);
        this.verify = getElement("verify");
        this.verify.onclick=_=>{
            if(!this.codeinput.isValid()) return this.codeinput.validateNow();
            this.load();
            postJsonData(post.getAuthByClient(data.client),{
                action:action.verify,
                code:this.codeinput.getInput()
            }).then(res=>{
                if(res.event == code.OK|| res.event == code.auth.SESSION_INVALID){
                    return parent.location.reload();
                }
                this.load(false);
                this.codeinput.showError("Wrong authentication code");
            });
        }
        this.sendcode = getElement("sendcode");
        resumeElementRestriction(this.sendcode,'send2facode',_=>{
            this.sendcode.onclick=_=>{
                this.load();
                this.sendcode.innerHTML = "Sending..."
                postJsonData(post.admin.manage,{
                    type:"twofactor",
                }).then(res=>{
                    if(res.event == code.mail.MAIL_SENT){
                        this.load(false);
                        this.sendcode.onclick=_=>{};
                        restrictElement(this.sendcode,60*5,'send2facode',_=>{
                            parent.location.reload();
                        })
                    } else {
                        parent.location.reload();
                    }
                })
            }
            this.sendcode.click();
        });
        this.load(false);
    }
    load(isloading = true){
        visibilityOf(this.sendcode,!isloading);
        opacityOf(this.view,isloading?0.5:1);
        visibilityOf(this.loader,isloading);
        visibilityOf(this.verify,!isloading);
        this.codeinput.toggleInput(!isloading);
    }
}

class ReceiveData{
    constructor(){
        this.client = getElement('client').innerHTML;
        this.id = getElement("email").innerHTML;
        this.uid = getElement("uid").innerHTML;
        this.uiid = getElement("uiid").innerHTML;
        this.username = getElement("username").innerHTML;
    }
}

window.onload=_=>{
    theme.setNav();
    new TwoFactor();
}