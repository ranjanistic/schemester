class Classrooms{
    constructor(){
        this.settingsmenu = new Menu("settingsmenu","settingsmenubutton");
        this.darkmode = new Switch('darkmode');
        this.darkmode.turn(theme.isDark());
        this.darkmode.onTurnChange(_=>{theme.setDark()},_=>{theme.setLight()});
        this.totalclasses = Number(getElement('totalclasses').innerHTML);
        this.createclass = getElement("createclass");
        this.createclass.onclick=_=>{
            const addclass = new Dialog();
            addclass.setDisplay('Create Classroom','Set a class name and assign the incharge.');
            addclass.createInputs(['New classname','Class incharge'],['A unique classroom','Incharge ID'],['text','email'],[validType.nonempty,validType.email]);
            addclass.validate(0);
            addclass.validate(1);
            addclass.inputField[1].onTextInput(_=>{
                this.teacherpredictor(addclass.getInputValue(1).trim(),addclass.inputField[1]);
            })
            addclass.createActions(['Create','Cancel'],[actionType.positive,actionType.neutral]);
            addclass.onButtonClick([_=>{
                addclass.validateNow(0);
                addclass.validateNow(1);
                if(!addclass.isValid(0)||!addclass.isValid(1)) return;
                postJsonData(post.admin.users,{
                    target:client.student,
                    action:code.action.CREATE_NEW_CLASS,
                    newclassname:addclass.getInputValue(0).trim(),
                    inchargeID:addclass.getInputValue(1).trim()
                }).then(resp=>{
                    clog(resp);
                });

            },_=>{
                addclass.hide();
            }]);
            addclass.transparent();
            addclass.show();
        }
        this.classes = [];
        let c = 0;
        while(c<this.totalclasses){
            clog(c);
            this.classes.push(new Classes(
                getElement(`viewschedule${c}`),
                getElement(`classid${c}`,),
                getElement(`classname${c}`,),
                getElement(`inchargeid${c}`),
                getElement(`setincharge${c}`)
            ));
            c++;
        }
        this.classes.forEach((classtab)=>{
            clog(classtab.classID);
            classtab.view.onclick=_=>{
                refer(locate.admin.session, {
                    target: locate.admin.target.viewschedule,
                    type: client.student,
                    c: classtab.classID,
                });
            }
            try{
                classtab.setincharge.onclick=_=>{
                    const setincharge = new Dialog();
                setincharge.setDisplay('Set incharge',`Assign the incharge of ${classtab.classname}`);
                setincharge.createInputs(['Class incharge'],['Incharge ID'],['email'],[validType.email]);
                setincharge.validate(0);
                setincharge.inputField[0].onTextInput(_=>{
                    this.teacherpredictor(setincharge.getInputValue(0).trim(),setincharge.inputField[0]);
                });
                setincharge.createActions(['Set incharge','Cancel'],[actionType.positive,actionType.neutral]);
                setincharge.onButtonClick([_=>{
                    setincharge.validateNow(0);
                    if(!setincharge.isValid(0)) return;
                    postJsonData(post.admin.users,{
                        target:client.student,
                        action:code.action.SET_INCHARGE,
                        cid:classtab.classID,
                        newinchargeID:setincharge.getInputValue(0).trim()
                    }).then(resp=>{
                        clog(resp);
                        if(resp.event == code.OK){
                            return location.reload();
                        }
                        switch(resp.event){
                            case code.inst.INCHARGE_OCCUPIED:return snackBar(`${resp.inchargename} (${resp.inchargeID}) is already an incharge of ${resp.iclassname}`,'Switch Incharge',true,_=>{
                                postJsonData(post.admin.users,{
                                    target:client.student,
                                    action:code.action.SET_INCHARGE,
                                    switchclash:true,
                                    cid:classtab.classID,
                                    newinchargeID:resp.inchargeID
                                }).then(resp=>{
                                    clog(resp);
                                    if(resp.event == code.OK){
                                        return location.reload();
                                    }
                                });
                            });
                        }
                    });

                },_=>{
                    setincharge.hide();
                }]);
                setincharge.transparent();
                setincharge.show();
                }
            }catch{
                classtab.inchargeID.onclick=_=>{
                    refer(locate.admin.session,{
                        target: locate.admin.target.viewschedule,
                        type: client.teacher,
                        teacherID: classtab.inchargeID.innerHTML,
                    });
                }
            }
        });
    }
    teacherpredictor(c, textInput){
        if (c && c!='@' && c!='.' && c != constant.nothing) {
          postJsonData(post.admin.manage, {
            target: client.teacher,
            type: "search",
            q: c,
          }).then((resp) => {
            if (resp.event == code.OK) {
              if(resp.teachers.length>0){
                snackBar(`${resp.teachers[0].username} (${resp.teachers[0].teacherID})?`,'Yes',true,_=>{
                  textInput.normalize();
                  textInput.setInput(resp.teachers[0].teacherID);
                });
              }
            }
          })
        } else {
          new Snackbar().hide();
        }
      }
}

class Classes{
    constructor(viewschedule,classid,classname,inchargeID,setincharge){
        this.view = viewschedule;
        this.classID = classid.innerHTML;
        this.classname = classname.innerHTML;
        this.inchargeID = inchargeID;
        this.setincharge = setincharge;
    }

}

window.onload=_=>new Classrooms();