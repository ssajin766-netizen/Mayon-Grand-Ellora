const { User } = require("../models/userModel");
const generateOTP = require("../utils/otpGenerator");
const sendOTP = require("../utils/sendOTP");

exports.sendVerificationOTP = async (email) => {

    const otp = generateOTP();

    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    await User.findOneAndUpdate(
        { username: email },
        {
            emailOTP: otp,
            otpExpiry: expiry
        }
    );

    await sendOTP(email, otp);

};