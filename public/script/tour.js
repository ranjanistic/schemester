window.onload=_=>{
    backRoot();
    theme.setNav(false);
    getElement("share").onclick=_=>{
      shareLinkAction(getElement("appname").innerHTML,getElement("site").innerHTML)
    }
}