const dns = require("dns");
const nodemailer = require("nodemailer");

// Force Node.js to prefer IPv4
dns.setDefaultResultOrder("ipv4first");

console.log("================================");
console.log("EMAIL USER:", process.env.EMAIL_USER);
console.log("EMAIL PASS:", process.env.EMAIL_PASS ? "Loaded" : "Missing");
console.log("================================");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },

    // Force IPv4 DNS lookup
    dnsLookup: (hostname, options, callback) => {
        return dns.lookup(hostname, { family: 4 }, callback);
    },

    logger: true,
    debug: true,

    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 30000,

    tls: {
        rejectUnauthorized: false,
        minVersion: "TLSv1.2",
    },
});

// Verify SMTP connection on startup
(async () => {
    try {
        await transporter.verify();
        console.log("================================");
        console.log("MAIL SERVER READY");
        console.log("================================");
    } catch (err) {
        console.log("================================");
        console.log("MAIL VERIFY FAILED");
        console.error(err);
        console.log("================================");
    }
})();

module.exports = transporter;