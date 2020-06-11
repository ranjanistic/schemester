const functions = require('firebase-functions');

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