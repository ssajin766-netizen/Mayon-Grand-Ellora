const sendMail = require("./sendMail");

async function sendOTP(
    email,
    otp,
    purpose = "email_verification"
) {

    try {

        console.log("================================");
        console.log("Sending Email...");
        console.log("To:", email);
        console.log("Purpose:", purpose);

        let subject = "";
        let title = "";
        let message = "";

        switch (purpose) {

            case "login":

                subject = "Login Verification Code";

                title = "Login OTP";

                message =
                    "Use the OTP below to complete your login.";

                break;

            case "forgot_password":

                subject = "Password Reset OTP";

                title = "Password Reset";

                message =
                    "Use the OTP below to reset your password.";

                break;

            case "phone_login":

                subject = "Phone Login Verification";

                title = "Phone Login OTP";

                message =
                    "Use the OTP below to verify your phone login.";

                break;

            case "email_verification":

            default:

                subject = "Verify Your Email";

                title = "Email Verification";

                message =
                    "Use the OTP below to verify your email address.";

        }

        const html = `
        <div style="
            max-width:600px;
            margin:auto;
            font-family:Arial,Helvetica,sans-serif;
            border:1px solid #e5e5e5;
            border-radius:8px;
            overflow:hidden;
        ">

            <div style="
                background:#0d6efd;
                color:#fff;
                padding:20px;
                text-align:center;
            ">
                <h2 style="margin:0;">
                    Mayon Grand Ellora
                </h2>
            </div>

            <div style="padding:30px;">

                <h3>${title}</h3>

                <p>${message}</p>

                <div style="
                    text-align:center;
                    margin:30px 0;
                ">

                    <span style="
                        display:inline-block;
                        background:#f8f9fa;
                        border:2px dashed #0d6efd;
                        color:#0d6efd;
                        font-size:34px;
                        font-weight:bold;
                        letter-spacing:8px;
                        padding:15px 30px;
                        border-radius:8px;
                    ">
                        ${otp}
                    </span>

                </div>

                <p>
                    This OTP is valid for
                    <strong>10 minutes</strong>.
                </p>

                <p>
                    If you did not request this OTP,
                    please ignore this email.
                </p>

                <hr>

                <small style="color:#777;">

                    This is an automated email from
                    Mayon Grand Ellora.

                </small>

            </div>

        </div>
        `;

        await sendMail(
            email,
            subject,
            html
        );

        console.log("================================");
        console.log("MAIL SENT SUCCESSFULLY");
        console.log("================================");

        return true;

    }

    catch (err) {

        console.log("================================");
        console.log("MAIL ERROR");
        console.log(err);
        console.log("================================");

        throw err;

    }

}

module.exports = sendOTP;