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

passport.serializeUser((user, done) => {

    done(null, user.id);

});

passport.deserializeUser(async (id, done) => {

    try {

        const user = await User.findById(id);

        done(null, user);

    } catch (err) {

        done(err);

    }

});

// --------------------------------------------------
// Google OAuth Strategy
// --------------------------------------------------

passport.use(

    new GoogleStrategy(

        {

            clientID: process.env.GOOGLE_CLIENT_ID,

            clientSecret: process.env.GOOGLE_CLIENT_SECRET,

            callbackURL: process.env.GOOGLE_CALLBACK_URL

        },

        async (accessToken, refreshToken, profile, done) => {

            try {

                const email = profile.emails[0].value;

                let user = await User.findOne({

                    googleId: profile.id

                });

                // Existing Google User
                if (user) {

                    return done(null, user);

                }

                // Existing Email User
                user = await User.findOne({

                    username: email

                });

                if (user) {

                    user.googleId = profile.id;

                    user.isEmailVerified = true;

                    user.lastLogin = new Date();

                    user.loginHistory.push({

                        loginTime: new Date(),

                        loginMethod: "Google",

                        status: "Success"

                    });

                    await user.save();

                    return done(null, user);

                }

                // New Google User
                user = new User({

                    username: email,

                    googleId: profile.id,

                    firstName: profile.name.givenName || "",

                    lastName: profile.name.familyName || "",

                    validation: "applied",

                    isAdmin: false,

                    societyName: "Pending",

                    flatNumber: "Pending",

                    phoneNumber: 0,

                    isEmailVerified: true,

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

                    user,

                    Math.random().toString(36)

                );

                return done(null, user);

            }

            catch (err) {

                console.log(err);

                return done(err, null);

            }

        }

    )

);

module.exports = passport;