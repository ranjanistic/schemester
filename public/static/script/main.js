
class Snackbar{
    constructor(bar,text,button,buttonText){
        this.bar = bar;
        this.text = text;
        this.button = button;
    }
    show(isNormal){
        this.bar.classList.replace('fmt-animate-bottom-off','fmt-animate-bottom');
        if(!isNormal){
            this.box.style.backgroundColor = "#1b2123"
        }
        this.bar.style.display = 'block';

    }
    hide(){
        this.bar.classList.replace('fmt-animate-bottom','fmt-animate-bottom-off');
    }
}

var snack = new Snackbar();
function showSnackBar(text = String(),buttonText = String(), isNormal = true){
    snack = new Snackbar(
        document.getElementById('snackBar'),document.getElementById('snackText'),
        document.getElementById('snackButton')
    );
    snack.text.textContent = text;
    snack.button.textContent = buttonText;
    snack.show(isNormal);
    snack.button.addEventListener('click',function(){
        hideSnackBar();
    },false)
}
function hideSnackBar(){
    snack.hide();
}