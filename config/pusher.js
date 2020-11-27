const Pusher = require("pusher"),{pusher} = require("./config.json"), {token} = require("./../workers/common/inspector");
module.exports = new Pusher({
    appId:pusher.appId,
    key: token.verify(pusher.secret),
    secret: token.verify(pusher.secret),
    cluster: pusher.cluster,
    useTLS: pusher.useTLS
});