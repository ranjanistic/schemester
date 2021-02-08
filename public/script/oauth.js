window.onload=_=>{
    backRoot();
    new ThemeSwitch();
    if(getElement("session").innerHTML != 'true'){
        getElement("adminlogin").onclick=_=>{
            referParent(locate.admin.login,{
                nexturl:window.location.pathname
            });
        }
    } else{
        const clientType = getElement("client").innerHTML;
        const domain = getElement("domain").innerHTML.trim();
        const postpath = (_=>{
            switch(clientType){
                case client.admin:return post.admin.auth;
                case client.teacher:return post.teacher.auth;
                case client.student:return post.student.auth;
            }
        })();
        const loginpath = (_=>{
            switch(clientType){
                case client.admin:return locate.admin.login;
                case client.teacher:return locate.teacher.login;
                case client.student:return locate.student.login;
            }
        })();
        if(getElement("authorized").innerHTML != 'true'){
            getElement("reject").onclick=_=>{
                load();
                relocateParent(locate.root);
            }
            getElement("logout").onclick=_=>{
                load();
                finishSession(getElement("client").innerHTML,()=>{
                    referParent(loginpath,{
                        nexturl:window.location.pathname
                    });
                });
            }
            getElement("authorize").onclick=_=>{
                load();
                postJsonData(postpath,{
                    action:action.oauth,
                    domain:domain
                }).then((resp)=>{
                    if(resp.event==code.OK){
                        return relocateParent(`${getElement("tokenendpoint").innerHTML}${resp.token}`);
                    } else {
                        load(false)
                        alert("An error occured");
                    }
                });
            }
        } else {
            getElement("reject").onclick=_=>{
                load();
                relocateParent(locate.root);
            }
            getElement("deauthorize").onclick=_=>{
                load();
                postJsonData(postpath,{
                    action:action.oauth,
                    domain:domain,
                    deauthorize:true
                }).then((resp)=>{
                    if(resp.event==code.OK){
                        return window.location.reload();
                    }
                    load(false)
                    alert("An error occured");
                });
            }
            getElement("logout").onclick=_=>{
                load();
                finishSession(getElement("client").innerHTML,()=>{
                    referParent(loginpath,{
                        nexturl:window.location.pathname
                    });
                });
            }
            getElement("continue").onclick=_=>{
                load();
                postJsonData(postpath,{
                    action:action.oauth,
                    domain:domain
                }).then((resp)=>{
                    if(resp.event==code.OK){
                        return relocateParent(`${getElement("tokenendpoint").innerHTML}${resp.token}`);
                    }
                    alert("An error occured");
                });
            }
        }
    }
}

const load=(show=true)=>{
    visibilityOf(getElement("loader"),show);
    visibilityOf(getElement("actions"),!show);
    opacityOf(getElement("workbox"),show?0.5:1);
}