const express = require("express");
const router = express.Router();

const user_collection = require("../models/userModel");
const society_collection = require("../models/societyModel");

const {
    isLoggedIn,
    isVerified,
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

            const foundUser =
                await user_collection.User.findById(req.user.id);

            if (!foundUser) {

                return res.status(404).send("User not found");

            }

            const foundSociety =
                await society_collection.Society.findOne({

                    societyName: foundUser.societyName

                });

            if (!foundSociety) {

                return res.status(404).send("Society not found");

            }

            res.render("profile", {

                resident: foundUser,

                society: foundSociety

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

            const foundUser =
                await user_collection.User.findById(req.user.id);

            if (!foundUser) {

                return res.status(404).send("User not found");

            }

            const foundSociety =
                await society_collection.Society.findOne({

                    societyName: foundUser.societyName

                });

            if (!foundSociety) {

                return res.status(404).send("Society not found");

            }

            res.render("editProfile", {

                resident: foundUser,

                society: foundSociety

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

            await user_collection.User.updateOne(

                {

                    _id: req.user.id

                },

                {

                    $set: {

                        firstName: req.body.firstName,

                        lastName: req.body.lastName,

                        phoneNumber: req.body.phoneNumber,

                        flatNumber: req.body.flatNumber

                    }

                }

            );

            // Update Society Address (Admin Only)

            if (req.user.isAdmin && req.body.address) {

                await society_collection.Society.updateOne(

                    {

                        admin: req.user.username

                    },

                    {

                        $set: {

                            societyAddress: {

                                address: req.body.address,

                                city: req.body.city,

                                district: req.body.district,

                                postalCode: req.body.postalCode

                            }

                        }

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

module.exports = router;