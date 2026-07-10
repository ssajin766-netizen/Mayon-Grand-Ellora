const { google } = require("googleapis");
const oauth2Client = require("../config/gmail");

async function sendMail(to, subject, html) {
    try {
        console.log("================================");
        console.log("GMAIL API START");
        console.log("EMAIL_USER:", process.env.EMAIL_USER);
        console.log("CLIENT ID:", process.env.GOOGLE_CLIENT_ID ? "Loaded" : "Missing");
        console.log("CLIENT SECRET:", process.env.GOOGLE_CLIENT_SECRET ? "Loaded" : "Missing");
        console.log("REFRESH TOKEN:", process.env.GMAIL_REFRESH_TOKEN ? "Loaded" : "Missing");

        await oauth2Client.getAccessToken();
        console.log("Access token generated");

        const gmail = google.gmail({
            version: "v1",
            auth: oauth2Client
        });

        const message = [
            `From: Mayon Grand Ellora <${process.env.EMAIL_USER}>`,
            `To: ${to}`,
            `Subject: ${subject}`,
            "MIME-Version: 1.0",
            "Content-Type: text/html; charset=UTF-8",
            "",
            html
        ].join("\n");

        const encodedMessage = Buffer.from(message)
            .toString("base64")
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/, "");

        const result = await gmail.users.messages.send({
            userId: "me",
            requestBody: {
                raw: encodedMessage
            }
        });

        console.log("MAIL SENT");
        console.log(result.data);

        return result.data;

    } catch (err) {
        console.log("GMAIL API ERROR");
        console.log(err.response?.data || err);
        throw err;
    }
}

module.exports = sendMail;