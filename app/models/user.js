var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var userSchema = new Schema({
    id: String,
	username: String,
	password: String,
	facebook: {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    },
     twitter          : {
         id           : String,
         token        : String,
         refresh_token: String,
         displayName  : String,
         username     : String
     }
    });

var User = mongoose.model('User', userSchema);

module.exports = User