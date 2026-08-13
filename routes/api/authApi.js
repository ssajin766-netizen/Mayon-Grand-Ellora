const express = require("express");
const passport = require("passport");

const phoneOtpController = require("../../controllers/phoneOtpController");

const router = express.Router();

/*
==================================================
EMAIL / PASSWORD LOGIN
POST /api/auth/login
==================================================
*/

router.post("/login", (req, res, next) => {

    console.log("==================================");
    console.log("API LOGIN");
    console.log("METHOD:", req.method);
    console.log("BODY:", req.body);
    console.log("==================================");

    passport.authenticate("local", (err, user) => {

        if (err) {
            console.log(err);
            return next(err);
        }

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        req.login(user, (err) => {

            if (err) {
                return next(err);
            }

            return res.json({
                success: true,
                message: "Login successful.",
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

    })(req, res, next);

});
/*
==================================================
GOOGLE SIGN-IN API (MOBILE)
==================================================
*/

router.post("/google", async (req, res, next) => {
    try {
        const { email, googleId, firstName, lastName, profileImage } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required."
            });
        }

        const cleanEmail = email.toLowerCase().trim();
        const User = require("../../models/userModel").User;

        let user = await User.findOne({
            $or: [{ googleId: googleId }, { username: cleanEmail }]
        });

        if (user) {
            user.googleId = googleId || user.googleId;
            if (firstName) user.firstName = firstName;
            if (lastName) user.lastName = lastName;
            user.isEmailVerified = true;
            user.lastLogin = new Date();
            user.lastLoginIp = req.ip;
            user.loginType = "google";

            user.addLoginHistory({
                loginTime: new Date(),
                loginMethod: "Google",
                status: "Success",
                ip: req.ip,
                browser: req.headers["user-agent"] || "Mobile App"
            });

            await user.save();
        } else {
            user = new User({
                username: cleanEmail,
                googleId: googleId || "",
                loginType: "google",
                validation: "applied",
                isAdmin: false,
                societyName: "",
                flatNumber: "",
                phoneNumber: "",
                firstName: firstName || "",
                lastName: lastName || "",
                profileImage: profileImage || "/images/default-avatar.png",
                isEmailVerified: true,
                isPhoneVerified: false,
                twoFactorEnabled: false,
                lastLogin: new Date(),
                lastLoginIp: req.ip,
                loginHistory: [
                    {
                        loginTime: new Date(),
                        loginMethod: "Google",
                        status: "Success",
                        ip: req.ip,
                        browser: req.headers["user-agent"] || "Mobile App"
                    }
                ]
            });

            await User.register(user, Math.random().toString(36));
        }

        req.login(user, (err) => {

    if (err) return next(err);

    req.session.save((err) => {

        if (err) {
            return next(err);
        }

        return res.json({
            success: true,
            message: "Google login successful",
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

});
    } catch (err) {
        console.error("Mobile Google Login Error:", err);
        return res.status(500).json({
            success: false,
            message: err.message || "Google login failed"
        });
    }
});
/*
==================================================
PHONE OTP
==================================================
*/

router.post(
    "/send-phone-otp",
    phoneOtpController.sendOtpApi
);

router.post(
    "/resend-otp",
    phoneOtpController.resendOtpApi
);

router.post(
    "/verify-phone-otp",
    phoneOtpController.verifyOtpApi
);


/*
==================================================
PHONE REGISTRATION
==================================================
*/

router.post(
    "/complete-phone-registration",
    phoneOtpController.completePhoneRegistration
);

/*
==================================================
CURRENT USER SESSION (/api/auth/me)
==================================================
*/
router.get("/me", (req, res) => {

    console.log("SessionID:", req.sessionID);

    console.log("Passport:", req.session.passport);

    console.log("Authenticated:", req.isAuthenticated());

    console.log("User:", req.user);

    if (!req.isAuthenticated()) {
        return res.status(401).json({
            success: false,
            message: "Not authenticated"
        });
    }
    const user = req.user;
    return res.json({
        success: true,
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

/*
==================================================
LOGOUT (/api/auth/logout)
==================================================
*/
router.post("/logout", (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ success: false, message: "Logout failed" });
        }
        req.session.destroy(() => {
            res.clearCookie("connect.sid");
            return res.json({ success: true, message: "Logged out successfully" });
        });
    });
});

router.post('/push-token', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  const { expoToken, platform } = req.body;
  if (!expoToken || !platform) {
    return res.status(400).json({ success: false, message: 'expoToken and platform are required' });
  }
  try {
    const User = require('../../models/userModel').User;
    await User.findByIdAndUpdate(req.user._id, {
      $set: {
        'pushNotification.expoToken': expoToken,
        'pushNotification.platform': platform,
        'pushNotification.updatedAt': new Date()
      }
    });
    return res.json({ success: true, message: 'Push token saved' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});
module.exports = router;