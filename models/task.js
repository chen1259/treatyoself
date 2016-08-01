var mongoose = require("mongoose");

var taskSchema = new mongoose.Schema({
    title: String,
    image: String,
    priority: String,
    reward: Number,
    penalty: Number,
    special: String,
    deadline: Date,
    created:  {type: Date, default: Date.now},
    creator: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    }
});

module.exports = mongoose.model("Task", taskSchema);