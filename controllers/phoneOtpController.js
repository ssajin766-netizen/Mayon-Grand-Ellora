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

        let phoneNumber = (req.body.phoneNumber || "").trim();

        if (!phoneNumber) {

            req.flash(
                "error",
                "Phone number is required."
            );

            return res.redirect("/loginPhone");

        }

        // Remove spaces

        phoneNumber = phoneNumber.replace(/\s+/g, "");

        // Validate E.164 format

        if (!/^\+[1-9]\d{8,14}$/.test(phoneNumber)) {

            req.flash(
                "error",
                "Please enter a valid mobile number."
            );

            return res.redirect("/loginPhone");

        }

        console.log("================================");
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
                    "Unable to create login session."
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

            err.message ||

            "Unable to send OTP."

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

        const otp = (req.body.otp || "").trim();

        if (!phoneNumber) {

            req.flash(
                "error",
                "Session expired."
            );

            return res.redirect("/loginPhone");

        }

        if (!/^\d{4,8}$/.test(otp)) {

            req.flash(
                "error",
                "Invalid OTP."
            );

            return res.redirect("/verifyPhoneOtp");

        }

        /*
        ------------------------------------------
        VERIFY OTP FROM TWILIO
        ------------------------------------------
        */

        const result = await checkVerification(

            phoneNumber,

            otp

        );

        console.log("================================");
        console.log("VERIFY STATUS:", result.status);
        console.log("================================");

        if (result.status !== "approved") {

            req.flash(
                "error",
                "Invalid OTP."
            );

            return res.redirect("/verifyPhoneOtp");

        }

        

/*
------------------------------------------
FIND USER
------------------------------------------
*/

let user;

// Password Login → Phone OTP (2FA)
if (req.session.phoneLoginUser) {

    user = await User.findById(

        req.session.phoneLoginUser

    );

}

// Normal Phone Login
else {

    user = await User.findOne({

        phoneNumber

    });

}

        /*
        ------------------------------------------
        CREATE USER
        ------------------------------------------
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

                societyName: "",

                flatNumber: "",

                isAdmin: false,

                loginType: "phone",

                isPhoneVerified: true,

                isEmailVerified: false,

                twoFactorEnabled: false,

                lastLogin: new Date(),

                lastLoginIp: req.ip,

                loginHistory: []

            });

            await User.register(

                user,

                Math.random().toString(36)

            );

        }

        /*
        ------------------------------------------
        ACCOUNT STATUS
        ------------------------------------------
        */

        if (user.validation === "rejected") {

            req.flash(

                "error",

                "Your account has been rejected."

            );

            return res.redirect("/login");

        }

        /*
        ------------------------------------------
        UPDATE LOGIN DETAILS
        ------------------------------------------
        */

        user.lastLogin = new Date();

        user.lastLoginIp = req.ip;

        user.loginType = "phone";

        user.isPhoneVerified = true;

        await user.addLoginHistory({

            loginTime: new Date(),

            loginMethod: "Phone",

            status: "Success",

            ip: req.ip,

            browser: req.headers["user-agent"],

            device: "",

            location: ""

        });

        /*
        ------------------------------------------
        SAVE USER
        ------------------------------------------
        */

        await user.save();

        /*
        ------------------------------------------
        LOGIN USER
        ------------------------------------------
        */

        req.login(user, (err) => {

            if (err) {

                console.error(err);

                req.flash(

                    "error",

                    "Login failed."

                );

                return res.redirect("/login");

            }

           delete req.session.phoneNumber;
           delete req.session.phoneLoginUser;
           delete req.session.pendingUser;

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

/*
--------------------------------------------------
FLUTTER API - SEND OTP
--------------------------------------------------
*/

exports.sendOtpApi = async (req, res) => {

    try {

        let { phoneNumber } = req.body;

        phoneNumber = (phoneNumber || "").trim();

        if (!phoneNumber) {

            return res.status(400).json({
                success: false,
                message: "Phone number is required."
            });

        }

        const user = await User.findOne({ phoneNumber });

        if (!user) {

            return res.status(404).json({
                success: false,
                message: "Phone number not registered."
            });

        }

        await sendVerification(phoneNumber);

        return res.json({

            success: true,
            message: "OTP sent successfully."

        });

    }

    catch (err) {

        console.error(err);

        return res.status(500).json({

            success: false,
            message: err.message

        });

    }

};

/*
--------------------------------------------------
FLUTTER API - VERIFY OTP
--------------------------------------------------
*/

exports.verifyOtpApi = async (req, res, next) => {

    try {

        const { phoneNumber, otp } = req.body;

        if (!phoneNumber || !otp) {

            return res.status(400).json({

                success: false,
                message: "Phone number and OTP are required."

            });

        }

        const result = await checkVerification(
            phoneNumber,
            otp
        );

        if (result.status !== "approved") {

            return res.status(401).json({

                success: false,
                message: "Invalid OTP"

            });

        }

        const user = await User.findOne({ phoneNumber });

        if (!user) {

            return res.status(404).json({

                success: false,
                message: "User not found"

            });

        }

        // Update login details
        user.lastLogin = new Date();
        user.lastLoginIp = req.ip;
        user.loginType = "phone";
        user.isPhoneVerified = true;

        user.addLoginHistory({

            loginTime: new Date(),
            loginMethod: "Phone",
            status: "Success",
            ip: req.ip,
            browser: req.headers["user-agent"] || "",
            device: "",
            location: ""

        });

        await user.save();

        req.login(user, err => {

            if (err) return next(err);

            return res.json({

                success: true,
                message: "Login successful",

                user: {

                    id: user._id,
                    username: user.username,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    phoneNumber: user.phoneNumber,
                    societyName: user.societyName,
                    flatNumber: user.flatNumber,
                    validation: user.validation,
                    isAdmin: user.isAdmin

                }

            });

        });

    }

    catch (err) {

        console.error(err);

        return res.status(500).json({

            success: false,
            message: err.message

        });

    }

};