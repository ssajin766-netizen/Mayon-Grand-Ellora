const express = require("express");
const router = express.Router();

const Razorpay = require("razorpay");

const transporter = require("../config/mail");
const sendWhatsApp = require("../services/whatsappService");

const WhatsAppLog = require("../models/WhatsAppLog");
const user_collection = require("../models/userModel");

const {
    isLoggedIn,
    isVerified,
    isApproved
} = require("../middleware/auth");

/*
--------------------------------------------------
RAZORPAY INSTANCE
--------------------------------------------------
*/

const razorpay = new Razorpay({

    key_id: process.env.RAZORPAY_KEY_ID,

    key_secret: process.env.RAZORPAY_KEY_SECRET

});

/*
--------------------------------------------------
CREATE ORDER
--------------------------------------------------
*/

router.post(
    "/create-order",
    isLoggedIn,
    isApproved,
    async (req, res) => {

        try {

            const order = await razorpay.orders.create({

                amount: req.user.makePayment * 100,

                currency: "INR",

                receipt: "receipt_" + Date.now()

            });

            res.json(order);

        }

        catch (err) {

            console.error(err);

            res.status(500).json({

                success: false,

                message: "Unable to create order"

            });

        }

    }
);

/*
--------------------------------------------------
PAYMENT SUCCESS
--------------------------------------------------
*/
router.post(
    "/payment-success",
    isLoggedIn,
    isApproved,
    async (req, res) => {

        try {

            const user =
                await user_collection.User.findById(req.user.id);

            if (!user) {

                return res.status(404).json({

                    success: false,

                    message: "User not found"

                });

            }

            const invoice =
                "INV-" + Date.now();

            user.lastPayment = {

                date: new Date(),

                amount: user.makePayment,

                invoice

            };

            if (!user.paymentHistory) {

                user.paymentHistory = [];

            }

            user.paymentHistory.push({

                amount: user.makePayment,

                invoice,

                paidAt: new Date(),

                method: "Razorpay"

            });

            await user.save();

            /*
            ------------------------------
            WhatsApp
            ------------------------------
            */

            try {

                await sendWhatsApp(

                    `+91${user.phoneNumber}`,

                    `Payment of ₹${user.makePayment} received successfully.\nInvoice: ${invoice}`

                );

                await WhatsAppLog.create({

                    residentId: user._id,

                    mobileNumber: user.phoneNumber,

                    message: `Payment of ₹${user.makePayment} received successfully.`,

                    status: "Sent"

                });

            }

            catch (err) {

                console.log("WhatsApp Error:", err.message);

            }

            /*
            ------------------------------
            Email
            ------------------------------
            */

            try {

                await transporter.sendMail({

                    from: `"Mayon Grand Ellora" <${process.env.EMAIL_FROM}>`,

                    to: user.username,

                    subject: "Maintenance Payment Receipt",

                    html: `

                        <h2>Payment Successful</h2>

                        <p><strong>Invoice:</strong> ${invoice}</p>

                        <p><strong>Amount:</strong> ₹${user.makePayment}</p>

                        <p><strong>Society:</strong> ${user.societyName}</p>

                        <p>Thank you for your payment.</p>

                    `

                });

            }

            catch (err) {

                console.log("Email Error:", err.message);

            }

            res.json({

                success: true,

                invoice

            });

        }

        catch (err) {

            console.error(err);

            res.status(500).json({

                success: false,

                message: "Payment failed"

            });

        }

    }
);

/*
--------------------------------------------------
MANUAL PAYMENT
--------------------------------------------------
*/

router.post(
    "/mark-paid",
    isLoggedIn,
    isApproved,
    async (req, res) => {

        try {

            const user =
                await user_collection.User.findById(req.user.id);

            if (!user) {

                return res.redirect("/bill");

            }

            const invoice =
                "INV-" + Date.now();

            user.lastPayment = {

                date: new Date(),

                amount: user.makePayment,

                invoice

            };

            if (!user.paymentHistory) {

                user.paymentHistory = [];

            }

            user.paymentHistory.push({

                amount: user.makePayment,

                invoice,

                paidAt: new Date(),

                method: "Manual"

            });

            await user.save();

            res.redirect("/bill");

        }

        catch (err) {

            console.error(err);

            res.redirect("/bill");

        }

    }
);

module.exports = router;