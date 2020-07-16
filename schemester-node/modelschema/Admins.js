const mongoose = require('mongoose')
const Schema = mongoose.Schema
class Administrator{
    constructor(){
        this.collection = "0administrators";
        this.adminSchema = new Schema({
            username:{type:String, required:true},
            email:{type:String,unique: true, required:true},
            password:{type:String, required:true},
            uiid:{type:String, unique: true, required:true},
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