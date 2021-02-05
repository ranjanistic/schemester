
parent.window.scrollTo(0, 0);
if(sessionStorage.getItem(key.fragment)!=locate.teacher.target.fragment.classroom){
  parent.clickTab(2);
}
class Classroom {
  constructor() {
    this.data = new ReceiveData();
    this.commbtn = getElement("chatbutton");
    this.commbtn.onclick=_=>{
      referParent(locate.teacher.session,{
        target:locate.teacher.target.comms
      });
    }
    this.notifmenu = new Menu("notifications", "notificationbutton");
    this.setupmenu = new Menu("setup", "setupbutton");
    this.settings = getElement("classsetup");
    if(!this.data.hasclass){
      getElement("settingslink").onclick=_=>{
        parent.getelement('settingstab').click();
      }
      return getElement("hidesection").onclick=_=>{
        parent.hideClassroom(true);
      }
    }
    localStorage.removeItem('hideclassroom');
    this.studentlist = getElement("studentslist");
    this.studentsview = getElement("studentsview");
    this.chooseclass = getElement("chooseclass");
    this.chooseclass.onclick=_=>{
      let viewbody = constant.nothing;
      this.data.otherclasses.forEach((Class,c)=>{
        viewbody+=`
        <div class="fmt-row fmt-center">
          <button class="half ${Class == sessionStorage.getItem('inchargeof')?'active-button':'positive-button'}" id="classbutton${c}">${Class != sessionStorage.getItem('inchargeof')?Class:`${Class} (yours) `}</button>
        </div>`;
      });
      const classchoose = new Dialog();
      classchoose.setDisplay('Choose class',`These are the classes you take in your schedule, choose anyone to view.<br/>${viewbody}`);
      let classbtns = [];
      this.data.otherclasses.forEach((Class,c)=>{
        classbtns.push(getElement(`classbutton${c}`));
        classbtns[c].onclick=_=>{
          classchoose.loader();
          return relocate(locate.teacher.fragment,{
            fragment:locate.teacher.target.fragment.classroom,
            classname:Class
          });
        }
      });
      classchoose.createActions(['Hide']);
      classchoose.transparent();
      classchoose.onButtonClick([_=>{classchoose.hide()}]);
      classchoose.show();
    };
    this.students = [];
    for(let s = 0;s<this.data.studentcount;s++){
      this.students.push(new Student(
        getElement(`studentmail${s}`).innerHTML,
        getElement(`studentname${s}`).innerHTML,
        getElement(`textstudent${s}`),
        this.data.other?null:getElement(`removestudent${s}`)
      ));
      this.students[s].textStud.onclick=_=>{
        referParent(locate.teacher.session,{
          target:locate.teacher.target.chatroom,
          personid:this.students[s].studentID
        });
      }
    }

    if(this.data.other) return;

    this.invitestudents = getElement("invitestudents");
    this.invitestudents.onclick=_=>{
      this.linkGenerator();
    }
    tryCalling(()=>{
      getElement("invitestudents1").onclick=_=>{
        this.linkGenerator();
      }
    });

    this.students.forEach((stud,s)=>{
      stud.removestudent.onclick=_=>{
        const removeconfirm = new Dialog();
        removeconfirm.setDisplay('Remove student?', `Are you sure you want to remove <span class="negative">${stud.studentName}</span> (${stud.studentID})?
        Their account will be removed from classroom, and ${stud.studentName} <span class="negative">won't be able to login into ${this.data.classname}</span>.`);
        removeconfirm.createActions([`Remove ${stud.studentName}`,'No, abort'],[actionType.negative,actionType.neutral]);
        removeconfirm.setBackgroundColor(colors.transparent);
        removeconfirm.setHeadingColor(colors.negative);
        removeconfirm.hideOnClickAnywhere(true);
        removeconfirm.onButtonClick([
          _=>{
            removeconfirm.loader();
            postJsonData(post.teacher.classroom,{
              target:"classroom",
              action:action.update,
              specific:"removestudent",
              studentID:stud.studentID
            }).then((response)=>{
              if(response.event == code.OK){
                removeconfirm.hide();
                parent.snackbar(`${stud.studentName} was removed from ${this.data.classname}`);
                return parent.clickTab(2);
              } else {
                throw response;
              }
            }).catch(e=>{
              clog(e);
              parent.snackbar(`${stud.studentName} was not removed.`,'Retry',false,_=>{
                removeconfirm.getDialogButton(0).click();
              });
            });
          },
          _=>{
            removeconfirm.hide();
          }
        ]);
        removeconfirm.show();
      }
    })
    
    this.studentrequests = getElement("studentrequests");
    if (this.data.requestees) {
      this.studentrequests.onclick = (_) => {
        loadingBox("Getting requests");
        postJsonData(post.teacher.classroom, {
          target: "pseudousers",
          action: action.receive,
        }).then((students) => {
          if (students.event != code.NO) {
            const requestDialog = new Dialog();
            requestDialog.transparent();
            requestDialog.createActions(["Hide"], [bodyType.neutral]);
            requestDialog.onButtonClick(
              [(_) => {
                requestDialog.hide();
              }]
            );
            let bodytext = `<center>These people have requested to join ${this.data.classname} as student.</center><br/>`;
            students.forEach((student, t) => {              
                bodytext += `
              <div class="fmt-row tab-view" id="request${t}">
                <div class="fmt-col fmt-half group-text">
                  <div class="positive">${student.username}</div>
                  <div class="questrial">${student.studentID}</div>
                </div>
                <div class="fmt-col fmt-half caption">
                  <button class="fmt-right negative-button" id="reject${t}">Reject</button>
                  <button class="fmt-right positive-button" id="accept${t}">Accept</button>
                </div>
              </div>
              `;
            });
            bodytext += `</div>`;
            requestDialog.setDisplay("Student requests", bodytext);
            const rejects = [];
            const accepts = [];
            students.forEach((student, t) => {
              rejects.push(getElement(`reject${t}`));
              accepts.push(getElement(`accept${t}`));
              rejects[t].onclick = (_) => {
                requestDialog.loader();
                postJsonData(post.teacher.classroom, {
                  target: "pseudousers",
                  action: action.reject,
                  studentID: student.studentID,
                }).then((resp) => {
                  if (resp.event == code.OK) {
                    hide(getElement(`request${t}`));
                    parent.snackbar(
                      `Rejected ${student.username} (${student.studentID})`,
                      null,
                      false
                    );
                  }
                  requestDialog.loader(false);
                });
              };
              accepts[t].onclick = (_) => {
                requestDialog.loader();
                postJsonData(post.teacher.classroom, {
                  target: "pseudousers",
                  action: action.accept,
                  studentID: student.studentID,
                }).then((resp) => {
                  if (resp.event == code.OK) {
                    hide(getElement(`request${t}`));
                    parent.snackbar(`Accepted ${student.username} (${student.studentID})`);
                  }
                  requestDialog.loader(false);
                });
              };
            });
          }
        });
      };
    }
  }

  linkGenerator(){
    loadingBox(
      true,
      "Generating Link",
      `A link is being created for your to share with students of class ${this.data.classname}`
    );
    postJsonData(post.teacher.classroom, {
      target:"invite",
      action:action.create,
    }).then((response) => {
      if (
        response.event == code.invite.LINK_EXISTS ||
          response.event == code.invite.LINK_CREATED
          ) {
          const linkdialog = new Dialog();
          linkdialog.setDisplay(
            "Invitation Link",
            `<center><a target="_blank" rel="noreferrer" href="${response.link}">${response.link}</a>
            <br/>Share with students to let them join your class. This Link will automatically expire on <b>${getProperDate(
              String(response.exp)
            )}</b><br/><br/>
          </center>`,
          true
          );
          new QRCode(getElement(linkdialog.imagedivId),response.link);
          linkdialog.createActions(
            ["Share" ,"Disable", "Copy", "Hide"],
            [actionType.positive, actionType.negative, actionType.positive, actionType.neutral]
          );
          linkdialog.onButtonClick(
            [
              ()=>{
                shareLinkAction('Student Invitation',response.link);
              },
              (_) => {
                linkdialog.loader(true);
                this.revokeLink();
              },
              (_) => {
                navigator.clipboard
                  .writeText(response.link)
                  .then((_) => {
                    parent.snackbar("Link copied to clipboard.");
                  })
                  .catch((err) => {
                    parent.snackbar(
                      "Failed to copy, please do it manually.",
                      'OK',
                      false
                    );
                  });
              },
              (_) => {
                linkdialog.hide();
              }
            ]
          );
          linkdialog.show();
        }
        switch (response.event) {
          case code.invite.LINK_EXISTS:
            return parent.snackbar("This link already exists and can be shared.");
          case code.invite.LINK_CREATED:
            return parent.snackbar("Share this with students of your class.");
          case code.invite.LINK_CREATION_FAILED:
            return parent.snackbar(
              `Unable to generate link:${response.msg}`,
              "Report"
            );
          default:
            return parent.snackbar(
              `Error:${response.event}:${response.msg}`,
              "Report"
            );
        }
      })
      .catch((error) => {
        clog(error);
        parent.snackbar(error);
      });
  };

  revokeLink() {
    postJsonData(post.teacher.classroom, {
      target: action.invite,
      action: action.disable,
    })
      .then((response) => {
        if (response.event == code.invite.LINK_DISABLED) {
          parent.snackbar("All links are inactive now.", null, false);
          const nolinkdialog = new Dialog();
          nolinkdialog.setDisplay(
            "Generate Link",
            `Create link to share with students of ${this.data.classname} institute, 
              so that they can join the classroom.`
          );
          nolinkdialog.createActions(
            ["Create Link", "Abort"],
            [actionType.positive, actionType.negative]
          );
          nolinkdialog.onButtonClick(
            [
              (_) => {
                nolinkdialog.hide();
                this.linkGenerator();
              },
              (_) => {
                nolinkdialog.hide();
              }
            ]
          );
          nolinkdialog.show();
        } else {
          parent.snackbar(`Link couldn't be disabled.`, "Try again", false, (_) => {
            this.revokeLink();
          });
        }
      })
      .catch((error) => {
        parent.snackbar(error);
      });
  }
}

class Student{
  constructor(studID,studName,message,remstud = null){
    this.studentID = studID;
    this.studentName = studName;
    this.textStud = message;
    this.removestudent = remstud;
  }
}

class ReceiveData{
    constructor(){
      this.other = getElement('other').innerHTML=='true';
      this.otherclasses = getElement("otherclasses").innerHTML.split(',');
      this.otherclasses = this.otherclasses=='false'?[]:this.otherclasses;
      this.hasclass = getElement("hasclassroom").innerHTML=='true';
      if(this.hasclass){
        this.classname = getElement("classname").innerHTML;
        if(!this.other){
          sessionStorage.setItem('inchargeof',this.classname);
        }
        this.studentcount = Number(getElement("totalstudents").innerHTML);
        try{
        this.requestees = getElement("requestees").innerHTML;
        }catch{

        }
      }
    }
}

window.onload = (_) => new Classroom();
