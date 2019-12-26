const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        index: true
    },
    email: {
        type: String,
        unique: true,
        index: true
    },
    password: String
});

module.exports = mongoose.model('User', userSchema);