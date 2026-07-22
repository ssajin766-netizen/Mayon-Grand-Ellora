const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const { User } = require("../models/userModel");

// --------------------------------------------------
// Local Strategy
// --------------------------------------------------

passport.use(User.createStrategy());

// --------------------------------------------------
// Session
// --------------------------------------------------

passport.serializeUser(User.serializeUser());

passport.deserializeUser(User.deserializeUser());

// --------------------------------------------------
// Helper
// --------------------------------------------------

async function updateLogin(user, method) {

    user.lastLogin = new Date();

    user.loginType = method.toLowerCase();

    user.failedLoginAttempts = 0;

    user.accountLockedUntil = null;

    user.lastFailedLogin = null;

    user.loginHistory.unshift({

        loginTime: new Date(),

        loginMethod: method,

        status: "Success"

    });

    user.loginHistory = user.loginHistory.slice(0, 20);

    await user.save();

}

// --------------------------------------------------
// Google Strategy
// --------------------------------------------------

passport.use(

    new GoogleStrategy(

        {

            clientID: process.env.GOOGLE_CLIENT_ID,

            clientSecret: process.env.GOOGLE_CLIENT_SECRET,

            callbackURL: process.env.GOOGLE_CALLBACK_URL,

            passReqToCallback: false

        },

        async (

            accessToken,

            refreshToken,

            profile,

            done

        ) => {

            try {

                if (

                    !profile.emails ||

                    profile.emails.length === 0

                ) {

                    return done(

                        new Error("Google account has no email"),

                        null

                    );

                }

                const email =

                    profile.emails[0].value

                        .toLowerCase()

                        .trim();

                // =====================================================
                // Existing Google User
                // =====================================================

                let user = await User.findOne({

                    googleId: profile.id

                });

                if (user) {

                    user.firstName =

                        profile.name.givenName || user.firstName;

                    user.lastName =

                        profile.name.familyName || user.lastName;

                    user.isEmailVerified = true;

                    await updateLogin(user, "Google");

                    return done(null, user);

                }

                // =====================================================
                // Existing Email User
                // =====================================================

                user = await User.findOne({

                    username: email

                });

                if (user) {

                    user.googleId = profile.id;

                    user.firstName =

                        profile.name.givenName || user.firstName;

                    user.lastName =

                        profile.name.familyName || user.lastName;

                    user.isEmailVerified = true;

                    user.loginType = "google";

                    await updateLogin(user, "Google");

                    return done(null, user);

                }

                // =====================================================
                // Create New User
                // =====================================================

                const newUser = new User({

                    username: email,

                    googleId: profile.id,

                    loginType: "google",

                    validation: "applied",

                    isAdmin: false,

                    societyName: "",

                    flatNumber: "",

                    phoneNumber: "",

                    firstName:

                        profile.name.givenName || "",

                    lastName:

                        profile.name.familyName || "",

                    profileImage:

                        profile.photos &&

                        profile.photos.length

                            ? profile.photos[0].value

                            : "/images/default-avatar.png",

                    isEmailVerified: true,

                    isPhoneVerified: false,

                    twoFactorEnabled: false,

                    lastLogin: new Date(),

                    loginHistory: [

                        {

                            loginTime: new Date(),

                            loginMethod: "Google",

                            status: "Success"

                        }

                    ]

                });

                await User.register(

                    newUser,

                    Math.random().toString(36)

                );

                return done(null, newUser);

            }

            catch (err) {

                console.error(

                    "Google Strategy Error:",

                    err

                );

                return done(err, null);

            }

        }

    )

);

module.exports = passport;