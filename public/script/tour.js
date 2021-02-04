window.onload=_=>{
    backRoot();
    theme.setNav(false);
    getElement("share").onclick=_=>{
        if (navigator.share) {
            navigator.share({
              title: getElement("appname").innerHTML,
              url: getElement("site").innerHTML
            }).then(() => {
              console.log('Thanks for sharing!');
            })
            .catch(console.error);
        } else {
            snackBar(`<a class="${bodyType.neutral}" target="_blank" href="${getElement("site").innerHTML}">${getElement("site").innerHTML}</a>`,false);
        }
    }
}