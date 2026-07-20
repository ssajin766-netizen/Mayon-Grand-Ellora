const express = require("express");
const router = express.Router();

const society_collection = require("../models/societyModel");
const { User } = require("../models/userModel");

const {
    createNotification
} = require("../services/notificationService");
const date = require("../date/date");

const {
    isLoggedIn,
    isAdmin,
    isApproved
} = require("../middleware/auth");

/*
--------------------------------------------------
NOTICE BOARD
--------------------------------------------------
*/

router.get(
    "/noticeboard",
    isLoggedIn,
    isApproved,
    async (req, res) => {

        try {

            const foundSociety =
                await society_collection.Society.findOne(

                    {
                        societyName: req.user.societyName
                    },

                    {
                        noticeboard: 1
                    }

                );

            if (!foundSociety) {

                return res.status(404).send("Society not found");

            }

            let notices = foundSociety.noticeboard;

            if (!notices || notices.length === 0) {

                notices = [

                    {

                        subject:
                            "Access all important announcements, notices and circulars here."

                    }

                ];

            }

            res.render("noticeboard", {

                notices,

                isAdmin: req.user.isAdmin

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
ADD NOTICE PAGE
--------------------------------------------------
*/

router.get(
    "/notice",
    isLoggedIn,
    isAdmin,
    (req, res) => {

        res.render("notice");

    }
);

/*
--------------------------------------------------
CREATE NOTICE
--------------------------------------------------
*/

router.post(
    "/notice",
    isLoggedIn,
    isAdmin,
    async (req, res) => {

        try {

            const foundSociety =
                await society_collection.Society.findOne({

                    societyName: req.user.societyName

                });

            if (!foundSociety) {

                return res.status(404).send("Society not found");

            }

            foundSociety.noticeboard.push({

                date: date.dateString,

                subject: req.body.subject,

                details: req.body.details

            });

            await foundSociety.save();
/*
--------------------------------------------------
NOTIFY ALL APPROVED RESIDENTS
--------------------------------------------------
*/

const residents = await User.find({

    societyName: req.user.societyName,

    validation: "approved",

    _id: { $ne: req.user._id } // Skip admin who posted the notice

});

await Promise.all(

    residents.map(resident =>

        createNotification({

            user: resident._id,

            title: "New Notice",

            message: req.body.subject,

            type: "info",

            icon: "fa-bullhorn",

            link: "/noticeboard"

        })

    )

);

            res.redirect("/noticeboard");

        }

        catch (err) {

            console.error(err);

            res.status(500).send("Server Error");

        }

    }
);

module.exports = router;