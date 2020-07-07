var express = require('express');
var router = express.Router();
const view = require('../hardcodes/views'),
auth = require('../workers/session');
const { response } = require('express');

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
})

router.get('/invitation/teachers*',(req,response)=>{
    console.log(req.query);
    console.log(getLinkData(req.query));
    var invite = getLinkData(req.query);
    if(invite==null){
        response.render('404');
    } else {
        //response.json(invite);
        //todo: render and json to script fetch simultaneously.
        response.render(view.userinvitaion,{invite});
    }
})

var createInviteLink = (email,uiid)=>{
    let id = String(email).split('@',1);
    let dom = String(email).split('@')[1];
    let exp = getTheMoment();
    //todo: set exp time one week later
    return `http://localhost:3000/admin/invitation/teachers/?id=${id}&dom=${dom}&uiid=${uiid}&exp=${exp}`;  
}
var getLinkData = (query)=>{
    let email = `${query.id}@${query.dom}`;
    console.log('new link:'+createInviteLink('priyanshuranjan88@gmail.com','mvmnoidab64b'));
    console.log(getTheMoment(false)+'<'+parseInt(query.exp));
    let valid = getTheMoment(false)<parseInt(query.exp);
    if(isInvalidQuery(query)){
        return null;
    }
    //todo: let admin = getAdminNameFromDB(email); //admin name to be shown
    return {
        //todo: adminName = [admin],
        adminemail:[email],     //for user to contact admin if !active, and other verification purposes if active.
        active:[valid],
        uiid:[query.uiid]       //for creation of user email object in users document of institution, for teacher schedule.
    };
}
var getTheMoment = (stringForm = true)=>{
    let d = new Date();
    if(stringForm){
        return String(d.getFullYear()) + String(d.getMonth()) + String(d.getDate()) + String(d.getHours()) + String(d.getMinutes())+String(d.getSeconds())
        + String(d.getMilliseconds());
    } else {
        return parseInt(String(d.getFullYear()) + String(d.getMonth()) + String(d.getDate()) + String(d.getHours()) + String(d.getMinutes())+String(d.getSeconds())
        + String(d.getMilliseconds()));
    }
}

var isInvalidQuery = (query)=>{
    return query.id == null||query.dom==null||query.exp==null||query.uiid==null ||query.id == ''||query.dom==''||query.exp==''||query.uiid=='';
}
module.exports = router;