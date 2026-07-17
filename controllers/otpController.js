const { User } = require("../models/userModel");
const OTP = require("../models/otpModel");

const generateOTP = require("../utils/otpGenerator");
const sendOTP = require("../utils/sendOTP");

/*
==================================================
HELPER
==================================================
*/

async function createOTP(email, purpose) {

    await OTP.deleteMany({
        email: email.toLowerCase(),
        purpose
    });

    const otp = generateOTP();

    await OTP.create({

        email: email.toLowerCase(),

        otp,

        purpose,

        isUsed: false,

        expiresAt: new Date(Date.now() + 10 * 60 * 1000)

    });

    await sendOTP(email, otp);

    return true;

}

/*
==================================================
SEND SIGNUP OTP
==================================================
*/

exports.sendSignupOTP = async (email) => {

    try {

        const user = await User.findOne({

            username: email.toLowerCase()

        });

        if (!user) {

            throw new Error("User not found.");

        }

        return await createOTP(

            email,

            "email_verification"

        );

    }

    catch (err) {

        console.error(err);

        throw err;

    }

};

/*
==================================================
SEND LOGIN OTP
==================================================
*/

exports.sendLoginOTP = async (email) => {

    try {

        const user = await User.findOne({

            username: email.toLowerCase()

        });

        if (!user) {

            throw new Error("User not found.");

        }

        return await createOTP(

            email,

            "login"

        );

    }

    catch (err) {

        console.error(err);

        throw err;

    }

};

/*
==================================================
VERIFY OTP
==================================================
*/

exports.verifyOTP = async (

    email,

    otp,

    purpose

) => {

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

        /*
        ---------------------------------------
        MARK OTP AS USED
        ---------------------------------------
        */

        otpDoc.isUsed = true;

        await otpDoc.save();

        await OTP.deleteMany({

            email: email.toLowerCase(),

            purpose

        });

        /*
        ---------------------------------------
        UPDATE USER
        ---------------------------------------
        */

        const update = {};

        if (purpose === "email_verification") {

            update.isEmailVerified = true;

        }

        if (purpose === "login") {

            update.lastLogin = new Date();

            update.loginType = "password";

            update.$push = {

                loginHistory: {

                    $each: [

                        {

                            loginTime: new Date(),

                            loginMethod: "OTP",

                            status: "Success"

                        }

                    ],

                    $slice: -20

                }

            };

        }

        await User.updateOne(

            {

                _id: user._id

            },

            update

        );

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
==================================================
RESEND SIGNUP OTP
==================================================
*/

exports.resendSignupOTP = async (email) => {

    return exports.sendSignupOTP(email);

};

/*
==================================================
RESEND LOGIN OTP
==================================================
*/

exports.resendLoginOTP = async (email) => {

    return exports.sendLoginOTP(email);

};