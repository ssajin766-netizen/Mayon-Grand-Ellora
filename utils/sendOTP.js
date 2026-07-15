const sendMail = require("../services/sendMail");

/*
=========================================
Send OTP Email
=========================================
*/

async function sendOTP(

    email,

    otp,

    purpose = "email_verification"

) {

    let subject = "";
    let title = "";
    let description = "";

    switch (purpose) {

        case "login":

            subject = "Login Verification Code";

            title = "Login OTP";

            description =
                "Use the OTP below to complete your login.";

            break;

        case "forgot_password":

            subject = "Password Reset OTP";

            title = "Reset Password";

            description =
                "Use the OTP below to reset your password.";

            break;

        case "phone_login":

            subject = "Phone Verification";

            title = "Phone Login OTP";

            description =
                "Use the OTP below to verify your phone login.";

            break;

        case "email_verification":

        default:

            subject = "Verify Your Email";

            title = "Email Verification";

            description =
                "Use the OTP below to verify your email address.";

    }

    const html = `
    <div style="max-width:600px;
                margin:auto;
                font-family:Arial,sans-serif;
                border:1px solid #ddd;
                border-radius:8px;
                overflow:hidden;">

        <div style="
            background:#0d6efd;
            color:#fff;
            padding:20px;
            text-align:center;
        ">

            <h2>Mayon Grand Ellora</h2>

        </div>

        <div style="padding:30px;">

            <h3>${title}</h3>

            <p>${description}</p>

            <div style="
                text-align:center;
                margin:30px 0;
            ">

                <span style="
                    font-size:36px;
                    font-weight:bold;
                    letter-spacing:8px;
                    color:#0d6efd;
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
                you can safely ignore this email.

            </p>

            <hr>

            <small style="color:#666;">

                This is an automated email from
                <strong>Mayon Grand Ellora</strong>.

            </small>

        </div>

    </div>
    `;

    return sendMail(

        email,

        subject,

        html

    );

}

module.exports = sendOTP;