const Pusher = require("pusher"),config = require("./config.json");
module.exports = new Pusher(config.pusherkeys);