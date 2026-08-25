const express = require("express");
const router = express.Router();

const crypto = require("crypto");
const Razorpay = require("razorpay");

const sendMail = require("../services/sendMail");
const sendWhatsApp = require("../services/whatsappService");

const WhatsAppLog = require("../models/WhatsAppLog");
const { User } = require("../models/userModel");
const { Society } = require("../models/societyModel");

const {
    createNotification
} = require("../services/notificationService");

const {
    isLoggedIn,
    isApproved
} = require("../middleware/auth");

const date = require("../date/date");

/*
==================================================
RAZORPAY INSTANCE
==================================================
*/

const razorpay = new Razorpay({

    key_id: process.env.RAZORPAY_KEY_ID,

    key_secret: process.env.RAZORPAY_KEY_SECRET

});

/*
==================================================
CALCULATE CURRENT BILL
==================================================
*/

async function calculateCurrentBill(user) {

    const society = await Society.findOne({

        societyName: user.societyName

    });

    if (!society) {

        throw new Error("Society not found.");

    }

    const maintenanceBill =
        society.maintenanceBill || {};

    const monthlyTotal =
        Object.values(maintenanceBill)

            .filter(value =>
                typeof value === "number" &&
                Number.isFinite(value)
            )

            .reduce(
                (sum, value) =>
                    sum + Number(value),
                0
            );

    const today = new Date();

    let dateFrom = user.createdAt;

    let totalMonth = 0;

    if (user.lastPayment?.date) {

        dateFrom =
            user.lastPayment.date;

        totalMonth =
            date.monthDiff(
                dateFrom,
                today
            );

    } else {

        totalMonth =
            date.monthDiff(
                dateFrom,
                today
            ) + 1;

    }

    let credit = 0;

    let due = 0;

    if (totalMonth === 0) {

        credit = monthlyTotal;

    }

    else if (totalMonth > 1) {

        due =
            (totalMonth - 1) *
            monthlyTotal;

    }

    const totalAmount =
        monthlyTotal +
        due -
        credit;

    return {

        society,

        monthlyTotal,

        pendingDue: due,

        creditBalance: credit,

        totalAmount: Math.max(
            0,
            Number(totalAmount)
        )

    };

}

/*
==================================================
CREATE RAZORPAY ORDER
==================================================
*/

router.post(
    "/create-order",
    isLoggedIn,
    isApproved,
    async (req, res) => {

        try {

            /*
            ------------------------------------------
            ALWAYS GET FRESH USER FROM DATABASE
            ------------------------------------------
            */

            const user =
                await User.findById(
                    req.user._id
                );

            if (!user) {

                return res.status(404).json({

                    success: false,

                    message:
                        "User not found."

                });

            }

            /*
            ------------------------------------------
            CALCULATE ACTUAL BILL
            ------------------------------------------
            */

            const bill =
                await calculateCurrentBill(
                    user
                );

            const amount =
                Number(bill.totalAmount);

            console.log(
                "========================================"
            );

            console.log(
                "RAZORPAY CREATE ORDER"
            );

            console.log(
                "User:",
                user.username
            );

            console.log(
                "Monthly Total:",
                bill.monthlyTotal
            );

            console.log(
                "Pending Due:",
                bill.pendingDue
            );

            console.log(
                "Credit:",
                bill.creditBalance
            );

            console.log(
                "FINAL PAYMENT:",
                amount
            );

            console.log(
                "========================================"
            );

            /*
            ------------------------------------------
            VALIDATE AMOUNT
            ------------------------------------------
            */

            if (
                !Number.isFinite(amount) ||
                amount <= 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "There is no outstanding payment."

                });

            }

            /*
            ------------------------------------------
            CREATE RAZORPAY ORDER
            ------------------------------------------
            */

            const order =
                await razorpay.orders.create({

                    amount:
                        Math.round(
                            amount * 100
                        ),

                    currency: "INR",

                    receipt:
                        "receipt_" +
                        Date.now(),

                    notes: {

                        userId:
                            user._id.toString(),

                        username:
                            user.username,

                        billAmount:
                            String(amount)

                    }

                });

            /*
            ------------------------------------------
            SAVE PENDING ORDER
            ------------------------------------------
            */

            user.pendingPaymentOrderId =
                order.id;

            /*
            IMPORTANT:
            Keep makePayment synchronized.
            */

            user.makePayment =
                amount;

            await user.save();

            /*
            ------------------------------------------
            RESPONSE
            ------------------------------------------
            */

            return res.json({

                success: true,

                key:
                    process.env.RAZORPAY_KEY_ID,

                order,

                amount,

                currency: "INR"

            });

        }

        catch (err) {

            console.error(
                "RAZORPAY CREATE ORDER ERROR:",
                err
            );

            return res.status(500).json({

                success: false,

                message:
                    "Unable to create payment order."

            });

        }

    }
);

/*
==================================================
PAYMENT SUCCESS
==================================================
*/

router.post(
    "/payment-success",
    isLoggedIn,
    isApproved,
    async (req, res) => {

        try {

            /*
            ------------------------------------------
            GET FRESH USER
            ------------------------------------------
            */

            const user =
                await User.findById(
                    req.user._id
                );

            if (!user) {

                return res.status(404).json({

                    success: false,

                    message:
                        "User not found."

                });

            }

            const {

                razorpay_order_id,

                razorpay_payment_id,

                razorpay_signature

            } = req.body;

            /*
            ------------------------------------------
            VALIDATE RAZORPAY DATA
            ------------------------------------------
            */

            if (
                !razorpay_order_id ||
                !razorpay_payment_id ||
                !razorpay_signature
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid Razorpay payment response."

                });

            }

            /*
            ------------------------------------------
            VERIFY ORDER BELONGS TO USER
            ------------------------------------------
            */

            if (
                user.pendingPaymentOrderId &&
                user.pendingPaymentOrderId !==
                    razorpay_order_id
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Payment order mismatch."

                });

            }

            /*
            ------------------------------------------
            VERIFY SIGNATURE
            ------------------------------------------
            */

            const generatedSignature =
                crypto

                    .createHmac(
                        "sha256",
                        process.env.RAZORPAY_KEY_SECRET
                    )

                    .update(
                        razorpay_order_id +
                        "|" +
                        razorpay_payment_id
                    )

                    .digest("hex");

            if (
                generatedSignature !==
                razorpay_signature
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Payment signature verification failed."

                });

            }

            /*
            ------------------------------------------
            GET ACTUAL PAID AMOUNT
            ------------------------------------------
            */

            const order =
                await razorpay.orders.fetch(
                    razorpay_order_id
                );

            const paidAmount =
                Number(order.amount) / 100;

            /*
            ------------------------------------------
            GENERATE INVOICE
            ------------------------------------------
            */

            const invoice =
                "INV-" +
                Date.now();

            const paymentDate =
                new Date();

            /*
            ------------------------------------------
            SAVE LAST PAYMENT
            ------------------------------------------
            */

            user.lastPayment = {

                date:
                    paymentDate,

                amount:
                    paidAmount,

                invoice

            };

            /*
            ------------------------------------------
            PAYMENT HISTORY
            ------------------------------------------
            */

            if (!user.paymentHistory) {

                user.paymentHistory = [];

            }

            user.paymentHistory.push({

                amount:
                    paidAmount,

                invoice,

                paidAt:
                    paymentDate,

                method:
                    "Razorpay",

                paymentStatus:
                    "Paid",

                razorpay_order_id,

                razorpay_payment_id

            });

            /*
            ------------------------------------------
            CLEAR PAYMENT
            ------------------------------------------
            */

            user.makePayment = 0;

            user.pendingPaymentOrderId = null;

            await user.save();

            /*
            ------------------------------------------
            SUCCESS NOTIFICATION
            ------------------------------------------
            */

            try {

                await createNotification({

                    user:
                        user._id,

                    title:
                        "Payment Successful",

                    message:
                        `₹${paidAmount} maintenance payment received successfully.`,

                    type:
                        "success",

                    icon:
                        "fa-credit-card",

                    link:
                        "/bill",

                    sendEmail:
                        true

                });

                await createNotification({

                    user:
                        user._id,

                    title:
                        "Receipt Generated",

                    message:
                        `Invoice ${invoice} has been generated successfully.`,

                    type:
                        "info",

                    icon:
                        "fa-receipt",

                    link:
                        "/bill",

                    sendEmail:
                        true

                });

            }

            catch (err) {

                console.log(
                    "Notification Error:",
                    err.message
                );

            }

            /*
            ------------------------------------------
            WHATSAPP
            ------------------------------------------
            */

            try {

                if (user.phoneNumber) {

                    await sendWhatsApp(

                        user.phoneNumber,

                        `Payment of ₹${paidAmount} received successfully.\nInvoice: ${invoice}`

                    );

                    await WhatsAppLog.create({

                        residentId:
                            user._id,

                        mobileNumber:
                            user.phoneNumber,

                        message:
                            `Payment of ₹${paidAmount} received successfully.`,

                        status:
                            "Sent"

                    });

                }

            }

            catch (err) {

                console.log(
                    "WhatsApp Error:",
                    err.message
                );

            }

            /*
            ------------------------------------------
            EMAIL
            ------------------------------------------
            */

            try {

                if (user.username) {

                    await sendMail(

                        user.username,

                        "Maintenance Payment Receipt",

                        `
                        <h2>Payment Successful</h2>

                        <p>
                            <strong>Invoice:</strong>
                            ${invoice}
                        </p>

                        <p>
                            <strong>Amount:</strong>
                            ₹${paidAmount}
                        </p>

                        <p>
                            <strong>Society:</strong>
                            ${user.societyName}
                        </p>

                        <p>
                            Thank you for your payment.
                        </p>
                        `

                    );

                }

            }

            catch (err) {

                console.log(
                    "Email Error:",
                    err.message
                );

            }

            /*
            ------------------------------------------
            RESPONSE
            ------------------------------------------
            */

            return res.json({

                success:
                    true,

                message:
                    "Payment successful.",

                invoice,

                payment: {

                    amount:
                        paidAmount,

                    invoice,

                    paidAt:
                        paymentDate,

                    method:
                        "Razorpay",

                    razorpay_order_id,

                    razorpay_payment_id

                }

            });

        }

        catch (err) {

            console.error(
                "RAZORPAY PAYMENT SUCCESS ERROR:",
                err
            );

            return res.status(500).json({

                success:
                    false,

                message:
                    "Payment verification failed."

            });

        }

    }
);

/*
==================================================
MANUAL PAYMENT
==================================================
*/

router.post(
    "/mark-paid",
    isLoggedIn,
    isApproved,
    async (req, res) => {

        try {

            const user =
                await User.findById(
                    req.user._id
                );

            if (!user) {

                return res.redirect(
                    "/bill"
                );

            }

            /*
            ------------------------------------------
            CALCULATE ACTUAL BILL
            ------------------------------------------
            */

            const bill =
                await calculateCurrentBill(
                    user
                );

            const amount =
                bill.totalAmount;

            if (amount <= 0) {

                return res.redirect(
                    "/bill"
                );

            }

            const invoice =
                "INV-" +
                Date.now();

            const paymentDate =
                new Date();

            user.lastPayment = {

                date:
                    paymentDate,

                amount,

                invoice

            };

            if (!user.paymentHistory) {

                user.paymentHistory = [];

            }

            user.paymentHistory.push({

                amount,

                invoice,

                paidAt:
                    paymentDate,

                method:
                    "Manual",

                paymentStatus:
                    "Paid"

            });

            user.makePayment = 0;

            user.pendingPaymentOrderId = null;

            await user.save();

            /*
            ------------------------------------------
            NOTIFICATION
            ------------------------------------------
            */

            await createNotification({

                user:
                    user._id,

                title:
                    "Payment Recorded",

                message:
                    `₹${amount} payment has been recorded.`,

                type:
                    "success",

                icon:
                    "fa-money-check-dollar",

                link:
                    "/bill"

            });

            /*
            ------------------------------------------
            EMAIL
            ------------------------------------------
            */

            try {

                await sendMail(

                    user.username,

                    "Maintenance Payment Received",

                    `
                    <h2>Payment Recorded</h2>

                    <p>
                        Your maintenance payment has been
                        marked as received.
                    </p>

                    <p>
                        <strong>Invoice:</strong>
                        ${invoice}
                    </p>

                    <p>
                        <strong>Amount:</strong>
                        ₹${amount}
                    </p>
                    `

                );

            }

            catch (err) {

                console.log(
                    "Email Error:",
                    err.message
                );

            }

            return res.redirect(
                "/bill"
            );

        }

        catch (err) {

            console.error(err);

            return res.redirect(
                "/bill"
            );

        }

    }
);

module.exports = router;