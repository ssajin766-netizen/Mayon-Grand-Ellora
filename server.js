require("dotenv").config();
require("./config/passport");

const flash = require("connect-flash");
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const MongoStore = require("connect-mongo");

const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");

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
const phoneRoutes = require("./routes/phoneRoutes");
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
TRUST PROXY
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
VIEW ENGINE
--------------------------------------------------
*/

app.set("view engine", "ejs");

/*
--------------------------------------------------
GLOBAL MIDDLEWARE
--------------------------------------------------
*/

app.use(
helmet({

    crossOriginEmbedderPolicy:false,

    contentSecurityPolicy:false

})
);
app.use(compression());

app.use(morgan("dev"));

app.use(express.static("public"));

app.use(express.urlencoded({
    extended: true
}));

app.use(express.json());

app.use(cookieParser());

/*
--------------------------------------------------
SESSION
--------------------------------------------------
*/
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

    maxAge: 1000 * 60 * 60 * 24,

    path: "/"

}

    })
);

app.use(flash());

/*
--------------------------------------------------
PASSPORT
--------------------------------------------------
*/

app.use(passport.initialize());

app.use(passport.session());

/*
--------------------------------------------------
GLOBAL VARIABLES
--------------------------------------------------
*/

app.use((req, res, next) => {

    res.locals.currentUser = req.user || null;

    res.locals.success = req.flash("success");

    res.locals.error = req.flash("error");

    next();

});

/*
--------------------------------------------------
SESSION DEBUG
--------------------------------------------------
*/

if (process.env.NODE_ENV !== "production") {

    app.use((req, res, next) => {

        console.log("====================================");

        console.log("SESSION :", req.sessionID);

        console.log("AUTH :", req.isAuthenticated());

        console.log(

            "USER :",

            req.user ? req.user.username : "NONE"

        );

        console.log("====================================");

        next();

    });

}

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

        const users = await user_collection.User.find();

        const cities = societies.map(

            s => s.societyAddress.city.toLowerCase()

        );

        res.render("index", {

            city: new Set(cities).size,

            society: societies.length,

            user: users.length,

            visit: pageVisit.count

        });

    }

    catch (err) {

        console.error(err);

        res.status(500).send("Internal Server Error");

    }

});

/*
--------------------------------------------------
HOME
--------------------------------------------------
*/

app.get("/home", (req, res) => {

    console.log("=================================");
    console.log("HOME ROUTE");
    console.log("Authenticated:", req.isAuthenticated());
    console.log("User:", req.user);
    console.log("Session:", req.sessionID);
    console.log("=================================");

    if (!req.isAuthenticated()) {
        console.log("Redirecting to /login");
        return res.redirect("/login");
    }

    if (req.user.validation === "approved") {
        console.log("Rendering home.ejs");
        return res.render("home");
    }

    if (req.user.validation === "applied") {
        console.log("Rendering homeStandby (Pending)");
        return res.render("homeStandby", {
            icon: "fa-user-clock",
            title: "Account Pending",
            content: "Your account is waiting for administrator approval."
        });
    }

    console.log("Rendering homeStandby (Declined)");

    return res.render("homeStandby", {
        icon: "fa-user-lock",
        title: "Account Declined",
        content: "Please contact the society administrator."
    });

});

/*
--------------------------------------------------
APPLICATION ROUTES
--------------------------------------------------
*/

app.use("/", authRoutes);

app.use("/",phoneRoutes);

app.use("/", residentRoutes);

app.use("/", billRoutes);

app.use("/", paymentRoutes);

app.use("/", complaintRoutes);

app.use("/", noticeRoutes);

app.use("/", profileRoutes);

app.use("/", contactRoutes);

/*
--------------------------------------------------
HEALTH
--------------------------------------------------
*/

app.get("/health", (req, res) => {

    res.status(200).json({

        success: true,

        message: "Server is running"

    });

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

    console.error(err.stack);

    res.status(500).render("failure", {

        message: "Internal Server Error",

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

    console.log("Environment :", process.env.NODE_ENV);

    console.log("===================================");

});