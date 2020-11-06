const Pusher = require("pusher"),{pusher,ssh} = require("./config.json"), jwt = require("jsonwebtoken");
module.exports = new Pusher({
    appId:pusher.appId,
    key: pusher.key,
    secret: jwt.verify(pusher.secret,ssh),
    cluster: pusher.cluster,
    useTLS: pusher.useTLS
});