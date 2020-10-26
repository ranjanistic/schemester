parent.window.scrollTo(0, 0);
if(sessionStorage.getItem(key.fragment)!=locate.student.target.fragment.classroom){
  parent.clickTab(2);
}

class StudentClassRoom{
    constructor(){
      this.data = new ReceiveData();
      this.setupmenu = new Menu("setup", "setupbutton");
      this.commbtn = getElement("chatbutton");
      this.commbtn.onclick=_=>{
        referParent(locate.student.session,{
          target:locate.student.target.comms
        });
      }   
      this.chooseclass = getElement('chooseclass');
      this.joinclass = getElement('joinclass');
      this.chooseclass.onclick=_=>{
        let viewbody = constant.nothing;
        this.data.classes.forEach((Class,c)=>{
          viewbody+=`
          <div class="fmt-row fmt-center">
            <button class="half positive-button" id="classbutton${c}">${Class}</button>
          </div>`;
        });
        if(this.data.pseudoclasses.length){
          viewbody+=`<br/><div class="group-text fmt-center">Requested for</div>`;
          this.data.pseudoclasses.forEach((pClass,pc)=>{
            viewbody+=`
            <div class="fmt-row fmt-center">
              <button class="half warning-button" id="pclassbutton${pc}">${pClass}</button>
            </div>`;
          });
        }
        const classchoose = new Dialog();
        classchoose.setDisplay('Choose class',`<center>Your classrooms</center>${viewbody}`);
        if(this.data.pseudoclasses.length){
          let pclassbtns = [];
          this.data.pseudoclasses.forEach((pClass,pc)=>{
            pclassbtns.push(getElement(`pclassbutton${pc}`));
            pclassbtns[pc].onclick=_=>{
              parent.snackbar(`Withdraw request for ${pClass}?`,'Delete Request',false,_=>{
                classchoose.loader(0);
                parent.snackbar('Withdrawing...',false,false);
                postJsonData(post.student.classroom,{
                  action:"request",
                  specific:post.student.action.withdraw,
                  classname:pClass,
                }).then((response)=>{
                  if(response.event == code.OK){
                    classchoose.loader(false);
                    hide(pclassbtns[pc]);
                    return parent.snackbar(`Request deleted for ${pClass}`,'OK');
                  }
                  switch(response.event){
                    case code.NO:return parent.snackbar(`Couldn't delete request`,'Refresh',false,_=>{
                      parent.clickTab(2);
                    });
                    default:return parent.snackbar(response.event);
                  }
                }).catch(e=>{
                  parent.snackbar(e);
                })
              });
            }
          })
        }
        let classbtns = [];
        this.data.classes.forEach((Class,c)=>{
          classbtns.push(getElement(`classbutton${c}`));
          classbtns[c].onclick=_=>{
            relocate(locate.student.fragment,{
              fragment:locate.student.target.fragment.classroom,
              classname:Class
            });
          }
        });
        classchoose.transparent();
        classchoose.createActions(['Hide']);
        classchoose.onButtonClick([_=>{classchoose.hide()}]);
        classchoose.show();
      }
      this.joinclass.onclick=_=>{
        const reqdialog = new Dialog();
        reqdialog.setDisplay('Type classname','Provide the classname to request membership');
        reqdialog.createInputs(['Valid classname'],['A classname of your institute'],['text'],[validType.nonempty]);
        reqdialog.createActions(['Send Request','Cancel'],[actionType.positive,actionType.neutral]);
        reqdialog.validate();
        reqdialog.transparent();
        reqdialog.onButtonClick([_=>{
          if(!reqdialog.allValid()) return reqdialog.validateNow();
          reqdialog.loader();
          postJsonData(post.student.classroom,{
            action:"request",
            specific:post.student.action.join,
            classname:reqdialog.getInputValue(0).trim(),
          }).then((response)=>{
            if(response.event == code.OK){
              reqdialog.hide();
              return parent.snackbar(`Request sent to ${reqdialog.getInputValue(0)}`,'OK');
            }
            reqdialog.loader(false);
            switch(response.event){
              case code.inst.CLASS_NOT_FOUND:return reqdialog.showFieldError(0,'No such classroom exists');
              case code.inst.CLASS_EXISTS:return reqdialog.showFieldError(0,'Already requested or in the classroom');
              default:return parent.snackbar(response.event);
            }
          }).catch(e=>{
            parent.snackbar(e);
          })
        },_=>{reqdialog.hide()}]);
        reqdialog.show();
      }
    }
  }

class ReceiveData{
  constructor(){
    this.classname = getElement('classname').innerHTML;
    this.classes = getElement('classes').innerHTML.split(',');
    this.pseudoclasses = getElement('pseudoclasses').innerHTML.split(',');
    this.pseudoclasses = this.pseudoclasses.includes("")?[]:this.pseudoclasses;
  }
}
window.onload=_=>new StudentClassRoom();