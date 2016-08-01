var express = require("express");
var router  = express.Router();
var User = require("../models/user");
var Daily = require("../models/daily");
var middleware = require("../middleware");

//========================
//Daily Routes
//========================
//Show the daily page
router.get("/dailies", middleware.isLoggedIn, function(req, res) {
    User.findById(req.user._id).populate("dailies").exec(function(err, foundUser) {
        if(err) {
            console.log(err);
        } else {
            res.render("dailies/dailies", {user: foundUser});
        }
    });
});

//Creates a new daily basically and then adds into the user's daily list
router.post("/dailies",  middleware.isLoggedIn, function(req, res) {
    User.findById(req.user._id, function(err, foundUser) {
        if(err) {
            console.log(err);
            res.redirect("/howtouse");
        } else {
            Daily.create(req.body.daily, function(err, daily) {
                if(err) {
                    console.log(err);
                } else {
                    daily.creator.id = req.user._id;
                    daily.creator.username = req.user.username;
                    daily.save();
                    foundUser.dailies.push(daily);
                    foundUser.save();
                    res.redirect("/dailies");
                }
            });
        }
    });
});

//Button for success logic, adds the current points and points from the daily and updates and then removes the daily
router.delete("/dailies/:dailyid/success", middleware.isLoggedIn, middleware.checkUserDaily, function(req, res) {
    Daily.findById(req.params.dailyid, function(err, daily) {
        if(err) {
            console.log("error here");
        } else {
            var date = new Date();
            var oldPoints = req.user.points;
            var newPoints = req.user.points + daily.reward;
            User.findByIdAndUpdate(req.user._id, {$set: {points: newPoints}}, function(err, user) {
                if(err) {
                    console.log("error there");
                } else {
                    var message = "On " + date.toDateString() + " you finished the daily,  " + daily.title + " ,and earned " + daily.reward + " points. " +   oldPoints + " -> " + newPoints;
                    req.flash("info", message);
                    user.history.unshift(message);
                    if(user.history.length > 25) {
                        user.history.pop();
                    }
                    user.save();
                    res.redirect("/dailies");
                }
            });
        }
    });
});

//Logic for the fail button, basically the same as the success button logic, but with penalty and subtracting
router.delete("/dailies/:dailyid/fail", middleware.isLoggedIn, middleware.checkUserDaily, function(req, res) {
    Daily.findById(req.params.dailyid, function(err, daily) {
        if(err) {
            console.log("error here");
        } else {
            var oldPoints = req.user.points;
            var date = new Date();
            var newPoints = req.user.points - daily.penalty;
            User.findByIdAndUpdate(req.user._id, {$set: {points: newPoints}}, function(err, user) {
                if(err) {
                    console.log("error there");
                } else {
                    var message = "On " + date.toDateString() + " you failed the daily,  " + daily.title + " ,and lost " + daily.penalty + " points. " +   oldPoints + " -> " + newPoints;
                    req.flash("info", message);
                    user.history.unshift(message);
                    if(user.history.length > 25) {
                        user.history.pop();
                    }
                    user.save();
                    res.redirect("/dailies");
                }
            });
        }
    });
});

//Logic for the delete button, removes the daily without changing points
router.delete("/dailies/:dailyid", middleware.isLoggedIn, middleware.checkUserDaily, function(req, res) {
    Daily.findByIdAndRemove(req.params.dailyid, function(err) {
        if(err) {
            console.log(err);
        } else {
            User.findById(req.user._id, function(err, user) {
                if(err) {
                    console.log(err);
                } else {
                    var index = user.dailies.indexOf(req.params.dailyid);
                    if(index > -1) {
                        user.dailies.splice(index, 1);
                    }
                    user.save();
                }
            });
            res.redirect("/dailies");
        }
    });
})

//logic for showing the update the page
router.get("/dailies/:dailyid/edit", middleware.isLoggedIn, middleware.checkUserDaily, function(req, res) {
    Daily.findById(req.params.dailyid, function(err, foundDaily) {
        if(err) {
            console.log(err);
        } else {
            res.render("dailies/edit", {daily:foundDaily} );
        }
    });
});

//Logic for updating the daily with new information
router.put("/dailies/:dailyid", middleware.isLoggedIn, middleware.checkUserDaily, function(req, res) {
    Daily.findByIdAndUpdate(req.params.dailyid, req.body.daily, function(err, daily) {
        if(err) {
            console.log(err);
        } else {
            res.redirect("/dailies");
        }
    });
});

//Logic for completing all the dailies, basically the logic for rewarding points for the success, except for all of them
router.delete("/dailies/:userid/allCompleted", middleware.isLoggedIn, function(req, res) {
    User.findById(req.user._id).populate("dailies").exec(function(err, foundUser) {
        if(err) {
            console.log(err);
        }
        var date = new Date();
        var totalPoints = 0;
        var oldPoints = foundUser.points;
        var newPoints = foundUser.points;
        foundUser.dailies.forEach(function(daily) {
            newPoints += daily.reward;
            totalPoints += daily.reward;
        });
        
        User.findByIdAndUpdate(foundUser._id, {$set: {points:newPoints}}, function(err, user) {
            if(err) {
                console.log(err);
            } else {
                var message = "On " + date.toDateString() + " you finished all your dailies and earned " + totalPoints + " points. " +   oldPoints + " -> " + newPoints;
                req.flash("info", message);
                foundUser.history.unshift(message);
                if(foundUser.history.length > 25) {
                    foundUser.history.pop();
                }
                foundUser.save();
                res.redirect("/dailies");
            }
        });
    });
});

//Logic for failing all the dailies, basically the same logic as above, but subtracting instead
router.delete("/dailies/:userid/allFailed", middleware.isLoggedIn, function(req, res) {
    User.findById(req.user._id).populate("dailies").exec(function(err, foundUser) {
        if(err) {
            console.log(err);
        }
        var date = new Date();
        var totalPoints = 0;
        var oldPoints = foundUser.points;
        var newPoints = foundUser.points;
        foundUser.dailies.forEach(function(daily) {
            newPoints -= daily.penalty;
            totalPoints += daily.penalty;
        });
        
        User.findByIdAndUpdate(foundUser._id, {$set: {points:newPoints}}, function(err, user) {
            if(err) {
                console.log(err);
            } else {
                var message = "On " + date.toDateString() + " you failed all your dailies and lost " + totalPoints + " points. " +   oldPoints + " -> " + newPoints;
                req.flash("info", message);
                foundUser.history.unshift(message);
                if(foundUser.history.length > 25) {
                    foundUser.history.pop();
                }
                foundUser.save();
                res.redirect("/dailies");
            }
        });
    });
});


module.exports = router;
