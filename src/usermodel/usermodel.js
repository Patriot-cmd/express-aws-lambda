const mongoose = require('../dbconnection/mongooseconnection'); // Erase if already required

// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema({
    fullname:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
    },
    phonenumber:{
        type:String,
        required:true,
        unique: true
    },
    favorites: {
        type:Array,
    }
});

//Export the model
module.exports = mongoose.model('user', userSchema);