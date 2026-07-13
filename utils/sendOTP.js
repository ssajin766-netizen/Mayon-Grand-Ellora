const transporter = require("../config/mail");

async function sendOTP(email, otp) {
    try {
        console.log("================================");
        console.log("Sending Email...");
        console.log("To:", email);

        const info = await transporter.sendMail({
            from: `"Mayon Grand Ellora" <${process.env.EMAIL_FROM}>`,
            to: email,
            subject: "Verify Your Email",
            html: `
                <h2>Mayon Grand Ellora</h2>
                <h1>${otp}</h1>
                <p>This OTP is valid for 10 minutes.</p>
            `
        });

        console.log("================================");
        console.log("MAIL SENT");
        console.log("Message ID:", info.messageId);
        console.log("================================");

        return info;

    } catch (err) {
        console.log("================================");
        console.log("MAIL ERROR");
        console.error(err);
        console.log("================================");
        throw err;
    }
}

module.exports = sendOTP;