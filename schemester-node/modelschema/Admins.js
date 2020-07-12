const mongoose = require('mongoose')
const Schema = mongoose.Schema
class Administrator{
    constructor(){
        this.adminSchema = new Schema({
            username:{type:String, required:true},
            email:{type:String,unique: true, required:true},
            password:{type:String, required:true},
            uiid:{type:String, unique: true, required:true},
            createdAt:{type:Date, default:Date.now()}
        });
    }
    getSchema(){
        return this.adminSchema;
    }
    getModel(){
        return mongoose.model("0administrators",this.getSchema());
    }
}

module.exports = new Administrator().getModel();