const express = require("express");
const router = express.Router();

const { User } = require("../../models/userModel");

const {
    createNotification
} = require("../../services/notificationService");

const date = require("../../date/date");

const {
    isLoggedIn,
    isApproved,
    isAdmin
} = require("../../middleware/auth");

/*
=================================================
GET HELPDESK
=================================================
*/

router.get(
    "/helpdesk",
    isLoggedIn,
    isApproved,
    async (req, res) => {

        try {

            if (req.user.isAdmin) {

                const residents = await User.find({

                    societyName: req.user.societyName,

                    validation: "approved"

                }).select(
                    "firstName lastName flatNumber complaints"
                );

                return res.json({

                    success: true,

                    role: "admin",

                    residents

                });

            }

            const user = await User.findById(req.user._id)
                .select("complaints");

            if (!user) {

                return res.status(404).json({

                    success: false,

                    message: "User not found."

                });

            }

            return res.json({

                success: true,

                role: "resident",

                complaints: user.complaints

            });

        }

        catch (err) {

            console.error(err);

            return res.status(500).json({

                success: false,

                message: "Unable to load helpdesk."

            });

        }

    }
);

/*
=================================================
SUBMIT COMPLAINT
=================================================
*/

router.post(
    "/helpdesk/complaints",
    isLoggedIn,
    isApproved,
    async (req, res) => {

        try {

            const {

                category,

                type,

                description

            } = req.body;

            const user = await User.findById(req.user._id);

            if (!user) {

                return res.status(404).json({

                    success: false,

                    message: "User not found."

                });

            }

            user.complaints.push({

                date: date.dateString,

                category,

                type,

                description,

                status: "open"

            });

            await user.save();

            await createNotification({

                user: user._id,

                title: "Complaint Submitted",

                message: `Your ${category} complaint has been submitted successfully.`,

                type: "info",

                icon: "fa-circle-exclamation",

                link: "/helpdesk"

            });

            const admins = await User.find({

                societyName: user.societyName,

                isAdmin: true

            });

            for (const admin of admins) {

                await createNotification({

                    user: admin._id,

                    title: "New Complaint",

                    message: `${user.firstName} ${user.lastName} submitted a ${category} complaint.`,

                    type: "warning",

                    icon: "fa-headset",

                    link: "/helpdesk"

                });

            }

            return res.status(201).json({

                success: true,

                message: "Complaint submitted successfully.",

                complaint: user.complaints[user.complaints.length - 1]

            });

        }

        catch (err) {

            console.error(err);

            return res.status(500).json({

                success: false,

                message: "Unable to submit complaint."

            });

        }

    }
);

/*
=================================================
CLOSE COMPLAINT
=================================================
*/

router.put(
    "/helpdesk/complaints/:userId/:index/close",
    isLoggedIn,
    isAdmin,
    async (req, res) => {

        try {

            const {

                userId,

                index

            } = req.params;

            const user = await User.findById(userId);

            if (!user) {

                return res.status(404).json({

                    success: false,

                    message: "User not found."

                });

            }

            if (!user.complaints[index]) {

                return res.status(404).json({

                    success: false,

                    message: "Complaint not found."

                });

            }

            user.complaints[index].status = "close";

            await user.save();

            await createNotification({

                user: user._id,

                title: "Complaint Resolved",

                message: `Your ${user.complaints[index].category} complaint has been resolved.`,

                type: "success",

                icon: "fa-circle-check",

                link: "/helpdesk",

                sendEmail: true

            });

            return res.json({

                success: true,

                message: "Complaint closed successfully.",

                complaint: user.complaints[index]

            });

        }

        catch (err) {

            console.error(err);

            return res.status(500).json({

                success: false,

                message: "Unable to close complaint."

            });

        }

    }
);

module.exports = router;