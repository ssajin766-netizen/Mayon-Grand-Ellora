const { User } = require("../models/userModel");

const {
    sendVerification,
    checkVerification
} = require("../services/twilioVerify");

/*
--------------------------------------------------
PHONE LOGIN PAGE
--------------------------------------------------
*/

exports.loginPhonePage = (req, res) => {

    res.render("loginPhone", {

        hideNavbar: true

    });

};

/*
--------------------------------------------------
SEND PHONE OTP
--------------------------------------------------
*/

exports.sendOTP = async (req, res) => {

    try {

        const phoneNumber = req.body.phoneNumber.trim();

        if (!phoneNumber) {

            req.flash(
                "error",
                "Phone number is required."
            );

            return res.redirect("/loginPhone");

        }

        console.log("PHONE :", phoneNumber);

        await sendVerification(phoneNumber);

        req.session.phoneNumber = phoneNumber;

        req.flash(
            "success",
            "OTP sent successfully."
        );

        req.session.save((err) => {

            if (err) {

                console.error(err);

                req.flash(
                    "error",
                    "Unable to create session."
                );

                return res.redirect("/loginPhone");

            }

            return res.redirect("/verifyPhoneOtp");

        });

    }

    catch (err) {

        console.error(err);

        req.flash(
            "error",
            err.message
        );

        return res.redirect("/loginPhone");

    }

};

/*
--------------------------------------------------
VERIFY OTP PAGE
--------------------------------------------------
*/

exports.verifyPhonePage = (req, res) => {

    if (!req.session.phoneNumber) {

        return res.redirect("/loginPhone");

    }

    res.render("verifyPhoneOtp", {

        hideNavbar: true

    });

};

/*
--------------------------------------------------
VERIFY PHONE OTP
--------------------------------------------------
*/

exports.verifyOTP = async (req, res) => {

    try {

        const phoneNumber = req.session.phoneNumber;

        const otp = req.body.otp.trim();

        if (!phoneNumber) {

            return res.redirect("/loginPhone");

        }

        const result = await checkVerification(

            phoneNumber,

            otp

        );

        console.log(result);

        if (result.status !== "approved") {

            req.flash(

                "error",

                "Invalid OTP."

            );

            return res.redirect("/verifyPhoneOtp");

        }

        /*
        ==========================================
        FIND USER
        ==========================================
        */

        let user = await User.findOne({

            phoneNumber

        });

        /*
        ==========================================
        CREATE USER LIKE GOOGLE LOGIN
        ==========================================
        */

        if (!user) {

            const username =

                phoneNumber.replace("+", "") +

                "@phone.esociety";

            user = new User({

                username,

                phoneNumber,

                firstName: "",

                lastName: "",

                validation: "applied",

                societyName: "Pending",

                flatNumber: "Pending",

                isAdmin: false,

                loginType: "phone",

                isPhoneVerified: true,

                isEmailVerified: false,

                twoFactorEnabled: false,

                lastLogin: new Date(),

                loginHistory: []

            });

            await User.register(

                user,

                Math.random().toString(36)

            );

        }

        /*
        ==========================================
        UPDATE LOGIN DETAILS
        ==========================================
        */

        user.lastLogin = new Date();

        user.loginType = "phone";

        user.isPhoneVerified = true;

        user.lastLoginIp = req.ip;

        user.loginHistory.unshift({

            loginTime: new Date(),

            loginMethod: "Phone",

            status: "Success",

            ip: req.ip,

            browser: req.headers["user-agent"],

            device: "",

            location: ""

        });

        if (user.loginHistory.length > 20) {

            user.loginHistory =

                user.loginHistory.slice(0, 20);

        }

        await user.save();

        /*
        ==========================================
        LOGIN USER
        ==========================================
        */

        req.login(user, (err) => {

            if (err) {

                console.error(err);

                return res.redirect("/login");

            }

            delete req.session.phoneNumber;

            req.session.save(() => {

                req.flash(

                    "success",

                    "Logged in successfully."

                );

                return res.redirect("/home");

            });

        });

    }

    catch (err) {

        console.error(err);

        req.flash(

            "error",

            "OTP verification failed."

        );

        return res.redirect("/verifyPhoneOtp");

    }

};