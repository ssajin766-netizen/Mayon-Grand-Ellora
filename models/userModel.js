const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema(
{
    // =========================
    // Account
    // =========================

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
    type: String,
    default: "",
    trim: true,
    unique: true,
    sparse: true
},
    username: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        trim: true
    },

googleId: {
    type: String,
    default: "",
    index: true
},

    // =========================
    // Email Verification
    // =========================

    isEmailVerified: {
        type: Boolean,
        default: false
    },

    // =========================
// Phone Verification
// =========================

isPhoneVerified: {
    type: Boolean,
    default: false
},

// =========================
// Two Factor Authentication
// =========================

twoFactorEnabled: {
    type: Boolean,
    default: false
},

// =========================
// Login Type
// =========================

loginType: {
    type: String,
    enum: [
        "password",
        "google",
        "phone"
    ],
    default: "password"
},

    // =========================
    // Remember Me
    // =========================

    rememberToken: {
        type: String,
        default: ""
    },

    // =========================
    // Login Activity
    // =========================

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

    // =========================
    // Login Security
    // =========================

    failedLoginAttempts: {
        type: Number,
        default: 0
    },

    accountLockedUntil: {
        type: Date,
        default: null
    },

    lastFailedLogin: {
        type: Date,
        default: null
    },

    // =========================
    // Complaints
    // =========================

    complaints: {
        type: Array,
        default: []
    },

    // =========================
    // Payments
    // =========================

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

// =========================
// Passport Plugin
// =========================

userSchema.plugin(passportLocalMongoose);

// =========================
// Model
// =========================

const User = mongoose.model("User", userSchema);

// =========================
// Export
// =========================

module.exports = { User };