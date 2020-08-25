//the admin dashboard script

/**
 * For daily working schedule.
 */
class Dashboard {
  constructor() {
    this.dayInput = getElement("dayinput");
    this.dayDropdown = getElement("daydropdown");
    this.teacherChipToday = getElement("teacherRadioToday");
    this.classChipToday = getElement("classRadioToday");
    this.workboxtoday = getElement("workSectionToday");
    this.teacherBoxToday = getElement("teacherSectionToday");
    this.classBoxToday = getElement("classSectionToday");
    this.teacherSearchInput = getElement("teachersearchinput");
    this.teacherDropdown = getElement("teacherDropdown");
    this.dayInput.placeholder = getDayName(today.getDay());

    //classSearchInput = getElement('classsearchinput');
    //classDropdown = getElement('classDropdown');
    visibilityOf(this.workboxtoday, false);
    //visibilityOf(teacherBoxToday,false);
    this.classChipToday.addEventListener(click, (_) => {
      visibilityOf(this.workboxtoday, true);
      visibilityOf(this.teacherBoxToday, false);
      visibilityOf(this.classBoxToday, true);
    });
    this.teacherChipToday.addEventListener(click, (_) => {
      visibilityOf(this.workboxtoday, true);
      visibilityOf(this.classBoxToday, false);
      visibilityOf(this.teacherBoxToday, true);
    });

    this.dayInput.addEventListener(click, (_) => {
      visibilityOf(this.dayDropdown, false);
    });

    this.dayInput.oninput = (_) => {
      visibilityOf(this.dayDropdown, true);
      this.filterFunction(this.dayInput, this.dayDropdown);
    };
  }

  filterFunction = (input, dropdown) => {
    var input, filter, a;
    filter = input.value.toUpperCase();
    a = dropdown.getElementsByTagName("a");
    for (var i = 0; i < a.length; i++) {
      var txtValue = a[i].textContent || a[i].innerText;
      visibilityOf(a[i], txtValue.toUpperCase().indexOf(filter) > -1);
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        a[i].onclick = (_) => {
          input.value = txtValue;
          visibilityOf(this.dayDropdown, false);
        };
        break;
      }
    }
  };
}

/**
 * For if scheduling hasn't started yet.
 */
class NoDataView {
  constructor() {
    clog("NDV");
    this.data = new ReceiveData();
    this.addTeacher = getElement("addteacher");
    this.inviteTeacher = getElement("inviteteacher");
    this.addTeacher.addEventListener(click, (_) => {
      relocate(locate.admin.session, { target: "addteacher" });
    });
    this.inviteTeacher.addEventListener(click, (_) => {
      this.linkGenerator("teacher");
    });
    if (this.data.hasTeacherSchedule) {
      this.startSchedule = getElement("startScheduling");
      this.startSchedule.onclick = (_) => {
        loadingBox(
          true,
          "Extracting classes",
          "Finding unique classes among schedule of teachers..."
        );
        postJsonData(post.admin.schedule, {
          target: client.teacher,
          action: "receive",
          specific: "classes",
        })
          .then((response) => {
            new ConfirmClasses(response.classes);
          })
          .catch((e) => {
            clog(e);
            snackBar(e, "Report");
          });
      };
    }
  }

  linkGenerator = (target) => {
    clog("link generator");
    loadingBox(
      true,
      "Generating Link",
      `A link is being created for your to share with ${target}s of ${localStorage.getItem(
        "uiid"
      )} institute`
    );
    postData(post.admin.manage, {
      type: "invitation",
      action: "create",
      target: target,
    })
      .then((response) => {
        clog("link generate response");
        clog(response);
        if (
          response.event == code.invite.LINK_EXISTS ||
          response.event == code.invite.LINK_CREATED
        ) {
          clog("link generated box");
          let linkdialog = new Dialog();
          linkdialog.setDisplay(
            "Invitation Link",
            `<center><a href="${response.link}">${response.link}</a>
            <br/>This Link will automatically expire on <b>${getProperDate(
              String(response.exp)
            )}</b><br/><br/>
            <div class="switch-view" id="teachereditschedulecontainer">
              <span class="switch-text positive">Allow new teachers to add schedule?</span>
              <label class="switch-container">
                <input type="checkbox" id="teachereditschedule">
                <span class="switch-positive" id="teachereditscheduleview"></span>
              </label>
          </div>
          </center>`
          );
          this.allowteacherschedule = new Switch("teachereditschedule");
          postJsonData(post.admin.manage, {
            type: "preferences",
            action: "get",
            specific: "allowTeacherAddSchedule",
          }).then((allowTeacherAddSchedule) => {
            clog(allowTeacherAddSchedule);
            this.allowteacherschedule.turn(allowTeacherAddSchedule);
          });
          this.allowteacherschedule.onTurnChange(
            (_) => {
              postJsonData(post.admin.manage, {
                type: "preferences",
                action: "set",
                specific: "allowTeacherAddSchedule",
                allow: true,
              }).then((resp) => {
                this.allowteacherschedule.turn(resp.event == code.OK);
              });
            },
            (_) => {
              postJsonData(post.admin.manage, {
                type: "preferences",
                action: "set",
                specific: "allowTeacherAddSchedule",
                allow: false,
              }).then((resp) => {
                this.allowteacherschedule.turn(resp.event != code.OK);
              });
            }
          );
          linkdialog.createActions(
            Array("Disable Link", "Copy", "Done"),
            Array(actionType.negative, actionType.positive, actionType.neutral)
          );
          linkdialog.onButtonClick(
            Array(
              (_) => {
                this.revokeLink(target);
              },
              (_) => {
                navigator.clipboard
                  .writeText(response.link)
                  .then((_) => {
                    snackBar("Link copied to clipboard.");
                  })
                  .catch((err) => {
                    snackBar(
                      "Failed to copy, please do it manually.",
                      null,
                      false
                    );
                  });
              },
              (_) => {
                linkdialog.hide();
              }
            )
          );
          linkdialog.show();
        }
        switch (response.event) {
          case code.invite.LINK_EXISTS:
            return snackBar("This link already exists and can be shared.");
          case code.invite.LINK_CREATED:
            return snackBar("Share this with teachers of your institution.");
          case code.invite.LINK_CREATION_FAILED:
            return snackBar(
              `Unable to generate link:${response.msg}`,
              "Report"
            );
          default:
            return snackBar(
              `Error:${response.event}:${response.msg}`,
              "Report"
            );
        }
      })
      .catch((error) => {
        clog(error);
        snackBar(error);
      });
  };

  revokeLink(target) {
    clog("revoke link");
    postData(post.admin.manage, {
      type: "invitation",
      action: "disable",
      target: target,
    })
      .then((response) => {
        if (response.event == code.invite.LINK_DISABLED) {
          clog("link disabled");
          snackBar("All links are inactive now.", null, false);
          let nolinkdialog = new Dialog();
          nolinkdialog.setDisplay(
            "Generate Link",
            `Create a link to share with ${target}s of ${localStorage.getItem(
              "uiid"
            )} institute, 
          so that they can access and take part in schedule management.`
          );
          nolinkdialog.createActions(
            Array("Create Link", "Abort"),
            Array(actionType.positive, actionType.negative)
          );
          nolinkdialog.onButtonClick(
            Array(
              (_) => {
                nolinkdialog.hide();
                this.linkGenerator(target);
              },
              (_) => {
                nolinkdialog.hide();
              }
            )
          );
          nolinkdialog.show();
        } else {
          clog("disabled:false");
          snackBar(`Link couldn't be disabled.`, "Try again", false, (_) => {
            this.revokeLink(target);
          });
        }
      })
      .catch((error) => {
        snackBar(error);
      });
  }
}

/**
 * For setting up unique classes/batches before starting the schedule.
 */
class ConfirmClasses {
  constructor(receivedclasses) {
    clog("CCS");
    sessionStorage.clear();

    class InchargeDialog {
      constructor(receivedclasses) {
        this.receivedclasses = receivedclasses;
        let bodyview = `<center>Set incharge of each class, and then continue.</center>
          <br/>
          <div class="fmt-col">`;
        receivedclasses.forEach((Class, c) => {
          //each class row
          bodyview += `
          <div class="fmt-row fmt-padding" id="classrow${c}">
            <div class="tab-view" id="classview${c}">
              <span class="active" id="classname${c}">Class ${Class}</span>
              <button class="neutral-button caption fmt-right" id="editincharge${c}">Set Incharge</button>
            </div>
            <div id="inchargeeditor${c}">
              <fieldset class="fmt-row text-field" style="margin:0" id="inchargefield${c}" style="margin:0">
              <legend class="field-caption" style="font-size:16px" id="inchargecaption${c}">Incharge ID of class ${Class}</legend> 
              <input class="text-input" id="incharge${c}" style="font-size:20px" placeholder="Type teacher ID">
              <span class="fmt-right error-caption" id="inchargeerror${c}"></span>
              </fieldset>
              <img class="fmt-spin-fast" style="display:none" width="20" src="/graphic/blueLoader.svg" id="loader${c}"/>
              <button class="positive-button caption" id="saveincharge${c}">Set</button>
              <button class="negative-button caption" id="undoincharge${c}">Cancel</button>
            </div>
          </div>`;
        });
        bodyview += `</div>`;
        this.inchargeDialog = new Dialog();
        this.inchargeDialog.setDisplay("Set Incharges", bodyview);
        this.inchargeeditables = Array()
        receivedclasses.forEach((Class, c) => {
          this.inchargeeditables.push(
            new Editable(
              `classview${c}`,
              `inchargeeditor${c}`,
              new TextInput(
                `inchargefield${c}`,
                `incharge${c}`,
                `inchargeerror${c}`,
                validType.email
              ),
              `editincharge${c}`,
              `classname${c}`,
              `saveincharge${c}`,
              `undoincharge${c}`,
              `loader${c}`
            )
          );
          this.inchargeeditables[c].textInput.onTextInput(_=>{this.teacherpredictor(c)})
          this.inchargeeditables[c].onSave((_) => {
            this.inchargeeditables[c].validateInputNow();
            this.inchargeeditables[c].textInput.onTextInput(_=>{this.teacherpredictor(c)});
            if (!this.inchargeeditables[c].isValidInput()) return;
            this.inchargeeditables[c].disableInput();
            if (
              this.inchargeeditables[c].getInputValue().trim() ==
              this.inchargeeditables[c].displayText()
            ) {
              return this.inchargeeditables[c].clickCancel();
            }
            this.inchargeeditables[c].load();
            
            sessionStorage.setItem(Class,this.inchargeeditables[c].getInputValue().trim());
            this.inchargeeditables[c].setDisplayText(`Class ${Class} 
              <span class="positive">(${sessionStorage.getItem(Class)})</span>`
            );
            this.inchargeeditables[c].display();
            this.inchargeeditables[c].load(false);
          });
        });

        this.inchargeDialog.createActions(
          Array("Back", "Start schedule", "Abort"),
          Array(actionType.neutral, actionType.positive, actionType.negative)
        );
        this.inchargeDialog.onButtonClick(
          Array(
            (_) => {
              new ConfirmClasses(receivedclasses);
            },
            (_) => {
              this.inchargeDialog.loader();
              const data = [];
              receivedclasses.forEach((Class,c)=>{
                data.push({
                  classname:Class,
                  inchargeID:sessionStorage.getItem(Class),
                  students:[],
                });
              });
              postJsonData(post.admin.schedule, {
                target: client.student,
                action: "update",
                specific:"createclasses",
                classes:data,
              }).then((response) => {
                clog(response);
                if (response.event == code.schedule.SCHEDULE_CREATED) {
                  location.reload();
                } else {
                  this.inchargeDialog.loader(false);
                  snackBar('Classes not created: ' + response.event,'Report');
                }
              });
            },
            (_) => {
              this.inchargeDialog.hide();
            }
          )
        );
        this.inchargeDialog.show();
      }
      teacherpredictor=(c)=>{
        if (this.inchargeeditables[c].getInputValue() && this.inchargeeditables[c].getInputValue().trim()!='@' && this.inchargeeditables[c].getInputValue().trim()!='.' && this.inchargeeditables[c].getInputValue().trim() != constant.nothing) {
          postJsonData(post.admin.manage, {
            target: client.teacher,
            type: "search",
            q: this.inchargeeditables[c].getInputValue(),
          }).then((resp) => {
            if (resp.event == code.OK) {
              if(resp.teachers.length>0){
                snackBar(`${resp.teachers[0].teacherID}?`,'Yes',true,_=>{
                  this.inchargeeditables[c].textInput.setInput(resp.teachers[0].teacherID);
                });
              }
            }
          })
        } else {
          new Snackbar().hide();
        }
      }
    }

    class RenameDialog {
      constructor(receivedclasses) {
        this.receivedclasses = receivedclasses;
        let bodyview = `<center>${receivedclasses.length} unique classes found. 
          Rename classes, or edit the duplicate classes and rename them as actual ones, then continue.</center>
          <br/>
          <div class="fmt-col">`;
        receivedclasses.forEach((Class, c) => {
          //each class row
          bodyview += `
        <div class="fmt-row fmt-padding" id="classrow${c}">
          <div class="tab-view" id="classview${c}">
              <span id="classname${c}">${Class}</span>
              <button class="neutral-button caption fmt-right" id="editclass${c}">Rename</button>
          </div>
          <div id="classeditor${c}">
              <fieldset class="fmt-row text-field" style="margin:0" id="classfield${c}" style="margin:0">
              <legend class="field-caption" style="font-size:16px" id="classcaption${c}">Rename ${Class} as</legend> 
              <input class="text-input" id="class${c}" style="font-size:20px" placeholder="Actual class name">
              <span class="fmt-right error-caption" id="classerror${c}"></span>
              </fieldset>
              <img class="fmt-spin-fast" style="display:none" width="20" src="/graphic/blueLoader.svg" id="loader${c}"/>
              <button class="positive-button caption" id="saveclass${c}">Save</button>
              <button class="negative-button caption" id="undoclass${c}">Cancel</button>
          </div>
        </div>`;
        });
        bodyview += `</div>`;
        this.classesDialog = new Dialog();
        this.classesDialog.setDisplay("Confirm Classes", bodyview);
        this.classeditables = Array();
        receivedclasses.forEach((Class, c) => {
          this.classeditables.push(
            new Editable(
              `classview${c}`,
              `classeditor${c}`,
              new TextInput(
                `classfield${c}`,
                `class${c}`,
                `classerror${c}`,
                validType.nonempty
              ),
              `editclass${c}`,
              `classname${c}`,
              `saveclass${c}`,
              `undoclass${c}`,
              `loader${c}`
            )
          );
          this.classeditables[c].onSave((_) => {
            this.classeditables[c].load();
            this.classeditables[c].validateInputNow();
            if (!this.classeditables[c].isValidInput()) return;
            this.classeditables[c].disableInput();
            if (
              this.classeditables[c].getInputValue().trim() ==
              this.classeditables[c].displayText()
            ) {
              return this.classeditables[c].clickCancel();
            }
            postJsonData(post.admin.schedule, {
              target: client.teacher,
              action: "update",
              specific: "renameclass",
              oldclassname: this.classeditables[c].displayText(),
              newclassname: this.classeditables[c].getInputValue().trim(),
            }).then((response) => {
              clog(response);
              this.classeditables[c].load(false);
              if (response.event == code.OK) {
                this.classeditables[c].setDisplayText(
                  this.classeditables[c].getInputValue().trim()
                );
                this.classeditables[c].display();
                return;
              }
              switch (response.event) {
                case code.schedule.SCHEDULE_CLASHED:
                  return this.classeditables[c].textInput.showError("Clashed");
                default:
                  return this.classeditables[c].textInput.showError("Error");
              }
            });
          });
        });
        // this.setDefaultDialog();

        this.classesDialog.createActions(
          Array("Continue", "Abort"),
          Array(actionType.positive, actionType.neutral)
        );
        this.classesDialog.onButtonClick(
          Array(
            (_) => {
              this.classesDialog.loader();
              let finalClasses = Array();
              receivedclasses.forEach((rclass) => {
                finalClasses.push(rclass);
              });
              new InchargeDialog(finalClasses);
            },
            (_) => {
              this.classesDialog.hide();
            }
          )
        );
        this.classesDialog.show();
      }
    }
    new RenameDialog(receivedclasses);
  }
}

/**
 * To set up default elements and views, irrespective of scheduling status.
 */
class BaseView {
  constructor() {
    this.navicon = getElement("navicon");
    this.navicon.onclick = (_) => {
      relocate(locate.root, { client: client.admin });
    };
    this.reload = getElement("refresh");
    this.reload.onclick = (_) => {
      location.reload();
    };
    this.greeting = getElement("greeting");
    this.greeting.onclick=_=>{refer(locate.admin.session,{target:locate.admin.target.manage,section:locate.admin.section.institute})};
    this.logOut = getElement("logoutAdminButton");
    this.dateTime = getElement("todayDateTime");
    this.settings = getElement("settingsAdminButton");
    this.logOut.addEventListener(click, (_) => {
      showLoader();
      let email = localStorage.getItem(constant.sessionID);
      let uiid = localStorage.getItem("uiid");
      finishSession((_) => {
        relocate(locate.admin.login, {
          email: email,
          uiid: uiid,
          target: locate.admin.target.dashboard,
        });
      });
    });
    this.settings.addEventListener(click, (_) => {
      showLoader();
      refer(locate.admin.session, {
        u: localStorage.getItem(constant.sessionUID),
        target: locate.admin.target.settings,
        section: locate.admin.section.account,
      });
    });
    const prevScrollpos = window.pageYOffset;
    window.onscroll = (_) => {
      const currentScrollPos = window.pageYOffset;
      replaceClass(
        this.dateTime,
        "fmt-animate-opacity-off",
        "fmt-animate-opacity",
        prevScrollpos > currentScrollPos
      );
      prevScrollpos = currentScrollPos;
    };
    const today = new Date();
    this.dateTime.textContent = `${getDayName(today.getDay())}, ${getMonthName(
      today.getMonth()
    )} ${today.getDate()}, ${today.getFullYear()}, ${today.getHours()}:${today.getMinutes()}`;
    try{
      getElement("resumeschedule").onclick =_=>{this.greeting.click()}
    }catch{}
  }
}

/**
 * Receives data from static view page, generally sent via server.
 */
class ReceiveData {
  constructor() {
    clog("RCVD");
    this.hasTeachers =
      getElement("hasTeachers").innerHTML == "true" ? true : false;
    this.hasTeacherSchedule =
      getElement("hasTeacherSchedule").innerHTML == "true" ? true : false;
  }
}

window.onload = (_) => {
  window.fragment = new BaseView();
  try {
    window.app = new NoDataView();
  } catch {
      window.app = new Dashboard();
  }
};
