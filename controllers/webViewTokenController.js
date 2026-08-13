const { User } = require("../models/userModel");
const {
    validateWebViewToken,
} = require("./phoneOtpController");

// ==================================================
// MOBILE WEBVIEW SESSION HAND-OFF
// ==================================================

exports.mobileWebViewSession = async (req, res) => {
    try {

        console.log("========================================");
        console.log("MOBILE WEBVIEW SESSION REQUEST");
        console.log("SESSION:", req.sessionID);
        console.log("TOKEN RECEIVED:", !!req.query.token);
        console.log("========================================");


        // --------------------------------------------------
        // GET TOKEN
        // --------------------------------------------------

        const token = req.query.token;

        if (!token) {
            console.error(
                "WebView session token missing"
            );

            return res.status(400).json({
                success: false,
                message: "Token missing",
            });
        }


        // --------------------------------------------------
        // VALIDATE ONE-TIME TOKEN
        // --------------------------------------------------

        const userId =
            validateWebViewToken(token);

        if (!userId) {

            console.error(
                "WebView token invalid or expired"
            );

            return res.status(401).json({
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


        // --------------------------------------------------
        // FIND USER
        // --------------------------------------------------

        const user =
            await User.findById(userId);

        if (!user) {

            console.error(
                "WebView user not found:",
                userId
            );

            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }


        console.log(
            "WEBVIEW USER:",
            user.username
        );


        // --------------------------------------------------
        // LOGIN USER INTO EXPRESS SESSION
        // --------------------------------------------------

        req.login(user, (loginErr) => {

            if (loginErr) {

                console.error(
                    "WebView Passport login error:",
                    loginErr
                );

                return res.status(500).json({
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
                req.user?.username
            );


            // --------------------------------------------------
            // SAVE EXPRESS SESSION
            // --------------------------------------------------

            req.session.save((saveErr) => {

                if (saveErr) {

                    console.error(
                        "WebView session save error:",
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
                    "SESSION:",
                    req.sessionID
                );

                console.log(
                    "AUTH:",
                    req.isAuthenticated()
                );

                console.log(
                    "USER:",
                    req.user?.username
                );

                console.log(
                    "COOKIE CONFIG:",
                    req.session.cookie
                );

                console.log(
                    "========================================"
                );


                // --------------------------------------------------
                // REDIRECT TO AUTHENTICATED HOME
                // --------------------------------------------------

                return res.redirect(
                    "/home"
                );
            });
        });

    } catch (err) {

        console.error(
            "mobileWebViewSession error:",
            err
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to establish WebView session",
        });
    }
};