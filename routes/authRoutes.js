const express = require("express");
const passport = require("passport");

const router = express.Router();

const user_collection = require("../models/userModel");
const society_collection = require("../models/societyModel");

const otpController = require("../controllers/otpController");

/*
--------------------------------------------------
GET LOGIN
--------------------------------------------------
*/

router.get("/login", (req, res) => {

    if (req.isAuthenticated()) {

        return res.redirect("/home");

    }

    res.render("login");

});

/*
--------------------------------------------------
GET SIGNUP
--------------------------------------------------
*/

router.get("/signup", async (req, res) => {

    try {

        const societies =
            await society_collection.Society.find();

        res.render("signup", {
            societies
        });

    } catch (err) {

        console.log(err);

        res.status(500).send("Server Error");

    }

});

/*
--------------------------------------------------
SIGNUP
--------------------------------------------------
*/

router.post("/signup", async (req, res) => {

    try {

        const foundSociety =
            await society_collection.Society.findOne({

                societyName: req.body.societyName

            });

        if (!foundSociety) {

            return res.render("failure", {

                message:
                    "Sorry, society is not registered. Please double-check the society name.",

                href: "/signup",

                messageSecondary: "Society not registered?",

                hrefSecondary: "/register",

                buttonSecondary: "Register Society"

            });

        }

        const user =
            await user_collection.User.register(

                {

                    username: req.body.username,

                    loginType: "password",

                    societyName: req.body.societyName,

                    flatNumber: req.body.flatNumber,

                    firstName: req.body.firstName,

                    lastName: req.body.lastName,

                    phoneNumber: req.body.phoneNumber,

                    isEmailVerified: false,

                    isPhoneVerified: false,

                    twoFactorEnabled: false

                },

                req.body.password

            );

        req.session.pendingUser = user._id;

        await otpController.sendSignupOTP(
            user.username
        );

        return res.redirect(
        "/verify-otp?email=" +
         encodeURIComponent(user.username) +
        "&purpose=signup"
      );

    }

    catch (err) {

        console.error(err);

        return res.render("failure", {

            message:
                "Sorry, this email address is already registered.",

            href: "/signup",

            messageSecondary:
                "Society not registered?",

            hrefSecondary:
                "/register",

            buttonSecondary:
                "Register Society"

        });

    }

});

/*
--------------------------------------------------
REGISTER SOCIETY PAGE
--------------------------------------------------
*/

router.get("/register", (req, res) => {

    if (req.isAuthenticated()) {

        return res.redirect("/home");

    }

    res.render("register");

});

router.post("/register", async (req, res) => {

    if (req.body.adminSecret !== process.env.ADMIN_SECRET) {

        return res.status(403).send("Invalid Admin Secret");

    }

    try {

        const existingSociety =

        await society_collection.Society.findOne({

            societyName: req.body.societyName

        });

        if (existingSociety) {

            return res.render("failure", {

                message: "Society already registered",

                href: "/register",

                messageSecondary: "Resident account?",

                hrefSecondary: "/signup",

                buttonSecondary: "Create Account"

            });

        }

        const user =

        await user_collection.User.register(

            {

                validation: "approved",

                isAdmin: true,

                username: req.body.username,

                societyName: req.body.societyName,

                flatNumber: req.body.flatNumber,

                firstName: req.body.firstName,

                lastName: req.body.lastName,

                phoneNumber: req.body.phoneNumber

            },

            req.body.password

        );

        await new Promise((resolve, reject) => {

            req.login(user, err => {

                if (err) return reject(err);

                resolve();

            });

        });

        const society = new society_collection.Society({

            societyName: user.societyName,

            societyAddress: {

                address: req.body.address,

                city: req.body.city,

                district: req.body.district,

                postalCode: req.body.postalCode

            },

            admin: user.username

        });

        await society.save();

        res.redirect("/home");

    }

    catch (err) {

        console.log(err);

        res.redirect("/register");

    }

});

/*
--------------------------------------------------
LOGIN
--------------------------------------------------
*/

router.post("/login", (req, res, next) => {

    passport.authenticate("local", (err, user) => {

        if (err) {
            return next(err);
        }

        if (!user) {
            return res.redirect("/loginFailure");
        }

        // 2FA Disabled → Login directly
        if (!user.twoFactorEnabled) {

            return req.logIn(user, (err) => {

                if (err) {
                    return next(err);
                }

                return res.redirect("/home");

            });

        }

        // 2FA Enabled → Send Login OTP

        req.session.pendingUser = user._id;

        req.session.save(async (err) => {

            if (err) {
                return next(err);
            }

            try {

           await otpController.sendLoginOTP(user.username);

           return res.redirect(
           "/verify-otp?email=" +
           encodeURIComponent(user.username) +
           "&purpose=login"
        );

            }

            catch (e) {

                console.error(e);

                return res.render("failure", {

                    message: "Unable to send OTP.",

                    href: "/login",

                    messageSecondary: "Try Again",

                    hrefSecondary: "/login",

                    buttonSecondary: "Login"

                });

            }

        });

    })(req, res, next);

});

/*
--------------------------------------------------
LOGOUT
--------------------------------------------------
*/

router.get("/logout",(req,res)=>{

    req.logout(()=>{

        req.session.destroy(()=>{

            res.clearCookie("connect.sid");

            res.redirect("/");

        });

    });

});

/*
--------------------------------------------------
GOOGLE LOGIN
--------------------------------------------------
*/

router.get(

    "/auth/google",

    passport.authenticate(

        "google",

        {

            scope: [

                "profile",

                "email"

            ]

        }

    )

);

/*
--------------------------------------------------
GOOGLE CALLBACK
--------------------------------------------------
*/
router.get(

    "/auth/google/callback",

    passport.authenticate("google", {

        failureRedirect: "/login"

    }),

    (req, res) => {

        return res.redirect("/home");

    }

);
/*
--------------------------------------------------
VERIFY OTP PAGE
--------------------------------------------------
*/

router.get("/verify-otp", (req, res) => {

    console.log(
        "VERIFY SESSION:",
        req.session.pendingUser
    );

    if (!req.session.pendingUser) {
        return res.redirect("/login");
    }

    res.render("verifyOtp", {

    email: req.query.email,

    purpose: req.query.purpose || "login"

});

});

/*
--------------------------------------------------
VERIFY OTP
--------------------------------------------------
*/

router.post("/verify-otp", async (req, res, next) => {

    try {

        if (!req.session.pendingUser) {
            return res.redirect("/login");
        }

const result = await otpController.verifyOTP(

    req.body.email,

    req.body.otp,

    req.body.purpose === "signup"
        ? "email_verification"
        : "login"

);

        if (!result.success) {

            return res.render("verifyOtp", {

                email: req.body.email,

                error: result.message

            });

        }

        const user = await user_collection.User.findById(

            req.session.pendingUser

        );

        if (!user) {

            return res.redirect("/login");

        }

        req.logIn(user, (err) => {

            if (err) {

                return next(err);

            }

            delete req.session.pendingUser;

            req.session.save(() => {

                return res.redirect("/home");

            });

        });

    }

    catch (err) {

        console.error(err);

        return res.render("verifyOtp", {

            email: req.body.email,

            error: "Something went wrong."

        });

    }

});

/*
--------------------------------------------------
RESEND OTP
--------------------------------------------------
*/

router.post("/resend-otp", async (req, res) => {

    try {

        if (req.body.purpose === "signup") {

            await otpController.resendSignupOTP(
                req.body.email
            );

        } else {

            await otpController.resendLoginOTP(
                req.body.email
            );

        }

        return res.render("verifyOtp", {

            email: req.body.email,

            purpose: req.body.purpose,

            success: "A new OTP has been sent."

        });

    }

    catch (err) {

        console.error(err);

        return res.render("verifyOtp", {

            email: req.body.email,

            purpose: req.body.purpose,

            error: err.message

        });

    }

});


router.get("/loginFailure", (req, res) => {

    res.render("failure", {

        message: "Sorry, entered password was incorrect, Please double-check.",

        href: "/login",

        messageSecondary: "Account not created?",

        hrefSecondary: "/signup",

        buttonSecondary: "Create Account"

    });

});

router.get("/newRequest", async (req, res) => {

    if (!req.isAuthenticated()) {

        return res.redirect("/login");

    }

    if (req.user.validation === "approved") {

        return res.redirect("/home");

    }

    try {

        const societies = await society_collection.Society.find();

        res.render("signupEdit", {

            user: req.user,

            societies

        });

    }

    catch (err) {

        console.log(err);

        res.status(500).send("Server Error");

    }

});

router.post("/newRequest", async (req, res) => {

    try {

        const foundSociety =

        await society_collection.Society.findOne({

            societyName: req.body.societyName

        });

        if (!foundSociety) {

            return res.render("failure", {

                message: "Sorry, society is not registered.",

                href: "/newRequest",

                messageSecondary: "Account not created?",

                hrefSecondary: "/signup",

                buttonSecondary: "Create Account"

            });

        }

  const user = await user_collection.User.findById(req.user.id);

user.firstName = req.body.firstName;
user.lastName = req.body.lastName;
user.phoneNumber = req.body.phoneNumber;
user.societyName = req.body.societyName;
user.flatNumber = req.body.flatNumber;
user.validation = "applied";

await user.save();

        res.redirect("/home");

    }

    catch (err) {

        console.log(err);

        res.redirect("/newRequest");

    }

});

module.exports = router;