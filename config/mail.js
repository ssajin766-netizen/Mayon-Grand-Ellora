const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },

    logger: true,
    debug: true
});

transporter.verify((err) => {

    console.log("================================");

    if (err) {
        console.log("MAIL VERIFY FAILED");
        console.error(err);
    } else {
        console.log("MAIL SERVER READY");
    }

    console.log("================================");

});

module.exports = transporter;