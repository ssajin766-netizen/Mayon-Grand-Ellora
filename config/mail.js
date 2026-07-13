const dns = require("dns");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },

    dnsLookup(hostname, options, callback) {
        return dns.lookup(hostname, { family: 4 }, callback);
    },

    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 30000,

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