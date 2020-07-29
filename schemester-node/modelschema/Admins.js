//const mongoose = require('mongoose');
//const Schema = mongoose.Schema;
const database = require("../config/db");
class Administrator{
    constructor(){
        this.Admin = database.collection('0administrators');
        //console.log(this.Admin.collectionName);
        // this.collection = "0administrators";
        // this.adminSchema = new Schema({
        //     username:{type:String},
        //     email:{type:String,unique: true},
        //     password:{type:String},
        //     uiid:{type:String, unique: true},
        //     createdAt:{type:Date, default:Date.now()},
        //     verified:{type:Boolean,default:false},
        //     vlinkexp:{type:Number,default:0}
        // });
    }
    // getSchema(){
    //     return this.adminSchema;
    // }
    // getModel(){
    //     return mongoose.model(this.collection,this.getSchema());
    // }
}

module.exports = new Administrator().Admin;