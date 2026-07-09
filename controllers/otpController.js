const { User } = require("../models/userModel");
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

    // ----------------------------
    // Prevent OTP spam
    // ----------------------------

    if (
        user.lastOtpSentAt &&
        Date.now() - user.lastOtpSentAt.getTime() < 60 * 1000
    ) {
        throw new Error(
            "Please wait 60 seconds before requesting another OTP."
        );
    }

    // ----------------------------
    // Daily resend limit
    // ----------------------------

    if (user.otpResendCount >= 5) {
        throw new Error(
            "Maximum OTP resend limit reached."
        );
    }

    const otp = generateOTP();

    const expiry = new Date(
        Date.now() + 10 * 60 * 1000
    );

    user.emailOTP = otp;
    user.otpExpiry = expiry;

    user.failedOtpAttempts = 0;
    user.otpLockedUntil = null;

    user.lastOtpSentAt = new Date();

    user.otpResendCount += 1;

    await user.save();

    await sendOTP(email, otp);

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

    // ----------------------------
    // Locked?
    // ----------------------------

    if (
        user.otpLockedUntil &&
        user.otpLockedUntil > Date.now()
    ) {

        return {

            success: false,

            message:
                "Too many incorrect OTP attempts. Please try again later."

        };

    }

    // ----------------------------
    // Expired?
    // ----------------------------

    if (
        !user.otpExpiry ||
        user.otpExpiry < Date.now()
    ) {

        return {

            success: false,

            message: "OTP has expired."

        };

    }

    // ----------------------------
    // Wrong OTP
    // ----------------------------

    if (user.emailOTP !== otp) {

        user.failedOtpAttempts += 1;

        if (user.failedOtpAttempts >= 5) {

            user.otpLockedUntil =
                new Date(Date.now() + 15 * 60 * 1000);

        }

        await user.save();

        return {

            success: false,

            message: "Incorrect OTP."

        };

    }

    // ----------------------------
    // Success
    // ----------------------------

    user.isEmailVerified = true;

    user.emailOTP = "";

    user.otpExpiry = null;

    user.failedOtpAttempts = 0;

    user.otpLockedUntil = null;

    user.otpResendCount = 0;

    user.lastOtpSentAt = null;

    await user.save();

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

    return await exports.sendVerificationOTP(email);

};