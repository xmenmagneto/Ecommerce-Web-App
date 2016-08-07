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
//MongoStore depends on express-session
//MongoStore is to store session on the server side
var MongoStore = require('connect-mongo/es5')(session);
var passport = require('passport');
var secret = require('./config/secret');
var User = require('./models/user'); //requrie UserSchema
var Category = require('./models/category');
var cartLength = require('./middleware/middlewares');
var app = express();  //app is referring to express object


//connet mongoose to database
mongoose.connect(secret.database, function (err) {
    if (err) console.log(err);
    console.log('Connected to the database');
});


//middleware
//declare static files, so express konws how to use it
app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));  //invoke morgan object
app.use(bodyParser.json()); //can parse json format data
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(session({
    //force the session to be saved,even if the session is not modified during requests
    resave: true,
    saveUninitialized: true,
    secret: secret.secretKey,
    store: new MongoStore({url: secret.database, autoReconnect: true})
}));
//flash depends on session and cookie, because you want to save the flash message
//in the sesssion, so it can be used in another request route
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(cartLength); //显示购物车商品总数


//==============================================
//create local variables
//==============================================
//create user object for every route
app.use(function (req, res, next) {
    res.locals.user = req.user;
    next();
});
//create categories object for every route
app.use(function (req, res, next) {
    Category.find({}, function (err, categories) {  //find all categories
        if(err) return next(err);
        res.locals.categories = categories;  //store found categories into local variable
        next();
    });
});


//ejsMate is the name of engine
app.engine('ejs', ejsMate);  //use ejs-mate engine for all ejs templates
app.set('view engine', 'ejs'); //so you can render ejs pages


//require routes
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