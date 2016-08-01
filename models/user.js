var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
    username: String,
    password: String,
    points: {type: Number, default: 0},
    history: [String],
    tasks: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Task"
        }
    ],
    dailies: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Daily"
        }
    ],
    treats: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Treat"
        }
    ]
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);