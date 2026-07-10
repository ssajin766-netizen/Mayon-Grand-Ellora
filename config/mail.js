const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({

    service: "gmail",

    auth: {

        user: process.env.EMAIL_USER,

        pass: process.env.EMAIL_PASS

    }

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