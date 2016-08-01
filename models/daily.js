var mongoose = require("mongoose");

var dailySchema = new mongoose.Schema({
    title: String,
    image: String,
    priority: String,
    reward: Number,
    penalty: Number,
    special: String,
    created:  {type: Date, default: Date.now},
    creator: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    }
});

module.exports = mongoose.model("Daily", dailySchema);