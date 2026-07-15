const axios = require("axios");

async function sendMail(to, subject, html) {
    try {
        const response = await axios.post(
            "https://api.brevo.com/v3/smtp/email",
            {
                sender: {
                    name: "Mayon Grand Ellora",
                    email: process.env.EMAIL_FROM
                },
                to: [{ email: to }],
                subject,
                htmlContent: html
            },
            {
                headers: {
                    "accept": "application/json",
                    "content-type": "application/json",
                    "api-key": process.env.BREVO_API_KEY
                }
            }
        );

        console.log("Mail sent:", response.data);
        return response.data;

    } catch (err) {
        console.error(err.response?.data || err.message);
        throw err;
    }
}

module.exports = sendMail;