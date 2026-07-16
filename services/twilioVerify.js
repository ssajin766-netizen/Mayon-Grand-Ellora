const twilio = require("twilio");

/*
--------------------------------------------------
CHECK ENV VARIABLES
--------------------------------------------------
*/

if (
    !process.env.TWILIO_ACCOUNT_SID ||
    !process.env.TWILIO_AUTH_TOKEN ||
    !process.env.TWILIO_VERIFY_SERVICE_SID
) {
    throw new Error(
        "Twilio Verify environment variables are missing. Check your .env file."
    );
}

/*
--------------------------------------------------
TWILIO CLIENT
--------------------------------------------------
*/

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

/*
--------------------------------------------------
SEND OTP
--------------------------------------------------
*/

async function sendVerification(phoneNumber) {

    try {

        const response = await client.verify.v2
            .services(process.env.TWILIO_VERIFY_SERVICE_SID)
            .verifications
            .create({

                to: phoneNumber,

                channel: "sms"

            });

        console.log("================================");
        console.log("OTP SENT SUCCESSFULLY");
        console.log("SID:", response.sid);
        console.log("STATUS:", response.status);
        console.log("TO:", response.to);
        console.log("================================");

        return response;

    }

    catch (err) {

        console.error("================================");
        console.error("TWILIO SEND OTP ERROR");
        console.error("Message:", err.message);

        if (err.code) {

            console.error("Code:", err.code);

        }

        if (err.moreInfo) {

            console.error("More Info:", err.moreInfo);

        }

        console.error("================================");

        throw err;

    }

}

/*
--------------------------------------------------
VERIFY OTP
--------------------------------------------------
*/

async function checkVerification(phoneNumber, code) {

    try {

        const response = await client.verify.v2
            .services(process.env.TWILIO_VERIFY_SERVICE_SID)
            .verificationChecks
            .create({

                to: phoneNumber,

                code

            });

        console.log("================================");
        console.log("OTP VERIFY RESULT");
        console.log("STATUS:", response.status);
        console.log("VALID:", response.valid);
        console.log("================================");

        return response;

    }

    catch (err) {

        console.error("================================");
        console.error("TWILIO VERIFY OTP ERROR");
        console.error("Message:", err.message);

        if (err.code) {

            console.error("Code:", err.code);

        }

        if (err.moreInfo) {

            console.error("More Info:", err.moreInfo);

        }

        console.error("================================");

        throw err;

    }

}

module.exports = {

    sendVerification,

    checkVerification

};