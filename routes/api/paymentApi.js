const express = require("express");
const router = express.Router();

const Razorpay = require("razorpay");

const sendMail = require("../../services/sendMail");
const sendWhatsApp = require("../../services/whatsappService");

const WhatsAppLog = require("../../models/WhatsAppLog");
const { User } = require("../../models/userModel");

const {
    createNotification
} = require("../../services/notificationService");

const {
    isLoggedIn,
    isApproved
} = require("../../middleware/auth");

const razorpay = new Razorpay({

    key_id: process.env.RAZORPAY_KEY_ID,

    key_secret: process.env.RAZORPAY_KEY_SECRET

});

router.post(
    "/payment/create-order",
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

            const order = await razorpay.orders.create({

                amount: user.makePayment * 100,

                currency: "INR",

                receipt: "receipt_" + Date.now()

            });

            return res.json({

                success: true,

                key: process.env.RAZORPAY_KEY_ID,

                order

            });

        }

        catch (err) {

            console.error(err);

            return res.status(500).json({

                success: false,

                message: "Unable to create payment order."

            });

        }

    }
);

router.post(
    "/payment/payment-success",
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

            const invoice = "INV-" + Date.now();

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

            user.makePayment = 0;

            await user.save();

            await createNotification({

                user: user._id,

                title: "Payment Successful",

                message: `₹${user.lastPayment.amount} maintenance payment received successfully.`,

                type: "success",

                icon: "fa-credit-card",

                link: "/bill",

                sendEmail: true

            });

            await createNotification({

                user: user._id,

                title: "Receipt Generated",

                message: `Invoice ${invoice} has been generated successfully.`,

                type: "info",

                icon: "fa-receipt",

                link: "/bill",

                sendEmail: true

            });

            try {

                await sendWhatsApp(

                    `+91${user.phoneNumber}`,

                    `Payment of ₹${user.lastPayment.amount} received successfully.\nInvoice: ${invoice}`

                );

                await WhatsAppLog.create({

                    residentId: user._id,

                    mobileNumber: user.phoneNumber,

                    message: `Payment of ₹${user.lastPayment.amount} received successfully.`,

                    status: "Sent"

                });

            }

            catch (err) {

                console.log(err.message);

            }

            try {

                await sendMail(

                    user.username,

                    "Maintenance Payment Receipt",

                    `
                    <h2>Payment Successful</h2>

                    <p><b>Invoice:</b> ${invoice}</p>

                    <p><b>Amount:</b> ₹${user.lastPayment.amount}</p>

                    <p><b>Society:</b> ${user.societyName}</p>
                    `

                );

            }

            catch (err) {

                console.log(err.message);

            }

            return res.json({

                success: true,

                message: "Payment successful.",

                invoice,

                payment: user.lastPayment

            });

        }

        catch (err) {

            console.error(err);

            return res.status(500).json({

                success: false,

                message: "Payment failed."

            });

        }

    }
);

router.post(
    "/payments/manual",
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

            const invoice = "INV-" + Date.now();

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

            user.makePayment = 0;

            await user.save();

            await createNotification({

                user: user._id,

                title: "Payment Recorded",

                message: `₹${user.lastPayment.amount} payment has been recorded.`,

                type: "success",

                icon: "fa-money-check-dollar",

                link: "/bill"

            });

            return res.json({

                success: true,

                message: "Manual payment recorded successfully.",

                invoice,

                payment: user.lastPayment

            });

        }

        catch (err) {

            console.error(err);

            return res.status(500).json({

                success: false,

                message: "Unable to record payment."

            });

        }

    }
);

module.exports = router;