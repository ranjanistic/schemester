const express = require('express'),
    bodyParser = require('body-parser'),
    view = require('./hardcodes/views'),
    code = require('./hardcodes/events'),
    admin = require('./routes/admin'),
    teacher = require('./routes/teacher'),
    database = require("./config/db"),
    app = express();

// Initiate Mongo Server
database.getServer()
.then(db=>{
    console.log(`Connected: ${db.connection.name}`);  
})
.catch(error=>console.log(error));

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('public'));

app.use('/admin', admin);
app.use('/teacher',teacher);

app.get('/', (req,res)=>{
    const client = req.query.client?req.query.client:null;
    const data = {client:client}
    clog(data);
    res.render(view.loader,{data});
});
app.get('/home', (_req,res)=>{
    res.render(view.homepage);
});

app.get('/plans/',(_request,res)=>{
    res.render(view.plans);
});

const clog =(msg)=>console.log(msg);
app.get('/404', (_req, _res, next)=>{
    next();
});
app.get('/403', (_req, _res, next)=>{
    var err = new Error('not allowed!');
    err.status = 403;
    next(err);
});
app.get('/500', (_req, _res, next)=>{
    next(new Error('keyboard cat!'));
});

app.use((req, res, _next)=>{
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

app.use((err, _req, res)=>{
    res.status(err.status || 500);
    res.render('500', { error: err });
});

app.listen(3000, _=> {
    console.log('listening on 3000');
})