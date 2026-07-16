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

    res.render("loginPhone");

};

/*
--------------------------------------------------
SEND OTP
--------------------------------------------------
*/

exports.sendOTP = async (req, res) => {

    try {

        let phoneNumber = req.body.phoneNumber.trim();

        if (!phoneNumber) {

            req.flash("error", "Phone number is required.");

            return res.redirect("/loginPhone");

        }

        if (!phoneNumber.startsWith("+")) {

            phoneNumber = "+91" + phoneNumber;

        }

        console.log("PHONE :", phoneNumber);

        await sendVerification(phoneNumber);

        req.session.phoneNumber = phoneNumber;

        req.flash("success", "OTP sent successfully.");

        // IMPORTANT: Save session before redirecting
        req.session.save((err) => {

            if (err) {

                console.error("SESSION SAVE ERROR:", err);

                req.flash(
                    "error",
                    "Unable to create login session."
                );

                return res.redirect("/loginPhone");

            }

            console.log(
                "SESSION PHONE SAVED:",
                req.session.phoneNumber
            );

            return res.redirect("/verifyPhoneOtp");

        });

    }

    catch (err) {

        console.error(err);

        req.flash(
            "error",
            err.message
        );

        res.redirect("/loginPhone");

    }

};

/*
--------------------------------------------------
VERIFY PAGE
--------------------------------------------------
*/

exports.verifyPhonePage = (req, res) => {

    console.log(
        "VERIFY PAGE SESSION:",
        req.session.phoneNumber
    );

    if (!req.session.phoneNumber) {

        console.log("Phone number missing in session.");

        return res.redirect("/loginPhone");

    }

    res.render("verifyPhoneOtp");

};

/*
--------------------------------------------------
VERIFY OTP
--------------------------------------------------
*/

exports.verifyOTP = async (req, res) => {

    try {

        const phoneNumber = req.session.phoneNumber;

        const otp = req.body.otp;

        if (!phoneNumber) {

            return res.redirect("/loginPhone");

        }

        const result = await checkVerification(

            phoneNumber,

            otp

        );

        if (result.status !== "approved") {

            req.flash(
                "error",
                "Invalid OTP."
            );

            return res.redirect("/verifyPhoneOtp");

        }

        /*
        ---------------------------------------
        FIND USER
        ---------------------------------------
        */

        let user = await User.findOne({

            phoneNumber

        });

        /*
        ---------------------------------------
        CREATE USER
        ---------------------------------------
        */

        if (!user) {

            const randomEmail =

                phoneNumber.replace("+", "") +

                "@phone.esociety";

            user = new User({

                username: randomEmail,

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
        ---------------------------------------
        UPDATE LOGIN
        ---------------------------------------
        */

        user.lastLogin = new Date();

        user.loginType = "phone";

        user.isPhoneVerified = true;

        user.loginHistory.push({

            loginTime: new Date(),

            loginMethod: "Phone",

            status: "Success",

            ip: req.ip,

            browser: req.headers["user-agent"],

            device: "",

            location: ""

        });

        if (user.loginHistory.length > 20) {

            user.loginHistory.shift();

        }

        await user.save();

        /*
        ---------------------------------------
        LOGIN USER
        ---------------------------------------
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

        res.redirect("/verifyPhoneOtp");

    }

};