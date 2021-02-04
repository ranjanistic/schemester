window.onload=_=>{
    new ThemeSwitch("darkmode")
    backRoot("backroot")
    theme.setNav();
    let search = new TextInput("searchfield","Type here","Search anything",validType.nonempty);
    search.setInput(getElement("query").innerHTML);
    let saction = getElement("searchaction")
    saction.onclick=_=>{
        search.validateNow();
        if(!search.isValid()) return;
        relocateParent(locate.search,{
            q:search.getInput().trim()
        });
    }
    search.input.addEventListener("keyup", (event)=>{
        if (event.keyCode === 13) {
            saction.click();
        }
    })
}