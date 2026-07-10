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

    try {

        console.log("================================");
        console.log("SEND OTP START");
        console.log("Email:", email);

        const user = await User.findOne({
            username: email.toLowerCase()
        });

        if (!user) {
            throw new Error("User not found");
        }

        // Remove old OTPs
        await OTP.deleteMany({
            email: email.toLowerCase(),
            purpose: "email_verification"
        });

        const otp = generateOTP();

        console.log("Generated OTP:", otp);

        await OTP.create({
            email: email.toLowerCase(),
            otp,
            purpose: "email_verification",
            isUsed: false,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000)
        });

        console.log("OTP Saved Successfully");

        console.log("Calling sendOTP()...");

        await sendOTP(email, otp);

        console.log("OTP Email Sent Successfully");

        return true;

    } catch (err) {

        console.error("================================");
        console.error("OTP CONTROLLER ERROR");
        console.error(err);
        console.error("================================");

        throw err;
    }

};

/*
=========================================
Verify OTP
=========================================
*/

exports.verifyOTP = async (email, otp) => {

    try {

        const user = await User.findOne({
            username: email.toLowerCase()
        });

        if (!user) {

            return {
                success: false,
                message: "User not found."
            };

        }

        const otpDoc = await OTP.findOne({
            email: email.toLowerCase(),
            otp: otp.trim(),
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
                message: "OTP expired."
            };

        }

        user.isEmailVerified = true;

        await user.save();

        otpDoc.isUsed = true;

        await otpDoc.save();

        await OTP.deleteMany({
            email: email.toLowerCase(),
            purpose: "email_verification"
        });

        return {

            success: true,

            message: "Email verified successfully."

        };

    } catch (err) {

        console.error(err);

        return {

            success: false,

            message: "Verification failed."

        };

    }

};

/*
=========================================
Resend OTP
=========================================
*/

exports.resendOTP = async (email) => {

    await OTP.deleteMany({
        email: email.toLowerCase(),
        purpose: "email_verification"
    });

    return exports.sendVerificationOTP(email);

};