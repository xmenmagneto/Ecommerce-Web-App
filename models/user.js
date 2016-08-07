var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');
var Schema = mongoose.Schema;

//=========================================
//The userSchema
//=========================================
var UserSchema = new Schema({
    email: {type: String, unique:true, lowercase:true}, //unique: can only be created one time
    password: String,
    facebook: String,
    tokens: Array,
    profile: {
        name: {type: String, default: ''},
        picture: {type: String, default: ''}
    },
    address: String,
    history: [{
        paid: {type: Number, default: 0},
        item: {type: Schema.Types.ObjectId, ref: 'Product'}
    }]
});

//=========================================
//Method: Hash the passwords
//=========================================
//pre is a built-in mongoose method
UserSchema.pre('save', function (next) {   //before saving newUser into database
    var user = this;  //this refers to userSchema
    //only hash pwd if it has been modified (or is new)
    //更新地址等信息, 然后save newUser, 并不会改变密码,不需要hash
    if (!user.isModified('password')) return next();
    bcrypt.genSalt(10, function (err, salt) {
        if(err) return next(err);
        // hash the password using our new salt
        bcrypt.hash(user.password, salt, null, function (err, hash) {
            if (err) return next(err);
            //overwrite the plaintext pwd with the hashed one
            user.password = hash;
            next();
        });
    });
});

//=========================================
//Method: compare pwd
//=========================================
//create a custom method
UserSchema.methods.comparePassword = function (password) { //the pwd typed in
  //bcrypt built-in method
  return bcrypt.compareSync(password, this.password);  //this.password 是存的hash
};




UserSchema.methods.gravatar = function (size) {
    if(!this.size) size = 200;
    if(!this.email) return 'http://www.codeproject.com/KB/GDI-plus/ImageProcessing2/img.jpg';
    var md5 = crypto.createHash('md5').update(this.email).digest('hex');
    return "https://gravatar.com/avatar/" + md5 + "?s=" + size + "&d=retro";
};



//export UserSchema, so other files can use it
module.exports = mongoose.model("User", UserSchema);
