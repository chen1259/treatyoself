var express = require("express");
var router  = express.Router();
var User = require("../models/user");
var Treat = require("../models/treat");
var middleware = require("../middleware");

//========================
//Treat Routes
//========================
//Show the treat page
router.get("/treats", middleware.isLoggedIn, function(req, res) {
    User.findById(req.user._id).populate("treats").exec(function(err, foundUser) {
        if(err) {
            console.log(err);
        } else {
            res.render("treats/treats", {user: foundUser});
        }
    });
});

//Creates a new treat basically and then adds into the user's treat list
router.post("/treats",  middleware.isLoggedIn, function(req, res) {
    User.findById(req.user._id, function(err, foundUser) {
        if(err) {
            console.log(err);
            res.redirect("/howtouse");
        } else {
            Treat.create(req.body.treat, function(err, treat) {
                if(err) {
                    console.log(err);
                } else {
                    treat.creator.id = req.user._id;
                    treat.creator.username = req.user.username;
                    treat.save();
                    foundUser.treats.push(treat);
                    foundUser.save();
                    res.redirect("/treats");
                }
            });
        }
    });
});

//Button for success logic, adds the current points and points from the treat and updates and then removes the treat
router.put("/treats/:treatid/success", middleware.isLoggedIn, middleware.checkUserTreat, function(req, res) {
    var oldPoints = req.user.points;
    var date = new Date();
    Treat.findById(req.params.treatid, function(err, treat) {
        if(err) {
            console.log("error here");
        } else {
            var newPoints = req.user.points - treat.price;
            User.findByIdAndUpdate(req.user._id, {$set: {points: newPoints}}, function(err, user) {
                if(err) {
                    console.log("error there");
                } else {
                    var message = "On " + date.toDateString() + " you cashed in  " + treat.title + " for " + treat.price + " points. " + oldPoints + " -> " + newPoints;
                    req.flash("info", message);
                    user.history.unshift(message);
                    if(user.history.length > 25) {
                        user.history.pop();
                    }
                    user.save();
                    res.redirect("/treats");
                }
            });
        }
    });
});

//Logic for the delete button, removes the treat without changing points
router.delete("/treats/:treatid", middleware.isLoggedIn, middleware.checkUserTreat, function(req, res) {
    Treat.findByIdAndRemove(req.params.treatid, function(err) {
        if(err) {
            console.log(err);
        } else {
            User.findById(req.user._id, function(err, user) {
                if(err) {
                    console.log(err);
                } else {
                    var index = user.treats.indexOf(req.params.treatid);
                    if(index > -1) {
                        user.treats.splice(index, 1);
                    }
                    user.save();
                }
            });
            res.redirect("/treats");
        }
    });
})

//logic for showing the update the page
router.get("/treats/:treatid/edit", middleware.isLoggedIn, middleware.checkUserTreat, function(req, res) {
    Treat.findById(req.params.treatid, function(err, foundTreat) {
        if(err) {
            console.log(err);
        } else {
            res.render("treats/edit", {treat:foundTreat} );
        }
    });
});

//Logic for updating the treat with new information
router.put("/treats/:treatid", middleware.isLoggedIn, middleware.checkUserTreat, function(req, res) {
    Treat.findByIdAndUpdate(req.params.treatid, req.body.treat, function(err, treat) {
        if(err) {
            console.log(err);
        } else {
            res.redirect("/treats");
        }
    });
});

//Logic for completing all the treats, basically the logic for priceing points for the success, except for all of them
router.delete("/treats/:userid/allCompleted", middleware.isLoggedIn, function(req, res) {
    User.findById(req.user._id).populate("treats").exec(function(err, foundUser) {
        var oldPoints = foundUser.points;
        var totalPrice = 0;
        var date = new Date();
        if(err) {
            console.log(err);
        }
        var newPoints = foundUser.points;
        foundUser.treats.forEach(function(treat) {
            newPoints -= treat.price;
            totalPrice += treat.price;
        });
        
        User.findByIdAndUpdate(foundUser._id, {$set: {points:newPoints}}, function(err, user) {
            if(err) {
                console.log(err);
            } else {
                var message = "On " + date.toDateString() + " you cashed in  all the treats for " + totalPrice + " points. " + oldPoints + " -> " + newPoints;
                req.flash("info", message);
                user.history.unshift(message);
                if(user.history.length > 25) {
                    user.history.pop();
                }
                user.save();
                res.redirect("/treats");
            }
        });
    });
});


module.exports = router;
