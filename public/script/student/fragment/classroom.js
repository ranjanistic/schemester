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
      this.chooseclass.onclick=_=>{
        let viewbody = constant.nothing;
        this.data.classes.forEach((Class,c)=>{
          viewbody+=`
          <div class="fmt-row fmt-center">
            <button class="half positive-button" id="classbutton${c}">${Class}</button>
          </div>`;
        });
        clog(this.data.pseudoclasses.length);
        if(this.data.pseudoclasses.length){
          viewbody+=`<div class="group-text fmt-center">Requested for</div>`;
          this.data.pseudoclasses.forEach((pClass,pc)=>{
            viewbody+=`
            <div class="fmt-row fmt-center">
              <button class="half positive-button" id="pclassbutton${pc}">${pClass}</button>
            </div>`;
          });
        }
        const classchoose = new Dialog();
        classchoose.setDisplay('Choose class',`<center>Your classrooms</center>${viewbody}`);
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
    }
  }

class ReceiveData{
  constructor(){
    this.classname = getElement('classname').innerHTML;
    this.classes = getElement('classes').innerHTML.split(',');
    this.pseudoclasses = getElement('pseudoclasses').innerHTML.split(',');
    this.pseudoclasses = this.pseudoclasses.includes("")?[]:this.pseudoclasses;
    clog(this.classes);
  }
}
window.onload=_=>new StudentClassRoom();