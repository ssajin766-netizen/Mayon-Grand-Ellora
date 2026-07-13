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