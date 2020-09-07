class Verification {
  constructor() {
    this.view = getElement("workbox");
    value.backbluecovered = true;
    this.data = new ReceiveData();
    if (this.data.verified) {
      window.fragment = new Verified(this.data);
    } else if (this.data.expired) {
      window.fragment = new Expired(this.data);
    } else {
      this.loader = getElement("verifyLoader");
      hide(this.loader);
      this.sendlink = getElement("sendlink");
      this.check = getElement("checkverified");
      hide(this.check);
      this.later = getElement("later");
      if (this.data.client == client.admin) {
        this.deleteaccount = getElement("resetaccount");
        this.deleteaccount.onclick = (_) => {
          this.load();
          postJsonData(post.admin.self,{
            target:"account",
            action:code.action.ACCOUNT_DELETE,
          }).then(response=>{
            clog("theresponse");
            clog(response);
            if(response.event == code.OK){
              finishSession(_=>{
                this.view.innerHTML = `<div class="positive-button" onclick="relocate(locate.homepage)">Explore schemester<div>`;
                registrationDialog(true, null, this.data.uiid);
                this.load(false);
              });
            } else {
              snackBar('Try later','Report',false);
            }
          })
        };
      }
      this.later.onclick = (_) => {
        refer(locate.homepage);
      };
      this.sendlink.onclick = (_) => {
        this.sendVerificationLink();
      };
      this.check.onclick = (_) => {
        this.checkVerification();
      };
    }
  }
  load(show = true) {
    visibilityOf(this.sendlink, !show);
    visibilityOf(this.later, !show);
    if (this.data.client == client.admin) {
      visibilityOf(this.deleteaccount, !show);
    }
    visibilityOf(this.loader, show);
    opacityOf(this.view, show ? 0.5 : 1);
  }
  checkVerification() {
    this.load();
    let plink;
    switch(this.data.client){
      case client.admin:{
        postJsonData(post.admin.manage, {
          type: "verification",
          action: "check",
        }).then((response) => {
          if (response.event == code.verify.VERIFIED) {
            location.reload();
          } else {
            snackBar("Not yet verified", "Recheck", false, (_) => {
              this.check.click();
            });
          }
        });
      }break;
      case client.teacher:{
        postJsonData(post.teacher.manage, {
          type: "verification",
          action: "check",
        }).then((response) => {
          if (response.event == code.verify.VERIFIED) {
            location.reload();
          } else {
            snackBar("Not yet verified", "Recheck", false, (_) => {
              this.check.click();
            });
          }
        });
      }break;
      case client.student:{
        postJsonData(post.student.manage, {
          type: "verification",
          action: "check",
        }).then((response) => {
          if (response.event == code.verify.VERIFIED) {
            location.reload();
          } else {
            snackBar("Not yet verified", "Recheck", false, (_) => {
              this.check.click();
            });
          }
        });
      }
    }
    this.load(false);
  }
  sendVerificationLink() {
    this.load();
    snackBar(`Sending link to ${this.data.email}...`); //todo
    switch (this.data.client) {
      case client.admin:
        {
          postJsonData(post.admin.manage, {
            type: "verification",
            action: "send",
          })
            .then((response) => {
              clog(response);
              this.afterSend(response);
            })
            .catch((e) => {
              clog(e);
              this.load(false);
            });
        }
        break;
      case client.teacher:{
        postJsonData(post.teacher.manage, {
          type: "verification",
          action: "send",
        })
          .then((response) => {
            clog(response);
            this.afterSend(response);
          })
          .catch((e) => {
            clog(e);
            this.load(false);
          });
      }break;
      case client.student:{
        postJsonData(post.student.manage, {
          type: "verification",
          action: "send",
        })
          .then((response) => {
            clog(response);
            this.afterSend(response);
          })
          .catch((e) => {
            clog(e);
            this.load(false);
          });
      }break;
    }
  }
  afterSend(response) {
    if (response.event != code.mail.MAIL_SENT) {
      snackBar("Unable to send email", "Try again", false, (_) => {
        this.sendlink.click();
      });
    } else {
      this.load(false);
      snackBar(`Link sent to ${this.data.email}. Check your spam folder too!`);
      show(this.check);
      let t = 60;
      this.sendlink.innerHTML = `Retry in ${t} seconds`;
      this.sendlink.onclick = (_) => {
        snackBar("Wait", null, false);
      };
      opacityOf(this.sendlink, 0.5);
      let timer = setInterval(() => {
        t--;
        this.sendlink.innerHTML = `Retry in ${t} seconds`;
        if (t == 0) {
          clearInterval(timer);
          opacityOf(this.sendlink, 1);
          this.sendlink.innerHTML = `Send link to ${this.data.email}`;
          this.sendlink.onclick = (_) => {
            this.sendVerificationLink();
          };
        }
      }, 1000);
    }
  }
}

class Verified {
  constructor(data) {
    this.continuesession = getElement("continueSession");
    this.explore = getElement("explore");
    this.continuesession.onclick = (_) => {
      relocate(data.client==client.admin?locate.admin.session:data.client==client.teacher?locate.teacher.session:data.client == client.student?locate.student.session:locate.root);
    };
    this.explore.onclick = (_) => {
      relocate(locate.homepage);
    };
  }
}

class Expired {
  constructor(data) {
    this.returnback = getElement("returnhome");
    this.returnback.onclick = (_) => {
      relocate(locate.root);
    };
  }
}

class ReceiveData {
  constructor() {
    this.expired = getElement("expired").innerHTML ? true : false;
    this.verified = getElement("verified").innerHTML == "true" ? true : false;
    if(!this.expired){
        this.client = getElement("client").innerHTML;
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
window.onload = (_) => (window.app = new Verification());
