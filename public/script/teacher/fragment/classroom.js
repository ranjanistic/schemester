class Classroom {
  constructor() {
    this.data = new ReceiveData();
    this.notifmenu = new Menu("notifications", "notificationbutton");
    this.setupmenu = new Menu("setup", "setupbutton");
    this.settings = getElement("classsetup");

    this.addstudent = getElement("addstudent");
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
    
    this.studentrequests = getElement("studentrequests");
    if (this.data.requestees) {
      this.studentrequests.onclick = (_) => {
        loadingBox("Getting requests");
        postJsonData(post.teacher.classroom, {
          target: "pseudousers",
          action: "receive",
        }).then((students) => {
        clog(students);
          if (students.event != code.NO) {
            const requestDialog = new Dialog();
            requestDialog.setBackgroundColor(colors.transparent);
            requestDialog.createActions(Array("Hide"), Array(bodyType.neutral));
            requestDialog.onButtonClick(
              Array((_) => {
                requestDialog.hide();
              })
            );
            let bodytext = `<center>These people have requested to join ${this.data.classname} as student.</center><br/>`;
            students.forEach((student, t) => {
              if (student.verified) {
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
              }
            });
            bodytext += `</div>`;
            requestDialog.setDisplay("Student requests", bodytext);
            const rejects = Array();
            const accepts = Array();
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
    postData(post.teacher.classroom, {
      target:"invite",
      action:"create",
    }).then((response) => {
        clog(response);
        if (
          response.event == code.invite.LINK_EXISTS ||
          response.event == code.invite.LINK_CREATED
        ) {
          const linkdialog = new Dialog();
          linkdialog.setDisplay(
            "Invitation Link",
            `<center><a href="${response.link}">${response.link}</a>
            <br/>This Link will automatically expire on <b>${getProperDate(
              String(response.exp)
            )}</b><br/><br/>
          </center>`
          );
          linkdialog.createActions(
            Array("Disable link", "Copy", "Hide"),
            Array(actionType.negative, actionType.positive, actionType.neutral)
          );
          linkdialog.onButtonClick(
            Array(
              (_) => {
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
            )
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
    clog("revoke link");
    postData(post.teacher.classroom, {
      target: "invite",
      action: "disable",
    })
      .then((response) => {
        if (response.event == code.invite.LINK_DISABLED) {
          clog("link disabled");
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
    this.removeconfirm = new Dialog();
    this.removeconfirm.setDisplay('Remove student?', `Are you sure you want to remove ${this.studentName} (${this.studentID})?
    Their account will be removed from classroom ${this.classname}.`);
    this.removeconfirm.createActions(Array(`Remove ${this.studentName}`,'No, abort'),Array(actionType.negative,actionType.neutral));
    this.removeconfirm.setBackgroundColor(colors.transparent);
    this.removeconfirm.onButtonClick(Array(
      _=>{
        this.removeconfirm.loader();
        this.remove();
      },
      _=>{
        this.removeconfirm.hide();
      }
    ))
    this.removestudent.onclick=_=>{
      this.removeconfirm.show();
    }
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
  remove(){
    postJsonData(post.teacher.classroom,{
      target:"classroom",
      action:"update",
      specific:"removestudent",
      studentID:this.studentID
    }).then((response)=>{
      if(response.event == code.OK){
        this.removeconfirm.hide();
        return parent.snackbar(`${this.studentName} was removed from ${this.classname}`);
      }
      alert(response.event);
    }).catch(e=>{
      clog(e);
    });
  }
}

class ReceiveData{
    constructor(){
      this.classname = getElement("classname").innerHTML;
      this.studentcount = Number(getElement("totalstudents").innerHTML);
      try{
      this.requestees = getElement("requestees").innerHTML;
      }catch{

      }
    }
}

window.onload = (_) => new Classroom();
