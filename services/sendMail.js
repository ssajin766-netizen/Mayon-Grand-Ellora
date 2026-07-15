const axios = require("axios");

/*
=========================================
Send Email via Brevo API
=========================================
*/

async function sendMail(to, subject, html) {

    try {

        if (!process.env.BREVO_API_KEY) {
            throw new Error("BREVO_API_KEY is missing.");
        }

        if (!process.env.EMAIL_FROM) {
            throw new Error("EMAIL_FROM is missing.");
        }

        console.log("================================");
        console.log("BREVO MAIL");
        console.log("To:", to);
        console.log("Subject:", subject);
        console.log("================================");

        const response = await axios.post(

            "https://api.brevo.com/v3/smtp/email",

            {

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

            },

            {

                headers: {

                    accept: "application/json",

                    "content-type": "application/json",

                    "api-key": process.env.BREVO_API_KEY

                },

                timeout: 30000

            }

        );

        console.log("================================");
        console.log("EMAIL SENT");
        console.log(response.data);
        console.log("================================");

        return response.data;

    }

    catch (err) {

        console.log("================================");
        console.log("BREVO ERROR");

        if (err.response) {

            console.log("Status:", err.response.status);
            console.log("Response:", err.response.data);

        } else {

            console.log(err.message);

        }

        console.log("================================");

        throw err;

    }

}

module.exports = sendMail;