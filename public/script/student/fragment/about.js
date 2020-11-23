parent.window.scrollTo(0, 0);
if(sessionStorage.getItem('fragment')!=locate.student.target.fragment.settings){
  parent.clickTab(3);
}
class StudentAbout {
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
  
      this.logout = getElement("logout");
      this.logout.onclick = (_) => {
        finishSession(client.student,(_) => {parent.location.reload()});
      };
      this.name = new Editable(
        "studentnameview",
        "studentnameeditor",
        new TextInput(
          "studentnamefield",
          false,
          "",
          validType.name
        ),
        "editstudentname",
        "studentname",
        "savestudentname",
        "cancelstudentname"
      );
      this.name.onSave((_) => {
        this.name.validateInputNow();
        if (!this.name.isValidInput()) return;
        this.name.disableInput();
        if (this.name.getInputValue().trim() == this.name.displayText()) {
          return this.name.clickCancel();
        }
        postJsonData(post.student.self, {
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
      this.resetmail = getElement("resetemail");
      this.resetpass = getElement("resetpass");
      this.forgotpass = getElement("forgotpass");
      this.deleteaccount = getElement("deleteaccount");
      this.resetmail.onclick = (_) => {
        changeEmailBox(client.student);
      };
      this.resetpass.onclick = (_) => {
        authenticateDialog(client.student, (_) => {
          resetPasswordDialog(client.student, true,_=>{
            parent.snackbar('Your password was changed','OK');
          });
        });
      };
      resumeElementRestriction(this.forgotpass,"studentforgot",_=>{
        this.forgotpass.onclick = (_) => {
          this.sendForgotLink()
        };
      });
      this.deleteaccount.onclick = (_) => {
        authenticateDialog(
          client.student,
          (_) => {
            this.accountdeletion();
          },
          true,
          true
        );
      };
    }
    sendForgotLink(){
      this.forgotpass.onclick=_=>{};
      parent.linkSender().then(done=>{
        restrictElement(this.forgotpass,120,'studentforgot',_=>{
          this.forgotpass.onclick = (_) => {this.sendForgotLink()};
        });
      })
    }
    accountdeletion() {
      const delconf = new Dialog();
      delconf.setDisplay(
        "Delete?",
        `Are you sure you want to delete your Schemester account <b>${localStorage.getItem(
          key.id
        )}</b> permanently? The following consequencies will take place:<br/>
          <div>
          <ul>
          <li>You will not be able to recover your account forever.</li>
          <li>Your will be removed from your classroom and institution.</li>
          <li>If you will create a new account after this, you'll have to request again to join.</li>
          <li>Make sure you truly understand what your next step will lead to.</li>
          </ul><br/>
          <div class="active">If only your email address is changed, then you can <a onclick="changeEmailBox(client.student)">change your account email address</a>, rather than deleting it.</div>
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
            
          },
          (_) => {
            delconf.hide();
          }
        ]
      );
      
      restrictElement(delconf.getDialogButton(0),15,"studentdeleteacc",_=>{
        let time = 60;
        let timer = setInterval(() => {
          time--;
          delconf.getDialogButton(0).innerHTML = `Delete account (${time}s)`;
          if (time == 0) {
            delconf.hide();
            clearInterval(timer);
          }
        }, 1000);
        delconf.getDialogButton(0).onclick=_=>{
          delconf.loader();
          postJsonData(post.student.self, {
            target: "account",
            action: code.action.ACCOUNT_DELETE,
          }).then((response) => {
            if (response.event == code.OK) {
              relocateParent(locate.root);
            } else {
              delconf.loader(false);
              parent.snackbar("Action Failed");
            }
          });
        }
      })
    }
}

window.onload = (_) => new StudentAbout();
