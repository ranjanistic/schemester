class Invitation{
    constructor(){
        this.acceptinvite = getElement('acceptInvitation');
        this.acceptinvite.addEventListener(click,this.acceptInvitation);
    }
    acceptInvitation(){
        
    }
}
window.onload =_=>{
    window.app = new Invitation();
}

//fetch works!!
let fetcher =_=>{
    let email = 'admin@testing.com',pass="123132!@##";
        fetch('/sampledata',{
            method: 'post',
            headers: {
              "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
            },
            body: `email=${email}&password=${pass}`
        })
        .then((res)=>res.json())
        .then((res)=>clog(res));
}