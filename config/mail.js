const dns = require("dns");

// Force Node.js to prefer IPv4
dns.setDefaultResultOrder("ipv4first");

const nodemailer = require("nodemailer");

console.log("================================");
console.log("EMAIL USER:", process.env.EMAIL_USER);
console.log("EMAIL PASS:", process.env.EMAIL_PASS ? "Loaded" : "Missing");
console.log("================================");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },

    tls: {
        rejectUnauthorized: false,
        family: 4
    },

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
        console.error(err);
    } else {
        console.log("MAIL SERVER READY");
        console.log(success);
    }

    console.log("================================");
});

module.exports = transporter;