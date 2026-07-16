const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const loginHistorySchema = new mongoose.Schema(
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
        enum: ["Password", "Google", "Phone", "OTP"],
        default: "Password"
    },

    status: {
        type: String,
        enum: ["Success", "Failed"],
        default: "Success"
    }
},
{
    _id: false
});

const paymentHistorySchema = new mongoose.Schema(
{
    amount: {
        type: Number,
        default: 0
    },

    invoice: {
        type: String,
        default: ""
    },

    paidAt: {
        type: Date,
        default: Date.now
    },

    method: {
        type: String,
        default: "Manual"
    },

    paymentStatus: {
        type: String,
        enum: ["Pending", "Paid"],
        default: "Paid"
    }

},
{
    _id: false
});

const userSchema = new mongoose.Schema(
{

    // ===========================================
    // Account
    // ===========================================

    validation: {
        type: String,
        enum: ["applied", "approved", "rejected"],
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

    profileImage: {
        type: String,
        default: "/images/default-avatar.png"
    },

    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
phoneNumber: {

    type: String,

    trim: true,

    unique: true,

    sparse: true,

    default: "",

    validate: {

        validator: function (value) {

            if (!value) {

                return true;

            }

            // Accept international E.164 format
            // Example: +919597723127

            return /^\+[1-9]\d{8,14}$/.test(value);

        },

        message: props =>

            `Phone number is invalid (${props.value}).`

    }

},

    googleId: {
        type: String,
        unique: true,
        sparse: true,
        trim: true,
        default: null
    },

    // ===========================================
    // Verification
    // ===========================================

    isEmailVerified: {
        type: Boolean,
        default: false
    },

    isPhoneVerified: {
        type: Boolean,
        default: false
    },

    // ===========================================
    // OTP
    // ===========================================

    emailOtp: {
        type: String,
        default: ""
    },

    emailOtpExpires: {
        type: Date,
        default: null
    },

    phoneOtp: {
        type: String,
        default: ""
    },

    phoneOtpExpires: {
        type: Date,
        default: null
    },

    // ===========================================
    // Login
    // ===========================================

    loginType: {
        type: String,
        enum: [
            "password",
            "google",
            "phone"
        ],
        default: "password"
    },

    twoFactorEnabled: {
        type: Boolean,
        default: false
    },

    rememberToken: {
        type: String,
        default: ""
    },

    rememberTokenExpires: {
        type: Date,
        default: null
    },

    // ===========================================
    // Login Activity
    // ===========================================

    lastLogin: {
        type: Date,
        default: null
    },

    lastLoginIp: {
        type: String,
        default: ""
    },

    loginHistory: {
        type: [loginHistorySchema],
        default: []
    },

    // ===========================================
    // Security
    // ===========================================

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

    // ===========================================
    // Complaints
    // ===========================================

    complaints: {
        type: Array,
        default: []
    },

    // ===========================================
    // Payments
    // ===========================================

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

    paymentHistory: {
        type: [paymentHistorySchema],
        default: []
    }

},
{
    timestamps: true
});

// ===========================================
// Passport
// ===========================================

userSchema.plugin(passportLocalMongoose);

// ===========================================
// Indexes
// ===========================================

userSchema.index({ societyName: 1 });
userSchema.index({ validation: 1 });

// ===========================================
// Hide Sensitive Fields
// ===========================================

userSchema.set("toJSON", {
    transform(doc, ret) {

        delete ret.hash;
        delete ret.salt;
        delete ret.__v;

        return ret;
    }
});

// ===========================================
// Helper
// ===========================================

userSchema.methods.addLoginHistory = function (data) {

    this.loginHistory.unshift(data);

    if (this.loginHistory.length > 20) {

        this.loginHistory = this.loginHistory.slice(0, 20);

    }

};

// ===========================================
// Model
// ===========================================

const User = mongoose.model("User", userSchema);

module.exports = { User };