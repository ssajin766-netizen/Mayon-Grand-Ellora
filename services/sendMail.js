const apiInstance = require("../config/brevo");

async function sendMail(to, subject, html) {

    try {

        const response = await apiInstance.sendTransacEmail({

            sender: {
                name: "Mayon Grand Ellora",
                email: process.env.EMAIL_FROM
            },

            to: [
                {
                    email: to
                }
            ],

            subject,

            htmlContent: html

        });

        console.log("MAIL SENT:", response.messageId || "Success");

        return response;

    } catch (err) {

        console.error("MAIL ERROR:", err);

        throw err;

    }

}

module.exports = sendMail;