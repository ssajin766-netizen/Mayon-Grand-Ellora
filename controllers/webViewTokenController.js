const crypto = require("crypto");

const { User } =
    require("../models/userModel");

const MobileWebViewToken =
    require("../models/mobileWebViewTokenModel");


// ==================================================
// MOBILE WEBVIEW SESSION
// ==================================================

exports.mobileWebViewSession = async (
    req,
    res
) => {

    try {

        console.log(
            "========================================"
        );

        console.log(
            "MOBILE WEBVIEW SESSION REQUEST"
        );

        console.log(
            "TOKEN RECEIVED:",
            !!req.query.token
        );

        console.log(
            "========================================"
        );


        // ==================================================
        // GET TOKEN
        // ==================================================

        const token =
            String(
                req.query.token || ""
            ).trim();


        if (!token) {

            console.error(
                "WEBVIEW TOKEN MISSING"
            );

            return res.status(400).json({
                success: false,
                message: "Token missing",
            });
        }


        // ==================================================
        // HASH TOKEN
        // ==================================================

        const tokenHash =
            crypto
                .createHash("sha256")
                .update(token)
                .digest("hex");


        // ==================================================
        // ATOMIC TOKEN CONSUMPTION
        // ==================================================
        //
        // Only one request can consume this token.
        //
        // This prevents:
        //
        // - replay attacks
        // - duplicate WebView requests
        // - race conditions
        //
        // ==================================================

        const tokenRecord =
            await MobileWebViewToken.findOneAndUpdate(

                {
                    tokenHash,

                    expiresAt: {
                        $gt: new Date(),
                    },

                    usedAt: null,
                },

                {
                    $set: {
                        usedAt: new Date(),
                    },
                },

                {
                    new: true,
                }
            );


        if (!tokenRecord) {

            console.error(
                "WEBVIEW TOKEN INVALID, EXPIRED OR ALREADY USED"
            );

            return res.status(401).json({
                success: false,
                message:
                    "Invalid or expired token",
            });
        }


        // ==================================================
        // FIND USER
        // ==================================================

        const user =
            await User.findById(
                tokenRecord.userId
            );


        if (!user) {

            console.error(
                "WEBVIEW USER NOT FOUND"
            );

            return res.status(404).json({
                success: false,
                message:
                    "User not found",
            });
        }


        // ==================================================
        // SECURITY CHECK
        // ==================================================

        if (
            user.validation !==
            "approved"
        ) {

            console.error(
                "WEBVIEW USER NOT APPROVED"
            );

            return res.status(403).json({
                success: false,
                message:
                    "User account is not approved",
            });
        }


        // ==================================================
        // LOGIN USER
        // ==================================================

        req.login(
            user,
            async loginErr => {

                if (loginErr) {

                    console.error(
                        "PASSPORT LOGIN ERROR:",
                        loginErr
                    );

                    return res.status(500).json({
                        success: false,
                        message:
                            "Unable to create login session",
                    });
                }


                // ==================================================
                // SAVE SESSION
                // ==================================================

                req.session.save(
                    saveErr => {

                        if (saveErr) {

                            console.error(
                                "SESSION SAVE ERROR:",
                                saveErr
                            );

                            return res.status(500).json({
                                success: false,
                                message:
                                    "Unable to save login session",
                            });
                        }


                        console.log(
                            "========================================"
                        );

                        console.log(
                            "WEBVIEW SESSION CREATED"
                        );

                        console.log(
                            "AUTH:",
                            req.isAuthenticated()
                        );

                        console.log(
                            "USER AUTHENTICATED"
                        );

                        console.log(
                            "========================================"
                        );


                        // ==================================================
                        // REDIRECT
                        // ==================================================

                        return res.redirect(
                            302,
                            "/home"
                        );
                    }
                );
            }
        );

    }

    catch (error) {

        console.error(
            "MOBILE WEBVIEW SESSION ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to establish WebView session",
        });
    }
};