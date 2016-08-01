var express = require("express");
var router  = express.Router();
var User = require("../models/user");
var Task = require("../models/task");
var middleware = require("../middleware");

router.get("/howtouse", middleware.isLoggedIn, function(req, res) {
    res.render("loggedin/howtouse");
});

router.get("/history", middleware.isLoggedIn, function(req, res) {
    res.render("loggedin/history")
});

//Part of the navbar, changes the points based on what you put in the input with the button next to it
router.put("/points", middleware.isLoggedIn, function(req, res) {
    var oldPoints = req.user.points;
    var date = new Date();
    User.findByIdAndUpdate(req.user._id, {$set: {points: req.body.points}}, function(err, user) {
        if(err) {
            console.log(err);
        } else {
            var message = "On " + date.toDateString() + " you manually changed from " + oldPoints + " points to " + req.body.points + " points."
            user.history.unshift(message);
            if(user.history.length > 25) {
                user.history.pop();
            }
            user.save();
            req.flash("success", message);
            res.redirect("back");
        }
    });
});

module.exports = router;

