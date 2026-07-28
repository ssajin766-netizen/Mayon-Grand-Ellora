const express = require("express");
const router = express.Router();

const Notification = require("../../models/notificationModel");

const {
    isLoggedIn,
    isApproved
} = require("../../middleware/auth");

/*
=================================================
GET ALL NOTIFICATIONS
=================================================
*/

router.get(
    "/notifications",
    isLoggedIn,
    isApproved,
    async (req, res) => {

        try {

            const notifications =
                await Notification.find({

                    user: req.user._id

                })

                .sort({ createdAt: -1 });

            return res.json({

                success: true,

                total: notifications.length,

                unread:

                    notifications.filter(

                        n => !n.read

                    ).length,

                notifications

            });

        }

        catch (err) {

            console.error(err);

            return res.status(500).json({

                success: false,

                message:
                    "Unable to fetch notifications."

            });

        }

    }
);

/*
=================================================
MARK READ
=================================================
*/

router.put(
    "/notifications/:id/read",
    isLoggedIn,
    isApproved,
    async (req, res) => {

        try {

            const notification =
                await Notification.findOne({

                    _id: req.params.id,

                    user: req.user._id

                });

            if (!notification) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Notification not found."

                });

            }

            notification.read = true;

            await notification.save();

            return res.json({

                success: true,

                message:
                    "Notification marked as read."

            });

        }

        catch (err) {

            console.error(err);

            return res.status(500).json({

                success: false,

                message:
                    "Unable to update notification."

            });

        }

    }
);

/*
=================================================
MARK ALL READ
=================================================
*/

router.put(
    "/notifications/read-all",
    isLoggedIn,
    isApproved,
    async (req, res) => {

        try {

            await Notification.updateMany(

                {

                    user: req.user._id,

                    read: false

                },

                {

                    $set: {

                        read: true

                    }

                }

            );

            return res.json({

                success: true,

                message:
                    "All notifications marked as read."

            });

        }

        catch (err) {

            console.error(err);

            return res.status(500).json({

                success: false,

                message:
                    "Unable to update notifications."

            });

        }

    }
);

/*
=================================================
DELETE NOTIFICATION
=================================================
*/

router.delete(
    "/notifications/:id",
    isLoggedIn,
    isApproved,
    async (req, res) => {

        try {

            const notification =
                await Notification.findOneAndDelete({

                    _id: req.params.id,

                    user: req.user._id

                });

            if (!notification) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Notification not found."

                });

            }

            return res.json({

                success: true,

                message:
                    "Notification deleted successfully."

            });

        }

        catch (err) {

            console.error(err);

            return res.status(500).json({

                success: false,

                message:
                    "Unable to delete notification."

            });

        }

    }
);

/*
=================================================
CLEAR ALL
=================================================
*/

router.delete(
    "/notifications",
    isLoggedIn,
    isApproved,
    async (req, res) => {

        try {

            await Notification.deleteMany({

                user: req.user._id

            });

            return res.json({

                success: true,

                message:
                    "All notifications cleared."

            });

        }

        catch (err) {

            console.error(err);

            return res.status(500).json({

                success: false,

                message:
                    "Unable to clear notifications."

            });

        }

    }
);

module.exports = router;