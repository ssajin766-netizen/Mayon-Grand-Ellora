const { User } = require("../models/userModel");

const {
    sendVerification,
    checkVerification
} = require("../services/twilioVerify");
const { sendOtpToUser } = require("../services/otpService");

// In‑memory map for one‑time WebView tokens (60 s TTL)
const crypto = require('crypto');
// ==================================================
// PRODUCTION MOBILE WEBVIEW TOKENS
// ==================================================

const MobileWebViewToken = require(
    "../models/mobileWebViewTokenModel"
);

// Token lifetime
const WEBVIEW_TOKEN_TTL_MS = 5 * 60 * 1000;

const {
    generateMobileAuthToken,
} = require("./mobileAuthController");


// ==================================================
// CREATE WEBVIEW SESSION TOKEN
// ==================================================

async function generateWebViewToken(userId) {

    const rawToken =
        crypto.randomBytes(32).toString("hex");

    const tokenHash =
        crypto
            .createHash("sha256")
            .update(rawToken)
            .digest("hex");

    const expiresAt =
        new Date(
            Date.now() +
            WEBVIEW_TOKEN_TTL_MS
        );

    await MobileWebViewToken.create({
        tokenHash,
        userId,
        expiresAt,
    });

    return rawToken;
}

exports.generateWebViewToken =
    generateWebViewToken;

/*
--------------------------------------------------
PHONE LOGIN PAGE
--------------------------------------------------
*/

exports.loginPhonePage = (req, res) => {

    res.render("loginPhone", {

        hideNavbar: true

    });

};

/*
--------------------------------------------------
SEND PHONE OTP
--------------------------------------------------
*/

exports.sendOTP = async (req, res) => {

    try {

        let phoneNumber = (req.body.phoneNumber || "").trim();

        if (!phoneNumber) {

            req.flash(
                "error",
                "Phone number is required."
            );

            return res.redirect("/loginPhone");

        }

        // Remove spaces

        phoneNumber = phoneNumber.replace(/\s+/g, "");

        // Validate E.164 format

        if (!/^\+[1-9]\d{8,14}$/.test(phoneNumber)) {

            req.flash(
                "error",
                "Please enter a valid mobile number."
            );

            return res.redirect("/loginPhone");

        }

        console.log("================================");
        console.log("PHONE :", phoneNumber);

        await sendVerification(phoneNumber);

        req.session.phoneNumber = phoneNumber;

        req.flash(
            "success",
            "OTP sent successfully."
        );

        req.session.save((err) => {

            if (err) {

                console.error(err);

                req.flash(
                    "error",
                    "Unable to create login session."
                );

                return res.redirect("/loginPhone");

            }

            return res.redirect("/verifyPhoneOtp");

        });

    }

    catch (err) {

        console.error(err);

        req.flash(

            "error",

            err.message ||

            "Unable to send OTP."

        );

        return res.redirect("/loginPhone");

    }

};

// --------------------------------------------------
// RESEND OTP (AJAX)
// --------------------------------------------------
exports.resendOTP = async (req, res) => {
    try {
        const { phoneNumber } = req.body;

        if (!phoneNumber) {
            return res.status(400).json({
                success: false,
                message: "Phone number is required"
            });
        }

        // Re-use Twilio Verify to send a fresh OTP
        await sendVerification(phoneNumber);

        return res.json({
            success: true,
            message: "OTP resent successfully"
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Unable to resend OTP"
        });
    }
};

/*
--------------------------------------------------
VERIFY OTP PAGE
--------------------------------------------------
*/

exports.verifyPhonePage = (req, res) => {

    if (!req.session.phoneNumber) {

        return res.redirect("/loginPhone");

    }

    res.render("verifyPhoneOtp", {
        hideNavbar: true,
        phoneNumber: req.session.phoneNumber
    });

};

/*
--------------------------------------------------
VERIFY PHONE OTP
--------------------------------------------------
*/

exports.verifyOTP = async (req, res) => {

    try {

        const phoneNumber = req.session.phoneNumber;

        const otp = (req.body.otp || "").trim();

        if (!phoneNumber) {

            req.flash(
                "error",
                "Session expired."
            );

            return res.redirect("/loginPhone");

        }

        if (!/^\d{4,8}$/.test(otp)) {

            req.flash(
                "error",
                "Invalid OTP."
            );

            return res.redirect("/verifyPhoneOtp");

        }

        /*
        ------------------------------------------
        VERIFY OTP FROM TWILIO
        ------------------------------------------
        */

        const result = await checkVerification(

            phoneNumber,

            otp

        );

        console.log("================================");
        console.log("VERIFY STATUS:", result.status);
        console.log("================================");

        if (result.status !== "approved") {

            req.flash(
                "error",
                "Invalid OTP."
            );

            return res.redirect("/verifyPhoneOtp");

        }



/*
------------------------------------------
FIND USER
------------------------------------------
*/

let user;

// Password Login → Phone OTP (2FA)
if (req.session.phoneLoginUser) {

    user = await User.findById(

        req.session.phoneLoginUser

    );

}

// Normal Phone Login
else {

    user = await User.findOne({

        phoneNumber

    });

}

        /*
        ------------------------------------------
        CREATE USER
        ------------------------------------------
        */

        if (!user) {

            const username =

                phoneNumber.replace("+", "") +

                "@phone.esociety";

            user = new User({

                username,

                phoneNumber,

                firstName: "",

                lastName: "",

                validation: "applied",

                societyName: "Pending",

                flatNumber: "Pending",

                isAdmin: false,

                loginType: "phone",

                isPhoneVerified: true,

                isEmailVerified: false,

                twoFactorEnabled: false,

                lastLogin: new Date(),

                lastLoginIp: req.ip,

                loginHistory: []

            });

            await User.register(

                user,

                Math.random().toString(36)

            );

        }

        /*
        ------------------------------------------
        ACCOUNT STATUS
        ------------------------------------------
        */

        if (user.validation === "rejected") {

            req.flash(

                "error",

                "Your account has been rejected."

            );

            return res.redirect("/login");

        }

        /*
        ------------------------------------------
        UPDATE LOGIN DETAILS
        ------------------------------------------
        */

        user.lastLogin = new Date();

        user.lastLoginIp = req.ip;

        user.loginType = "phone";

        user.isPhoneVerified = true;

        await user.addLoginHistory({

            loginTime: new Date(),

            loginMethod: "Phone",

            status: "Success",

            ip: req.ip,

            browser: req.headers["user-agent"],

            device: "",

            location: ""

        });

// ------------------------------------------
// SAVE USER
// ------------------------------------------

await user.save();

// ------------------------------------------
// LOGIN USER INTO EXPRESS SESSION
// ------------------------------------------

req.login(user, (err) => {

    if (err) {

        console.error("Passport login error:", err);

        req.flash(
            "error",
            "Unable to create login session."
        );

        return res.redirect("/verifyPhoneOtp");
    }

    // ------------------------------------------
    // SAVE SESSION
    // ------------------------------------------

    req.session.save((err) => {

        if (err) {

            console.error("Session save error:", err);

            req.flash(
                "error",
                "Unable to save login session."
            );

            return res.redirect("/verifyPhoneOtp");
        }

        console.log("================================");
        console.log("PHONE LOGIN SUCCESS");
        console.log("USER:", user.username);
        console.log("SESSION:", req.sessionID);
        console.log("AUTH:", req.isAuthenticated());
        console.log("================================");

        return res.redirect("/home");
    });
});

} catch (err) {

    console.error("Phone OTP verification error:", err);

    req.flash(
        "error",
        err.message || "Unable to verify OTP."
    );

    return res.redirect("/verifyPhoneOtp");
}

};
/*
==================================================
MOBILE PHONE OTP FLOW
==================================================

This flow supports BOTH:

1. Existing approved users -> Login
2. New users -> Registration details

The OTP is verified only once.
*/


// ==================================================
// TEMPORARY REGISTRATION TOKENS
// ==================================================

const mobileRegistrationTokens =
    new Map();

const mobileOtpVerificationCache =
    new Map();


//
// A new phone is verified first.
// We then issue a short-lived registration token.
//
// This is NOT a login token.
//
// It can only be used by:
// POST /api/auth/complete-phone-registration
//
// TTL: 15 minutes
//



/*
==================================================
MOBILE OTP DUPLICATE PROTECTION
==================================================

Prevents the same phone + OTP from being sent to
Twilio more than once.

This protects against:
- double tapping Verify OTP
- React Native duplicate requests
- network retry
- accidental duplicate API calls

TTL:
5 minutes
==================================================
*/




/*
==================================================
OTP VERIFICATION IN-FLIGHT REQUESTS
==================================================

If two requests arrive at exactly the same time,
the second request waits for the first Twilio
verification instead of calling Twilio again.
==================================================
*/

const mobileOtpVerificationInFlight =
    new Map();


function getMobileOtpVerificationKey(
    phoneNumber,
    otp
) {

    return `${phoneNumber}:${otp}`;

}


/*
==================================================
GET CACHED OTP VERIFICATION
==================================================
*/

function getCachedMobileOtpVerification(
    phoneNumber,
    otp
) {

    const key =
        getMobileOtpVerificationKey(
            phoneNumber,
            otp
        );


    const entry =
        mobileOtpVerificationCache.get(
            key
        );


    if (!entry) {

        return null;

    }


    if (
        Date.now() >
        entry.expiresAt
    ) {

        mobileOtpVerificationCache.delete(
            key
        );

        return null;

    }


    return entry;

}


/*
==================================================
SAVE OTP VERIFICATION RESULT
==================================================
*/

function saveMobileOtpVerification(
    phoneNumber,
    otp,
    response
) {

    const key =
        getMobileOtpVerificationKey(
            phoneNumber,
            otp
        );


    const expiresAt =
        Date.now() +
        5 * 60 * 1000;


    mobileOtpVerificationCache.set(

        key,

        {

            response,

            expiresAt,

        }

    );


    /*
    ----------------------------------------------
    AUTOMATIC CLEANUP
    ----------------------------------------------
    */

    setTimeout(

        () => {

            const current =
                mobileOtpVerificationCache.get(
                    key
                );


            if (
                current &&
                current.expiresAt <=
                    Date.now()
            ) {

                mobileOtpVerificationCache.delete(
                    key
                );

            }

        },

        5 * 60 * 1000

    );

}


function generateRegistrationToken(
    phoneNumber
) {

    const token =
        crypto.randomBytes(32).toString('hex');

    const expiresAt =
        Date.now() +
        15 * 60 * 1000;

    mobileRegistrationTokens.set(
        token,
        {
            phoneNumber,
            expiresAt,
        }
    );

    setTimeout(
        () => {
            mobileRegistrationTokens.delete(
                token
            );
        },
        15 * 60 * 1000
    );

    return token;
}


function validateRegistrationToken(
    token
) {

    if (!token) {
        return null;
    }

    const entry =
        mobileRegistrationTokens.get(
            token
        );

    if (!entry) {
        return null;
    }

    if (
        Date.now() >
        entry.expiresAt
    ) {

        mobileRegistrationTokens.delete(
            token
        );

        return null;
    }

    return entry;
}


/*
==================================================
NORMALIZE PHONE
==================================================
*/

function normalizeMobilePhone(
    phoneNumber
) {

    let phone =
        (phoneNumber || '')
            .trim()
            .replace(/\s+/g, '');

    /*
    ----------------------------------------------
    Indian 10 digit number
    ----------------------------------------------
    */

    if (
        /^[6-9]\d{9}$/.test(phone)
    ) {

        phone =
            '+91' +
            phone;

    }

    /*
    ----------------------------------------------
    91XXXXXXXXXX
    ----------------------------------------------
    */

    else if (
        /^91[6-9]\d{9}$/.test(phone)
    ) {

        phone =
            '+' +
            phone;

    }

    return phone;
}


/*
==================================================
SEND PHONE OTP
==================================================

Existing approved user:
    send OTP

New user:
    send OTP

Pending/rejected user:
    do NOT send login OTP
==================================================
*/

exports.sendOtpApi =
    async (req, res) => {

        try {

            const phoneNumber =
                normalizeMobilePhone(
                    req.body.phoneNumber
                );


            if (!phoneNumber) {

                return res.status(400).json({

                    success: false,

                    message:
                        'Phone number is required.'

                });

            }


            /*
            --------------------------------------
            VALIDATE PHONE
            --------------------------------------
            */

            if (
                !/^\+[1-9]\d{8,14}$/.test(
                    phoneNumber
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        'Please enter a valid phone number.'

                });

            }


            /*
            --------------------------------------
            FIND USER
            --------------------------------------
            */

            const user =
                await User.findOne({
                    phoneNumber
                });


            /*
            --------------------------------------
            NEW USER
            --------------------------------------
            */

            if (!user) {

                console.log(
                    'New mobile registration OTP:',
                    phoneNumber
                );


                await sendVerification(
                    phoneNumber
                );


                return res.json({

                    success: true,

                    registration: true,

                    message:
                        'OTP sent successfully.'

                });

            }


            /*
            --------------------------------------
            REJECTED USER
            --------------------------------------
            */

            if (
                user.validation ===
                'rejected'
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        'Your account has been rejected. Please contact the society administrator.'

                });

            }


            /*
            --------------------------------------
            PENDING USER
            --------------------------------------
            */

            if (
                user.validation !==
                'approved'
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        'Your account is waiting for administrator approval.'

                });

            }


            /*
            --------------------------------------
            EXISTING APPROVED USER
            --------------------------------------
            */

            await sendOtpToUser(
                user
            );


            return res.json({

                success: true,

                registration: false,

                message:
                    'OTP sent successfully.'

            });

        }

        catch (err) {

            console.error(
                'SEND PHONE OTP ERROR:',
                err
            );


            return res.status(500).json({

                success: false,

                message:
                    err.message ||
                    'Unable to send OTP.'

            });

        }

    };


/*
==================================================
RESEND PHONE OTP
==================================================
*/

exports.resendOtpApi =
    async (req, res) => {

        try {

            const phoneNumber =
                normalizeMobilePhone(
                    req.body.phoneNumber
                );


            if (!phoneNumber) {

                return res.status(400).json({

                    success: false,

                    message:
                        'Phone number is required.'

                });

            }


            if (
                !/^\+[1-9]\d{8,14}$/.test(
                    phoneNumber
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        'Invalid phone number.'

                });

            }


            const user =
                await User.findOne({
                    phoneNumber
                });


            /*
            --------------------------------------
            NEW USER
            --------------------------------------
            */

            if (!user) {

                await sendVerification(
                    phoneNumber
                );


                return res.json({

                    success: true,

                    registration: true,

                    message:
                        'OTP resent successfully.'

                });

            }


            /*
            --------------------------------------
            REJECTED
            --------------------------------------
            */

            if (
                user.validation ===
                'rejected'
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        'Your account has been rejected. Please contact the society administrator.'

                });

            }


            /*
            --------------------------------------
            PENDING
            --------------------------------------
            */

            if (
                user.validation !==
                'approved'
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        'Your account is waiting for administrator approval.'

                });

            }


            /*
            --------------------------------------
            EXISTING APPROVED USER
            --------------------------------------
            */

            await sendOtpToUser(
                user
            );


            return res.json({

                success: true,

                registration: false,

                message:
                    'OTP resent successfully.'

            });

        }

        catch (err) {

            console.error(
                'RESEND PHONE OTP ERROR:',
                err
            );


            return res.status(500).json({

                success: false,

                message:
                    err.message ||
                    'Unable to resend OTP.'

            });

        }

    };


/*
==================================================
VERIFY PHONE OTP
==================================================

Existing approved user:
    return WebView token

New user:
    return registration token
==================================================
*/

exports.verifyOtpApi =
    async (req, res) => {

        try {

            const phoneNumber =
                normalizeMobilePhone(
                    req.body.phoneNumber
                );

            const otp =
                String(
                    req.body.otp || ''
                ).trim();


            if (
                !phoneNumber ||
                !otp
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        'Phone number and OTP are required.'

                });

            }


            if (
                !/^\+[1-9]\d{8,14}$/.test(
                    phoneNumber
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        'Invalid phone number.'

                });

            }


           /*
==================================================
VERIFY TWILIO OTP
==================================================
*/


/*
--------------------------------------------------
1. CHECK FOR ALREADY VERIFIED OTP
--------------------------------------------------
*/

const cachedVerification =
    getCachedMobileOtpVerification(
        phoneNumber,
        otp
    );


if (
    cachedVerification
) {

    console.log(
        '================================'
    );

    console.log(
        'DUPLICATE OTP VERIFICATION'
    );

    console.log(
        'Phone:',
        phoneNumber
    );

    console.log(
        'OTP already verified'
    );

    console.log(
        'Returning cached response'
    );

    console.log(
        '================================'
    );


    return res.json(
        cachedVerification.response
    );

}


/*
--------------------------------------------------
2. CREATE UNIQUE REQUEST KEY
--------------------------------------------------
*/

const verificationKey =
    getMobileOtpVerificationKey(
        phoneNumber,
        otp
    );


/*
--------------------------------------------------
3. CHECK IF SAME VERIFICATION IS ALREADY RUNNING
--------------------------------------------------
*/

const existingVerification =
    mobileOtpVerificationInFlight.get(
        verificationKey
    );


if (
    existingVerification
) {

    console.log(
        '================================'
    );

    console.log(
        'DUPLICATE OTP REQUEST'
    );

    console.log(
        'Verification already in progress'
    );

    console.log(
        'Waiting for first request'
    );

    console.log(
        '================================'
    );


    const result =
        await existingVerification;


    if (
        result.status !==
        'approved'
    ) {

        return res.status(401).json({

            success: false,

            message:
                'Invalid or expired OTP.'

        });

    }

}


/*
--------------------------------------------------
4. FIRST VERIFICATION REQUEST
--------------------------------------------------
*/

let result;


/*
--------------------------------------------------
Create shared Twilio promise
--------------------------------------------------
*/

if (
    !mobileOtpVerificationInFlight.has(
        verificationKey
    )
) {

    const verificationPromise =
        checkVerification(
            phoneNumber,
            otp
        );


    mobileOtpVerificationInFlight.set(

        verificationKey,

        verificationPromise

    );


    try {

        result =
            await verificationPromise;

    }

    finally {

        mobileOtpVerificationInFlight.delete(
            verificationKey
        );

    }

}

else {

    result =
        await mobileOtpVerificationInFlight.get(
            verificationKey
        );

}


            if (
                result.status !==
                'approved'
            ) {

                return res.status(401).json({

                    success: false,

                    message:
                        'Invalid or expired OTP.'

                });

            }


            /*
            --------------------------------------
            FIND USER
            --------------------------------------
            */

            const user =
                await User.findOne({
                    phoneNumber
                });

/*
==================================================
NEW USER
==================================================
*/

if (!user) {

    /*
    ----------------------------------------------
    CREATE REGISTRATION TOKEN
    ----------------------------------------------
    */

    const registrationToken =
        generateRegistrationToken(
            phoneNumber
        );


    /*
    ----------------------------------------------
    CREATE RESPONSE
    ----------------------------------------------
    */

    const response = {

        success: true,

        registrationRequired:
            true,

        registrationToken,

        phoneNumber,

        message:
            'Phone verified. Please complete your registration.'

    };


    /*
    ----------------------------------------------
    CACHE SUCCESSFUL VERIFICATION
    ----------------------------------------------
    */

    saveMobileOtpVerification(

        phoneNumber,

        otp,

        response

    );


    /*
    ----------------------------------------------
    RETURN RESPONSE
    ----------------------------------------------
    */

    return res.json(
        response
    );

}


            /*
            ======================================
            REJECTED
            ======================================
            */

            if (
                user.validation ===
                'rejected'
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        'Your account has been rejected. Please contact the society administrator.'

                });

            }


            /*
            ======================================
            PENDING APPROVAL
            ======================================
            */

            if (
                user.validation !==
                'approved'
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        'Your account is waiting for administrator approval.'

                });

            }


            /*
            ======================================
            EXISTING APPROVED USER
            ======================================
            */

            user.lastLogin =
                new Date();

            user.lastLoginIp =
                req.ip;

            user.loginType =
                'phone';

            user.isPhoneVerified =
                true;


            user.addLoginHistory({

                loginTime:
                    new Date(),

                loginMethod:
                    'Phone',

                status:
                    'Success',

                ip:
                    req.ip,

                browser:
                    req.headers[
                        'user-agent'
                    ] || '',

                device:
                    'Mobile App',

                location:
                    ''

            });


            await user.save();


            /*
            --------------------------------------
            GENERATE WEBVIEW TOKEN
            --------------------------------------
            */

            const token =
                 await generateWebViewToken(
                     user._id.toString()
                 );

            const mobileAuthToken =
                  await generateMobileAuthToken(
                     user._id.toString()
               );


            /*
==================================================
EXISTING APPROVED USER RESPONSE
==================================================
*/

const response = {

    success: true,

    registrationRequired:
        false,

    message:
        'Verification successful.',

    token,

    mobileAuthToken,

    user: {

        id:
            user._id,

        username:
            user.username,

        firstName:
            user.firstName,

        lastName:
            user.lastName,

        phoneNumber:
            user.phoneNumber,

        societyName:
            user.societyName,

        flatNumber:
            user.flatNumber,

        validation:
            user.validation,

        isAdmin:
            user.isAdmin

    }

};


/*
--------------------------------------------------
CACHE SUCCESSFUL LOGIN
--------------------------------------------------
*/

saveMobileOtpVerification(

    phoneNumber,

    otp,

    response

);


/*
--------------------------------------------------
RETURN RESPONSE
--------------------------------------------------
*/

return res.json(
    response
);

        }

        catch (err) {

            console.error(
                'VERIFY PHONE OTP ERROR:',
                err
            );


            return res.status(500).json({

                success: false,

                message:
                    err.message ||
                    'Unable to verify OTP.'

            });

        }

    };


/*
==================================================
COMPLETE NEW USER REGISTRATION
==================================================

Called only AFTER phone OTP has been
successfully verified.

Registration fields:

- First Name
- Last Name
- Email
- Society Name
- Flat Number

Phone number comes ONLY from the verified
registration token.
==================================================
*/

exports.completePhoneRegistration =
    async (req, res) => {

        try {

            const {
                registrationToken,
                firstName,
                lastName,
                email,
                societyName,
                flatNumber
            } = req.body;


            /*
            ==========================================
            VALIDATE REGISTRATION TOKEN
            ==========================================
            */

            const registration =
                validateRegistrationToken(
                    registrationToken
                );


            if (!registration) {

                return res.status(401).json({

                    success: false,

                    message:
                        'Registration session expired. Please verify your phone again.'

                });

            }


            /*
            ==========================================
            PHONE FROM VERIFIED TOKEN
            ==========================================

            DO NOT trust phoneNumber from the app.
            */

            const phoneNumber =
                registration.phoneNumber;


            /*
            ==========================================
            CLEAN INPUT
            ==========================================
            */

            const cleanFirstName =
                (firstName || '').trim();

            const cleanLastName =
                (lastName || '').trim();

            const cleanEmail =
                (email || '')
                    .trim()
                    .toLowerCase();

            const cleanSocietyName =
                (societyName || '').trim();

            const cleanFlatNumber =
                (flatNumber || '').trim();


            /*
            ==========================================
            REQUIRED FIELD VALIDATION
            ==========================================
            */

            if (!cleanFirstName) {

                return res.status(400).json({

                    success: false,

                    message:
                        'First name is required.'

                });

            }


            if (!cleanLastName) {

                return res.status(400).json({

                    success: false,

                    message:
                        'Last name is required.'

                });

            }


            if (!cleanEmail) {

                return res.status(400).json({

                    success: false,

                    message:
                        'Email address is required.'

                });

            }


            /*
            ==========================================
            EMAIL VALIDATION
            ==========================================
            */

            const emailRegex =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


            if (
                !emailRegex.test(
                    cleanEmail
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        'Please enter a valid email address.'

                });

            }


            if (!cleanSocietyName) {

                return res.status(400).json({

                    success: false,

                    message:
                        'Society name is required.'

                });

            }


            if (!cleanFlatNumber) {

                return res.status(400).json({

                    success: false,

                    message:
                        'Flat number is required.'

                });

            }


            /*
            ==========================================
            CHECK SOCIETY
            ==========================================
            */

            const Society =
                require('../models/societyModel')
                    .Society;


            const society =
                await Society.findOne({

                    societyName:
                        cleanSocietyName

                });


            if (!society) {

                return res.status(404).json({

                    success: false,

                    message:
                        'Society is not registered. Please check the society name.'

                });

            }


            /*
            ==========================================
            CHECK PHONE AGAIN
            ==========================================
            */

            const existingPhoneUser =
                await User.findOne({

                    phoneNumber

                });


            if (existingPhoneUser) {

                return res.status(409).json({

                    success: false,

                    message:
                        'This phone number is already registered.'

                });

            }


            /*
            ==========================================
            CHECK EMAIL / USERNAME
            ==========================================

            Your existing application uses
            Passport Local Mongoose username
            as the email address.

            Therefore email is stored as username.
            */

            const existingEmailUser =
                await User.findOne({

                    username:
                        cleanEmail

                });


            if (existingEmailUser) {

                return res.status(409).json({

                    success: false,

                    message:
                        'This email address is already registered.'

                });

            }


            /*
            ==========================================
            GENERATE MOBILE USERNAME
            ==========================================

            IMPORTANT:

            The current phone-login implementation
            uses:

                919xxxxxxxxxx@phone.esociety

            as the username.

            However, because registration now collects
            email, we use the EMAIL as username.

            Phone remains the OTP login identity.
            */

            const username =
                cleanEmail;


            /*
            ==========================================
            CREATE RANDOM PASSWORD
            ==========================================

            Phone OTP is the authentication method.

            Passport Local Mongoose still needs a
            password hash when creating the User.
            */

            const temporaryPassword =
                crypto
                    .randomBytes(32)
                    .toString('hex');


            /*
            ==========================================
            CREATE USER
            ==========================================
            */

            const user =
                await User.register(

                    {

                        username,

                        phoneNumber,

                        firstName:
                            cleanFirstName,

                        lastName:
                            cleanLastName,

                        societyName:
                            cleanSocietyName,

                        flatNumber:
                            cleanFlatNumber,

                        validation:
                            'applied',

                        isAdmin:
                            false,

                        loginType:
                            'phone',

                        isPhoneVerified:
                            true,

                        isEmailVerified:
                            false,

                        twoFactorEnabled:
                            false,

                        lastLogin:
                            null,

                        lastLoginIp:
                            ''

                    },

                    temporaryPassword

                );


            /*
            ==========================================
            CONSUME REGISTRATION TOKEN
            ==========================================
            */

            mobileRegistrationTokens.delete(
                registrationToken
            );


            /*
            ==========================================
            SUCCESS RESPONSE
            ==========================================
            */

            return res.status(201).json({

                success: true,

                approved: false,

                message:
                    'Registration successful. Your account is waiting for administrator approval.',

                user: {

                    id:
                        user._id,

                    username:
                        user.username,

                    email:
                        user.username,

                    firstName:
                        user.firstName,

                    lastName:
                        user.lastName,

                    phoneNumber:
                        user.phoneNumber,

                    societyName:
                        user.societyName,

                    flatNumber:
                        user.flatNumber,

                    validation:
                        user.validation,

                    isAdmin:
                        user.isAdmin

                }

            });

        }

        catch (err) {

            console.error(
                'COMPLETE PHONE REGISTRATION ERROR:',
                err
            );


            /*
            ==========================================
            DUPLICATE KEY
            ==========================================
            */

            if (
                err.code === 11000
            ) {

                return res.status(409).json({

                    success: false,

                    message:
                        'An account with this email or phone number already exists.'

                });

            }


            return res.status(500).json({

                success: false,

                message:
                    err.message ||
                    'Unable to complete registration.'

            });

        }

    };
