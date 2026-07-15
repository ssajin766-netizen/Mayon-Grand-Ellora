const sendMail = require("../services/sendMail");

async function sendOTP(email, otp) {

    return sendMail(

        email,

        "Verify Your Email",

        `
        <h2>Mayon Grand Ellora</h2>

        <h1>${otp}</h1>

        <p>This OTP is valid for 10 minutes.</p>
        `

    );

}

module.exports = sendOTP;