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

    this.logout = getElement("logout");
    this.logout.onclick = (_) => {
      finishSession((_) => {
        relocateParent(locate.teacher.login, {
          email: localStorage.getItem("id"),
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
    if (Number(sessionStorage.getItem("linkin")) > 0) {
      opacityOf(this.forgotpass, 0.5);
      let time = Number(sessionStorage.getItem("linkin"));
      const timer = setInterval(() => {
        time--;
        sessionStorage.setItem("linkin", time);
        this.forgotpass.innerHTML = `Try again in ${time} seconds.`;
        if (Number(sessionStorage.getItem("linkin")) == 0) {
          clearInterval(timer);
          this.forgotpass.innerHTML = "Forgot password";
          opacityOf(this.forgotpass, 1);
          this.forgotpass.onclick = (_) => {
            this.sendForgotLink();
          };
        }
      }, 1000);
    } else {
      this.forgotpass.onclick = (_) => {
        this.sendForgotLink();
      };
    }

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
      Array(`Delete account`, "No, step back"),
      Array(actionType.negative, actionType.positive)
    );
    delconf.onButtonClick(
      Array(
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
      )
    );
    let time = 60;
    let timer = setInterval(() => {
      time--;
      delconf.getDialogButton(0).innerHTML = `Delete account (${time}s)`;
      if (time == 0) {
        clearInterval(timer);
        delconf.hide();
      }
    }, 1000);
  }
  sendForgotLink() {
    parent.linkSender().then((done) => {
      clog(done);
      if (done) {
        opacityOf(this.forgotpass, 0.4);
        this.forgotpass.onclick = (_) => {};
        let time = 120;
        sessionStorage.setItem("linkin", time);
        const timer = setInterval(() => {
          time--;
          sessionStorage.setItem("linkin", time);
          this.forgotpass.innerHTML = `Try again in ${time} seconds.`;
          if (Number(sessionStorage.getItem("linkin")) == 0) {
            clearInterval(timer);
            this.forgotpass.innerHTML = "Forgot password";
            opacityOf(this.forgotpass, 1);
            this.forgotpass.onclick=_=>{this.sendForgotLink()};
          }
        }, 1000);
      }
    });
  }
}
window.onload = (_) => new TeacherAbout();