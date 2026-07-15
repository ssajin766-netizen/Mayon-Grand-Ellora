const { User } = require("../models/userModel");
const OTP = require("../models/otpModel");

const generateOTP = require("../utils/otpGenerator");
const sendOTP = require("../utils/sendOTP");

/*
=========================================
Send Login OTP
=========================================
*/

exports.sendVerificationOTP = async (email) => {

    try {

        console.log("================================");
        console.log("SEND LOGIN OTP");
        console.log("Email:", email);

        const user = await User.findOne({
            username: email.toLowerCase()
        });

        if (!user) {
            throw new Error("User not found");
        }

        // Delete previous login OTPs
        await OTP.deleteMany({
            email: email.toLowerCase(),
            purpose: "login"
        });

        const otp = generateOTP();

        console.log("Generated OTP:", otp);

        await OTP.create({

            email: email.toLowerCase(),

            otp,

            purpose: "login",

            isUsed: false,

            expiresAt: new Date(Date.now() + 10 * 60 * 1000)

        });

        await sendOTP(email, otp);

        console.log("OTP Sent Successfully");

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
Verify Login OTP
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

            purpose: "login",

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

            purpose: "login"

        });

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
Resend Login OTP
=========================================
*/

exports.resendOTP = async (email) => {

    await OTP.deleteMany({

        email: email.toLowerCase(),

        purpose: "login"

    });

    return exports.sendVerificationOTP(email);

};