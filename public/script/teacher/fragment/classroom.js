
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
      return getElement("hidesection").onclick=_=>{
        parent.hideClassroom(true);
      }
    }
    localStorage.removeItem('hideclassroom');
    this.inchargeOf = getElement("inchargeOf");
    this.studentlist = getElement("studentslist");
    this.studentsview = getElement("studentsview");
    this.chooseclass = getElement("chooseclass");
    this.chooseclass.onclick=_=>{
      let viewbody = constant.nothing;
      this.data.otherclasses.forEach((Class,c)=>{
        viewbody+=`
        <div class="fmt-row fmt-center">
          <button class="half ${Class == this.data.classname?'active-button':'positive-button'}" id="classbutton${c}">${Class != this.data.classname?Class:`${Class} (yours) `}</button>
        </div>`;
      });
      const classchoose = new Dialog();
      classchoose.setDisplay('Choose class',`These are the classes you take in your schedule, choose anyone to view.<br/>${viewbody}`);
      let classbtns = [];
      this.data.otherclasses.forEach((_,c)=>{
        classbtns.push(getElement(`classbutton${c}`));
        classbtns[c].onclick=_=>{
          if(this.data.otherclasses[c] == this.data.classname){
            return parent.clickTab(2);
          }
          classchoose.loader();
          postJsonData(post.teacher.classroom,{
            target:'classroom',
            action:'receive',
            otherclass:this.data.otherclasses[c]
          }).then((resp)=>{
            const classroom = resp.classroom;
            this.inchargeOf.innerHTML = `<span class="positive">Classroom ${classroom.classname}</span>`;
            let listview = `
            <div class="group-text fmt-center">${classroom.inchargeID?classroom.inchargename:'No incharge assigned'}</div>
            ${classroom.inchargeID?'<div class="group-text positive fmt-center">${classroom.inchargeID}</div>':''}<br/>
            <input type="text" class="fmt-row dropdown-input fmt-padding-small wide" placeholder="Search among ${classroom.students.length} students" id="teacherSearch"/><br/><br/>`;
            if(!classroom.students.length){
              listview = `<div class="fmt-center group-text fmt-padding">
              No students yet.
              </div>`
            }else{
            classroom.students.forEach((stud,s)=>{
              listview += `<div class="fmt-row wide b-neutral fmt-padding" style="margin:4px 0px" id="studentslate${s}">
              <div class="fmt-col fmt-twothird group-text">
                <span class="positive" id="studentname${s}">${stud.username}</span><br/>
                <span class="questrial" id="studentmail${s}">${stud.id}</span><br/>
              </div>
            </div>`
            })}
            this.studentsview.innerHTML = listview;
            hide(this.invitestudents);
            classchoose.hide();
          })
        }
      });
      classchoose.createActions(['Hide']);
      classchoose.transparent();
      classchoose.onButtonClick([_=>{classchoose.hide()}]);
      classchoose.show();
    };
    this.invitestudents = getElement("invitestudents");
    this.invitestudents.onclick=_=>{
      this.linkGenerator();
    }
    this.students = Array();
    for(let s = 0;s<this.data.studentcount;s++){
      this.students.push(new Student(
        getElement(`studentmail${s}`).innerHTML,
        getElement(`studentname${s}`).innerHTML,
        getElement(`removestudent${s}`)
        ));
    }
    this.students.forEach((stud,s)=>{
      stud.removestudent.onclick=_=>{
        const removeconfirm = new Dialog();
        removeconfirm.setDisplay('Remove student?', `Are you sure you want to remove <span class="negative">${stud.studentName}</span> (${stud.studentID})?
        Their account will be removed from classroom ${this.data.classname}, and ${stud.studentName} <span class="negative">won't be able to access ${this.data.classname}</span>.`);
        removeconfirm.createActions(Array(`Remove ${stud.studentName}`,'No, abort'),Array(actionType.negative,actionType.neutral));
        removeconfirm.setBackgroundColor(colors.transparent);
        removeconfirm.setHeadingColor(colors.negative);
        removeconfirm.hideOnClickAnywhere(true);
        removeconfirm.onButtonClick(Array(
          _=>{
            removeconfirm.loader();
            postJsonData(post.teacher.classroom,{
              target:"classroom",
              action:"update",
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
        ));
        removeconfirm.show();
      }
    })
    
    this.studentrequests = getElement("studentrequests");
    if (this.data.requestees) {
      this.studentrequests.onclick = (_) => {
        loadingBox("Getting requests");
        postJsonData(post.teacher.classroom, {
          target: "pseudousers",
          action: "receive",
        }).then((students) => {
          if (students.event != code.NO) {
            const requestDialog = new Dialog();
            requestDialog.setBackgroundColor(colors.transparent);
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
                  action: "reject",
                  studentID: student.studentID,
                }).then((resp) => {
                  if (resp.event == code.OK) {
                    hide(getElement(`request${t}`));
                    parent.snackbar(
                      `Rejected ${student.username} (${student.id})`,
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
                  action: "accept",
                  studentID: student.studentID,
                }).then((resp) => {
                  if (resp.event == code.OK) {
                    hide(getElement(`request${t}`));
                    parent.snackbar(`Accepted ${student.username} (${student.id})`);
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

  linkGenerator = () => {
    loadingBox(
      true,
      "Generating Link",
      `A link is being created for your to share with students of class ${this.data.classname}`
    );
    postJsonData(post.teacher.classroom, {
      target:"invite",
      action:"create",
    }).then((response) => {
        if (
          response.event == code.invite.LINK_EXISTS ||
          response.event == code.invite.LINK_CREATED
        ) {
          const linkdialog = new Dialog();
          linkdialog.setDisplay(
            "Invitation Link",
            `<center><a target="_blank" rel="noreferrer" href="${response.link}">${response.link}</a>
            <br/>This Link will automatically expire on <b>${getProperDate(
              String(response.exp)
            )}</b><br/><br/>
          </center>`
          );
          linkdialog.createActions(
            ["Disable link", "Copy", "Hide"],
            [actionType.negative, actionType.positive, actionType.neutral]
          );
          linkdialog.onButtonClick(
            [
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
      target: "invite",
      action: "disable",
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
            Array("Create Link", "Abort"),
            Array(actionType.positive, actionType.negative)
          );
          nolinkdialog.onButtonClick(
            Array(
              (_) => {
                nolinkdialog.hide();
                this.linkGenerator();
              },
              (_) => {
                nolinkdialog.hide();
              }
            )
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
  constructor(studID,studName,remstud){
    this.classname = new ReceiveData().classname;
    this.studentID = studID;
    this.studentName = studName;
    this.removestudent = remstud;
  }
  message(message){
    postJsonData(post.teacher.classroom,{
      target:"classroom",
      action:"notify",
      studentID:this.studentID,
      message:message
    }).then((resp)=>{
      if(resp.event != code.OK){
        parent.snackbar('Unable to send','Try again');
      }
    });
  }
}

class ReceiveData{
    constructor(){
      this.otherclasses = getElement("otherclasses").innerHTML.split(',');
      this.hasclass = getElement("hasclassroom").innerHTML=='true';
      if(this.hasclass){
        this.classname = getElement("classname").innerHTML;
        this.studentcount = Number(getElement("totalstudents").innerHTML);
        try{
        this.requestees = getElement("requestees").innerHTML;
        }catch{

        }
      }
    }
}

window.onload = (_) => new Classroom();
