const { User } = require("../models/userModel");
const OTP = require("../models/otpModel");

const generateOTP = require("../utils/otpGenerator");
const sendOTP = require("../utils/sendOTP");

/*
=========================================
Send Signup OTP
=========================================
*/

exports.sendSignupOTP = async (email) => {

    try {

        const user = await User.findOne({
            username: email.toLowerCase()
        });

        if (!user) {
            throw new Error("User not found");
        }

        await OTP.deleteMany({
            email: email.toLowerCase(),
            purpose: "email_verification"
        });

        const otp = generateOTP();

        await OTP.create({
            email: email.toLowerCase(),
            otp,
            purpose: "email_verification",
            isUsed: false,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000)
        });

        await sendOTP(email, otp);

        return true;

    } catch (err) {

        console.error(err);
        throw err;

    }

};

/*
=========================================
Send Login OTP
=========================================
*/

exports.sendLoginOTP = async (email) => {

    try {

        const user = await User.findOne({
            username: email.toLowerCase()
        });

        if (!user) {
            throw new Error("User not found");
        }

        await OTP.deleteMany({
            email: email.toLowerCase(),
            purpose: "login"
        });

        const otp = generateOTP();

        await OTP.create({
            email: email.toLowerCase(),
            otp,
            purpose: "login",
            isUsed: false,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000)
        });

        await sendOTP(email, otp);

        return true;

    } catch (err) {

        console.error(err);
        throw err;

    }

};

/*
=========================================
Verify OTP
=========================================
*/

exports.verifyOTP = async (email, otp, purpose) => {

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

            purpose,

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

        otpDoc.isUsed = true;

        await otpDoc.save();

        await OTP.deleteMany({

            email: email.toLowerCase(),

            purpose

        });

        if (purpose === "email_verification") {

            user.isEmailVerified = true;

            await user.save();

        }

        return {

            success: true,

            message: "OTP verified successfully."

        };

    }

    catch (err) {

        console.error(err);

        return {

            success: false,

            message: "Verification failed."

        };

    }

};

/*
=========================================
Resend Signup OTP
=========================================
*/

exports.resendSignupOTP = async (email) => {

    await OTP.deleteMany({

        email: email.toLowerCase(),

        purpose: "email_verification"

    });

    return exports.sendSignupOTP(email);

};

/*
=========================================
Resend Login OTP
=========================================
*/

exports.resendLoginOTP = async (email) => {

    await OTP.deleteMany({

        email: email.toLowerCase(),

        purpose: "login"

    });

    return exports.sendLoginOTP(email);

};