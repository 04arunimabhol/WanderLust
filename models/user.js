const mongoose = require("mongoose");
const crypto = require("crypto");

const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    googleId: {
        type: String,
        default: null,
    },

    provider: {
        type: String,
        enum: ["local", "google"],
        default: "local",
    },

    profilePicture: {
        type: String,
        default: "",
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    passwordChangedAt: Date
}); 

userSchema.plugin(passportLocalMongoose.default);

module.exports = mongoose.model('User', userSchema);