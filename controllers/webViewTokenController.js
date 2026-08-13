const { User } = require("../models/userModel");

const {
    validateWebViewToken,
} = require("./phoneOtpController");

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
            "SESSION:",
            req.sessionID
        );

        console.log(
            "TOKEN RECEIVED:",
            !!req.query.token
        );

        console.log(
            "========================================"
        );

        // ==================================================
        // TOKEN
        // ==================================================

        const token =
            req.query.token;

        if (!token) {
            return res
                .status(400)
                .json({
                    success: false,
                    message:
                        "Token missing",
                });
        }

        // ==================================================
        // VALIDATE TOKEN
        // ==================================================

        const userId =
            validateWebViewToken(
                token
            );

        if (!userId) {
            console.error(
                "WebView token invalid or expired"
            );

            return res
                .status(401)
                .json({
                    success: false,
                    message:
                        "Invalid or expired token",
                });
        }

        console.log(
            "WEBVIEW TOKEN VALID"
        );

        console.log(
            "USER ID:",
            userId
        );

        // ==================================================
        // FIND USER
        // ==================================================

        const user =
            await User.findById(
                userId
            );

        if (!user) {
            console.error(
                "WebView user not found:",
                userId
            );

            return res
                .status(404)
                .json({
                    success: false,
                    message:
                        "User not found",
                });
        }

        console.log(
            "WEBVIEW USER:",
            user.username ||
            user.email ||
            user.phoneNumber
        );

        // ==================================================
        // PASSPORT LOGIN
        // ==================================================

        req.login(
            user,
            loginErr => {
                if (loginErr) {
                    console.error(
                        "Passport login error:",
                        loginErr
                    );

                    return res
                        .status(500)
                        .json({
                            success: false,
                            message:
                                "Unable to create login session",
                        });
                }

                console.log(
                    "PASSPORT LOGIN SUCCESS"
                );

                console.log(
                    "AUTH:",
                    req.isAuthenticated()
                );

                console.log(
                    "USER:",
                    req.user?.username ||
                    req.user?.email ||
                    req.user?.phoneNumber
                );

                // ==================================================
                // FORCE SESSION SAVE
                // ==================================================

                req.session.save(
                    saveErr => {
                        if (saveErr) {
                            console.error(
                                "Session save error:",
                                saveErr
                            );

                            return res
                                .status(500)
                                .json({
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
                            "SESSION:",
                            req.sessionID
                        );

                        console.log(
                            "AUTH:",
                            req.isAuthenticated()
                        );

                        console.log(
                            "COOKIE:",
                            req.session.cookie
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

    } catch (error) {
        console.error(
            "mobileWebViewSession error:",
            error
        );

        return res
            .status(500)
            .json({
                success: false,
                message:
                    "Unable to establish WebView session",
            });
    }
};