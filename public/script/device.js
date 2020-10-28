/**
 * For client device related objects and methods.
 */
class Device{
    constructor(){
        
    }
    /**
     * Commits the passed function object after ensuring if notifications are allowed, and requests if not.
     * @param {Function} action A method requiring notification use.
     */
    onNotifyPermit(action=_=>{}){
        if ("Notification" in window){
            if(Notification.permission !== "granted") {
                Notification.requestPermission().then(permission=>{
                    if(permission === "granted"){
                        action();
                    }
                }).catch(e=>{
                    clog(e);
                })
            } else {
                action();
            }
        }
    }

    /**
     * Commits the passed function object after ensuring if audio is allowed, and requests if not.
     * @param {Function} action A method requiring audio use.
     */
    onAudioPermit(action=_=>{}){
        navigator.mediaDevices.getUserMedia({ audio: true })
        .then(function(stream) {
            action();
        })
        .catch(function(err) {
            console.log(err)
        });
    }

    /**
     * Commits the passed function object after ensuring if camera is allowed, and requests if not.
     * @param {Function} action A method requiring camera use.
     */
    onCamPermit(action=_=>{}){
        navigator.mediaDevices.getUserMedia({video:true })
        .then(function(stream) {
            action();
        })
        .catch(function(err) {
            console.log(err)
        });
    }
}
const device = new Device();