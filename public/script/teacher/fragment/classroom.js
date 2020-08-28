class Classroom {
  constructor() {
      this.data = new ReceiveData();
    this.notifmenu = new Menu("notifications", "notificationbutton");
    this.setupmenu = new Menu("setup", "setupbutton");
    this.settings = getElement("classsetup");

    const setup = new Dialog();
    setup.setDisplay(
      "Setup",
      `
            <div class="fmt-col fmt-center caption">
                <button class="positive-button" id="addstudent">Add student</button>
                <button class="active-button" id="invitestudent">Invite students</button>
            </div>
        `
    );
    setup.createActions(Array("Hide"), Array(actionType.neutral));
    appendClass(setup.actions, "caption");

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
                    snackBar(
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
                    snackBar(`Accepted ${student.username} (${student.id})`);
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
}

class ReceiveData{
    constructor(){
        this.classname = getElement("classname").innerHTML;
        try{
        this.requestees = getElement("requestees").innerHTML;
        }catch{}
    }
}

window.onload = (_) => new Classroom();
