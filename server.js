require("dotenv").config();
require("./config/passport");

const cors = require("cors");

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
const { Notification } = require("./models/notificationModel");


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
const notificationRoutes = require("./routes/notificationRoutes");
const authApi = require("./routes/api/authApi");
const profileApi = require("./routes/api/profileApi");
const residentApi = require("./routes/api/residentApi");
const noticeApi = require("./routes/api/noticeApi");
const billApi = require("./routes/api/billApi");
const paymentApi = require("./routes/api/paymentApi");
const helpdeskApi = require("./routes/api/helpdeskApi");
const notificationApi = require("./routes/api/notificationApi");
const contactApi = require("./routes/api/contactApi");
const dashboardApi = require("./routes/api/dashboardApi");

const app = express();

app.use((req, res, next) => {
    res.locals.currentPath = req.path;
    next();
});

const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:8081",
  "http://127.0.0.1:8081",
  "http://localhost:19006",
  "http://127.0.0.1:19006",
  "https://e-society-erp9.onrender.com"
];

app.use(cors({
  origin: function (origin, callback) {

    console.log("Origin:", origin);

    // Allow requests with no Origin (same-origin navigation, Postman, curl)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log("Blocked Origin:", origin);

    return callback(null, true);   // <-- TEMPORARY for debugging
  },
  credentials: true
}));

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

const isProduction =
    process.env.NODE_ENV === "production";


app.use(
    session({

        secret: process.env.SESSION_SECRET,

        resave: false,

        saveUninitialized: false,

        proxy: isProduction,

        store: MongoStore.create({

            mongoUrl: process.env.MONGO_URI,

            collectionName: "sessions",

            ttl: 60 * 60 * 24
        }),

        cookie: {

            // Prevent JavaScript from accessing the session cookie
            httpOnly: true,

            // Local:
            //   http://10.0.2.2:3000
            //
            // Production:
            //   https://e-society-erp9.onrender.com
            secure: isProduction,

            // Local WebView and production WebView
            sameSite: isProduction
                ? "none"
                : "lax",

            // 24 hours
            maxAge:
                1000 * 60 * 60 * 24,

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

app.use((req, res, next) => {
    if (req.path === "/login" || req.path === "/home") {
        console.log("========== SESSION CHECK ==========");
        console.log("PATH:", req.path);
        console.log("SESSION ID:", req.sessionID);
        console.log("AUTH:", req.isAuthenticated());
        console.log(
            "USER:",
            req.user ? req.user.username : "NONE"
        );
        console.log(
            "COOKIE:",
            req.headers.cookie || "NO COOKIE"
        );
        console.log("==================================");
    }

    next();
});

/*
--------------------------------------------------
GLOBAL VARIABLES
--------------------------------------------------
*/

app.use(async (req, res, next) => {

    res.locals.currentUser = req.user || null;

    res.locals.success = req.flash("success");

    res.locals.error = req.flash("error");

    res.locals.unreadNotifications = 0;

    try {

        if (req.user) {

            res.locals.unreadNotifications =
                await Notification.countDocuments({

                    user: req.user._id,

                    isRead: false

                });

        }

    }

    catch (err) {

        console.log("Notification Error:", err.message);

    }

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

    if (!req.isAuthenticated()) {
        return res.redirect("/login");
    }

    // ==========================================
    // ADMIN
    // ==========================================
    if (req.user.isAdmin) {
        return res.render("home");
    }

    // ==========================================
    // Google / Phone users must complete profile
    // ==========================================
    if (
        req.user.societyName === "Pending" ||
        req.user.flatNumber === "Pending"
    ) {
        return res.redirect("/newRequest");
    }

    // ==========================================
    // Resident Approved
    // ==========================================
    if (req.user.validation === "approved") {
        return res.render("home");
    }

    // ==========================================
    // Waiting Approval
    // ==========================================
    if (req.user.validation === "applied") {
        return res.render("homeStandby", {
            icon: "fa-user-clock",
            title: "Account Pending",
            content: "Your account is waiting for administrator approval."
        });
    }

    // ==========================================
    // Rejected
    // ==========================================
    return res.render("homeStandby", {
        icon: "fa-user-lock",
        title: "Account Declined",
        content: "Please contact the society administrator."
    });

});

// ==================================================
// MOBILE APP VERSION
// ==================================================

app.get("/app/version", (req, res) => {
    return res.status(200).json({
        success: true,
        minimumVersion: "1.1.0",
        forceUpdate: false
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

app.use("/", notificationRoutes);

app.use("/api/auth", authApi);

app.use("/api", profileApi);

app.use("/api", residentApi);

app.use("/api", noticeApi);

app.use("/api", billApi);

app.use("/api", paymentApi);

app.use("/api", helpdeskApi);

app.use("/api", notificationApi);

app.use("/api", contactApi);

app.use("/api", dashboardApi);

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
    console.error("========== ERROR ==========");
    console.error(err);
    console.error(err.stack);

    res.status(500).send(`
        <h1>Internal Server Error</h1>
        <pre>${err.stack}</pre>
    `);
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