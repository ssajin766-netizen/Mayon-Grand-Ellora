const transporter = require("../config/mail");

/*
=========================================
Send OTP Email
=========================================
*/

async function sendOTP(email, otp) {

    const mailOptions = {

        from: `"Mayon Grand Ellora" <${process.env.EMAIL_USER}>`,

        to: email,

        subject: "Verify Your Email - Mayon Grand Ellora",

        text: `Hello,

Your verification code is: ${otp}

This OTP is valid for 10 minutes.

If you did not request this verification, please ignore this email.

Regards,
Mayon Grand Ellora Team`,

        html: `
<!DOCTYPE html>
<html>

<head>
<meta charset="UTF-8">
<title>Email Verification</title>
</head>

<body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,Helvetica,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">

<tr>

<td align="center">

<table width="600" cellpadding="0" cellspacing="0"
style="
background:#ffffff;
border-radius:10px;
overflow:hidden;
box-shadow:0 2px 10px rgba(0,0,0,.08);
">

<tr>

<td
style="
background:#198754;
color:#ffffff;
padding:25px;
text-align:center;
">

<h2 style="margin:0;">
Mayon Grand Ellora
</h2>

<p style="margin:8px 0 0;">
Email Verification
</p>

</td>

</tr>

<tr>

<td style="padding:35px;">

<h3>Hello,</h3>

<p>
Thank you for registering with
<strong>Mayon Grand Ellora</strong>.
</p>

<p>
Please use the verification code below to activate your account.
</p>

<div
style="
margin:35px 0;
text-align:center;
">

<span
style="
display:inline-block;
padding:18px 45px;
background:#198754;
color:#ffffff;
font-size:34px;
font-weight:bold;
letter-spacing:10px;
border-radius:8px;
">

${otp}

</span>

</div>

<p>

This verification code is valid for
<strong>10 minutes</strong>.

</p>

<p>

If you didn't request this email,
you can safely ignore it.

</p>

<hr style="margin:30px 0;">

<p
style="
font-size:12px;
color:#777;
text-align:center;
">

© ${new Date().getFullYear()} Mayon Grand Ellora

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

    try {

        const info = await transporter.sendMail(mailOptions);

        console.log("=================================");
        console.log("OTP EMAIL SENT SUCCESSFULLY");
        console.log("To        :", email);
        console.log("Message ID:", info.messageId);
        console.log("=================================");

        return info;

    } catch (err) {

        console.error("=================================");
        console.error("OTP EMAIL FAILED");
        console.error(err);
        console.error("=================================");

        throw err;

    }

}

module.exports = sendOTP;