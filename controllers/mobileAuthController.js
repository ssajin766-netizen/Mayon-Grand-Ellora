const crypto = require("crypto");

const {
    User,
} = require("../models/userModel");

const MobileAuthToken =
    require("../models/mobileAuthTokenModel");

const MobileWebViewRestoreTicket =
    require(
        "../models/mobileWebViewRestoreTicketModel"
    );


// ==================================================
// CONFIGURATION
// ==================================================

const MOBILE_AUTH_TOKEN_TTL_MS =
    30 * 24 * 60 * 60 * 1000; // 30 days

const RESTORE_TICKET_TTL_MS =
    60 * 1000; // 1 minute


// ==================================================
// HASH TOKEN
// ==================================================

function hashToken(value) {

    return crypto
        .createHash("sha256")
        .update(value)
        .digest("hex");

}


// ==================================================
// GENERATE RANDOM TOKEN
// ==================================================

function generateRandomToken() {

    return crypto
        .randomBytes(32)
        .toString("hex");

}


// ==================================================
// GENERATE PERSISTENT MOBILE AUTH TOKEN
// ==================================================

async function generateMobileAuthToken(
    userId
) {

    const token =
        generateRandomToken();

    const tokenHash =
        hashToken(token);

    const expiresAt =
        new Date(
            Date.now() +
            MOBILE_AUTH_TOKEN_TTL_MS
        );


    await MobileAuthToken.create({

        tokenHash,

        userId,

        expiresAt,

        revokedAt: null,

    });


    return token;
}


exports.generateMobileAuthToken =
    generateMobileAuthToken;


// ==================================================
// CREATE SHORT-LIVED WEBVIEW RESTORE TICKET
// ==================================================

exports.createMobileWebViewRestoreTicket =
    async (
        req,
        res
    ) => {

        try {

            console.log(
                "========================================"
            );

            console.log(
                "CREATE MOBILE WEBVIEW RESTORE TICKET"
            );

            console.log(
                "========================================"
            );


            const token =
                String(
                    req.body?.token || ""
                ).trim();


            if (!token) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Mobile authentication token missing",

                });

            }


            const tokenHash =
                hashToken(token);


            // ------------------------------------------
            // Find valid persistent token
            // ------------------------------------------

            const mobileAuthToken =
                await MobileAuthToken.findOne({

                    tokenHash,

                    expiresAt: {
                        $gt: new Date(),
                    },

                    revokedAt: null,

                });


            if (!mobileAuthToken) {

                console.error(
                    "MOBILE AUTH TOKEN INVALID/EXPIRED"
                );

                return res.status(401).json({

                    success: false,

                    message:
                        "Mobile authentication expired",

                });

            }


            // ------------------------------------------
            // Find user
            // ------------------------------------------

            const user =
                await User.findById(
                    mobileAuthToken.userId
                );


            if (!user) {

                return res.status(401).json({

                    success: false,

                    message:
                        "User not found",

                });

            }


            // ------------------------------------------
            // Verify account
            // ------------------------------------------

            if (
                user.validation !==
                "approved"
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "User account is not approved",

                });

            }


            // ------------------------------------------
            // Generate ONE-TIME restore ticket
            // ------------------------------------------

            const ticket =
                generateRandomToken();

            const ticketHash =
                hashToken(ticket);

            const expiresAt =
                new Date(
                    Date.now() +
                    RESTORE_TICKET_TTL_MS
                );


            await MobileWebViewRestoreTicket.create({

                ticketHash,

                userId:
                    user._id,

                expiresAt,

                usedAt: null,

            });


            console.log(
                "WEBVIEW RESTORE TICKET CREATED"
            );

            console.log(
                "USER:",
                user.username
            );

            console.log(
                "EXPIRES:",
                expiresAt
            );


            return res.json({

                success: true,

                ticket,

                expiresAt,

            });

        }

        catch (error) {

            console.error(
                "CREATE RESTORE TICKET ERROR:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Unable to create WebView restore ticket",

            });

        }

    };


// ==================================================
// RESTORE WEBVIEW SESSION
// ==================================================

exports.mobileWebViewRestore =
    async (
        req,
        res
    ) => {

        try {

            console.log(
                "========================================"
            );

            console.log(
                "MOBILE WEBVIEW SESSION RESTORE"
            );

            console.log(
                "========================================"
            );


            const ticket =
                String(
                    req.query?.ticket || ""
                ).trim();


            if (!ticket) {

                console.error(
                    "RESTORE TICKET MISSING"
                );

                return res.status(401).send(
                    "Invalid restore ticket"
                );

            }


            const ticketHash =
                hashToken(ticket);


            // ==================================================
            // ATOMIC CONSUMPTION
            // ==================================================

            const ticketRecord =
                await MobileWebViewRestoreTicket
                    .findOneAndUpdate(

                        {
                            ticketHash,

                            expiresAt: {
                                $gt: new Date(),
                            },

                            usedAt: null,
                        },

                        {
                            $set: {
                                usedAt:
                                    new Date(),
                            },
                        },

                        {
                            new: true,
                        }

                    );


            if (!ticketRecord) {

                console.error(
                    "RESTORE TICKET INVALID/EXPIRED/USED"
                );

                return res.status(401).send(
                    "Invalid or expired restore ticket"
                );

            }


            // ==================================================
            // FIND USER
            // ==================================================

            const user =
                await User.findById(
                    ticketRecord.userId
                );


            if (!user) {

                console.error(
                    "RESTORE USER NOT FOUND"
                );

                return res.status(401).send(
                    "User not found"
                );

            }


            // ==================================================
            // VERIFY USER
            // ==================================================

            if (
                user.validation !==
                "approved"
            ) {

                console.error(
                    "RESTORE USER NOT APPROVED"
                );

                return res.status(403).send(
                    "User account is not approved"
                );

            }

// ==================================================
// CREATE PASSPORT SESSION
// ==================================================

req.login(
    user,
    loginErr => {

        if (loginErr) {

            console.error(
                "PASSPORT RESTORE LOGIN ERROR:",
                loginErr
            );

            if (!res.headersSent) {
                return res.status(500).send(
                    "Unable to restore login session"
                );
            }

            return;
        }


        // ------------------------------------------
        // SESSION CREATED BY PASSPORT
        // ------------------------------------------

        console.log(
            "========================================"
        );

        console.log(
            "WEBVIEW SESSION RESTORED"
        );

        console.log(
            "AUTH:",
            req.isAuthenticated()
        );

        console.log(
            "USER:",
            user.username
        );

        console.log(
            "========================================"
        );


        // ------------------------------------------
        // REDIRECT TO HOME
        // ------------------------------------------

        if (res.headersSent) {
            return;
        }

        return res.redirect(
            302,
            "/home"
        );

    }
);

}

catch (error) {

    console.error(
        "WEBVIEW SESSION RESTORE ERROR:",
        error
    );

    if (res.headersSent) {
        return;
    }

    return res.status(500).send(
        "Unable to restore WebView session"
    );

}

};


// ==================================================
// REVOKE MOBILE AUTH TOKEN
// ==================================================

exports.revokeMobileAuthToken =
    async function revokeMobileAuthToken(
        token
    ) {

        if (!token) {
            return;
        }


        try {

            const tokenHash =
                hashToken(token);


            await MobileAuthToken.updateOne(

                {
                    tokenHash,
                },

                {
                    $set: {
                        revokedAt:
                            new Date(),
                    },
                }

            );

        }

        catch (error) {

            console.error(
                "MOBILE AUTH TOKEN REVOKE ERROR:",
                error
            );

        }

    };