const { User } = require("../models/userModel");
const OTP = require("../models/otpModel");

const generateOTP = require("../utils/otpGenerator");
const sendOTP = require("../utils/sendOTP");

/*
=========================================
Send Verification OTP
=========================================
*/

exports.sendVerificationOTP = async (email) => {

    const user = await User.findOne({
        username: email
    });

    if (!user) {
        throw new Error("User not found");
    }

    // Check for recent OTP (60 seconds)

    const recentOTP = await OTP.findOne({
        email,
        purpose: "email_verification",
        createdAt: {
            $gt: new Date(Date.now() - 60 * 1000)
        }
    });

    if (recentOTP) {

        throw new Error(
            "Please wait 60 seconds before requesting another OTP."
        );

    }

    // Remove old OTPs

    await OTP.deleteMany({
        email,
        purpose: "email_verification"
    });

    const otp = generateOTP();

    console.log("================================");
    console.log("Generating OTP");
    console.log("Email :", email);
    console.log("OTP   :", otp);
    console.log("================================");

    await OTP.create({

        email,

        otp,

        purpose: "email_verification",

        expiresAt: new Date(
            Date.now() + 10 * 60 * 1000
        )

    });

    await sendOTP(email, otp);

    console.log("OTP Email Sent Successfully");

    return true;

};


/*
=========================================
Verify OTP
=========================================
*/

exports.verifyOTP = async (email, otp) => {

    const user = await User.findOne({
        username: email
    });

    if (!user) {

        return {

            success: false,

            message: "User not found."

        };

    }

    const otpDoc = await OTP.findOne({

        email,

        otp,

        purpose: "email_verification",

        isUsed: false

    });

    if (!otpDoc) {

        return {

            success: false,

            message: "Invalid OTP."

        };

    }

    if (otpDoc.expiresAt < new Date()) {

        await OTP.deleteOne({
            _id: otpDoc._id
        });

        return {

            success: false,

            message: "OTP has expired."

        };

    }

    user.isEmailVerified = true;

    await user.save();

    otpDoc.isUsed = true;

    await otpDoc.save();

    await OTP.deleteMany({

        email,

        purpose: "email_verification"

    });

    return {

        success: true,

        message: "Email verified successfully."

    };

};


/*
=========================================
Resend OTP
=========================================
*/

exports.resendOTP = async (email) => {

    await OTP.deleteMany({

        email,

        purpose: "email_verification"

    });

    return await exports.sendVerificationOTP(email);

};