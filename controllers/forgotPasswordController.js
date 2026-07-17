const { User } = require("../models/userModel");
const OTP = require("../models/otpModel");

const generateOTP = require("../utils/generateOTP");
const sendOTP = require("../utils/sendOTP");

/*
==================================================
FORGOT PASSWORD PAGE
==================================================
*/

exports.forgotPasswordPage = (req, res) => {

    res.render("forgotPassword", {

        error: req.flash("error"),

        success: req.flash("success")

    });

};
/*
==================================================
SEND RESET OTP
==================================================
*/

exports.sendResetOTP = async (req, res) => {

    try {

        const email = req.body.email.trim().toLowerCase();

        if (!email) {

            req.flash(
                "error",
                "Email is required."
            );

            return res.redirect("/forgot-password");

        }

        const user = await User.findOne({

            username: email

        });

        if (!user) {

            req.flash(
                "error",
                "No account found with this email."
            );

            return res.redirect("/forgot-password");

        }

        const otp = generateOTP();

        await OTP.deleteMany({

            email,

            purpose: "password_reset"

        });

        await OTP.create({

            email,

            otp,

            purpose: "password_reset"

        });

        await sendOTP(

            email,

            otp,

            "password_reset"

        );

        req.session.resetEmail = email;

        req.flash(

            "success",

            "OTP sent successfully."

        );

        return res.redirect("/verify-reset-otp");

    }

    catch (err) {

        console.error(err);

        req.flash(

            "error",

            "Unable to send OTP."

        );

        return res.redirect("/forgot-password");

    }

};
/*
==================================================
VERIFY RESET OTP PAGE
==================================================
*/

exports.verifyResetOtpPage = (req, res) => {

    if (!req.session.resetEmail) {

        req.flash(
            "error",
            "Session expired. Please try again."
        );

        return res.redirect("/forgot-password");

    }

    res.render("verifyResetOtp", {

        email: req.session.resetEmail,

        error: req.flash("error"),

        success: req.flash("success")

    });

};


/*
==================================================
VERIFY RESET OTP
==================================================
*/

exports.verifyResetOTP = async (req, res) => {

    try {

        const email = req.session.resetEmail;

        const otp = req.body.otp.trim();

        if (!email) {

            req.flash(
                "error",
                "Session expired."
            );

            return res.redirect("/forgot-password");

        }

        const otpRecord = await OTP.findOne({

            email,

            otp,

            purpose: "password_reset"

        });

        if (!otpRecord) {

            req.flash(
                "error",
                "Invalid OTP."
            );

            return res.redirect("/verify-reset-otp");

        }

        // Check expiry
        if (otpRecord.expiresAt < new Date()) {

            await OTP.deleteOne({

                _id: otpRecord._id

            });

            req.flash(
                "error",
                "OTP has expired."
            );

            return res.redirect("/forgot-password");

        }

        // Delete OTP after successful verification
        await OTP.deleteOne({

            _id: otpRecord._id

        });

        req.session.resetVerified = true;

        req.flash(
            "success",
            "OTP verified successfully."
        );

        return res.redirect("/reset-password");

    }

    catch (err) {

        console.error(err);

        req.flash(
            "error",
            "OTP verification failed."
        );

        return res.redirect("/verify-reset-otp");

    }

};
/*
==================================================
RESET PASSWORD PAGE
==================================================
*/

exports.resetPasswordPage = (req, res) => {

    if (!req.session.resetEmail || !req.session.resetVerified) {

        req.flash(
            "error",
            "Please verify your OTP first."
        );

        return res.redirect("/forgot-password");

    }

    res.render("resetPassword", {

        email: req.session.resetEmail,

        error: req.flash("error"),

        success: req.flash("success")

    });

};


/*
==================================================
RESET PASSWORD
==================================================
*/

exports.resetPassword = async (req, res) => {

    try {

        const email = req.session.resetEmail;

        if (!email || !req.session.resetVerified) {

            req.flash(
                "error",
                "Unauthorized request."
            );

            return res.redirect("/forgot-password");

        }

        const {

            password,

            confirmPassword

        } = req.body;

        if (!password || !confirmPassword) {

            req.flash(
                "error",
                "Please fill all fields."
            );

            return res.redirect("/reset-password");

        }

        if (password !== confirmPassword) {

            req.flash(
                "error",
                "Passwords do not match."
            );

            return res.redirect("/reset-password");

        }

        if (password.length < 6) {

            req.flash(
                "error",
                "Password must be at least 6 characters."
            );

            return res.redirect("/reset-password");

        }

        const user = await User.findOne({

            username: email

        });

        if (!user) {

            req.flash(
                "error",
                "User not found."
            );

            return res.redirect("/forgot-password");

        }

        /*
        ==========================================
        UPDATE PASSWORD
        ==========================================
        */

        await user.setPassword(password);

        await user.save();

        /*
        ==========================================
        CLEAR SESSION
        ==========================================
        */

        delete req.session.resetEmail;
        delete req.session.resetVerified;

        req.flash(
            "success",
            "Password updated successfully. Please login."
        );

        return res.redirect("/login");

    }

    catch (err) {

        console.error(err);

        req.flash(
            "error",
            "Unable to reset password."
        );

        return res.redirect("/reset-password");

    }

};