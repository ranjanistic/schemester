//const functions = require('firebase-functions');
const express = require('express');
//const engines = require('consolidate');
//var hbs = require('handlebars');
//const admin = require('firebase-admin');
//var path = require('path');
const app = express();
//app.engine('hbs',engines.handlebars);
app.set('views','./views');
//const MongoClient = require('mongodb').MongoClient;
const bodyParser= require('body-parser')
const mongoose = require('mongoose');
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
//const url = 'mongodb+srv://ranjanistic:ggD2zo319tfQ6M8f@realmcluster.njdl8.mongodb.net/Schools?retryWrites=true&w=majority'
const url = 'mongodb+srv://tempdbuser:sz58UgReMdMoDdBd@cluster0.zspfk.mongodb.net/Institutions?retryWrites=true&w=majority'
const Defaults = require('./models/Defaults.js');
mongoose.connect(url,{useNewUrlParser: true,useUnifiedTopology: true });
var db = mongoose.connection;

// var serviceAccount = require("./schemester-firebase-adminsdk-gj5yx-f64cfd6fb3.json");
// var config = {
//     credential: admin.credential.cert(serviceAccount),
//     databaseURL: "https://schemester.firebaseio.com",
//     apiKey: "AIzaSyBLW5MynJe7wrITc3UhTDtO_6P-RvMkisA",
//     authDomain: "schemester.firebaseapp.com",
//     projectId: "schemester",
//     storageBucket: "schemester.appspot.com",
//     messagingSenderId: "763392707863",
//     appId: "1:763392707863:web:afd8883a09ce3070f97b52",
//     measurementId: "G-F2N1TNPSBV"
// }
// admin.initializeApp(config);

//firebase.initializeApp(config);
db.once('open',_=>{
    console.log('Database connected');
    // app.get('/saveDefaults',(req,res)=>{
    // })
    var defaults = mongoose.model('NIPSNOIDA',new Defaults().defaultSchema)
    const def = new defaults({
        defaults:{
            admin:{
                adminName:"Empajj",
                email:"someemail@com",
                phone:"34987394"
            },
            institute:{
                instituteName:"School of soe",
                uiid:"soeScholl",
                subscriptionTill:"9-12-2020 23:59",
                active:true
            },
            timings:{
                startTime:"0830",
                endTime:"1400",
                breakStartTime:"1045",
                startDay:"Monday",
                periodMinutes:45,
                breakMinutes:15,
                periodsInDay:6,
                daysInWeek:5
            }
    }
    })
    def.save((error,document)=>{
        if(error) console.error(error)
        console.log(document);
    })
    app.get('/',(req,res)=>{
        res.render('loader.ejs');
    });
})
db.on('error', err => {
    console.error('connection error:', err)
})

app.get('/',(_request,response) =>{
    response.render('loader.ejs');
});

//exports.app = functions.https.onRequest(app);

app.get('/home', (_request,response)=>{
    response.render('home.ejs');
});

app.get('/plans',(_request,response)=>{
    response.render('plans.ejs');
});

app.get('/admin/register',(_request,response)=>{
    response.render('admin/edit_detail');
});

app.get('/admin/auth',(_request,response)=>{
    response.render('admin/admin_login');
});

app.get('/admin/dash',(_request,response)=>{
    response.render('admin/admin_dash');
});

app.get('/admin/manage',(_request,response)=>{
    response.render('admin/management');
});

app.post('/confirm_subscription',async (request,response)=>{
    var collection = 'TestInstitute';
    
});


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
  

/** Need the following basic fucntions to-
 * 
 * Authenticate users of a collection using their credentials stored at firestore.
 * 
 * Watch for live data change in collection's data values by admin (in schedule and timetable) and
 * by teachers (if they'll take a class or not).
 * 
 * Get the details of absent teachers and show them on admin's dashboard with the period details,
 * and also show the teachers who are free on that particular day, and the classes affected because of that,
 * so that admin can reassign teachers for replacement of that day.
 * 
 * Further funtions will be discussed later.
 */