parent.window.scrollTo(0, 0);
if(sessionStorage.getItem(key.fragment)!=locate.student.target.fragment.classroom){
    parent.clickTab(2);
  }
class StudentClassRoom{
    constructor(){
      this.commbtn = getElement("chatbutton");
      this.commbtn.onclick=_=>{
        referParent(locate.student.session,{
          target:locate.student.target.comms
        });
      }   
    }
}
window.onload=_=>new StudentClassRoom();