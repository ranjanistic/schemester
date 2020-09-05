class Classrooms{
    constructor(){
        this.totalclasses = Number(getElement('totalclasses').innerHTML);
        this.classes = [];
        let c = 0;
        while(c<this.totalclasses){
            clog(c);
            this.classes.push(new Classes(
                getElement(`viewschedule${c}`),
                getElement(`classid${c}`,).innerHTML,
                getElement(`inchargeID${c}`),
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
        })
    }
}

class Classes{
    constructor(viewschedule,classid,inchargeID,setincharge){
        this.view = viewschedule;
        this.classID = classid;
        this.inchargeID = inchargeID;
        this.setincharge = setincharge;
    }

}

window.onload=_=>new Classrooms();