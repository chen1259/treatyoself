var express = require("express");
var router  = express.Router();
var passport = require("passport");
var User = require("../models/user");

//Goes to the landing page
router.get("/", function(req, res) {
    res.render("landing");
});

//Sign Up Logic
router.post("/signup", function(req, res) {
    var newUser = new User({username: req.body.username});
    console.log(newUser);
    User.register(newUser, req.body.password, function(err, user) {
        if(err) {
            req.flash("error", err.message);
            res.redirect("/")
        } else {
            passport.authenticate("local")(req, res, function() {
                req.flash("success", "You've succesfully signed up! Welcome " + user.username + " and get ready to treat yo self!");
                res.redirect("/howtouse"); 
            });
        }
    });
});

//Show the login form
router.get("/login", function(req, res) {
    res.render("login");
});

//Handle the login logic
router.post("/login", passport.authenticate("local",
    {
        successRedirect: "/dailies",
        failureRedirect: "/login"
    }), function(req, res) {
});

//logout route
router.get("/logout", function(req, res) {
    req.logout();
    req.flash("success", "You've successfully logged out");
    res.redirect("/")
});

module.exports = router;