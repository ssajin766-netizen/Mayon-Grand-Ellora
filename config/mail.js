const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },

    family: 4,

    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 30000,

    logger: true,
    debug: true
});

transporter.verify((err, success) => {
    console.log("================================");

    if (err) {
        console.log("MAIL VERIFY FAILED");
        console.log(err);
    } else {
        console.log("MAIL SERVER READY");
    }

    console.log("================================");
});

module.exports = transporter;