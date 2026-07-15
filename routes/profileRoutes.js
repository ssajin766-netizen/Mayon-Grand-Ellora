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

            const resident = await User.findById(req.user.id);

            if (!resident) {
                return res.status(404).send("User not found");
            }

            const society = await Society.findOne({

                societyName: resident.societyName

            });

            if (!society) {
                return res.status(404).send("Society not found");
            }

            res.render("profile", {

                resident,

                society

            });

        }

        catch (err) {

            console.error(err);

            res.status(500).send("Server Error");

        }

    }

);

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

            const resident = await User.findById(req.user.id);

            if (!resident) {
                return res.status(404).send("User not found");
            }

            const society = await Society.findOne({

                societyName: resident.societyName

            });

            if (!society) {
                return res.status(404).send("Society not found");
            }

            res.render("editProfile", {

                resident,

                society

            });

        }

        catch (err) {

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

            await User.findByIdAndUpdate(

                req.user.id,

                {

                    firstName: req.body.firstName,

                    lastName: req.body.lastName,

                    phoneNumber: req.body.phoneNumber,

                    flatNumber: req.body.flatNumber,

                    twoFactorEnabled:
                        req.body.twoFactorEnabled === "on"

                },

                {

                    new: true,

                    runValidators: true

                }

            );

            /*
            ------------------------------------------
            Update Society Address (Admin Only)
            ------------------------------------------
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

                        societyAddress: {

                            address: req.body.address,

                            city: req.body.city,

                            district: req.body.district,

                            postalCode: req.body.postalCode

                        }

                    },

                    {

                        runValidators: true

                    }

                );

            }

            res.redirect("/profile");

        }

        catch (err) {

            console.error(err);

            res.status(500).send("Server Error");

        }

    }

);

/*
--------------------------------------------------
Toggle Two-Step Verification
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

                    twoFactorEnabled:
                        req.body.enabled === "true"

                }

            );

            res.redirect("/profile");

        }

        catch (err) {

            console.error(err);

            res.status(500).send("Server Error");

        }

    }

);

module.exports = router;