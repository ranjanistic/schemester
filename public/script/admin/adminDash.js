//the admin dashboard script

/**
 * For daily working schedule.
 */
class Dashboard {
  constructor() {
    this.data = new ReceiveData()
    const todayview = getElement("todayview");
    class Today{
      constructor(){
        this.view = todayview;
        this.todayrefresh = getElement("todayrefresh")
        this.todaywork = getElement("todayworkview");
        this.todayteachers = getElement("todayteachersview");
        this.todayclasses = getElement("todayclassesview");
        // this.loader();
        this.todayrefresh.onclick=_=>{
          this.loader();
          new Today();
        };
        clog("posting");
        postJsonData(post.admin.dashboard,{
          target:post.admin.target.today,
          action:post.admin.action.fetch,
        }).then(response=>{
          clog(response);
          this.loader(false);
          if(response.timings.daysInWeek.includes(new Date().getDay())){
            const teachers = response.teachers;
            this.todaywork.innerHTML = 
            `<div class="fmt-row" id="todayclassesview" >
            <span class=" positive questrial">Classes affected
            <button class="active-button caption fmt-right" id="autoarrange">Auto arrange</button>
            </span>
            <div id="classlist">
            </div>
          </div>
            <div class="fmt-row" id="todayteachersview" >
              <span class=" positive questrial">Absent teachers</span>
              <div id="teacherlist">
              </div>
            </div>
            `;
            let teacherlist = constant.nothing;
            let classeslist = teacherlist;
            let affectedclasses = [];
            teachers.forEach((teacher)=>{
              let absentperiods = [];
              teacher.periods.forEach((period,p)=>{
                if(teacher.absent){
                  period['p'] = p;
                  affectedclasses.push(period);
                }else if(!period.hold){
                  absentperiods.push(p);
                  period['p'] = p;
                  affectedclasses.push(period);
                }
              });
              if(teacher.absent){
                teacherlist +=`
                <div class="fmt-row neutral-button" style="margin:4px 0">
                  ${teacher.teacherID} is absent today.
                </div>`
              }
              if(absentperiods.length){
                if(!teacher.absent){
                  teacherlist +=`
                  <div class="fmt-row neutral-button" style="margin:4px 0">
                    ${teacher.teacherID} is absent for ${absentperiods.length} periods.
                  </div>`;
                }
              }
            });
            if(!affectedclasses.length){
              return this.noproblems();
            }else {
              getElement("teacherlist").innerHTML=teacherlist;
              let arranges = [];
              affectedclasses.forEach((period,p)=>{
                  classeslist+= `
                  <div class="fmt-row neutral-button" style="margin:4px 0">
                    ${addNumberSuffixHTML(period.p+1)} period of ${period.classname} is vacant.
                    <button class="positive-button caption fmt-right" id="arrange${p}">Arrange</button>
                  </div>
                  `;
                  arranges.push({
                    period:period.p,
                    classname:period.classname
                  });
              });
              getElement("classlist").innerHTML=classeslist;
              let arrangebuttons = []
              affectedclasses.forEach((_,p)=>{
                arrangebuttons.push(getElement(`arrange${p}`));
                arrangebuttons[p].onclick=_=>{
                  const adialog = new Dialog();
                  adialog.setDisplay('',`Substitute for ${addNumberSuffixHTML(arranges[p].period+1)} period of class ${arranges[p].classname}`);
                  adialog.createInputs(Array('Substitute name or ID'),Array('This teacher will hold the class today'),Array('text'),Array(validType.nonempty));
                  adialog.createActions(['Set','Cancel'],[actionType.positive,actionType.neutral]);
                  adialog.transparent();
                  adialog.onButtonClick(Array(_=>{
                    if(!adialog.isValid()) return adialog.validateNow();
                    adialog.loader();
                    postJsonData(post.admin.dashboard,{
                      target:post.admin.target.today,
                      action:post.admin.action.update,
                      arrange:arranges[p]
                    }).then(resp=>{
                      if(resp.event == code.OK){
                        return adialog.hide();
                      }
                      adialog.loader(false);
                      switch(resp.event){
                        case code.auth.USER_NOT_EXIST:return adialog.inputField[0].showError('No such teacher',true);
                        default:snackBar('An error occurred','Report');
                      }
                    });
                  },_=>{
                    adialog.hide();
                  }));
                  adialog.show();
                }
              });
              getElement("autoarrange").onclick=_=>{
                const autodialog = new Dialog();
                autodialog.setDisplay('Auto arrange?','Are you sure you want schemester to arrange substitutes for you? This feature is experimental, and might fail to arrange.');
                autodialog.createActions(['Go ahead','Abort'],[actionType.positive,actionType.neutral]);
                autodialog.onButtonClick([_=>{
                  autodialog.loader();
                  snackBar('Please wait');
                  autodialog.setDisplay('Arranging...','Finding and assigning substitutes for today...');
                  //autoarrange;
                },_=>{
                  autodialog.hide();
                }]);
                autodialog.transparent();
                autodialog.show();
              };
            }
          }else {
            this.noschedule();
          }
        }).catch(e=>{
          this.loader(false);
          this.errorview(navigator.onLine?e:'Check you connection');
        });
      }
      loader(show = true){
        this.todaywork.innerHTML = show?`<div class="fmt-row fmt-center fmt-spin-fast" id="todayloader" >
        <img src="/graphic/blueLoader.svg"/>
      </div>`:constant.nothing;
      }
      noproblems(){
        this.todaywork.innerHTML = `<div class="fmt-row fmt-center group-text">
          <br/>
          <img src="/graphic/elements/okicon.svg" width="70"/><br/><br/>
          Everyone is present today!
        </div>`;
      }
      noschedule(){
        this.todaywork.innerHTML = `<div class="fmt-row fmt-center group-text">
          <br/>
          <img src="/graphic/elements/okicon.svg" width="70"/><br/><br/>
          No schedule for today.
        </div>`;
      }
      errorview(e){
        this.todaywork.innerHTML = `<div class="fmt-row fmt-center group-text">
        <br/>
        <img src="/graphic/elements/warnicon.svg" width="70"/><br/><br/>
          ${e}.
        </div>`;
      }
    }
    this.today = new Today();
  };
};

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
        let bodyview = receivedclasses.length?`<center>${receivedclasses.length} unique classes found. 
          Rename classes, or edit the duplicate classes and rename them as actual ones, then continue.</center>
          <br/>
          <div class="fmt-col">`:`No schedule is available of any teacher.`;
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
                validType.nonempty,
                `classcaption${c}`
              ),
              `editclass${c}`,
              `classname${c}`,
              `saveclass${c}`,
              `undoclass${c}`,
              `loader${c}`
            )
          );
          this.classeditables[c].onSave((_) => {
            this.classeditables[c].validateInputNow();
            if (!this.classeditables[c].isValidInput()) return;
            this.classeditables[c].disableInput();
            if (
              this.classeditables[c].getInputValue().trim() ==
              this.classeditables[c].displayText()
            ) {
              return this.classeditables[c].clickCancel();
            }
            this.classeditables[c].load();
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
                this.classeditables[c].textInput.setFieldCaption(`Rename ${this.classeditables[c].getInputValue().trim()} as`);
                return this.classeditables[c].display();
              }
              switch (response.event) {
                case code.schedule.SCHEDULE_CLASHED:
                  return this.classeditables[c].textInput.showError(
                    `This change will clash period ${response.clash.targetperiod+1} on ${constant.weekdays[response.clash.targetday]} of
                    <a target="_blank" rel="noreferrer" href="${locate.admin.session}?target=${locate.admin.target.viewschedule}&type=${client.teacher}&teacherID=${response.clash.targetid}" id="changer${response.clash.targetid}">${response.clash.targetid}</a>
                    with <a target="_blank" rel="noreferrer" href="${locate.admin.session}?target=${locate.admin.target.viewschedule}&type=${client.teacher}&teacherID=${response.clash.id}" id="clash${response.clash.targetid}">${response.clash.id}</a>`);
                default:
                  return this.classeditables[c].textInput.showError("Error");
              }
            });
          });
        });

        this.classesDialog.createActions(
          Array(receivedclasses.length?"Continue":"View teachers", "Abort"),
          Array(actionType.positive, actionType.neutral)
        );
        this.classesDialog.onButtonClick(
          Array(
            receivedclasses.length?
            (_) => {
              this.classesDialog.loader();
              let finalClasses = Array();
              postJsonData(post.admin.schedule, {
                target: client.teacher,
                action: "receive",
                specific: "classes",
              })
              .then((response) => {
                receivedclasses = response.classes;
                new InchargeDialog(receivedclasses);
              })
            }:_=>{refer(locate.admin.session,{target:locate.admin.target.manage,section:locate.admin.section.users})},
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
    this.data = new ReceiveData();
    this.navicon = getElement("navicon");
    this.navicon.onclick = (_) => {
      relocate(locate.root, { client: client.admin });
    };
    this.reload = getElement("refresh");
    this.reload.onclick = (_) => {
      location.reload();
    };
    this.notifmenu = new Menu("notifications","notificationbutton");
    this.settingsmenu = new Menu("settingsmenu","settingsmenubutton");
    this.instname = getElement("instname");
    this.instname.onclick=_=>{refer(locate.admin.session,{target:locate.admin.target.manage,section:locate.admin.section.institute})};
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

    this.teacherrequests = getElement("teacherrequests");
    if(this.data.requstees){
    this.teacherrequests.onclick=_=>{
      loadingBox('Getting requests');
      postJsonData(post.admin.receivedata,{
        target:"pseudousers",
        specific:"teachers",
      }).then(teachers=>{
        if(teachers.event != code.NO){
          const requestDialog  = new Dialog();
          requestDialog.createActions(Array('Hide'),Array(bodyType.neutral));
          requestDialog.onButtonClick(Array(_=>{requestDialog.hide()}));
          let bodytext = `<center>${this.data.requstees} people have requested to join ${this.data.instname} as teacher.</center><br/>`;
          teachers.forEach((teacher,t)=>{
            if(teacher.verified){
              bodytext += `
              <div class="fmt-row tab-view" id="request${t}">
                <div class="fmt-col fmt-half group-text">
                  <div class="positive">${teacher.username}</div>
                  <div class="questrial">${teacher.id}</div>
                </div>
                <div class="fmt-col fmt-half caption">
                  <button class="fmt-right negative-button" id="reject${t}">Reject</button>
                  <button class="fmt-right positive-button" id="accept${t}">Accept</button>
                </div>
              </div>
              `;
            }
          })
          bodytext += `</div>`;
          requestDialog.setDisplay('Teacher requests',bodytext);
          const rejects = Array();
          const accepts = Array();
          teachers.forEach((teacher,t)=>{
            rejects.push(getElement(`reject${t}`));
            accepts.push(getElement(`accept${t}`));
            rejects[t].onclick=_=>{
              requestDialog.loader();
              postJsonData(post.admin.pseudousers,{
                target:"teachers",
                action:"reject",
                teacherID:teacher.id
              }).then(resp=>{
                if(resp.event == code.OK){
                  hide(getElement(`request${t}`));
                  snackBar(`Rejected ${teacher.username} (${teacher.id})`,null,false);
                }
                requestDialog.loader(false);
              });
            };
            accepts[t].onclick=_=>{
              requestDialog.loader();
              postJsonData(post.admin.pseudousers,{
                target:"teachers",
                action:"accept",
                teacherID:teacher.id
              }).then(resp=>{
                if(resp.event == code.OK){
                  hide(getElement(`request${t}`));
                  snackBar(`Accepted ${teacher.username} (${teacher.id})`);
                }
                requestDialog.loader(false);
              });
            };
          });
        };
      });
    };
  }

    let prevScrollpos = window.pageYOffset;
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
      getElement("resumeschedule").onclick =_=>{this.instname.click()}
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
    this.instname = getElement("instname").innerHTML;
    try{
      this.requstees = Number(getElement("requestees").innerHTML);
    }catch{

    }
    
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