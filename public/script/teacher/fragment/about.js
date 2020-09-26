parent.window.scrollTo(0, 0);
if(sessionStorage.getItem('fragment')!=locate.teacher.target.fragment.about){
  parent.clickTab(3);
}
class TeacherAbout {
  constructor() {
    this.darkmode = new Switch("darkmode");
    this.darkmode.turn(theme.isDark());
    this.darkmode.onTurnChange(
      (_) => {
        theme.setDark();
      },
      (_) => {
        theme.setLight();
      }
    );
    getElement("themetab").onclick = (_) => {
      theme.switch();
      this.darkmode.change();
    };
    
      
    this.hideclassswitch = new Switch("hideclass");
    this.hideclassswitch.turn(localStorage.getItem('hideclassroom')?true:false);
    getElement("hideclassroom").onclick=_=>{
      this.hideclassswitch.change();
      this.hideclassswitch.isOn()?parent.hideClassroom():parent.showClassroom();
    }

    this.logout = getElement("logout");
    this.logout.onclick = (_) => {
      const email =  localStorage.getItem("id");
      finishSession(client.teacher,(_) => {
        relocateParent(locate.teacher.login, {
          email:email
        });
      });
    };
    this.name = new Editable(
      "teachernameview",
      "teachernameeditor",
      new TextInput(
        "teachernamefield",
        "teachernameinput",
        "teachernameerror",
        validType.name
      ),
      "editteachername",
      "teachername",
      "saveteachername",
      "cancelteachername"
    );
    this.name.onSave((_) => {
      this.name.validateInputNow();
      if (!this.name.isValidInput()) return;
      this.name.disableInput();
      if (this.name.getInputValue().trim() == this.name.displayText()) {
        return this.name.clickCancel();
      }
      postJsonData(post.teacher.self, {
        target: "account",
        action: code.action.CHANGE_NAME,
        newname: this.name.getInputValue().trim(),
      }).then((resp) => {
        if (resp.event == code.OK) {
          this.name.setDisplayText(this.name.getInputValue());
          this.name.display();
        } else {
          parent.snackbar("Unable to save");
        }
      });
    });

    this.backup = getElement("downloadschedule");
    resumeElementRestriction(this.backup,"backupschedule",_=>{
      this.backup.onclick=_=>{
        const backup = this.backup.onclick;
        this.backup.onclick=_=>{};
        parent.snackbar('Generating backup file...');
        postJsonData(post.teacher.schedule,{
          action:code.schedule.CREATE_BACKUP
        }).then(resp=>{
          parent.snackbar('Backup file generated. Save that file securely, and only provide that file to Schemester when required.');
          restrictElement(this.backup,60,"backupschedule",_=>{
            this.backup.onclick=backup;
          });
          refer(resp.url);
        }).catch(err=>{
          clog(err);
        })
      }
    });

    this.resetmail = getElement("resetemail");
    this.resetpass = getElement("resetpass");
    this.forgotpass = getElement("forgotpass");
    this.deleteaccount = getElement("deleteaccount");
    this.resetmail.onclick = (_) => {
      changeEmailBox(client.teacher);
    };
    this.resetpass.onclick = (_) => {
      authenticateDialog(client.teacher, (_) => {
        resetPasswordDialog(client.teacher, true,_=>{
          parent.snackbar('Your password was changed','OK');
        });
      });
    };
    resumeElementRestriction(this.forgotpass,"teacherforgot",_=>{
      this.forgotpass.onclick = (_) => {this.sendForgotLink()};
    });

    this.deleteaccount.onclick = (_) => {
      authenticateDialog(
        client.teacher,
        (_) => {
          this.accountdeletion();
        },
        true,
        true
      );
    };
  }
  accountdeletion() {
    const delconf = new Dialog();
    delconf.setDisplay(
      "Delete?",
      `Are you sure you want to delete your Schemester account <b>${localStorage.getItem(
        "id"
      )}</b> permanently? The following consequencies will take place:<br/>
        <div>
        <ul>
        <li>You will not be able to recover your account forever.</li>
        <li>Your will be removed from your institution.</li>
        <li>Your schedule however, will remain untouched (only administrator can delete that).</li>
        <li>Make sure you truly understand what your next step will lead to.</li>
        </ul><br/>
        <div class="active">If only your email address is changed, then you can <a onclick="changeEmailBox(client.teacher)">change your account email address</a>, rather than deleting it.</div>
        </div>`
    );
    delconf.setBackgroundColorType(bodyType.negative);
    delconf.createActions(
      [`Delete account`, "No, step back"],
      [actionType.negative, actionType.positive]
    );
    delconf.onButtonClick(
      [
        (_) => {
          delconf.loader();
          postJsonData(post.teacher.self, {
            target: "account",
            action: code.action.ACCOUNT_DELETE,
          }).then((response) => {
            if (response.event == code.OK) {
              relocateParent(locate.root);
            } else {
              parent.snackbar("Action Failed");
            }
          });
        },
        (_) => {
          delconf.hide();
        }
      ]
    );
    restrictElement(delconf.getDialogButton(0),15,"teacherdeleteacc",_=>{
      let time = 60;
      let timer = setInterval(() => {
        time--;
        delconf.getDialogButton(0).innerHTML = `Delete account (${time}s)`;
        if (time == 0) {
          clearInterval(timer);
          delconf.hide();
        }
      }, 1000);
    })
  }
  sendForgotLink() {
    this.forgotpass.onclick=_=>{};
    parent.linkSender().then((done) => {
      restrictElement(this.forgotpass,120,'teacherforgot',_=>{
        this.forgotpass.onclick = (_) => {this.sendForgotLink()};
      });
    });
  }
}
window.onload = (_) => new TeacherAbout();
