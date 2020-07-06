const express = require('express');
const router = express.Router();
const view = require('../hardcodes/views');

router.get('/', function(req, res) {
    res.redirect('/teacher/today')
});

router.get('/today', function(req, res) {
    view.render(res,view.forbidden);
});

router.post('/', function(req, res) {
    res.send('POST handler for /teacher route.');
});

module.exports = router;