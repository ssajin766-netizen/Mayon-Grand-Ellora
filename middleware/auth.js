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

    if (req.isAuthenticated()) {
        return next();
    }

    return res.redirect("/login");

};


/*
-----------------------------------------
User must be Admin
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

            messageSecondary: "Go back",

            hrefSecondary: "/home",

            buttonSecondary: "Home"

        });

    }

    return next();

};


/*
-----------------------------------------
OTP Authentication Check
-----------------------------------------
*/

exports.isVerified = (req, res, next) => {

    // User has already completed login + OTP
    if (req.isAuthenticated()) {
        return next();
    }

    return res.redirect("/login");

};


/*
-----------------------------------------
User must be approved
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

            messageSecondary: "Need help?",

            hrefSecondary: "/contacts",

            buttonSecondary: "Contact Society"

        });

    }

    return next();

};