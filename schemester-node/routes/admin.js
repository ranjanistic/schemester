var express = require('express');
var router = express.Router();
const view = require('../hardcodes/views'),
auth = require('../workers/session')

router.get('/', function(req, res) {
    res.redirect('/admin/dash');
});

router.post('/', function(req, res) {
    res.send('POST handler for /admin route.');
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

module.exports = router;