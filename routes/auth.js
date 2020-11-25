const express = require("express"),
    auth = express.Router(),
    session = require("../workers/common/session"),
    {get,view, clog} = require("./../public/script/codes");

module.exports = (client) =>{
    auth.get("/login",(req,res)=>{
      const response = session.verify(req, session.getSecretByClient(client));
      clog(client);
      clog(view.getLoginViewByClient(client));
      if (!session.valid(response))
        return res.render(view.getLoginViewByClient(client), { autofill: req.query });
      let data = req.query;
      delete data["u"];
      return res.redirect(worker.toSession(response.user.id, data));
    });
    
    auth.get("/help",(req,res)=>{
    
    })
    
    auth.get("/2FA",(req,res)=>{
    
    })
    return auth;
}