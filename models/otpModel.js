const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(

    {

        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true
        },

        otp: {
            type: String,
            required: true
        },

purpose: {

    type: String,

    enum: [

        "email_verification",

        "forgot_password",

        "login",

        "phone_login"

    ],

    default: "email_verification"

},
        isUsed: {

            type: Boolean,

            default: false

        },

        expiresAt: {

            type: Date,

            required: true

        }

    },

    {

        timestamps: true

    }

);

otpSchema.index(

    {

        expiresAt: 1

    },

    {

        expireAfterSeconds: 0

    }

);

module.exports = mongoose.model("OTP", otpSchema);