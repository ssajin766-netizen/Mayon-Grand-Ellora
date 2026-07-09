const express = require("express");
const router = express.Router();

const user_collection = require("../models/userModel");
const date = require("../date/date");

const {
    isLoggedIn,
    isAdmin,
    isApproved
} = require("../middleware/auth");

/*
--------------------------------------------------
HELPDESK
--------------------------------------------------
*/

router.get(
    "/helpdesk",
    isLoggedIn,
    isApproved,
    async (req, res) => {

        try {

            if (req.user.isAdmin) {

                const foundUsers = await user_collection.User.find({

                    societyName: req.user.societyName,

                    validation: "approved"

                });

                return res.render("helpdeskAdmin", {

                    users: foundUsers

                });

            }

            const foundUser = await user_collection.User.findById(req.user.id);

            if (!foundUser) {

                return res.status(404).send("User not found");

            }

            let complaints = foundUser.complaints;

            if (!complaints.length) {

                complaints = [

                    {

                        category: "You have not raised any complaint",

                        description:
                            "You can raise complaints and track their resolution by the facility manager."

                    }

                ];

            }

            res.render("helpdesk", {

                complaints

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
COMPLAINT PAGE
--------------------------------------------------
*/

router.get(
    "/complaint",
    isLoggedIn,
    isApproved,
    (req, res) => {

        res.render("complaint");

    }
);

/*
--------------------------------------------------
SUBMIT COMPLAINT
--------------------------------------------------
*/

router.post(
    "/complaint",
    isLoggedIn,
    isApproved,
    async (req, res) => {

        try {

            const foundUser =
                await user_collection.User.findById(req.user.id);

            if (!foundUser) {

                return res.status(404).send("User not found");

            }

            foundUser.complaints.push({

                date: date.dateString,

                category: req.body.category,

                type: req.body.type,

                description: req.body.description,

                status: "open"

            });

            await foundUser.save();

            res.redirect("/helpdesk");

        }

        catch (err) {

            console.error(err);

            res.status(500).send("Server Error");

        }

    }
);

/*
--------------------------------------------------
CLOSE COMPLAINT
--------------------------------------------------
*/

router.post(
    "/closeTicket",
    isLoggedIn,
    isAdmin,
    async (req, res) => {

        try {

            const userId = Object.keys(req.body.ticket)[0];

            const ticketIndex = Object.values(req.body.ticket)[0];

            const foundUser =
                await user_collection.User.findById(userId);

            if (!foundUser) {

                return res.status(404).send("User not found");

            }

            if (!foundUser.complaints[ticketIndex]) {

                return res.status(404).send("Complaint not found");

            }

            foundUser.complaints[ticketIndex].status = "close";

            await foundUser.save();

            res.redirect("/helpdesk");

        }

        catch (err) {

            console.error(err);

            res.status(500).send("Server Error");

        }

    }
);

module.exports = router;