const MongoClient = require('mongodb').MongoClient;
const express = require('express');
const bodyParser= require('body-parser')
const mongoose = require('mongoose');
const app = express()
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
const url = 'mongodb+srv://ranjanistic:ggD2zo319tfQ6M8f@realmcluster.njdl8.mongodb.net/Schools?retryWrites=true&w=majority'

const Defaults = require('./models/Defaults.js');

mongoose.connect(url,{useNewUrlParser: true,useUnifiedTopology: true });
var db = mongoose.connection;

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
        res.render('index.ejs');
    });
})

db.on('error', err => {
    console.error('connection error:', err)
})
app.listen(3000,()=> {
    console.log('listening on 3000')
});

