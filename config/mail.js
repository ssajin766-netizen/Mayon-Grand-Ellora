const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    requireTLS: true,

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },

    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,

    logger: true,
    debug: true
});

transporter.verify((err) => {
    console.log("================================");

    if (err) {
        console.error(err);
    } else {
        console.log("MAIL SERVER READY");
    }

    console.log("================================");
});

module.exports = transporter;