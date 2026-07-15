/*
=========================================
Authentication Middleware
=========================================
*/

/*
-----------------------------------------
User must be logged in
-----------------------------------------
*/

exports.isLoggedIn = (req, res, next) => {

    if (!req.isAuthenticated()) {
        return res.redirect("/login");
    }

    next();

};

/*
-----------------------------------------
Administrator Only
-----------------------------------------
*/

exports.isAdmin = (req, res, next) => {

    if (!req.isAuthenticated()) {
        return res.redirect("/login");
    }

    if (!req.user.isAdmin) {

        return res.status(403).render("failure", {

            message: "Access denied. Administrator privileges required.",

            href: "/home",

            messageSecondary: "Go Back",

            hrefSecondary: "/home",

            buttonSecondary: "Home"

        });

    }

    next();

};

/*
-----------------------------------------
Email Verification Required
Used for features that require a verified email
-----------------------------------------
*/

exports.isVerified = (req, res, next) => {

    if (!req.isAuthenticated()) {
        return res.redirect("/login");
    }

    if (!req.user.isEmailVerified) {

        return res.redirect(

            "/verify-otp?email=" +

            encodeURIComponent(req.user.username) +

            "&purpose=signup"

        );

    }

    next();

};

/*
-----------------------------------------
Phone Verification Required (Future)
-----------------------------------------
*/

exports.isPhoneVerified = (req, res, next) => {

    if (!req.isAuthenticated()) {
        return res.redirect("/login");
    }

    if (!req.user.isPhoneVerified) {

        return res.render("failure", {

            message: "Please verify your phone number.",

            href: "/verify-phone",

            messageSecondary: "Verify Phone",

            hrefSecondary: "/verify-phone",

            buttonSecondary: "Verify"

        });

    }

    next();

};

/*
-----------------------------------------
Admin Approval Required
-----------------------------------------
*/

exports.isApproved = (req, res, next) => {

    if (!req.isAuthenticated()) {
        return res.redirect("/login");
    }

    if (req.user.validation !== "approved") {

        return res.render("failure", {

            message: "Your account is waiting for administrator approval.",

            href: "/logout",

            messageSecondary: "Need Help?",

            hrefSecondary: "/contacts",

            buttonSecondary: "Contact Society"

        });

    }

    next();

};