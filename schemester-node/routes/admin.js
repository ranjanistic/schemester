const express = require('express'),
    router = express.Router(),
    view = require('../hardcodes/views'),
    auth = require('../workers/session');

router.get('/', function(req, res) {
    res.redirect('/admin/dash');
});

router.get('/register',(_request,res)=>{
    view.render(res,view.adminsetup);
});

router.get('/auth',(_request,res)=>{
    view.render(res,view.adminlogin);
});
router.get('/dash',(_request,res)=>{
    //if logged in
    view.render(res,view.admindash);
});

router.get('/manage',(_request,res)=>{
    view.render(res,view.adminsettings);
});

router.post("/auth/signup", async (req, res) => {
    const { email, password } = req.body;
    console.log(req.body);
    auth.createAdmin(email,password).then(result=>{
        console.log(result);
        res.send({event:[result]});
    });
});
  
router.post("/auth/login", async (req, res) => {
    const { email, password, uiid} = req.body;
    try {
        const user = await userService.authenticate(email, password);
        if(auth.loginAdmin){//logged in
            console.log(req.ip);//store ip address
            //relocate to 
        }
        res.json(user);
    } catch (err) {
        res.status(401).json({ error: err.message });
    }
});

router.post('/createInstitution',(req,res)=>{
    const register = require('../workers/registration.js');
    res.send(register.createInstitutionDefaults(req.body));
});

router.post('/invitation/teachers/generatelink',(req,response)=>{
    //todo: Generate only if expired. Check getMoment()<lastlinkdate equality from database.
    //also check if user has disabled previous link, in {req.query.revoked}, then create and send new link as follows.
    var linkdata = createInviteLink('priyanshuranjan88@gmail.com','mvmnoidab64b');
    console.log('new link:'+linkdata);
    response.json({linkdata});
});

router.get('/invitation/teachers*',(req,response)=>{
    console.log(req.query);
    var invite = getLinkData(req.query);
    if(invite==null){
        response.render('404');
    } else {
        console.log(invite.active+" in get");
        response.render(view.userinvitaion,{invite});
    }
});

router.post('/invitation/teachers/action',(req,res)=>{
    if(req.body.accepted){
        res.render(view.adminsettings);
    } else {
        res.render(view.loader);
    }
})

var createInviteLink = (email,uiid)=>{
    let id = String(email).split('@',1);
    let dom = String(email).split('@')[1];
    let exp = getTheMoment(true,7); // set exp time one week later
    return JSON.stringify({link:`http://localhost:3000/admin/invitation/teachers/?id=${id}&dom=${dom}&uiid=${uiid}&exp=${exp}`,time:[exp]});  
}
var getLinkData = (query)=>{
    let email = `${query.id}@${query.dom}`;
    console.log(getTheMoment(false)+'<'+parseInt(query.exp));
    let valid = getTheMoment(false)<parseInt(query.exp);
    if(isInvalidQuery(query)){
        return null;
    }
    //todo: let admin = getAdminNameFromDB(email); //admin name to be shown
    //match exp from server, return null if conflict.
    return {
        adminName:'Admin kumar',
        adminEmail:[email],     //for user to contact admin if !active, and other verification purposes if active.
        active:[valid],
        uiid:[query.uiid],//for creation of user email object in users document of institution, for teacher schedule.
        instituteName:'Institution of Example',
        exp:[query.exp]
    };
}
var getTheMoment = (stringForm = true,dayincrement = 0)=>{
    let d = new Date();
    let year = d.getFullYear();
    let month = d.getMonth()+1<10?`0${d.getMonth()+1}`:d.getMonth()+1;
    let date = d.getDate();
    let incrementedDate = date+dayincrement;
    if(daysInMonth(month,year)-incrementedDate<0){
        incrementedDate = incrementedDate-daysInMonth(month,year);
    }
    incrementedDate = incrementedDate<10?`0${incrementedDate}`:incrementedDate;
    let hour = d.getHours()<10?`0${d.getHours()}`:d.getHours();
    let min = d.getMinutes()<10?`0${d.getMinutes()}`:d.getMinutes();
    let insts = d.getSeconds();
    let secs = insts<10?`0${insts}`:insts;
    let instm = d.getMilliseconds();
    let milli = instm<10?`00${instm}`:instm<100?`0${instm}`:instm;
    if(stringForm){
        return String(year) + String(month) + String(incrementedDate) + String(hour) + String(min)+String(secs)
        + String(milli);
    } else {
        return parseInt(String(year) + String(month) + String(incrementedDate) + String(hour) + String(min)+String(secs)
        + String(milli));
    }
}
var isLeap = (year)=> new Date(year, 1, 29).getMonth() == 1;
var daysInMonth = (month, year)=> new Date(year, month, 0).getDate();
var isInvalidQuery = (query)=> query.id == null||query.dom==null||query.exp==null||query.uiid==null ||query.id == ''||query.dom==''||query.exp==''||query.uiid=='';

module.exports = router;