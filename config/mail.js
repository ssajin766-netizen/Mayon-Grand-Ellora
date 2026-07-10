const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({

    host: "smtp.gmail.com",

    port: 587,

    secure: false,

    requireTLS: true,

    auth: {

        user: process.env.EMAIL_USER,

        pass: process.env.EMAIL_PASS

    },

    family: 4,

    connectionTimeout: 15000,

    greetingTimeout: 15000,

    socketTimeout: 15000

});

transporter.verify((err) => {

    if (err) {

        console.log("MAIL VERIFY FAILED");
        console.log(err);

    } else {

        console.log("MAIL SERVER READY");

    }

});

module.exports = transporter;