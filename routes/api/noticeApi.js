const express = require("express");
const router = express.Router();

const { Society } = require("../../models/societyModel");
const { User } = require("../../models/userModel");

const {
    createNotification
} = require("../../services/notificationService");

const date = require("../../date/date");

const {
    isLoggedIn,
    isAdmin,
    isApproved
} = require("../../middleware/auth");

/*
=================================================
GET ALL NOTICES
=================================================
*/

router.get(
    "/notices",
    isLoggedIn,
    isApproved,
    async (req, res) => {

        try {

            const society = await Society.findOne(

                {
                    societyName: req.user.societyName
                },

                {
                    noticeboard: 1
                }

            );

            if (!society) {

                return res.status(404).json({

                    success: false,

                    message: "Society not found."

                });

            }

            let notices = society.noticeboard || [];

            notices.sort((a, b) => {

                return new Date(b.date) - new Date(a.date);

            });

            return res.json({

                success: true,

                total: notices.length,

                notices

            });

        } catch (err) {

            console.error(err);

            return res.status(500).json({

                success: false,

                message: "Unable to fetch notices."

            });

        }

    }
);

/*
=================================================
GET NOTICE DETAILS
=================================================
*/

router.get(
    "/notices/:id",
    isLoggedIn,
    isApproved,
    async (req, res) => {

        try {

            const society = await Society.findOne({

                societyName: req.user.societyName

            });

            if (!society) {

                return res.status(404).json({

                    success: false,

                    message: "Society not found."

                });

            }

            const notice = society.noticeboard.id(req.params.id);

            if (!notice) {

                return res.status(404).json({

                    success: false,

                    message: "Notice not found."

                });

            }

            return res.json({

                success: true,

                notice

            });

        } catch (err) {

            console.error(err);

            return res.status(500).json({

                success: false,

                message: "Unable to fetch notice."

            });

        }

    }
);

/*
=================================================
CREATE NOTICE
=================================================
*/

router.post(
    "/notices",
    isLoggedIn,
    isAdmin,
    async (req, res) => {

        try {

            const { subject, details } = req.body;

            if (!subject || !details) {

                return res.status(400).json({

                    success: false,

                    message: "Subject and details are required."

                });

            }

            const society = await Society.findOne({

                societyName: req.user.societyName

            });

            if (!society) {

                return res.status(404).json({

                    success: false,

                    message: "Society not found."

                });

            }

            const notice = {

                date: date.dateString,

                subject,

                details

            };

            society.noticeboard.push(notice);

            await society.save();

            /*
            --------------------------------------------------
            NOTIFY ALL APPROVED RESIDENTS
            --------------------------------------------------
            */

            const residents = await User.find({

                societyName: req.user.societyName,

                validation: "approved",

                _id: { $ne: req.user._id }

            });

            await Promise.all(

                residents.map(resident =>

                    createNotification({

                        user: resident._id,

                        title: "New Notice",

                        message: subject,

                        type: "info",

                        icon: "fa-bullhorn",

                        link: "/noticeboard",

                        sendEmail: true

                    })

                )

            );

            return res.status(201).json({

                success: true,

                message: "Notice created successfully.",

                notice: society.noticeboard[
                    society.noticeboard.length - 1
                ]

            });

        } catch (err) {

            console.error(err);

            return res.status(500).json({

                success: false,

                message: "Unable to create notice."

            });

        }

    }
);

/*
=================================================
UPDATE NOTICE
=================================================
*/

router.put(
    "/notices/:id",
    isLoggedIn,
    isAdmin,
    async (req, res) => {

        try {

            const { subject, details } = req.body;

            const society = await Society.findOne({

                societyName: req.user.societyName

            });

            if (!society) {

                return res.status(404).json({

                    success: false,

                    message: "Society not found."

                });

            }

            const notice = society.noticeboard.id(req.params.id);

            if (!notice) {

                return res.status(404).json({

                    success: false,

                    message: "Notice not found."

                });

            }

            if (subject !== undefined)
                notice.subject = subject;

            if (details !== undefined)
                notice.details = details;

            notice.date = date.dateString;

            await society.save();

            return res.json({

                success: true,

                message: "Notice updated successfully.",

                notice

            });

        } catch (err) {

            console.error(err);

            return res.status(500).json({

                success: false,

                message: "Unable to update notice."

            });

        }

    }
);

/*
=================================================
DELETE NOTICE
=================================================
*/

router.delete(
    "/notices/:id",
    isLoggedIn,
    isAdmin,
    async (req, res) => {

        try {

            const society = await Society.findOne({

                societyName: req.user.societyName

            });

            if (!society) {

                return res.status(404).json({

                    success: false,

                    message: "Society not found."

                });

            }

            const notice = society.noticeboard.id(req.params.id);

            if (!notice) {

                return res.status(404).json({

                    success: false,

                    message: "Notice not found."

                });

            }

            notice.deleteOne();

            await society.save();

            return res.json({

                success: true,

                message: "Notice deleted successfully."

            });

        } catch (err) {

            console.error(err);

            return res.status(500).json({

                success: false,

                message: "Unable to delete notice."

            });

        }

    }
);

module.exports = router;