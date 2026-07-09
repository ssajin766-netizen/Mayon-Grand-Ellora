require("dotenv").config();
require("./config/passport");

const express = require("express");
const session = require("express-session");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const MongoStore = require("connect-mongo");

const db = require("./config/db");

const visit_collection = require("./models/visitModel");
const user_collection = require("./models/userModel");
const society_collection = require("./models/societyModel");

/*
--------------------------------------------------
ROUTES
--------------------------------------------------
*/

const authRoutes = require("./routes/authRoutes");
const residentRoutes = require("./routes/residentRoutes");
const billRoutes = require("./routes/billRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
const noticeRoutes = require("./routes/noticeRoutes");
const profileRoutes = require("./routes/profileRoutes");
const contactRoutes = require("./routes/contactRoutes");

const app = express();

/*
--------------------------------------------------
IMPORTANT FOR RENDER
--------------------------------------------------
*/

app.set("trust proxy", 1);

/*
--------------------------------------------------
DATABASE
--------------------------------------------------
*/

db.connectDB();

/*
--------------------------------------------------
MIDDLEWARE
--------------------------------------------------
*/

app.set("view engine", "ejs");

app.use(express.static("public"));

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.use(cookieParser());

app.use(
    session({
        secret: process.env.SESSION_SECRET,

        resave: false,

        saveUninitialized: false,

        proxy: true,

        store: MongoStore.create({
            mongoUrl: process.env.MONGO_URI,
            collectionName: "sessions"
        }),

        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 1000 * 60 * 60 * 24
        }
    })
);

app.use(passport.initialize());

app.use(passport.session());

/*
--------------------------------------------------
SESSION DEBUG
--------------------------------------------------
*/

app.use((req, res, next) => {

    console.log("====================================");
    console.log("SESSION ID :", req.sessionID);
    console.log("AUTH :", req.isAuthenticated());

    if (req.user) {
        console.log("USER :", req.user.username);
    } else {
        console.log("USER : NONE");
    }

    console.log("====================================");

    next();

});

/*
--------------------------------------------------
HOME PAGE
--------------------------------------------------
*/

app.get("/", async (req, res) => {

    try {

        let pageVisit = await visit_collection.Visit.findOne();

        if (!pageVisit) {

            pageVisit = new visit_collection.Visit({
                count: 0
            });

        }

        if (process.env.NODE_ENV === "production") {
            pageVisit.count++;
        }

        await pageVisit.save();

        const societies = await society_collection.Society.find();

        const foundUsers = await user_collection.User.find();

        const cities = societies.map(
            s => s.societyAddress.city.toLowerCase()
        );

        res.render("index", {

            city: new Set(cities).size,

            society: societies.length,

            user: foundUsers.length,

            visit: pageVisit.count

        });

    }

    catch (err) {

        console.error(err);

        res.status(500).send("Server Error");

    }

});

/*
--------------------------------------------------
HOME
--------------------------------------------------
*/

app.get("/home", (req, res) => {

    if (!req.isAuthenticated()) {
        return res.redirect("/login");
    }

    if (req.user.validation === "approved") {
        return res.render("home");
    }

    if (req.user.validation === "applied") {

        return res.render("homeStandby", {

            icon: "fa-user-clock",

            title: "Account Pending",

            content:
                "Your account is waiting for approval from the administrator."

        });

    }

    return res.render("homeStandby", {

        icon: "fa-user-lock",

        title: "Account Declined",

        content:
            "Your account request has been declined. Please contact the administrator."

    });

});

/*
--------------------------------------------------
APPLICATION ROUTES
--------------------------------------------------
*/

app.use("/", authRoutes);

app.use("/", residentRoutes);

app.use("/", billRoutes);

app.use("/", paymentRoutes);

app.use("/", complaintRoutes);

app.use("/", noticeRoutes);

app.use("/", profileRoutes);

app.use("/", contactRoutes);

/*
--------------------------------------------------
HEALTH CHECK
--------------------------------------------------
*/

app.get("/health", (req, res) => {

    res.status(200).send("Server running");

});

/*
--------------------------------------------------
404
--------------------------------------------------
*/

app.use((req, res) => {

    res.status(404).render("failure", {

        message: "Page not found.",

        href: "/",

        messageSecondary: "Return Home",

        hrefSecondary: "/",

        buttonSecondary: "Home"

    });

});

/*
--------------------------------------------------
GLOBAL ERROR HANDLER
--------------------------------------------------
*/

app.use((err, req, res, next) => {

    console.error("GLOBAL ERROR:");

    console.error(err);

    res.status(500).render("failure", {

        message: "Something went wrong.",

        href: "/",

        messageSecondary: "Return Home",

        hrefSecondary: "/",

        buttonSecondary: "Home"

    });

});

/*
--------------------------------------------------
SERVER
--------------------------------------------------
*/

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log("===================================");
    console.log("Server started");
    console.log("Running on Port", PORT);
    console.log("===================================");

});