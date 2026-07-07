const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const passport = require('passport');

const userSchema = new mongoose.Schema(
{
    validation: {
        type: String,
        default: 'applied'
    },

    isAdmin: {
        type: Boolean,
        default: false
    },

    // Google users won't have these immediately
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

    googleId: {
        type: String,
        default: ""
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

},
{
    timestamps: true
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.User = User;