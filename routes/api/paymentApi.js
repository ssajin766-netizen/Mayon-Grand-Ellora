const express = require("express");
const router = express.Router();

const crypto = require("crypto");
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


/*
==================================================
RAZORPAY INSTANCE
==================================================
*/

const razorpay = new Razorpay({

    key_id:
        process.env.RAZORPAY_KEY_ID,

    key_secret:
        process.env.RAZORPAY_KEY_SECRET

});


/*
==================================================
CREATE RAZORPAY ORDER
==================================================
*/

router.post(
    "/payment/create-order",
    isLoggedIn,
    isApproved,
    async (req, res) => {

        try {

            /*
            ------------------------------------------
            GET CURRENT USER
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
            GET PAYMENT AMOUNT
            ------------------------------------------
            */

            const paymentAmount =
                Number(user.makePayment);


            /*
            ------------------------------------------
            VALIDATE PAYMENT
            ------------------------------------------
            */

            if (
                !Number.isFinite(paymentAmount) ||
                paymentAmount <= 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "No pending payment amount found."

                });

            }


            /*
            ------------------------------------------
            CREATE ORDER
            ------------------------------------------
            */

            const order =
                await razorpay.orders.create({

                    amount:
                        Math.round(
                            paymentAmount * 100
                        ),

                    currency:
                        "INR",

                    receipt:
                        "receipt_" +
                        Date.now(),

                    notes: {

                        userId:
                            String(user._id),

                        amount:
                            String(paymentAmount)

                    }

                });


            /*
            ------------------------------------------
            RESPONSE
            ------------------------------------------
            */

            return res.json({

                success: true,

                message:
                    "Payment order created successfully.",

                key:
                    process.env.RAZORPAY_KEY_ID,

                order: {

                    id:
                        order.id,

                    entity:
                        order.entity,

                    amount:
                        order.amount,

                    amount_paid:
                        order.amount_paid,

                    amount_due:
                        order.amount_due,

                    currency:
                        order.currency,

                    receipt:
                        order.receipt,

                    status:
                        order.status

                }

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
RAZORPAY PAYMENT SUCCESS
==================================================
*/

router.post(
    "/payment/payment-success",
    isLoggedIn,
    isApproved,
    async (req, res) => {

        try {

            /*
            ------------------------------------------
            GET RAZORPAY DATA
            ------------------------------------------
            */

            const {

                razorpay_order_id,

                razorpay_payment_id,

                razorpay_signature

            } = req.body;


            /*
            ------------------------------------------
            VALIDATE REQUEST
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
                        "Missing Razorpay payment details."

                });

            }


            /*
            ------------------------------------------
            GET USER
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
            PAYMENT AMOUNT
            ------------------------------------------
            */

            const paymentAmount =
                Number(user.makePayment);


            if (
                !Number.isFinite(paymentAmount) ||
                paymentAmount <= 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "No pending payment amount found."

                });

            }


            /*
            ------------------------------------------
            VERIFY RAZORPAY SIGNATURE
            ------------------------------------------
            */

            const generatedSignature =
                crypto
                    .createHmac(
                        "sha256",
                        process.env.RAZORPAY_KEY_SECRET
                    )
                    .update(
                        `${razorpay_order_id}|${razorpay_payment_id}`
                    )
                    .digest("hex");


            if (
                generatedSignature !==
                razorpay_signature
            ) {

                console.error(
                    "INVALID RAZORPAY SIGNATURE"
                );

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid payment signature."

                });

            }


            /*
            ------------------------------------------
            PREVENT DUPLICATE PAYMENT
            ------------------------------------------
            */

            const duplicatePayment =
                user.paymentHistory &&
                user.paymentHistory.some(

                    payment =>
                        payment.razorpayPaymentId ===
                        razorpay_payment_id

                );


            if (duplicatePayment) {

                return res.status(409).json({

                    success: false,

                    message:
                        "This payment has already been processed."

                });

            }


            /*
            ------------------------------------------
            CREATE INVOICE
            ------------------------------------------
            */

            const invoice =
                "INV-" + Date.now();


            const paymentDate =
                new Date();


            /*
            ------------------------------------------
            LAST PAYMENT
            ------------------------------------------
            */

            user.lastPayment = {

                date:
                    paymentDate,

                amount:
                    paymentAmount,

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
                    paymentAmount,

                invoice,

                paidAt:
                    paymentDate,

                method:
                    "Razorpay",

                razorpayOrderId:
                    razorpay_order_id,

                razorpayPaymentId:
                    razorpay_payment_id

            });


            /*
            ------------------------------------------
            CLEAR CURRENT PAYMENT
            ------------------------------------------
            */

            user.makePayment = 0;


            /*
            ------------------------------------------
            SAVE
            ------------------------------------------
            */

            await user.save();


            /*
            ==================================================
            SUCCESS NOTIFICATION
            ==================================================
            */

            try {

                await createNotification({

                    user:
                        user._id,

                    title:
                        "Payment Successful",

                    message:
                        `₹${paymentAmount} maintenance payment received successfully.`,

                    type:
                        "success",

                    icon:
                        "fa-credit-card",

                    link:
                        "/bill",

                    sendEmail:
                        true

                });

            }

            catch (err) {

                console.error(
                    "PAYMENT NOTIFICATION ERROR:",
                    err.message
                );

            }


            /*
            ==================================================
            RECEIPT NOTIFICATION
            ==================================================
            */

            try {

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

                console.error(
                    "RECEIPT NOTIFICATION ERROR:",
                    err.message
                );

            }


            /*
            ==================================================
            WHATSAPP
            ==================================================
            */

            try {

                if (user.phoneNumber) {

                    await sendWhatsApp(

                        `+91${user.phoneNumber}`,

                        `Payment of ₹${paymentAmount} received successfully.\nInvoice: ${invoice}`

                    );


                    await WhatsAppLog.create({

                        residentId:
                            user._id,

                        mobileNumber:
                            user.phoneNumber,

                        message:
                            `Payment of ₹${paymentAmount} received successfully.`,

                        status:
                            "Sent"

                    });

                }

            }

            catch (err) {

                console.error(
                    "WHATSAPP PAYMENT ERROR:",
                    err.message
                );

            }


            /*
            ==================================================
            EMAIL
            ==================================================
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
                            ₹${paymentAmount}
                        </p>

                        <p>
                            <strong>Society:</strong>
                            ${user.societyName}
                        </p>

                        <p>
                            <strong>Razorpay Payment ID:</strong>
                            ${razorpay_payment_id}
                        </p>

                        <p>
                            Thank you for your payment.
                        </p>
                        `

                    );

                }

            }

            catch (err) {

                console.error(
                    "EMAIL PAYMENT ERROR:",
                    err.message
                );

            }


            /*
            ==================================================
            RESPONSE
            ==================================================
            */

            return res.json({

                success:
                    true,

                message:
                    "Payment successful.",

                invoice,

                amount:
                    paymentAmount,

                payment: {

                    date:
                        paymentDate,

                    amount:
                        paymentAmount,

                    invoice

                },

                razorpay: {

                    orderId:
                        razorpay_order_id,

                    paymentId:
                        razorpay_payment_id

                }

            });

        }

        catch (err) {

            console.error(
                "RAZORPAY PAYMENT VERIFICATION ERROR:",
                err
            );


            /*
            ------------------------------------------
            FAILURE NOTIFICATION
            ------------------------------------------
            */

            try {

                if (req.user) {

                    await createNotification({

                        user:
                            req.user._id,

                        title:
                            "Payment Failed",

                        message:
                            "Your maintenance payment could not be completed. Please try again.",

                        type:
                            "error",

                        icon:
                            "fa-circle-xmark",

                        link:
                            "/bill"

                    });

                }

            }

            catch (notificationError) {

                console.error(
                    "FAILURE NOTIFICATION ERROR:",
                    notificationError.message
                );

            }


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
    "/payments/manual",
    isLoggedIn,
    isApproved,
    async (req, res) => {

        try {

            /*
            ------------------------------------------
            GET USER
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
            SAVE AMOUNT BEFORE CLEARING
            ------------------------------------------
            */

            const paymentAmount =
                Number(user.makePayment);


            if (
                !Number.isFinite(paymentAmount) ||
                paymentAmount <= 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "No pending payment amount found."

                });

            }


            /*
            ------------------------------------------
            CREATE INVOICE
            ------------------------------------------
            */

            const invoice =
                "INV-" + Date.now();


            const paymentDate =
                new Date();


            /*
            ------------------------------------------
            LAST PAYMENT
            ------------------------------------------
            */

            user.lastPayment = {

                date:
                    paymentDate,

                amount:
                    paymentAmount,

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
                    paymentAmount,

                invoice,

                paidAt:
                    paymentDate,

                method:
                    "Manual"

            });


            /*
            ------------------------------------------
            CLEAR DUE
            ------------------------------------------
            */

            user.makePayment = 0;


            await user.save();


            /*
            ------------------------------------------
            NOTIFICATION
            ------------------------------------------
            */

            try {

                await createNotification({

                    user:
                        user._id,

                    title:
                        "Payment Recorded",

                    message:
                        `₹${paymentAmount} payment has been recorded.`,

                    type:
                        "success",

                    icon:
                        "fa-money-check-dollar",

                    link:
                        "/bill"

                });

            }

            catch (err) {

                console.error(
                    "MANUAL PAYMENT NOTIFICATION ERROR:",
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

                        "Maintenance Payment Received",

                        `
                        <h2>Payment Recorded</h2>

                        <p>
                            Your maintenance payment
                            has been recorded.
                        </p>

                        <p>
                            <strong>Invoice:</strong>
                            ${invoice}
                        </p>

                        <p>
                            <strong>Amount:</strong>
                            ₹${paymentAmount}
                        </p>

                        <p>
                            <strong>Society:</strong>
                            ${user.societyName}
                        </p>
                        `

                    );

                }

            }

            catch (err) {

                console.error(
                    "MANUAL PAYMENT EMAIL ERROR:",
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
                    "Manual payment recorded successfully.",

                invoice,

                amount:
                    paymentAmount,

                payment: {

                    date:
                        paymentDate,

                    amount:
                        paymentAmount,

                    invoice

                }

            });

        }

        catch (err) {

            console.error(
                "MANUAL PAYMENT ERROR:",
                err
            );


            return res.status(500).json({

                success:
                    false,

                message:
                    "Unable to record payment."

            });

        }

    }
);


module.exports = router;