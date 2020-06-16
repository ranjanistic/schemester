
class Snackbar{
    constructor(bar,text,button){
        this.bar = bar;
        this.text = text;
        this.button = button;
    }

}


function showSnackBar(text = String(),buttonText = String(), isNormal = true,hasAction = false){
    var snack = new Snackbar(
        document.getElementById('snackBar'),document.getElementById('snackText'),
        document.getElementById('snackButton')
    );
    snack.text.textContent = text;
    snack.button.textContent = buttonText;
    if(!isNormal){
        snack.bar.style.backgroundColor = "#bb2123"
    } else {
        snack.bar.style.backgroundColor = "#216bf3"
    }
    if(!hasAction){
        snack.button.style.display = 'none';
    } else {
        snack.button.style.display = 'block';
    }
    snack.bar.classList.replace('fmt-animate-bottom-off','fmt-animate-bottom');
    snack.bar.style.display = 'block';
}
function hideSnackBar(){
    var snack = new Snackbar(
        document.getElementById('snackBar'),document.getElementById('snackText'),
        document.getElementById('snackButton')
    );
    snack.bar.classList.replace('fmt-animate-bottom','fmt-animate-bottom-off');
    snack.bar.style.display = 'none';
}