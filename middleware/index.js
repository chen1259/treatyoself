var passport = require("passport");
var User = require("../models/user");
var Task = require("../models/task");
var Daily = require("../models/daily");
var Treat = require("../models/treat");

module.exports = {
    isLoggedIn: function(req, res, next) {
        if(req.isAuthenticated()) {
            return next();
        } else {
            req.flash("error", "You must be logged in to continue.")
            res.redirect("/");
        }
    },
    checkUserId: function(req, res, next) {
        if(req.isAuthenticated()) {
            User.findById(req.params.userid, function(err, foundUser) {
                if(err) {
                    console.log(err);
                } else {
                    if(foundUser._id.equals(req.user._id)) {
                        next();
                    } else {
                        req.logout();
                        res.redirect("/")
                    }
                }
            });
        } else {
            res.redirect("/login");
        }
    },
    checkUserTask: function(req, res, next) {
        if(req.isAuthenticated()) {
            Task.findById(req.params.taskid, function(err, foundTask) {
                if(err) {
                    console.log(err);
                } else {
                    if(foundTask.creator.id.equals(req.user._id)) {
                        next();
                    } else {
                        req.logout();
                        res.redirect("/")
                    }
                }
            });
        } else {
            res.redirect("/login");
        }
    },
    checkUserDaily: function(req, res, next) {
        if(req.isAuthenticated()) {
            Daily.findById(req.params.dailyid, function(err, foundDaily) {
                if(err) {
                    console.log(err);
                } else {
                    if(foundDaily.creator.id.equals(req.user._id)) {
                        next();
                    } else {
                        req.logout();
                        res.redirect("/")
                    }
                }
            });
        } else {
            res.redirect("/login");
        }
    },
    checkUserTreat: function(req, res, next) {
        if(req.isAuthenticated()) {
            Treat.findById(req.params.treatid, function(err, foundTreat) {
                if(err) {
                    console.log(err);
                } else {
                    if(foundTreat.creator.id.equals(req.user._id)) {
                        next();
                    } else {
                        req.logout();
                        res.redirect("/")
                    }
                }
            });
        } else {
            res.redirect("/login");
        }
    }
}