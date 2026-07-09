const transporter = require("../config/mail");

async function sendOTP(email, otp) {

    const mailOptions = {

        from: process.env.EMAIL_USER,

        to: email,

        subject: "Mayon Grand Ellora - Email Verification",

        html: `
        <div style="font-family:Arial;padding:30px">

            <h2>Mayon Grand Ellora</h2>

            <p>Your verification code is</p>

            <h1 style="letter-spacing:8px;color:#2E7D32;">
                ${otp}
            </h1>

            <p>This OTP is valid for <b>10 minutes</b>.</p>

            <p>If you didn't request this, please ignore this email.</p>

        </div>
        `
    };

    await transporter.sendMail(mailOptions);

}

module.exports = sendOTP;