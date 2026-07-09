/*
=========================================
Authentication Middleware
=========================================
*/

// User must be logged in
exports.isLoggedIn = (req, res, next) => {

    if (req.isAuthenticated()) {
        return next();
    }

    return res.redirect("/login");

};


// User must be Admin
exports.isAdmin = (req, res, next) => {

    if (!req.isAuthenticated()) {
        return res.redirect("/login");
    }

    if (!req.user.isAdmin) {
        return res.status(403).render("failure", {
            message: "Access denied. Administrator privileges required.",
            href: "/home",
            messageSecondary: "Go back",
            hrefSecondary: "/home",
            buttonSecondary: "Home"
        });
    }

    next();

};


// Email must be verified
exports.isVerified = (req, res, next) => {

    if (!req.isAuthenticated()) {
        return res.redirect("/login");
    }

    if (!req.user.isEmailVerified) {
        return res.redirect(
            "/verify-otp?email=" +
            encodeURIComponent(req.user.username)
        );
    }

    next();

};


// User must be approved by Admin
exports.isApproved = (req, res, next) => {

    if (!req.isAuthenticated()) {
        return res.redirect("/login");
    }

    if (req.user.validation !== "approved") {

        return res.render("failure", {

            message: "Your account is waiting for administrator approval.",

            href: "/logout",

            messageSecondary: "Need help?",

            hrefSecondary: "/contacts",

            buttonSecondary: "Contact Society"

        });

    }

    next();

};