const { Notification } = require("../models/notificationModel");
const { User } = require("../models/userModel");
const sendMail = require("./sendMail");

async function createNotification({

    user,

    title,

    message,

    type = "info",

    icon = "fa-bell",

    link = "#",

    sendEmail = false

}) {

    try {

        /*
        ------------------------------------------
        SAVE NOTIFICATION
        ------------------------------------------
        */

        await Notification.create({

            user,

            title,

            message,

            type,

            icon,

            link

        });

        /*
        ------------------------------------------
        SEND EMAIL (OPTIONAL)
        ------------------------------------------
        */

        if (sendEmail) {

            try {

                const resident = await User.findById(user);

                if (resident && resident.username) {

                    await sendMail(

                        resident.username,

                        title,

                        `
                        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">

                            <h2 style="color:#198754;">
                                ${title}
                            </h2>

                            <p style="font-size:16px;color:#333;">
                                ${message}
                            </p>

                            <br>

                            <a
                                href="${process.env.BASE_URL || ""}${link}"
                                style="
                                    display:inline-block;
                                    background:#198754;
                                    color:#ffffff;
                                    text-decoration:none;
                                    padding:12px 22px;
                                    border-radius:6px;
                                    font-weight:bold;
                                ">

                                View Notification

                            </a>

                            <hr>

                            <p style="color:#777;font-size:13px;">

                                This is an automated notification from
                                <strong>Mayon Grand Ellora</strong>.

                            </p>

                        </div>
                        `

                    );

                }

            }

            catch (emailErr) {

                console.error("Email Notification Error:", emailErr);

            }

        }

    }

    catch (err) {

        console.error("Notification Error:", err);

    }

}

module.exports = {

    createNotification

};