const express = require("express");
const router = express.Router();

const { User } = require("../../models/userModel");
const { Society } = require("../../models/societyModel");
const Notification = require("../../models/notificationModel");

const {
    isLoggedIn,
    isApproved
} = require("../../middleware/auth");

/*
=================================================
DASHBOARD
=================================================
*/

router.get(
    "/dashboard",
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

            const society = await Society.findOne({

                societyName: user.societyName

            });

            if (!society) {

                return res.status(404).json({

                    success: false,

                    message: "Society not found."

                });

            }

            const notices = [...society.noticeboard]
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 5);

            const unreadNotifications =
                await Notification.countDocuments({

                    user: user._id,

                    read: false

                });

            const approvedResidents =
                await User.countDocuments({

                    societyName: user.societyName,

                    validation: "approved"

                });

            const pendingResidents =
                await User.countDocuments({

                    societyName: user.societyName,

                    validation: "applied"

                });

            const openComplaints =
                user.complaints.filter(

                    complaint => complaint.status === "open"

                ).length;

            return res.json({

                success: true,

                profile: {

                    id: user._id,

                    firstName: user.firstName,

                    lastName: user.lastName,

                    username: user.username,

                    flatNumber: user.flatNumber,

                    profileImage: user.profileImage,

                    isAdmin: user.isAdmin

                },

                society: {

                    societyName: society.societyName,

                    societyAddress: society.societyAddress

                },

                maintenance: {

                    pendingAmount: user.makePayment,

                    lastPayment: user.lastPayment

                },

                complaints: {

                    total: user.complaints.length,

                    open: openComplaints

                },

                notifications: {

                    unread: unreadNotifications

                },

                residents: {

                    approved: approvedResidents,

                    pending: pendingResidents

                },

                notices

            });

        }

        catch (err) {

            console.error(err);

            return res.status(500).json({

                success: false,

                message: "Unable to load dashboard."

            });

        }

    }
);

module.exports = router;