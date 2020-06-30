const functions = require('firebase-functions');
const express = require('express');
const engines = require('consolidate');
var hbs = require('handlebars');
const admin = require('firebase-admin');

const app = express();
app.engine('hbs',engines.handlebars);
app.set('views','../public');
app.set('view engine','hbs');

var serviceAccount = require("./schemester-firebase-adminsdk-gj5yx-0158c5a06d.json");
admin.initializeApp({
credential: admin.credential.cert(serviceAccount),
databaseURL: "https://schemester.firebaseio.com"
});

async function getFirestore(){
    const firestore_con  = await admin.firestore();
    const writeResult = firestore_con.collection('TestInstitute').doc('Defaults')
    .get().then(doc => {
        if (!doc.exists){
            console.log('No such document!'); 
        }else{
            return doc.data();
        }
        return writeResult;
    }).catch(err => {
        console.log('Error getting document', err);
    })
}

app.get('/',async (_request,response) =>{
    var db_result = await getFirestore();
    response.render('loader',{db_result});
});

exports.app = functions.https.onRequest(app);

async function insertFormData(request){
    const writeResult = await admin.firestore().collection('sample').add({
    firstname: request.body.firstname,
    lastname: request.body.lastname
    }).then(() => {
        console.log("Document successfully written!");
        return 1;
    }).catch((error) => {
        console.error("Error writing document: ", error);
    });
}
app.post('/insert_data',async (request,response) =>{
    var insert = await insertFormData(request);
    response.sendStatus(200);
});

app.get('/home', (_request,response)=>{
    response.render('home');
});
app.get('/admin/register',(_request,response)=>{
    response.render('admin/edit_detail');
});
app.get('/admin/login',(_request,response)=>{
    response.render('admin/admin_login');
});
app.get('/admin/dash',(_request,response)=>{
    response.render('admin/admin_dash');
});
app.get('/admin/manage',(_request,response)=>{
    response.render('admin/management');
});
app.get('/404',(_request,response)=>{
    response.render('404');
});
app.get(/.*.hbs$/, (req, res) =>{
    res.render('404');
});

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

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