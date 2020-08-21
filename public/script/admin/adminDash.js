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
          specific:"classes"
        }).then((response) => {
          new ConfirmClasses(response.classes);
        }).catch((e) => {
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
    postData("/admin/manage", {
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
            <label class="check-container">
              Teacher can add their schedule
              <input type="checkbox" id="teachercanaddschedule">
              <span class="tickmark-positive"></span>
            </label>.
          </center>`
          );
          const teacheradschedule = getElement("teachercanaddschedule");
          postJsonData(post.admin.manage,{
            type:"preferences",
            action:"get",
            preference:"allowTeacherAddSchedule",
          }).then((allow)=>{
            clog(allow);
            if(allow.event != code.NO){
              teacheradschedule.checked = allow.event;
            }
          })
          teacheradschedule.addEventListener(change, (_) => {
              postJsonData(post.admin.manage,{
                type:"preferences",
                action:"set",
                preference:"allowTeacherAddSchedule",
                allow:teacheradschedule.checked
              }).then(resp=>{
                if(resp.event != code.OK){
                  teacheradschedule.checked = !teacheradschedule.checked;
                }
              });
          });
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
                linkdialog.existence(false);
              }
            )
          );
          linkdialog.show();
        }
        switch (response.event) {
          case code.invite.LINK_EXISTS:
            {
              snackBar("This link already exists and can be shared.");
            }
            break;
          case code.invite.LINK_CREATED:
            {
              snackBar("Share this with teachers of your institution.");
            }
            break;
          case code.invite.LINK_CREATION_FAILED: {
            snackBar(`Unable to generate link:${response.msg}`, "Report");
          }
          default: {
            snackBar(`Error:${response.event}:${response.msg}`, "Report");
          }
        }
      })
      .catch((error) => {
        clog(error);
        snackBar(error);
      });
  };

  revokeLink(target) {
    clog("revoke link");
    postData("/admin/manage", {
      type: "invitation",
      action: "disable",
      target: target,
    })
      .then((response) => {
        clog("revoke link response");
        clog(response);
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
        clog(error);
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
        let bodyview = `<center>${this.receivedclasses.length} unique classes found. 
          Set incharges of each, and then continue.</center>
          <br/>
          <div class="fmt-col">`;
        this.receivedclasses.forEach((Class, cindex) => {
          //each class row
          bodyview += `<div class="fmt-row fmt-padding" id="classrow${cindex}">
        <div class="fmt-col sub-container fmt-padding active fmt-padding" id="classview${cindex}">
          <span class="fmt-padding">Class ${Class}<span>
          <button class="fmt-right positive-button" style="font-size:16px" id="addincharge${cindex}">Set incharge</button>
          </div>
        <div class="fmt-col" style="padding:0 12px" id="inchargeview${cindex}">
          <fieldset class="fmt-row text-field" id="inchargefield${cindex}" style="margin:0">
          <legend class="field-caption" style="font-size:14px" id="inchargecaption${cindex}">Incharge of ${Class}</legend> 
          <input class="text-input" id="incharge${cindex}" style="font-size:18px" placeholder="Incharge ID">
          <span class="fmt-right error-caption" id="inchargeerror${cindex}"></span></fieldset>
        </div>
        <div class="fmt-row fmt-padding fmt-center" id="actionview${cindex}">
          <div class="fmt-col half" style="padding:0 4px">
            <button class="wide positive-button" style="font-size:16px" id="saveclass${cindex}">Save</button>
          </div>
          <div class="fmt-col half" style="padding:0 4px">
            <button class="wide negative-button" style="font-size:16px" id="undoclass${cindex}">Cancel</button>
          </div>
        </div>
      </div>`;
        });
        bodyview += `</div>`;
        this.inchargeDialog = new Dialog();
        this.inchargeDialog.setDisplay("Set Incharges", bodyview);
        this.classview = Array();
        this.inchargeField = Array();
        this.inchargeView = Array();
        this.addIncharges = Array();
        this.actionview = Array();
        this.saves = Array();
        this.undos = Array();
        this.receivedclasses.forEach((Class, cindex) => {
          this.classview.push(getElement(`classrow${cindex}`));
          this.inchargeView.push(getElement(`inchargeview${cindex}`));
          this.inchargeField.push(
            new TextInput(
              `inchargefield${cindex}`,
              `incharge${cindex}`,
              `inchargeerror${cindex}`,
              validType.nonempty
            )
          );
          this.addIncharges.push(getElement(`addincharge${cindex}`));
          this.actionview.push(getElement(`actionview${cindex}`));
          this.saves.push(getElement(`saveclass${cindex}`));
          this.undos.push(getElement(`undoclass${cindex}`));
        });

        this.setDefaultDialog();

        this.inchargeDialog.createActions(
          Array("Start schedule", "Abort"),
          Array(actionType.positive, actionType.neutral)
        );
        this.inchargeDialog.onButtonClick(
          Array(
            (_) => {
              this.inchargeDialog.loader();
              postJsonData(post.admin.schedule, {
                target: client.student,
                action: "setincharges",
                confirmed: true,
              }).then((response) => {
                clog(response);
                if(response.event == code.OK){
                  clog("class schedule created");
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
      setDefaultDialog() {
        this.hideClassIncharge();
        hideElement(this.saves);
        this.classview.forEach((Class, cindex) => {
          appendClass(Class, "fmt-half");
          appendClass(this.actionview[cindex], "fmt-half");
          this.addIncharges[cindex].onclick = (_) => {
            clog(`clicked${cindex}`);
            this.showClassIncharge(cindex);
          };
          this.undos[cindex].onclick = (_) => {
            clog(`clicked${cindex}`);
            hide(this.saves[cindex]);
            this.hideClassIncharge(cindex);
            sessionStorage.setItem(`class${cindex}incharge`,constant.nothing);
          };
          this.saves[cindex].onclick = (_) => {
            this.classview.forEach((Class, cindex) => {
              sessionStorage.setItem(
                `class${cindex}incharge`,
                this.inchargeField[cindex].getInput()
              );
            });
            this.inchargeDialog.getDialogButton(0).innerHTML = "Reload classes";
            this.inchargeDialog.getDialogButton(0).onclick = (_) => {
              this.inchargeDialog.loader();
              let data = Array();
              this.receivedclasses.forEach((rclass, rcindex) => {
                data.push({
                  classname: rclass,
                  incharge: sessionStorage.getItem(`class${rcindex}incharge`),
                });
              });
              postJsonData(post.admin.schedule, {
                target: client.student,
                action: "updateincharges",
                data,
              }).then((response) => {
                clog(response);
                if (response.event == code.OK) {
                  new NoDataView().startSchedule.click();
                }
              });
            };
          };
          this.inchargeField[cindex].onTextInput((_) => {
            visibilityOf(
              this.saves[cindex],
              this.inchargeField[cindex].getInput() != constant.nothing 
            );
          });
        });
      }
      hideClassIncharge(cindex = null) {
        hideElement(this.inchargeView, cindex, false);
        showElement(this.addIncharges, cindex, false);
        hideElement(this.undos, cindex, false);
        cindex != null
          ? this.inchargeField[cindex].setInput(constant.nothing)
          : this.inchargeField.forEach((field, _) =>
              field.setInput(constant.nothing)
            );
      }
      showClassIncharge(cindex = null) {
        showElement(this.inchargeView, cindex, false);
        hideElement(this.addIncharges, cindex, false);
        showElement(this.undos, cindex, false);
      }
    }

    class RenameDialog {
      constructor(receivedclasses) {
        this.receivedclasses = receivedclasses;
        let bodyview = `<center>${this.receivedclasses.length} unique classes found. 
          Rename classes, or edit the duplicate classes and rename them as actual ones, then continue.</center>
          <br/>
          <div class="fmt-col">`;
        this.receivedclasses.forEach((Class, cindex) => {
          //each class row
          bodyview += `<div class="fmt-row fmt-padding" id="classrow${cindex}">
        <div class="fmt-col sub-container fmt-padding active fmt-padding" id="classview${cindex}">
          <span class="fmt-padding">Class ${Class}<span>
          <button class="fmt-right positive-button" style="font-size:16px" id="renameclass${cindex}">Rename</button>
          </div>
        <div class="fmt-col" style="padding:0 12px" id="classrenameview${cindex}">
          <fieldset class="fmt-row text-field" id="classfield${cindex}" style="margin:0">
          <legend class="field-caption" style="font-size:14px" id="classcaption${cindex}">Rename ${Class} as</legend> 
          <input class="text-input" id="class${cindex}" style="font-size:18px" placeholder="Actual class name">
          <span class="fmt-right error-caption" id="classerror${cindex}"></span></fieldset>
        </div>
        <div class="fmt-row fmt-padding fmt-center" id="actionview${cindex}">
          <div class="fmt-col half" style="padding:0 4px">
            <button class="wide positive-button" style="font-size:16px" id="saveclass${cindex}">Save</button>
          </div>
          <div class="fmt-col half" style="padding:0 4px">
            <button class="wide negative-button" style="font-size:16px" id="undoclass${cindex}">Cancel</button>
          </div>
        </div>
      </div>`;
        });
        bodyview += `</div>`;
        this.classesDialog = new Dialog();
        this.classesDialog.setDisplay("Confirm Classes", bodyview);
        this.classview = Array();
        this.renameField = Array();
        this.renameView = Array();
        this.renames = Array();
        this.actionview = Array();
        this.saves = Array();
        this.undos = Array();
        this.receivedclasses.forEach((Class, cindex) => {
          this.classview.push(getElement(`classrow${cindex}`));
          this.renameView.push(getElement(`classrenameview${cindex}`));
          this.renameField.push(
            new TextInput(
              `classfield${cindex}`,
              `class${cindex}`,
              `classerror${cindex}`,
              validType.nonempty
            )
          );
          this.renames.push(getElement(`renameclass${cindex}`));
          this.actionview.push(getElement(`actionview${cindex}`));
          this.saves.push(getElement(`saveclass${cindex}`));
          this.undos.push(getElement(`undoclass${cindex}`));
        });

        this.setDefaultDialog();

        this.classesDialog.createActions(
          Array("Create classes", "Abort"),
          Array(actionType.positive, actionType.neutral)
        );
        this.classesDialog.onButtonClick(
          Array(
            (_) => {
              this.classesDialog.loader();
              let data = Array();
              this.receivedclasses.forEach((rclass, rcindex) => {
                data.push({
                  classname: rclass,
                  renamed: sessionStorage.getItem(`class${rcindex}renamed`),
                });
              });
              postJsonData(post.admin.schedule, {
                target: client.student,
                action: "createclasses",
                confirmed:true,
                data
              }).then((response) => {
                clog(response);
                if (response.event == code.OK) {
                  return new InchargeDialog(response.classes); 
                }
              });
            },
            (_) => {
              this.classesDialog.hide();
            }
          )
        );
        this.classesDialog.show();
      }
      setDefaultDialog() {
        this.hideClassRename();
        hideElement(this.saves);
        this.classview.forEach((Class, cindex) => {
          appendClass(Class, "fmt-half");
          appendClass(this.actionview[cindex], "fmt-half");
          this.renames[cindex].onclick = (_) => {
            clog(`clicked${cindex}`);
            this.showClassRename(cindex);
          };
          this.undos[cindex].onclick = (_) => {
            clog(`clicked${cindex}`);
            hide(this.saves[cindex]);
            this.hideClassRename(cindex);
            sessionStorage.setItem(`class${cindex}renamed`,constant.nothing);
          };
          this.saves[cindex].onclick = (_) => {
            this.classview.forEach((Class, cindex) => {
              sessionStorage.setItem(
                `class${cindex}renamed`,
                this.renameField[cindex].getInput()
                  ? this.renameField[cindex].getInput()
                  : this.receivedclasses[cindex]
              );
            });
            hide(this.saves[cindex]);
          };
          this.renameField[cindex].onTextInput((_) => {
            visibilityOf(
              this.saves[cindex],
              this.renameField[cindex].getInput() != constant.nothing
            );
          });
        });
      }
      hideClassRename(cindex = null) {
        hideElement(this.renameView, cindex, false);
        showElement(this.renames, cindex, false);
        hideElement(this.undos, cindex, false);
        cindex != null
          ? this.renameField[cindex].setInput(constant.nothing)
          : this.renameField.forEach((field, _) =>
              field.setInput(constant.nothing)
            );
      }
      showClassRename(cindex = null) {
        showElement(this.renameView, cindex, false);
        hideElement(this.renames, cindex, false);
        showElement(this.undos, cindex, false);
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
    this.logOut = getElement("logoutAdminButton");
    this.dateTime = getElement("todayDateTime");
    this.greeting = getElement("greeting");
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
      });
    });
    var prevScrollpos = window.pageYOffset;
    window.onscroll = (_) => {
      var currentScrollPos = window.pageYOffset;
      replaceClass(
        this.dateTime,
        "fmt-animate-opacity-off",
        "fmt-animate-opacity",
        prevScrollpos > currentScrollPos
      );
      prevScrollpos = currentScrollPos;
    };
    setTimeGreeting(this.greeting);
    var today = new Date();
    this.dateTime.textContent = `${getDayName(today.getDay())}, ${getMonthName(
      today.getMonth()
    )} ${today.getDate()}, ${today.getFullYear()}, ${today.getHours()}:${today.getMinutes()}`;
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
