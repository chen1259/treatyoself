var express = require("express");
var router  = express.Router();
var User = require("../models/user");
var Task = require("../models/task");
var middleware = require("../middleware");

//========================
//Task Routes
//========================
//Show the task page
router.get("/tasks", middleware.isLoggedIn, function(req, res) {
    User.findById(req.user._id).populate("tasks").exec(function(err, foundUser) {
        if(err) {
            console.log(err);
        } else {
            res.render("tasks/tasks", {user: foundUser});
        }
    });
});

//Creates a new task basically and then adds into the user's task list
router.post("/tasks",  middleware.isLoggedIn, function(req, res) {
    User.findById(req.user._id, function(err, foundUser) {
        if(err) {
            console.log(err);
            res.redirect("/howtouse");
        } else {
            Task.create(req.body.task, function(err, task) {
                if(err) {
                    console.log(err);
                } else {
                    task.creator.id = req.user._id;
                    task.creator.username = req.user.username;
                    task.save();
                    foundUser.tasks.push(task);
                    foundUser.save();
                    res.redirect("/tasks");
                }
            });
        }
    });
});

//Button for success logic, adds the current points and points from the task and updates and then removes the task
router.delete("/tasks/:taskid/success", middleware.isLoggedIn, middleware.checkUserTask, function(req, res) {
    Task.findById(req.params.taskid, function(err, task) {
        if(err) {
            console.log("error here");
        } else {
            var oldPoints = req.user.points;
            var date = new Date();
            var newPoints = req.user.points + task.reward;
            User.findByIdAndUpdate(req.user._id, {$set: {points: newPoints}}, function(err, user) {
                if(err) {
                    console.log("error there");
                } else {
                    Task.findByIdAndRemove(task.id, function(err) {
                        if(err) {
                            console.log("error everywhere");
                        } else {
                            var index = user.tasks.indexOf(task.id);
                            if(index > -1) {
                                user.tasks.splice(index, 1);
                            }
                            var message = "On " + date.toDateString() + " you finished the task,  " + task.title + " ,and earned " + task.reward + " points. " +   oldPoints + " -> " + newPoints;
                            req.flash("info", message);
                            user.history.unshift(message);
                            if(user.history.length > 25) {
                                user.history.pop();
                            }
                            user.save();
                            res.redirect("/tasks");
                        }
                    });
                }
            });
        }
    });
});

//Logic for the fail button, basically the same as the success button logic, but with penalty and subtracting
router.delete("/tasks/:taskid/fail", middleware.isLoggedIn, middleware.checkUserTask, function(req, res) {
    Task.findById(req.params.taskid, function(err, task) {
        if(err) {
            console.log("error here");
        } else {
            var oldPoints = req.user.points;
            var date = new Date();
            var newPoints = req.user.points - task.penalty;
            User.findByIdAndUpdate(req.user._id, {$set: {points: newPoints}}, function(err, user) {
                if(err) {
                    console.log("error there");
                } else {
                    Task.findByIdAndRemove(task.id, function(err) {
                        if(err) {
                            console.log("error everywhere");
                        } else {
                            var index = user.tasks.indexOf(task.id);
                            if(index > -1) {
                                user.tasks.splice(index, 1);
                            }
                            var message = "On " + date.toDateString() + " you failed the task,  " + task.title + " ,and lost " + task.penalty + " points. " +   oldPoints + " -> " + newPoints;
                            req.flash("info", message);
                            user.history.unshift(message);
                            if(user.history.length > 25) {
                                user.history.pop();
                            }
                            user.save();
                            res.redirect("/tasks");
                        }
                    });
                }
            });
        }
    });
});

//Logic for the delete button, removes the task without changing points
router.delete("/tasks/:taskid", middleware.isLoggedIn, middleware.checkUserTask, function(req, res) {
    Task.findByIdAndRemove(req.params.taskid, function(err) {
        if(err) {
            console.log(err);
        } else {
            User.findById(req.user._id, function(err, user) {
                if(err) {
                    console.log(err);
                } else {
                    var index = user.tasks.indexOf(req.params.taskid);
                    if(index > -1) {
                        user.tasks.splice(index, 1);
                    }
                    user.save();
                }
            });
            res.redirect("/tasks");
        }
    });
})

//logic for showing the update the page
router.get("/tasks/:taskid/edit", middleware.isLoggedIn, middleware.checkUserTask, function(req, res) {
    Task.findById(req.params.taskid, function(err, foundTask) {
        if(err) {
            console.log(err);
        } else {
            res.render("tasks/edit", {task:foundTask} );
        }
    });
});

//Logic for updating the task with new information
router.put("/tasks/:taskid", middleware.isLoggedIn, middleware.checkUserTask, function(req, res) {
    Task.findByIdAndUpdate(req.params.taskid, req.body.task, function(err, task) {
        if(err) {
            console.log(err);
        } else {
            res.redirect("/tasks");
        }
    });
});

//Logic for completing all the tasks, basically the logic for rewarding points for the success, except for all of them
router.delete("/tasks/:userid/allCompleted", middleware.isLoggedIn, function(req, res) {
    User.findById(req.user._id).populate("tasks").exec(function(err, foundUser) {
        if(err) {
            console.log(err);
        }
        var newPoints = foundUser.points;
        var date = new Date();
        var oldPoints = foundUser.points;
        var totalPoints = 0;
        foundUser.tasks.forEach(function(task) {
            newPoints += task.reward;
            totalPoints += task.reward;
        });
        
        User.findByIdAndUpdate(foundUser._id, {$set: {points:newPoints}}, function(err, user) {
            if(err) {
                console.log(err);
            } else {
                foundUser.tasks.forEach(function(foundTask) {
                    var taskIdHolder = foundTask._id;
                    Task.findByIdAndRemove(taskIdHolder, function(err) {
                        if(err) {
                            console.log(err);
                        }
                    })
                })
                
                var message = "On " + date.toDateString() + " you finished all your tasks and earned " + totalPoints + " points. " +   oldPoints + " -> " + newPoints;
                req.flash("info", message);
                foundUser.history.unshift(message);
                if(foundUser.history.length > 25) {
                    foundUser.history.pop();
                }
                foundUser.tasks.splice(0, foundUser.tasks.length);
                foundUser.save();
                res.redirect("/tasks");
            }
        });
        
        //More stuf that doesnt work
        // Task.findByIdAndRemove(taskHolder, function(err) {
        //     if(err) {
        //         console.log(err);
        //     } else {
        //         console.log("This is the unpopulated?" + user);
        //         console.log("The found task id " + taskHolder);
        //         var index = user.tasks.indexOf(taskHolder);
        //         console.log("The index is " + index);
        //         if(index > -1) {
        //             console.log("The user " + user);
        //             console.log("the index needed to be deleted is " + index + " and what we have is " + user.tasks);
        //             user.tasks.splice(index, 1);
        //             user.save(function(err) {
        //                 if(err) {
        //                     console.log(err);
        //                 } else {
        //                     console.log("This is what happens after the save user " + user);
        //                     console.log("This is what happens after the save user " + user.tasks);
        //                     console.log("the length " + user.tasks.length);
                            
        //                     if(user.tasks.length === 0) {
        //                         res.redirect("/tasks");
        //                     }
        //                 }
        //             });
        //         }
        //     }
        // });
        
        //The forEach for the completed all tasks that didn't work, use this as a learning experience
        // if(err) {
        //     console.log(err);
        // }
        // // if(err) {
        // //     console.log(err);
        // // } else {
        // //     foundUser.tasks.forEach(function(task) {
        // //         Task.findById(task, function(err, foundTask) {
        // //             if(err) {
        // //                 console.log(err);
        // //             } else {
        // //                 console.log("this is the foundtask's reward" + foundTask.reward);
        // //                 newPoints += foundTask.reward;
        // //                 console.log("The current new Points" + newPoints);
        // //                 console.log("first");
        // //             }
        // //         });
        // //     });
        // // }
        // foundUser.tasks.forEach(function(task) {
        //     Task.findByIdAndRemove(task, function(err) {
        //         if(err) {
        //             console.log(err);
        //         } else {
        //             console.log("second");
        //         }
        //     });
        // });
        
        // // console.log("third");
        // // console.log("Found user points" + foundUser.points);
        // // foundUser.points = newPoints;
        // // console.log("new Found user points" + foundUser.points);
        // // console.log("The found user" + foundUser);
        // foundUser.tasks.splice(0, foundUser.tasks.length);
        // foundUser.save();
        // res.redirect("/tasks");
    });
});

//Logic for failing all the tasks, basically the same logic as above, but subtracting instead
router.delete("/tasks/:userid/allFailed", middleware.isLoggedIn, function(req, res) {
    User.findById(req.user._id).populate("tasks").exec(function(err, foundUser) {
        if(err) {
            console.log(err);
        }
        var oldPoints = foundUser.points;
        var date = new Date();
        var totalPoints = 0;
        var newPoints = foundUser.points;
        foundUser.tasks.forEach(function(task) {
            newPoints -= task.penalty;
            totalPoints += task.penalty;
        });
        
        User.findByIdAndUpdate(foundUser._id, {$set: {points:newPoints}}, function(err, user) {
            if(err) {
                console.log(err);
            } else {
                foundUser.tasks.forEach(function(foundTask) {
                    var taskIdHolder = foundTask._id;
                    Task.findByIdAndRemove(taskIdHolder, function(err) {
                        if(err) {
                            console.log(err);
                        }
                    })
                })
                var message = "On " + date.toDateString() + " you failed all you tasks and lost " + totalPoints + " points. " +   oldPoints + " -> " + newPoints;
                req.flash("info", message);
                foundUser.history.unshift(message);
                if(foundUser.history.length > 25) {
                    foundUser.history.pop();
                }
                foundUser.tasks.splice(0, foundUser.tasks.length);
                foundUser.save();
                res.redirect("/tasks");
            }
        });
    });
});


module.exports = router;
