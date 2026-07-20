const express = require("express");

const router = express.Router();

const {
    Notification
} = require("../models/notificationModel");

const {
    isLoggedIn
} = require("../middleware/auth");

/*
========================================
ALL NOTIFICATIONS
========================================
*/

router.get(

    "/notifications",

    isLoggedIn,

    async (req,res)=>{

        const notifications =
            await Notification.find({

                user:req.user._id

            })

            .sort({

                createdAt:-1

            });

        res.render(

            "notifications",

            {

                notifications

            }

        );

    }

);

/*
========================================
MARK AS READ
========================================
*/

router.post(

    "/notifications/:id/read",

    isLoggedIn,

    async(req,res)=>{

        await Notification.findByIdAndUpdate(

            req.params.id,

            {

                isRead:true

            }

        );

        res.redirect("/notifications");

    }

);

/*
========================================
DELETE
========================================
*/

router.post(

    "/notifications/:id/delete",

    isLoggedIn,

    async(req,res)=>{

        await Notification.findByIdAndDelete(

            req.params.id

        );

        res.redirect("/notifications");

    }

);

/*
========================================
CLEAR ALL
========================================
*/

router.post(

    "/notifications/clear",

    isLoggedIn,

    async(req,res)=>{

        await Notification.deleteMany({

            user:req.user._id

        });

        res.redirect("/notifications");

    }

);

module.exports = router;