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

router.get(
    "/editProfile",
    isLoggedIn,
    isApproved,
    async (req, res) => {

        try {

            const resident = await User.findById(req.user.id).lean();

            if (!resident) {
                return res.status(404).send("User not found");
            }

            const society = await Society.findOne({
                societyName: resident.societyName
            }).lean();

            if (!society) {
                return res.status(404).send("Society not found");
            }

            res.render("editProfile", {
                resident,
                society
            });

        } catch (err) {

            console.error(err);

            res.status(500).send("Server Error");

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

                firstName: req.body.firstName,

                lastName: req.body.lastName,

                phoneNumber: req.body.phoneNumber,

                flatNumber: req.body.flatNumber,

                loginType:
                    req.body.loginType || "password",

                twoFactorEnabled:
                    req.body.twoFactorEnabled === "on"

            };

            await User.findByIdAndUpdate(
            req.user.id,
           {
           $set: updateData
           },
          {
          new: true,
          runValidators: true
          }
          );

            // Optional

            if (req.body.isEmailVerified !== undefined) {

                updateData.isEmailVerified =
                    req.body.isEmailVerified === "true";

            }

            if (req.body.isPhoneVerified !== undefined) {

                updateData.isPhoneVerified =
                    req.body.isPhoneVerified === "true";

            }

            updateData.lastLogin = new Date();

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

                return res.status(404).send("User not found");

            }

            /*
            ----------------------------------
            Update Society
            ----------------------------------
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

                            societyAddress: {

                                address:
                                    req.body.address,

                                city:
                                    req.body.city,

                                district:
                                    req.body.district,

                                postalCode:
                                    req.body.postalCode

                            }

                        }

                    }

                );

            }

            res.redirect("/profile");

        }

        catch (err) {

            console.error("PROFILE UPDATE ERROR");

            console.error(err);

            res.status(500).send("Unable to update profile.");

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