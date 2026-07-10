const sendMail = require("./sendMail");

async function sendOTP(email, otp) {

    try {

        console.log("================================");
        console.log("Sending Email...");
        console.log("To:", email);

        await sendMail(
            email,
            "Verify Your Email",
            `
                <h2>Mayon Grand Ellora</h2>

                <h1>${otp}</h1>

                <p>This OTP is valid for 10 minutes.</p>
            `
        );

        console.log("================================");
        console.log("MAIL SENT SUCCESSFULLY");
        console.log("================================");

        return true;

    } catch (err) {

        console.log("================================");
        console.log("MAIL ERROR");
        console.log(err);
        console.log("================================");

        throw err;

    }

}

module.exports = sendOTP;