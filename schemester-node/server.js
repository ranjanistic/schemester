const express = require('express'),
    bodyParser= require('body-parser'),
    mongoose = require('mongoose'),
    view = require('./hardcodes/views'),
    code = require('./hardcodes/events'),
    auth = require('./workers/session'),
    admin = require('./routes/admin'),
    teacher = require('./routes/teacher')
const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('public'));
app.use('/admin', admin);
app.use('/teacher',teacher);
//'mongodb+srv://ranjanistic:ggD2zo319tfQ6M8f@realmcluster.njdl8.mongodb.net/Schools?retryWrites=true&w=majority'
const mainurl = 'mongodb+srv://tempdbuser:sz58UgReMdMoDdBd@cluster0.zspfk.mongodb.net/Institutions?retryWrites=true&w=majority';
const localurl = 'mongodb://localhost/Institutions';
mongoose.connect(localurl, { useNewUrlParser: true , useUnifiedTopology: true });
const db = mongoose.connection;

app.get('/',(req,res)=>{
    view.render(res,view.loader);
});
app.get('/home', (req,res)=>{
    view.render(res,view.homepage);
});

app.get('/plans',(_request,res)=>{
    view.render(res,view.plans);
});


db.once('open', _ => {
  onDatabaseConnected();
});

db.on('error', err => {
  console.error('db connection error:', err);
});

var onDatabaseConnected = _=>{
    console.log('Database connected');
    
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

app.listen(3000, _=> {
    console.log('listening on 3000');
})

