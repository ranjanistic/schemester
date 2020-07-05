const express = require('express');
const bodyParser= require('body-parser');
const mongoose = require('mongoose');
const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('public'));

const view = require('./hardcodes/views.js');
const code = require('./hardcodes/events.js');
const auth = require('./workers/session.js');

//'mongodb+srv://ranjanistic:ggD2zo319tfQ6M8f@realmcluster.njdl8.mongodb.net/Schools?retryWrites=true&w=majority'
const mainurl = 'mongodb+srv://tempdbuser:sz58UgReMdMoDdBd@cluster0.zspfk.mongodb.net/Institutions?retryWrites=true&w=majority';
mongoose.connect(mainurl, { useNewUrlParser: true , useUnifiedTopology: true });
const db = mongoose.connection;

app.get('/',(req,res)=>{
    renderView(res,view.loader);
});
app.get('/home', (req,res)=>{
    renderView(res,view.homepage);
});

app.get('/plans',(_request,res)=>{
    renderView(res,view.plans);
});

app.get('/admin/register',(_request,res)=>{
    renderView(res,view.adminsetup);
});

app.get('/admin/auth',(_request,res)=>{
    renderView(res,view.adminlogin);
});

db.once('open', _ => {
  onDatabaseConnected();
});

db.on('error', err => {
  console.error('db connection error:', err);
});

var onDatabaseConnected = _=>{
    console.log('Database connected');
    app.get('/admin/dash',(_request,res)=>{
        //if logged in
        renderView(res,view.admindash);
    });
    
    app.get('/admin/manage',(_request,res)=>{
        renderView(res,view.adminsettings);
    });

    app.post("/adminsignup", async (req, res) => {
        const { email, password } = req.body;
        auth.createAdmin(email,password).then(result=>{
            console.log(result);
        });
    });
      
    app.post("/adminlogin", async (req, res) => {
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

    app.post('/createInstitution',(req,res)=>{
        const register = require('./workers/registration.js');
        register.createInstitutionDefaults(req.body);
    })
}


app.get('/404', (req, res, next)=>{
    next();
});
app.get('/403', (req, res, next)=>{
var err = new Error('not allowed!');
err.status = 403;
next(err);
});
app.get('/500', (req, res, next)=>{
next(new Error('keyboard cat!'));
});
// Error handlers
app.use((req, res, next)=>{
res.status(404);
res.format({
    html: function () {
    res.render('404', { url: req.url })
    },
    json: function () {
    res.json({ error: 'Not found' })
    },
    default: function () {
    res.type('txt').send('Not found')
    }
})
});

app.use((err, req, res, next)=>{
res.status(err.status || 500);
res.render('500', { error: err });
});

var renderView= (res, viewname)=>{
    res.render(viewname);
}

app.listen(3000, _=> {
    console.log('listening on 3000');
})

