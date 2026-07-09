const transporter = require("../config/mail");

/*
=========================================
Send OTP Email
=========================================
*/

async function sendOTP(email, otp) {

    try {

        const mailOptions = {

            from: `"Mayon Grand Ellora" <${process.env.EMAIL_USER}>`,

            to: email,

            subject: "Verify your Email - Mayon Grand Ellora",

            text:
`Your OTP is ${otp}

This OTP is valid for 10 minutes.

If you did not request this verification, please ignore this email.`,

            html: `
<!DOCTYPE html>
<html>

<head>
<meta charset="UTF-8">
</head>

<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0">

<tr>

<td align="center">

<table width="600" cellpadding="0" cellspacing="0"
style="background:#ffffff;margin:30px;border-radius:10px;overflow:hidden;">

<tr>

<td
style="
background:#198754;
padding:25px;
text-align:center;
color:white;
">

<h2 style="margin:0;">
Mayon Grand Ellora
</h2>

<p style="margin-top:8px;">
Email Verification
</p>

</td>

</tr>

<tr>

<td style="padding:35px;">

<h3>Hello,</h3>

<p>

Thank you for registering with
<b>Mayon Grand Ellora</b>.

</p>

<p>

Please use the following OTP to verify your email address.

</p>

<div
style="
margin:30px auto;
text-align:center;
">

<span
style="
display:inline-block;
padding:18px 40px;
background:#198754;
color:white;
font-size:32px;
font-weight:bold;
letter-spacing:10px;
border-radius:8px;
">

${otp}

</span>

</div>

<p>

This OTP will expire in
<b>10 minutes</b>.

</p>

<p>

If you did not request this email,
you can safely ignore it.

</p>

<hr>

<p
style="
font-size:12px;
color:#888;
text-align:center;
">

© ${new Date().getFullYear()}
Mayon Grand Ellora

</p>

</td>

</tr>

</table>

</td>

</tr>

</table>

</body>

</html>
`
        };

        const info = await transporter.sendMail(mailOptions);

        console.log("=================================");
        console.log("OTP Email Sent");
        console.log("To :", email);
        console.log("Message ID :", info.messageId);
        console.log("=================================");

        return info;

    }

    catch (err) {

        console.error("=================================");
        console.error("OTP Email Failed");
        console.error(err);
        console.error("=================================");

        throw err;

    }

}

module.exports = sendOTP;