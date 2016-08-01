var mongoose = require("mongoose");

var treatSchema = new mongoose.Schema({
    title: String,
    image: String,
    price: Number,
    priority: String,
    special: String,
    creator: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    }
});

module.exports = mongoose.model("Treat", treatSchema);