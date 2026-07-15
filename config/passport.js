const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const { User } = require("../models/userModel");

// Debug (Remove after testing)
console.log("createStrategy:", typeof User.createStrategy);
console.log("authenticate:", typeof User.authenticate);

/*
--------------------------------------------------
LOCAL STRATEGY
--------------------------------------------------
*/

passport.use(User.createStrategy());

/*
--------------------------------------------------
SESSION
--------------------------------------------------
*/

passport.serializeUser(User.serializeUser());

passport.deserializeUser(User.deserializeUser());

/*
--------------------------------------------------
GOOGLE STRATEGY
--------------------------------------------------
*/

passport.use(

    new GoogleStrategy(

        {

            clientID: process.env.GOOGLE_CLIENT_ID,

            clientSecret: process.env.GOOGLE_CLIENT_SECRET,

            callbackURL: process.env.GOOGLE_CALLBACK_URL

        },

        async (accessToken, refreshToken, profile, done) => {

            try {

                const email = profile.emails[0].value.toLowerCase();

                /*
                -----------------------------------------
                Existing Google User
                -----------------------------------------
                */

                let user = await User.findOne({

                    googleId: profile.id

                });

                if (user) {

                    user.lastLogin = new Date();

                    user.loginType = "google";

                    user.loginHistory.push({

                        loginTime: new Date(),

                        loginMethod: "Google",

                        status: "Success"

                    });

                    if (user.loginHistory.length > 20) {
                        user.loginHistory.shift();
                    }

                    await user.save();

                    return done(null, user);

                }

                /*
                -----------------------------------------
                Existing Email User
                -----------------------------------------
                */

                user = await User.findOne({

                    username: email

                });

                if (user) {

                    user.googleId = profile.id;

                    user.loginType = "google";

                    user.isEmailVerified = true;

                    user.lastLogin = new Date();

                    user.loginHistory.push({

                        loginTime: new Date(),

                        loginMethod: "Google",

                        status: "Success"

                    });

                    if (user.loginHistory.length > 20) {
                        user.loginHistory.shift();
                    }

                    await user.save();

                    return done(null, user);

                }

                /*
                -----------------------------------------
                Create New Google User
                -----------------------------------------
                */

                const newUser = new User({

                    username: email,

                    googleId: profile.id,

                    loginType: "google",

                    firstName: profile.name.givenName || "",

                    lastName: profile.name.familyName || "",

                    validation: "applied",

                    isAdmin: false,

                    societyName: "Pending",

                    flatNumber: "Pending",

                    phoneNumber: "",

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

                console.error(err);

                return done(err, null);

            }

        }

    )

);

module.exports = passport;