const mongoose = require('mongoose')
const Schema = mongoose.Schema
class Admins{
    constructor(){
        this.adminschema = new Schema({
            username:String,
            email:{type:String,unique: true,required:true},
            password:{type:String,required:true},
            createdAt:{type:Date,default:Date.now()}
        });
    }
    getSchema(){
        return this.adminschema;
    }
    getModelOf(adminemailCollection){
        return mongoose.model("adminemailCollection",this.getSchema());
    }
}

module.exports = new Admins().getModelOf('a');