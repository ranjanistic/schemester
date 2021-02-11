const {appname} = require("./config/config.js");
module.exports = {
    apps : [{
      name: appname,
      script: "./server.js",
      instances: "max",
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      }
    }]
}