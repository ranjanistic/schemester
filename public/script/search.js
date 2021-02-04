window.onload=_=>{
    new ThemeSwitch("darkmode")
    backRoot("backroot")
    theme.setNav();
    let search = new TextInput("searchfield","Type here","Search anything",validType.nonempty);
    search.setInput(getElement("query").innerHTML);
    getElement("searchaction").onclick=_=>{
        search.validateNow();
        if(!search.isValid()) return;
        relocateParent(locate.search,{
            q:search.getInput().trim()
        });
    }
}