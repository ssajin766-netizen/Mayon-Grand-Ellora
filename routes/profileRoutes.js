const express = require("express");
const router = express.Router();

const path = require("path");
const fs = require("fs");
const sharp = require("sharp");

const upload = require("../middleware/uploadProfile");

const { User } = require("../models/userModel");
const { Society } = require("../models/societyModel");
const Notification = require("../models/notificationModel");

const {
    isLoggedIn,
    isApproved
} = require("../middleware/auth");
/*
--------------------------------------------------
PROFILE
--------------------------------------------------
*/

router.get(
    "/profile",
    isLoggedIn,
    isApproved,
    async (req, res) => {
        try {

            const resident = await User.findById(req.user.id).lean();

            if (!resident) {
                return res.status(404).render("failure", {
                    message: "User not found",
                    href: "/login"
                });
            }

            const society = await Society.findOne({
                societyName: resident.societyName
            }).lean();

            if (!society) {
                return res.status(404).render("failure", {
                    message: "Society not found",
                    href: "/home"
                });
            }

            // Dashboard Counts

           const noticeCount =
             Array.isArray(society.noticeBoard)
             ? society.noticeBoard.length
            : 0;

            const visitorCount =
               Array.isArray(society.visitors)
               ? society.visitors.length
               : 0;

            // Render

            res.render("profile", {
              resident,
              society,
              noticeCount,
              visitorCount,
              success: req.flash("success"),
              error: req.flash("error")
         });

        } catch (err) {

            console.error("PROFILE ERROR:", err);

            res.status(500).render("failure", {
                message: "Unable to load profile.",
                href: "/home"
            });

        }
    }
);

/*
==================================================
UPLOAD PROFILE IMAGE
==================================================
*/

router.post(
    "/profile/upload",
    isLoggedIn,
    upload.single("profileImage"),
    async (req, res) => {

        try {

            if (!req.file) {

                req.flash(
                    "error",
                    "Please select an image."
                );

                return res.redirect("/profile");

            }

            const user = await User.findById(req.user.id);

            if (!user) {

                // Remove uploaded temp file
                if (fs.existsSync(req.file.path)) {

                    fs.unlinkSync(req.file.path);

                }

                req.flash(
                    "error",
                    "User not found."
                );

                return res.redirect("/profile");

            }

            /*
            ==========================================
            STORE OLD IMAGE
            ==========================================
            */

            const oldProfileImage = user.profileImage;

            /*
            ==========================================
            RESIZE & COMPRESS IMAGE
            ==========================================
            */

            const newFileName =
                Date.now() + ".webp";

            const outputPath = path.join(
                __dirname,
                "../public/uploads/profiles",
                newFileName
            );

            await sharp(req.file.path)

                .resize(512, 512, {

                    fit: "cover"

                })

                .webp({

                    quality: 85

                })

                .toFile(outputPath);

            /*
            ==========================================
            DELETE TEMP MULTER FILE
            ==========================================
            */

            if (fs.existsSync(req.file.path)) {

                fs.unlinkSync(req.file.path);

            }

/*
==========================================
UPDATE DATABASE
==========================================
*/

await User.updateOne(

    {

        _id: req.user._id

    },

    {

        $set: {

            profileImage:

                "/uploads/profiles/" +

                newFileName

        }

    }

);

/*
==========================================
UPDATE LOCAL OBJECT
==========================================
*/

user.profileImage =
    "/uploads/profiles/" +
    newFileName;

            /*
            ==========================================
            DELETE OLD PROFILE IMAGE
            ==========================================
            */

            if (

                oldProfileImage &&

                oldProfileImage !== "/images/default-avatar.png"

            ) {

                const oldImagePath = path.join(

                    __dirname,

                    "../public",

                    oldProfileImage

                );

                if (fs.existsSync(oldImagePath)) {

                    fs.unlinkSync(oldImagePath);

                }

            }

            /*
            ==========================================
            SUCCESS
            ==========================================
            */

            req.flash(

                "success",

                "Profile picture updated successfully."

            );

            return res.redirect("/profile");

        }

        catch (err) {

            console.error(err);

            // Remove temporary upload if it still exists
            if (

                req.file &&

                fs.existsSync(req.file.path)

            ) {

                fs.unlinkSync(req.file.path);

            }

            req.flash(

                "error",

                err.message ||

                "Unable to upload profile image."

            );

            return res.redirect("/profile");

        }

    }

);


/*
--------------------------------------------------
EDIT PROFILE PAGE
--------------------------------------------------
*/

router.get(
    "/editProfile",
    isLoggedIn,
    isApproved,
    async (req, res) => {

        try {

            // ==========================================
            // Fetch Logged-in User
            // ==========================================

            const resident = await User.findById(req.user.id);

            if (!resident) {

                return res.status(404).render("failure", {

                    message: "Resident account not found.",

                    href: "/login",

                    buttonSecondary: "Login Again"

                });

            }

            // ==========================================
            // Fetch Society Details
            // ==========================================

            const society = await Society.findOne({

                societyName: resident.societyName

            });

            if (!society) {

                return res.status(404).render("failure", {

                    message: "Society information not found.",

                    href: "/home",

                    buttonSecondary: "Go Home"

                });

            }

            // ==========================================
            // Render Edit Profile
            // ==========================================

            res.render("editProfile", {

                title: "Edit Profile",

                resident,

                society,

                success: req.flash ? req.flash("success") : [],

                error: req.flash ? req.flash("error") : []

            });

        }

        catch (err) {

            console.error("EDIT PROFILE ERROR");

            console.error(err);

            return res.status(500).render("failure", {

                message: "Something went wrong while loading your profile.",

                href: "/profile",

                buttonSecondary: "Back to Profile"

            });

        }

    }

);

/*
--------------------------------------------------
CHANGE PASSWORD PAGE
--------------------------------------------------
*/

router.get(
    "/changePassword",
    isLoggedIn,
    isApproved,
    (req, res) => {

        res.render("changePassword");

    }
);

/*
--------------------------------------------------
LOGIN HISTORY PAGE
--------------------------------------------------
*/

router.get(
    "/loginHistory",
    isLoggedIn,
    isApproved,
    async (req, res) => {

        try {

            const resident = await User.findById(req.user.id).lean();

            if (!resident) {

                return res.status(404).render("failure", {

                    message: "User not found.",

                    href: "/profile"

                });

            }

            res.render("loginHistory", {

                resident,

                success: req.flash("success"),

                error: req.flash("error")

            });

        }

        catch (err) {

            console.error("LOGIN HISTORY ERROR:", err);

            res.status(500).render("failure", {

                message: "Unable to load login history.",

                href: "/profile"

            });

        }

    }
);

/*
--------------------------------------------------
SECURITY PAGE
--------------------------------------------------
*/

router.get(
    "/security",
    isLoggedIn,
    isApproved,
    async (req,res)=>{

        try{

            const resident = await User.findById(req.user.id).lean();

            resident.loginHistory = resident.loginHistory || [];

            res.render("security", {
            resident,
            success: req.flash("success"),
            error: req.flash("error")
       });

        }

        catch(err){

            console.error(err);

            res.redirect("/profile");

        }

    }
);


/*
--------------------------------------------------
UPDATE PROFILE
--------------------------------------------------
*/

router.post(
    "/editProfile",
    isLoggedIn,
    isApproved,
    async (req, res) => {

        try {

            const updateData = {

                firstName: req.body.firstName?.trim(),

                lastName: req.body.lastName?.trim(),

                phoneNumber: req.body.phoneNumber?.trim(),

                flatNumber: req.body.flatNumber?.trim(),

                loginType: req.body.loginType || "password",

                twoFactorEnabled:
                    req.body.twoFactorEnabled === "on"

            };

            // Optional verification fields

            if (req.body.isEmailVerified !== undefined) {

                updateData.isEmailVerified =
                    req.body.isEmailVerified === "true";

            }

            if (req.body.isPhoneVerified !== undefined) {

                updateData.isPhoneVerified =
                    req.body.isPhoneVerified === "true";

            }

            const resident = await User.findByIdAndUpdate(

                req.user.id,

                {
                    $set: updateData
                },

                {
                    new: true,
                    runValidators: true
                }

            );

            if (!resident) {

                return res.status(404).render("failure", {

                    message: "Resident not found.",

                    href: "/home"

                });

            }

            /*
            ======================================
            Update Society (Admin Only)
            ======================================
            */

            if (

                req.user.isAdmin &&

                req.body.address

            ) {

                await Society.findOneAndUpdate(

                    {

                        admin: req.user.username

                    },

                    {

                        $set: {

                            "societyAddress.address":
                                req.body.address,

                            "societyAddress.city":
                                req.body.city,

                            "societyAddress.district":
                                req.body.district,

                            "societyAddress.postalCode":
                                req.body.postalCode

                        }

                    },

                    {

                        runValidators: true

                    }

                );

            }

            req.flash(

                "success",

                "Profile updated successfully."

            );

            res.redirect("/profile");

        }

        catch (err) {

            console.error(

                "PROFILE UPDATE ERROR",

                err

            );

            res.status(500).render("failure", {

                message: "Unable to update profile.",

                href: "/editProfile"

            });

        }

    }

);

/*
--------------------------------------------------
UPDATE PASSWORD
--------------------------------------------------
*/

router.post(
    "/changePassword",
    isLoggedIn,
    async (req, res) => {

        try {

            const {

                currentPassword,

                newPassword,

                confirmPassword

            } = req.body;

            if (newPassword !== confirmPassword) {

                req.flash("error", "Passwords do not match.");

                return res.redirect("/changePassword");

            }

            const user = await User.findById(req.user.id);

            await user.changePassword(

                currentPassword,

                newPassword

            );

            await user.save();

            req.flash(

                "success",

                "Password updated successfully."

            );

            res.redirect("/security");

        }

        catch (err) {

            console.error(err);

            req.flash(

                "error",

                "Current password is incorrect."

            );

            res.redirect("/changePassword");

        }

    }
);

/*
--------------------------------------------------
CLEAR LOGIN HISTORY
--------------------------------------------------
*/

router.post(
    "/clearLoginHistory",
    isLoggedIn,
    async(req,res)=>{

        try{

            await User.findByIdAndUpdate(

                req.user.id,

                {

                    loginHistory:[]

                }

            );

            req.flash(

                "success",

                "Login history cleared."

            );

            res.redirect("/loginHistory");

        }

        catch(err){

            console.error(err);

            req.flash(

                "error",

                "Unable to clear login history."

            );

            res.redirect("/loginHistory");

        }

    }
);

/*
--------------------------------------------------
UPDATE TWO FACTOR SETTINGS
--------------------------------------------------
*/

router.post(
    "/security/two-factor",
    isLoggedIn,
    async (req, res) => {

        try {

            const method = req.body.twoFactorMethod;

            let update = {};

            if (method === "disabled") {

                update = {

                    twoFactorEnabled: false,

                    twoFactorMethod: "email"

                };

            }

            else if (method === "email") {

                update = {

                    twoFactorEnabled: true,

                    twoFactorMethod: "email"

                };

            }

            else if (method === "phone") {

                update = {

                    twoFactorEnabled: true,

                    twoFactorMethod: "phone"

                };

            }

            else {

                req.flash(
                    "error",
                    "Invalid verification method."
                );

                return res.redirect("/security");

            }

            await User.findByIdAndUpdate(

                req.user.id,

                {

                    $set: update

                }

            );

            req.flash(

                "success",

                "Two-Step Verification updated successfully."

            );

            return res.redirect("/security");

        }

        catch (err) {

            console.error(err);

            req.flash(

                "error",

                "Unable to update security settings."

            );

            return res.redirect("/security");

        }

    }

);

/*
--------------------------------------------------
LOGOUT FROM ALL DEVICES
--------------------------------------------------
*/

router.post(
    "/logoutAll",
    isLoggedIn,
    (req,res)=>{

        req.logout((err)=>{

            if(err){

                return res.redirect("/security");

            }

            req.session.destroy(()=>{

                res.clearCookie("connect.sid");

                res.redirect("/login");

            });

        });

    }
);

/*
--------------------------------------------------
DELETE ACCOUNT
--------------------------------------------------
*/

router.post(
    "/delete-account",
    isLoggedIn,
    async (req, res, next) => {

        try {

            const user = await User.findById(req.user._id);

            if (!user) {

                req.flash(
                    "error",
                    "User not found."
                );

                return res.redirect("/profile");

            }

            /*
            ==========================================
            Prevent Society Admin Deletion
            ==========================================
            */

            const society = await Society.findOne({

                admin: user.username

            });

            if (society) {

                req.flash(
                    "error",
                    "You are the Society Administrator. Transfer ownership or delete the society before deleting your account."
                );

                return res.redirect("/profile");

            }

            /*
            ==========================================
            Delete Profile Image
            ==========================================
            */

            if (

                user.profileImage &&

                user.profileImage !== "/images/default-avatar.png"

            ) {

                const imagePath = path.join(

                    __dirname,

                    "../public",

                    user.profileImage

                );

                if (fs.existsSync(imagePath)) {

                    fs.unlinkSync(imagePath);

                }

            }

            /*
            ==========================================
            Delete Notifications
            ==========================================
            */

            await Notification.deleteMany({

                user: user._id

            });

            /*
            ==========================================
            Delete User
            ==========================================
            */

            await User.findByIdAndDelete(user._id);

            /*
            ==========================================
            Logout
            ==========================================
            */

            req.logout((err) => {

                if (err) {

                    return next(err);

                }

                req.session.destroy(() => {

                    res.clearCookie("connect.sid");

                    return res.redirect("/login?deleted=1");

                });

            });

        }

        catch (err) {

            console.error("DELETE ACCOUNT ERROR:", err);

            req.flash(

                "error",

                "Unable to delete account."

            );

            return res.redirect("/profile");

        }

    }
);

/*
--------------------------------------------------
DELETE SOCIETY
--------------------------------------------------
*/

router.post(
    "/delete-society",
    isLoggedIn,
    async (req, res, next) => {

        try {

            const admin = await User.findById(req.user._id);

            if (!admin) {

                req.flash(
                    "error",
                    "Administrator not found."
                );

                return res.redirect("/profile");

            }

            if (!admin.isAdmin) {

                req.flash(
                    "error",
                    "Only administrators can delete a society."
                );

                return res.redirect("/profile");

            }

            /*
            ==========================================
            Get All Society Users
            ==========================================
            */

            const users = await User.find({

                societyName: admin.societyName

            });

            /*
            ==========================================
            Delete Profile Images
            ==========================================
            */

            for (const user of users) {

                if (

                    user.profileImage &&

                    user.profileImage !== "/images/default-avatar.png"

                ) {

                    const imagePath = path.join(

                        __dirname,

                        "../public",

                        user.profileImage

                    );

                    if (fs.existsSync(imagePath)) {

                        fs.unlinkSync(imagePath);

                    }

                }

            }

            /*
            ==========================================
            Delete Notifications
            ==========================================
            */

            const userIds = users.map(user => user._id);

            await Notification.deleteMany({

                user: {

                    $in: userIds

                }

            });

            /*
            ==========================================
            Delete Users
            ==========================================
            */

            await User.deleteMany({

                societyName: admin.societyName

            });

            /*
            ==========================================
            Delete Society
            ==========================================
            */

            await Society.deleteOne({

                societyName: admin.societyName

            });

            /*
            ==========================================
            Logout
            ==========================================
            */

            req.logout((err) => {

                if (err) {

                    return next(err);

                }

                req.session.destroy(() => {

                    res.clearCookie("connect.sid");

                    return res.redirect("/login?societyDeleted=1");

                });

            });

        }

        catch (err) {

            console.error(err);

            req.flash(

                "error",

                "Unable to delete society."

            );

            return res.redirect("/profile");

        }

    }
);

module.exports = router;