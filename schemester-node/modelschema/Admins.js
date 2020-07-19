const mongoose = require('mongoose')
const Schema = mongoose.Schema
class Administrator{
    constructor(){
        this.collection = "0administrators";
        this.adminSchema = new Schema({
            username:{type:String, a:true},
            email:{type:String,unique: true, a:true},
            password:{type:String, a:true},
            uiid:{type:String, unique: true, a:true},
            createdAt:{type:Date, default:Date.now()},
            verified:{type:Boolean,default:false}
        });
    }
    getSchema(){
        return this.adminSchema;
    }
    getModel(){
        return mongoose.model(this.collection,this.getSchema());
    }
}

module.exports = new Administrator().getModel();