const express = require("express");
const router = express.Router();

const { User } = require("../models/userModel");
const { Society } = require("../models/societyModel");

const {
    isLoggedIn,
    isApproved
} = require("../middleware/auth");

/*
--------------------------------------------------
PROFILE
--------------------------------------------------
*/

router.get(
    "/profile",
    isLoggedIn,
    isApproved,
    async (req, res) => {
        try {

            const resident = await User.findById(req.user.id).lean();

            if (!resident) {
                return res.status(404).render("failure", {
                    message: "User not found",
                    href: "/login"
                });
            }

            const society = await Society.findOne({
                societyName: resident.societyName
            }).lean();

            if (!society) {
                return res.status(404).render("failure", {
                    message: "Society not found",
                    href: "/home"
                });
            }

            res.render("profile", {
                resident,
                society
            });

        } catch (err) {

            console.error("PROFILE ERROR:", err);

            res.status(500).render("failure", {
                message: "Unable to load profile.",
                href: "/home"
            });

        }
    }
);

/*
--------------------------------------------------
EDIT PROFILE
--------------------------------------------------
*/

/*
--------------------------------------------------
EDIT PROFILE PAGE
--------------------------------------------------
*/

router.get(
    "/editProfile",
    isLoggedIn,
    isApproved,
    async (req, res) => {

        try {

            // ==========================================
            // Fetch Logged-in User
            // ==========================================

            const resident = await User.findById(req.user.id);

            if (!resident) {

                return res.status(404).render("failure", {

                    message: "Resident account not found.",

                    href: "/login",

                    buttonSecondary: "Login Again"

                });

            }

            // ==========================================
            // Fetch Society Details
            // ==========================================

            const society = await Society.findOne({

                societyName: resident.societyName

            });

            if (!society) {

                return res.status(404).render("failure", {

                    message: "Society information not found.",

                    href: "/home",

                    buttonSecondary: "Go Home"

                });

            }

            // ==========================================
            // Render Edit Profile
            // ==========================================

            res.render("editProfile", {

                title: "Edit Profile",

                resident,

                society,

                success: req.flash ? req.flash("success") : [],

                error: req.flash ? req.flash("error") : []

            });

        }

        catch (err) {

            console.error("EDIT PROFILE ERROR");

            console.error(err);

            return res.status(500).render("failure", {

                message: "Something went wrong while loading your profile.",

                href: "/profile",

                buttonSecondary: "Back to Profile"

            });

        }

    }

);

/*
--------------------------------------------------
UPDATE PROFILE
--------------------------------------------------
*/

router.post(
    "/editProfile",
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

                twoFactorEnabled:
                    req.body.twoFactorEnabled === "on"

            };

            // Optional verification fields

            if (req.body.isEmailVerified !== undefined) {

                updateData.isEmailVerified =
                    req.body.isEmailVerified === "true";

            }

            if (req.body.isPhoneVerified !== undefined) {

                updateData.isPhoneVerified =
                    req.body.isPhoneVerified === "true";

            }

            const resident = await User.findByIdAndUpdate(

                req.user.id,

                {
                    $set: updateData
                },

                {
                    new: true,
                    runValidators: true
                }

            );

            if (!resident) {

                return res.status(404).render("failure", {

                    message: "Resident not found.",

                    href: "/home"

                });

            }

            /*
            ======================================
            Update Society (Admin Only)
            ======================================
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

                    },

                    {

                        runValidators: true

                    }

                );

            }

            req.flash(

                "success",

                "Profile updated successfully."

            );

            res.redirect("/profile");

        }

        catch (err) {

            console.error(

                "PROFILE UPDATE ERROR",

                err

            );

            res.status(500).render("failure", {

                message: "Unable to update profile.",

                href: "/editProfile"

            });

        }

    }

);

/*
--------------------------------------------------
Toggle Two Factor
--------------------------------------------------
*/

router.post(
    "/profile/two-factor",
    isLoggedIn,
    async (req, res) => {

        try {

            await User.findByIdAndUpdate(

                req.user.id,

                {

                    $set: {

                        twoFactorEnabled:
                            req.body.enabled === "true"

                    }

                }

            );

            res.json({

                success: true,

                enabled:
                    req.body.enabled === "true"

            });

        }

        catch (err) {

            console.error(err);

            res.status(500).json({

                success: false

            });

        }

    }

);

module.exports = router;