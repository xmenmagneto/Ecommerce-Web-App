var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy; //local login
var FacebookStrategy = require('passport-facebook').Strategy;
var secret = require('../config/secret');  //user the info that facebook provides
var User = require('../models/user');
var async = require('async');
var Cart = require('../models/cart');


//=========================================
//serialize and deserialize
//=========================================
//only user ID is serialized to the session
//save user._id to resssion, req.session.passport.user = {id: '...'}
passport.serializeUser(function (user, done) {
    done(null, user._id);
});
//user.id is used to fetch the whole user object
passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
    //user object attaches to the request as req.user
        done(err, user);
    });
});

//=========================================
//middleware, name it as 'local-login'
//=========================================
passport.use('local-login', new LocalStrategy({
    usernameField: 'email',
    passwordField: "password",
    passReqToCallback: true
}, function (req, email, password, done) {
    User.findOne({email: email}, function (err, user) {
        if(err) return done(err);
        if(!user){ //user not exists
            return done(null, false, req.flash('loginMessage', 'No user has been found'));
        }
        if(!user.comparePassword(password)) { //wrong password
            return done(null, false, req.flash('loginMessage', 'Wrong password!'));
        }
        return done(null, user);
    });
}));


//=============================================
//facebook login middleware
//=============================================
//teach passport how to authenticate with facebook
passport.use(new FacebookStrategy(secret.facebook, function (token, refreshToken, profile, done) {
    User.findOne({facebook: profile.id}, function (err, user) {
        if(err) return done(err);
        if(user){  //if user exists or logged in
            return done(null, user);
        }else{ //the first time facebook user login
             async.waterfall([
                 //to create facebook user
                 function (callback) {
                     //the first time user login, creat new user object
                     var newUser = new User();
                     newUser.email = profile._json.email;
                     newUser.facebook = profile.id;
                     newUser.tokens.push({kind: 'facebook', token: token});
                     newUser.profile.name = profile.displayName;
                     newUser.profile.picture = 'https://graph.facebook.com/' + profile.id + '/picture?type=large';

                     newUser.save(function (err) {
                             if(err) throw err;
                             callback(err, newUser);
                     });
                 },

                 //为facebook user创建cart
                 function (newUser) {
                     var cart = new Cart();
                     cart.owner = newUser._id;
                     cart.save(function (err) {
                         if(err) return done(err);
                         return done(err, newUser);
                     });
                 }
             ]);
        }
    });
}));



//=============================================
//custom function to validate
//to check whether the user is logged in or not
//=============================================
exports.isAuthenticated = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
};


