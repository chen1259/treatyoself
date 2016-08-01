//Initiate all required files
var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    cookieParser = require("cookie-parser"),
    passport    = require("passport"),
    LocalStrategy = require("passport-local"),
    session = require("express-session"),
    User = require("./models/user"),
    flash = require("connect-flash"),
    Daily = require("./models/daily"),
    Task = require("./models/task"),
    Treat = require("./models/treat"),
    methodOverride = require("method-override");
    
var port = 3000 || process.env.PORT;


//Additional setup with some of the required files
mongoose.connect("mongodb://127.0.0.1:27017/treatyoself");
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride('_method'));
app.use(cookieParser('secret'));
app.use(flash());

//Passport configuration
app.use(require("express-session")({
    secret: "Treat yo self 2016",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Require all the routes we will be using
var indexRoutes = require("./routes/index");
var loggedInRoutes = require("./routes/loggedin");
var taskRoutes = require("./routes/tasks");
var dailyRoutes = require("./routes/dailies");
var treatRoutes = require("./routes/treats");

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.info = req.flash("info");
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   next();
});

//Use the routes you required
app.use(indexRoutes);
app.use(loggedInRoutes);
app.use(taskRoutes);
app.use(dailyRoutes);
app.use(treatRoutes);

app.listen(port, "138.68.11.174", function(){
    console.log("Running on port " + port);
});
