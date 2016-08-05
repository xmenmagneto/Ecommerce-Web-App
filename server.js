var express = require('express'); //require express library
var morgan = require('morgan'); //log all the requests from users
var mongoose = require('mongoose');
var bodyParser = require('body-parser'); //take the body of your request and parse it into what the server will receive
var ejs = require('ejs');
var ejsMate = require('ejs-mate');
var session = require('express-session');
var cookieParser = require('cookie-parser');  //use cookie to store session ID
//cookie-parser parses cookies and put cookie info in request object
var flash = require('express-flash');
var MongoStore = require('connect-mongo/es5')(session);  //MongoStore depends on express-session
var passport = require('passport');


var secret = require('./config/secret');
var User = require('./models/user'); //requrie UserSchema
var Category = require('./models/category');


var cartLength = require('./middleware/middlewares');

var app = express();  //app is referring to express object






//connet mongoose to database
mongoose.connect(secret.database, function (err) {
   if (err) {
       console.log(err);
   }else {
       console.log('Connected to the database');
   }
});

//middleware
app.use(express.static(__dirname + '/public'));  //serve static files
app.use(morgan('dev'));  //invoke morgan object
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(session({
    resave: true, //force the session to be saved
    saveUninitialized: true,
    secret: secret.secretKey,
    store: new MongoStore({url: secret.database, autoReconnect: true})
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());


//every route will have the user object by default
app.use(function (req, res, next) {
    res.locals.user = req.user;
    next();
});


app.use(cartLength); //显示购物车商品总数


//create local variable
app.use(function (req, res, next) {
    Category.find({}, function (err, categories) {  //find all categories
        if(err) return next(err);
        res.locals.categories = categories;  //store found categories into local variable
        next();
    });
});


app.engine('ejs', ejsMate);  //use ejs-mate engine
app.set('view engine', 'ejs');

var mainRoutes = require('./routes/main');
var userRoutes = require('./routes/user');
var adminRoutes = require('./routes/admin');
var apiRoutes = require('./api/api');


app.use(mainRoutes);
app.use(userRoutes);
app.use(adminRoutes);
app.use('/api', apiRoutes);


app.listen(secret.port, function (err) {  //listen on port
    if(err) throw err;
    console.log('Server is running on port ' + secret.port);
});