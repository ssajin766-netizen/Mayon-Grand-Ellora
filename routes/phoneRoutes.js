const express = require("express");
const router = express.Router();

const phoneOtpController = require("../controllers/phoneOtpController");

/*
--------------------------------------------------
PHONE LOGIN PAGE
--------------------------------------------------
*/

router.get(
    "/loginPhone",
    phoneOtpController.loginPhonePage
);

/*
--------------------------------------------------
SEND OTP
--------------------------------------------------
*/

router.post(
    "/phone/send",
    phoneOtpController.sendOTP
);

/*
--------------------------------------------------
VERIFY OTP PAGE
--------------------------------------------------
*/

router.get(
    "/verifyPhoneOtp",
    phoneOtpController.verifyPhonePage
);

/*
--------------------------------------------------
VERIFY OTP
--------------------------------------------------
*/

router.post(
    "/phone/verify",
    phoneOtpController.verifyOTP
);

/*
--------------------------------------------------
RESEND OTP
--------------------------------------------------
*/

router.post(
    "/phone/resend",
    phoneOtpController.sendOTP
);

/*
--------------------------------------------------
PHONE LOGOUT
--------------------------------------------------
*/

router.get(
    "/phone/logout",
    (req, res) => {

        req.logout((err) => {

            if (err) {

                console.error(err);

                return res.redirect("/home");

            }

            req.session.destroy(() => {

                res.clearCookie("connect.sid");

                res.redirect("/login");

            });

        });

    }
);

module.exports = router;