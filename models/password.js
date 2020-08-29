const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema;

const passwordSchema = new mongoose.Schema({
    mail:{
        type:String,
        trim:true,
        required:true,
        maxlength:52,
    },oldpass:{
        type:String,
        trim:true,
        required:true,
        maxlength:32,
    },
    newpass:{
        type:String,
        trim:true,
        maxlength:32,
    },
    confirm:{
        type:String,
        trim:true,
        maxlength:32,
    }
},{timestamps:true});

module.exports = mongoose.model("Password",passwordSchema);