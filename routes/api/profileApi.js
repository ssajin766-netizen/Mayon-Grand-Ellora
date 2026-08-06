const express = require("express");
const router = express.Router();

const path = require("path");
const fs = require("fs");
const sharp = require("sharp");

const upload = require("../../middleware/uploadProfile");

const { User } = require("../../models/userModel");
const { Society } = require("../../models/societyModel");

const {
    isLoggedIn,
    isApproved
} = require("../../middleware/auth");

/*
=================================================
GET PROFILE
=================================================
*/

router.get(
    "/profile",
    isLoggedIn,
    isApproved,
    async (req, res) => {

        try {

            const user = await User.findById(req.user._id).lean();

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            const society = await Society.findOne({
                societyName: user.societyName
            }).lean();

            res.json({
                success: true,
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    username: user.username,
                    phoneNumber: user.phoneNumber,
                    societyName: user.societyName,
                    flatNumber: user.flatNumber,
                    profileImage: user.profileImage,
                    validation: user.validation,
                    isAdmin: user.isAdmin,
                    loginType: user.loginType,
                    twoFactorEnabled: user.twoFactorEnabled,
                    twoFactorMethod: user.twoFactorMethod,
                    loginHistory: user.loginHistory || []
                },
                society: society
                    ? {
                          societyName: society.societyName,
                          address: society.societyAddress
                      }
                    : null
            });

        } catch (err) {

            console.error(err);

            res.status(500).json({
                success: false,
                message: "Unable to fetch profile"
            });

        }

    }
);

/*
=================================================
UPDATE PROFILE
=================================================
*/

router.put(
    "/profile",
    isLoggedIn,
    isApproved,
    async (req, res) => {

        try {

            const updateData = {
                firstName: req.body.firstName?.trim(),
                lastName: req.body.lastName?.trim(),
                phoneNumber: req.body.phoneNumber?.trim(),
                flatNumber: req.body.flatNumber?.trim(),
                loginType: req.body.loginType || "password",
                twoFactorEnabled: req.body.twoFactorEnabled === true
            };

            if (req.body.isEmailVerified !== undefined) {
                updateData.isEmailVerified =
                    req.body.isEmailVerified;
            }

            if (req.body.isPhoneVerified !== undefined) {
                updateData.isPhoneVerified =
                    req.body.isPhoneVerified;
            }

            const user = await User.findByIdAndUpdate(
                req.user._id,
                {
                    $set: updateData
                },
                {
                    new: true,
                    runValidators: true
                }
            );

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            /*
            ==========================================
            Update Society Address (Admin Only)
            ==========================================
            */

            if (
                req.user.isAdmin &&
                req.body.address
            ) {

                await Society.findOneAndUpdate(
                    {
                        admin: req.user.username
                    },
                    {
                        $set: {
                            "societyAddress.address":
                                req.body.address,
                            "societyAddress.city":
                                req.body.city,
                            "societyAddress.district":
                                req.body.district,
                            "societyAddress.postalCode":
                                req.body.postalCode
                        }
                    }
                );

            }

            return res.json({
                success: true,
                message: "Profile updated successfully.",
                user
            });

        } catch (err) {

            console.error(err);

            return res.status(500).json({
                success: false,
                message: "Unable to update profile."
            });

        }

    }
);

/*
=================================================
UPLOAD PROFILE IMAGE
=================================================
*/

router.post(
    "/profile/upload",
    isLoggedIn,
    upload.single("profileImage"),
    async (req, res) => {

        try {

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: "Please select an image."
                });
            }

            const user = await User.findById(req.user._id);

            if (!user) {

                if (fs.existsSync(req.file.path)) {
                    fs.unlinkSync(req.file.path);
                }

                return res.status(404).json({
                    success: false,
                    message: "User not found."
                });
            }

            const oldProfileImage = user.profileImage;

            const newFileName = Date.now() + ".webp";

            const outputPath = path.join(
                __dirname,
                "../../public/uploads/profiles",
                newFileName
            );

            await sharp(req.file.path)
                .resize(512, 512, {
                    fit: "cover"
                })
                .webp({
                    quality: 85
                })
                .toFile(outputPath);

            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }

            user.profileImage =
                "/uploads/profiles/" + newFileName;

            await user.save();

            if (
                oldProfileImage &&
                oldProfileImage !== "/images/default-avatar.png"
            ) {

                const oldImagePath = path.join(
                    __dirname,
                    "../../public",
                    oldProfileImage
                );

                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }

            return res.json({
                success: true,
                message: "Profile image updated successfully.",
                profileImage: user.profileImage
            });

        } catch (err) {

            console.error(err);

            if (
                req.file &&
                fs.existsSync(req.file.path)
            ) {
                fs.unlinkSync(req.file.path);
            }

            return res.status(500).json({
                success: false,
                message: "Unable to upload profile image."
            });

        }

    }
);

/*
=================================================
CHANGE PASSWORD API
=================================================
*/

router.post(
    "/change-password",
    isLoggedIn,
    async (req, res) => {

        try {

            const {
                currentPassword,
                newPassword,
                confirmPassword
            } = req.body;

            if (
                !currentPassword ||
                !newPassword ||
                !confirmPassword
            ) {
                return res.status(400).json({
                    success: false,
                    message: "All fields are required."
                });
            }

            if (newPassword !== confirmPassword) {
                return res.status(400).json({
                    success: false,
                    message: "Passwords do not match."
                });
            }

            const user = await User.findById(req.user._id);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found."
                });
            }

            await user.changePassword(
                currentPassword,
                newPassword
            );

            await user.save();

            return res.json({
                success: true,
                message: "Password updated successfully."
            });

        } catch (err) {

            console.error(err);

            return res.status(400).json({
                success: false,
                message: "Current password is incorrect."
            });

        }

    }
);

/*
=================================================
CLEAR LOGIN HISTORY API
=================================================
*/

router.post(
    "/login-history/clear",
    isLoggedIn,
    async (req, res) => {

        try {

            await User.findByIdAndUpdate(
                req.user._id,
                {
                    loginHistory: []
                }
            );

            return res.json({
                success: true,
                message: "Login history cleared successfully."
            });

        } catch (err) {

            console.error(err);

            return res.status(500).json({
                success: false,
                message: "Unable to clear login history."
            });

        }

    }
);

/*
=================================================
UPDATE TWO FACTOR SETTINGS API
=================================================
*/

router.post(
    "/security/two-factor",
    isLoggedIn,
    async (req, res) => {

        try {

            const { twoFactorMethod } = req.body;

            let update = {};

            switch (twoFactorMethod) {

                case "disabled":
                    update = {
                        twoFactorEnabled: false,
                        twoFactorMethod: "email"
                    };
                    break;

                case "email":
                    update = {
                        twoFactorEnabled: true,
                        twoFactorMethod: "email"
                    };
                    break;

                case "phone":
                    update = {
                        twoFactorEnabled: true,
                        twoFactorMethod: "phone"
                    };
                    break;

                default:
                    return res.status(400).json({
                        success: false,
                        message: "Invalid verification method."
                    });

            }

            await User.findByIdAndUpdate(
                req.user._id,
                {
                    $set: update
                }
            );

            return res.json({
                success: true,
                message: "Two-factor settings updated successfully.",
                settings: update
            });

        } catch (err) {

            console.error(err);

            return res.status(500).json({
                success: false,
                message: "Unable to update two-factor settings."
            });

        }

    }
);

/*
=================================================
LOGOUT FROM ALL DEVICES API
=================================================
*/

router.post(
    "/logout-all",
    isLoggedIn,
    (req, res, next) => {

        req.logout((err) => {

            if (err) {
                return next(err);
            }

            req.session.destroy((sessionErr) => {

                if (sessionErr) {
                    return res.status(500).json({
                        success: false,
                        message: "Unable to logout from all devices."
                    });
                }

                res.clearCookie("connect.sid");

                return res.json({
                    success: true,
                    message: "Logged out successfully from all devices."
                });

            });

        });

    }
);

/*
=================================================
SEND DELETE ACCOUNT OTP
=================================================
*/

router.post(
    "/delete-account/send-otp",
    isLoggedIn,
    async (req, res) => {

        try {

            const otp = Math.floor(
                100000 + Math.random() * 900000
            ).toString();

            req.session.deleteAccountOTP = otp;
            req.session.deleteAccountOTPExpires =
                Date.now() + 10 * 60 * 1000;

            // Send OTP using your existing email/SMS service
            // await sendOTP(req.user.username, otp);

            return res.json({
                success: true,
                message:
                    "Verification OTP sent successfully."
            });

        } catch (err) {

            console.error(err);

            return res.status(500).json({
                success: false,
                message:
                    "Unable to send verification OTP."
            });

        }

    }
);

/*
=================================================
VERIFY DELETE ACCOUNT OTP
=================================================
*/

router.post(
    "/delete-account/verify-otp",
    isLoggedIn,
    (req, res) => {

        const { otp } = req.body;

        if (
            !req.session.deleteAccountOTP ||
            !req.session.deleteAccountOTPExpires
        ) {

            return res.status(400).json({
                success: false,
                message: "OTP has expired."
            });

        }

        if (
            Date.now() >
            req.session.deleteAccountOTPExpires
        ) {

            return res.status(400).json({
                success: false,
                message: "OTP has expired."
            });

        }

        if (
            otp !== req.session.deleteAccountOTP
        ) {

            return res.status(400).json({
                success: false,
                message: "Invalid OTP."
            });

        }

        req.session.deleteAccountVerified = true;

        return res.json({
            success: true,
            message: "OTP verified successfully."
        });

    }
);

/*
=================================================
DELETE ACCOUNT
=================================================
*/

router.delete(
    "/delete-account",
    isLoggedIn,
    async (req, res) => {

        try {

            if (!req.session.deleteAccountVerified) {

                return res.status(403).json({
                    success: false,
                    message:
                        "OTP verification required."
                });

            }

            await User.findByIdAndDelete(
                req.user._id
            );

            req.logout(() => {});

            req.session.destroy(() => {});

            return res.json({
                success: true,
                message:
                    "Account deleted successfully."
            });

        } catch (err) {

            console.error(err);

            return res.status(500).json({
                success: false,
                message:
                    "Unable to delete account."
            });

        }

    }
);

/*
=================================================
DELETE SOCIETY API
=================================================
*/

router.delete(
    "/delete-society",
    isLoggedIn,
    isApproved,
    async (req, res) => {

        try {

            const user = await User.findById(req.user._id);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found."
                });
            }

            if (!user.isAdmin) {
                return res.status(403).json({
                    success: false,
                    message: "Only the society admin can delete the society."
                });
            }

            const societyName = user.societyName;

            // Delete all users belonging to the society
            await User.deleteMany({
                societyName
            });

            // Delete the society document
            await Society.deleteOne({
                societyName
            });

            req.logout((err) => {
                if (err) {
                    console.error(err);
                }
            });

            req.session.destroy(() => {});

            return res.json({
                success: true,
                message: "Society deleted successfully."
            });

        } catch (err) {

            console.error(err);

            return res.status(500).json({
                success: false,
                message: "Unable to delete society."
            });

        }

    }
);

module.exports = router;
