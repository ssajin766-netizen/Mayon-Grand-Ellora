const express = require("express");
const router = express.Router();

const sendMail = require("../services/sendMail");
const sendWhatsApp = require("../services/whatsappService");

const WhatsAppLog = require("../models/WhatsAppLog");
const user_collection = require("../models/userModel");

const {
    isLoggedIn,
    isAdmin,
    isApproved
} = require("../middleware/auth");

/*
--------------------------------------------------
RESIDENTS
--------------------------------------------------
*/

router.get(
    "/residents",
    isLoggedIn,
    isApproved,
    async (req, res) => {

        try {

            const userSocietyName = req.user.societyName;

            const allResidents = await user_collection.User.find({
                societyName: userSocietyName
            });

            const approvedResidents = [];
            const appliedResidents = [];

            allResidents.forEach((user) => {

                if (user.validation === "approved") {

                    approvedResidents.push(user);

                } else if (user.validation === "applied") {

                    appliedResidents.push(user);

                }

            });

            res.render("residents", {

                societyResidents: approvedResidents,

                appliedResidents,

                societyName: userSocietyName,

                isAdmin: req.user.isAdmin

            });

        } catch (err) {

            console.error(err);

            res.status(500).send("Server Error");

        }

    }
);

/*
--------------------------------------------------
APPROVE RESIDENT
--------------------------------------------------
*/

router.post(
    "/approveResident",
    isLoggedIn,
    isAdmin,
    async (req, res) => {

        try {

            const userId = Object.keys(req.body.validate)[0];

            const validationState = Object.values(req.body.validate)[0];

            await user_collection.User.updateOne(

                {
                    _id: userId
                },

                {
                    $set: {
                        validation: validationState
                    }
                }

            );

            const approvedUser =
                await user_collection.User.findById(userId);

            if (!approvedUser) {

                return res.redirect("/residents");

            }

            /*
            --------------------------
            WhatsApp
            --------------------------
            */

            try {

                await sendWhatsApp(

                    `+91${approvedUser.phoneNumber}`,

                    `Your Mayon Grand Ellora account has been approved.`

                );

                await WhatsAppLog.create({

                    residentId: approvedUser._id,

                    mobileNumber: approvedUser.phoneNumber,

                    message: "Your account has been approved.",

                    status: "Sent"

                });

            } catch (err) {

                console.log("WhatsApp Error:", err.message);

            }

            /*
            --------------------------
            Email (Brevo API)
            --------------------------
            */

            try {

                await sendMail(

                    approvedUser.username,

                    "Account Approved",

                    `
                    <h2>Congratulations!</h2>

                    <p>Your <strong>Mayon Grand Ellora</strong> resident account has been approved.</p>

                    <p>You can now log in and access all resident services.</p>

                    <br>

                    <p>Thank you,</p>

                    <p><strong>Mayon Grand Ellora Team</strong></p>
                    `

                );

                console.log("Approval email sent.");

            } catch (err) {

                console.log("Email Error:", err.message);

            }

            res.redirect("/residents");

        } catch (err) {

            console.error(err);

            res.redirect("/residents");

        }

    }
);

module.exports = router;