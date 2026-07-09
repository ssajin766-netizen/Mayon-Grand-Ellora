const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema(
{
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
        unique: true,
        required: true
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

            ip: {
                type: String,
                default: ""
            },

            browser: {
                type: String,
                default: ""
            },

            device: {
                type: String,
                default: ""
            },

            location: {
                type: String,
                default: ""
            },

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

    // Complaints
    complaints: {
        type: Array,
        default: []
    },

    // Payments
    lastPayment: {

        date: Date,

        amount: {
            type: Number,
            default: 0
        },

        invoice: {
            type: String,
            default: ""
        }

    },

    makePayment: {
        type: Number,
        default: 0
    },

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
}
);

// Passport Local Mongoose Plugin
userSchema.plugin(passportLocalMongoose);

// Model
const User = mongoose.model("User", userSchema);

// Export only the model
module.exports = { User };