const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const passport = require("passport");

const userSchema = new mongoose.Schema({

    validation: {
        type: String,
        default: "applied"
    },

    isAdmin: {
        type: Boolean,
        default: false
    },

    societyName: {
        type: String,
        default: "Pending"
    },

    flatNumber: {
        type: String,
        default: "Pending"
    },

    firstName: {
        type: String,
        default: ""
    },

    lastName: {
        type: String,
        default: ""
    },

    phoneNumber: {
        type: Number,
        default: 0
    },

    username: {
        type: String,
        unique: true
    },

    googleId: {
        type: String,
        default: ""
    },

    // Email Verification
    isEmailVerified: {
        type: Boolean,
        default: false
    },

    emailOTP: {
        type: String,
        default: ""
    },

    otpExpiry: {
        type: Date,
        default: null
    },

    // Forgot Password
    resetPasswordOTP: {
        type: String,
        default: ""
    },

    resetPasswordExpiry: {
        type: Date,
        default: null
    },

    // Remember Me
    rememberToken: {
        type: String,
        default: ""
    },

    // Login Activity
    lastLogin: {
        type: Date,
        default: null
    },

    loginHistory: [
        {
            loginTime: {
                type: Date,
                default: Date.now
            },

            ip: String,

            browser: String,

            device: String,

            location: String,

            loginMethod: {
                type: String,
                default: "Password"
            },

            status: {
                type: String,
                default: "Success"
            }
        }
    ],

    // Security
    failedLoginAttempts: {
        type: Number,
        default: 0
    },

    accountLockedUntil: {
        type: Date,
        default: null
    },

    complaints: [],

    lastPayment: {
        date: Date,
        amount: Number,
        invoice: String
    },

    makePayment: Number,

    paymentHistory: [
        {
            amount: Number,
            invoice: String,
            paidAt: Date,
            method: String
        }
    ]

}, {
    timestamps: true
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

module.exports = { User };