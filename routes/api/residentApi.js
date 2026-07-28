const express = require("express");
const router = express.Router();

const sendMail = require("../../services/sendMail");
const sendWhatsApp = require("../../services/whatsappService");

const WhatsAppLog = require("../../models/WhatsAppLog");
const { User } = require("../../models/userModel");

const {
    isLoggedIn,
    isAdmin,
    isApproved
} = require("../../middleware/auth");

/*
=================================================
GET ALL RESIDENTS
=================================================
*/

router.get(
    "/residents",
    isLoggedIn,
    isApproved,
    async (req, res) => {

        try {

            const residents = await User.find({

                societyName: req.user.societyName

            })
            .select(
                "firstName lastName username phoneNumber flatNumber validation isAdmin profileImage"
            )
            .sort({
                flatNumber: 1
            });

            const approvedResidents = residents.filter(
                user => user.validation === "approved"
            );

            const appliedResidents = residents.filter(
                user => user.validation === "applied"
            );

            return res.json({

                success: true,

                societyName: req.user.societyName,

                approvedCount: approvedResidents.length,

                appliedCount: appliedResidents.length,

                approvedResidents,

                appliedResidents

            });

        } catch (err) {

            console.error(err);

            return res.status(500).json({

                success: false,

                message: "Unable to fetch residents."

            });

        }

    }
);

/*
=================================================
APPROVE RESIDENT API
=================================================
*/

router.put(
    "/residents/:id/approve",
    isLoggedIn,
    isAdmin,
    async (req, res) => {

        try {

            const { id } = req.params;

            const approvedUser = await User.findById(id);

            if (!approvedUser) {

                return res.status(404).json({

                    success: false,

                    message: "Resident not found."

                });

            }

            approvedUser.validation = "approved";

            await approvedUser.save();

            /*
            --------------------------
            WhatsApp
            --------------------------
            */

            try {

                await sendWhatsApp(

                    `+91${approvedUser.phoneNumber}`,

                    `Your Mayon Grand Ellora account has been approved.`

                );

                await WhatsAppLog.create({

                    residentId: approvedUser._id,

                    mobileNumber: approvedUser.phoneNumber,

                    message: "Your account has been approved.",

                    status: "Sent"

                });

            } catch (err) {

                console.log("WhatsApp Error:", err.message);

            }

            /*
            --------------------------
            Email
            --------------------------
            */

            try {

                await sendMail(

                    approvedUser.username,

                    "Account Approved",

                    `
                    <h2>Congratulations!</h2>

                    <p>Your <strong>Mayon Grand Ellora</strong> resident account has been approved.</p>

                    <p>You can now log in and access all resident services.</p>

                    <br>

                    <p>Thank you,</p>

                    <p><strong>Mayon Grand Ellora Team</strong></p>
                    `

                );

            } catch (err) {

                console.log("Email Error:", err.message);

            }

            return res.json({

                success: true,

                message: "Resident approved successfully.",

                resident: {

                    _id: approvedUser._id,

                    firstName: approvedUser.firstName,

                    lastName: approvedUser.lastName,

                    validation: approvedUser.validation

                }

            });

        } catch (err) {

            console.error(err);

            return res.status(500).json({

                success: false,

                message: "Unable to approve resident."

            });

        }

    }
);

/*
=================================================
REJECT RESIDENT API
=================================================
*/

router.put(
    "/residents/:id/reject",
    isLoggedIn,
    isAdmin,
    async (req, res) => {

        try {

            const { id } = req.params;

            const resident = await User.findById(id);

            if (!resident) {

                return res.status(404).json({
                    success: false,
                    message: "Resident not found."
                });

            }

            resident.validation = "applied";

            await resident.save();

            /*
            --------------------------
            Optional Email Notification
            --------------------------
            */

            try {

                await sendMail(

                    resident.username,

                    "Resident Application Updated",

                    `
                    <h2>Application Update</h2>

                    <p>Your resident application requires further review.</p>

                    <p>Please contact the society administrator for more information.</p>

                    <br>

                    <p><strong>Mayon Grand Ellora Team</strong></p>
                    `

                );

            } catch (err) {

                console.log("Email Error:", err.message);

            }

            return res.json({

                success: true,

                message: "Resident moved back to pending approval.",

                resident: {

                    _id: resident._id,

                    firstName: resident.firstName,

                    lastName: resident.lastName,

                    validation: resident.validation

                }

            });

        } catch (err) {

            console.error(err);

            return res.status(500).json({

                success: false,

                message: "Unable to update resident."

            });

        }

    }
);

/*
=================================================
GET RESIDENT DETAILS
=================================================
*/

router.get(
    "/residents/:id",
    isLoggedIn,
    isApproved,
    async (req, res) => {

        try {

            const { id } = req.params;

            const resident = await User.findOne({

                _id: id,

                societyName: req.user.societyName

            }).select("-hash -salt");

            if (!resident) {

                return res.status(404).json({

                    success: false,

                    message: "Resident not found."

                });

            }

            return res.json({

                success: true,

                resident: {

                    _id: resident._id,

                    firstName: resident.firstName,

                    lastName: resident.lastName,

                    username: resident.username,

                    phoneNumber: resident.phoneNumber,

                    flatNumber: resident.flatNumber,

                    societyName: resident.societyName,

                    validation: resident.validation,

                    isAdmin: resident.isAdmin,

                    loginType: resident.loginType,

                    profileImage: resident.profileImage,

                    createdAt: resident.createdAt,

                    updatedAt: resident.updatedAt

                }

            });

        } catch (err) {

            console.error(err);

            return res.status(500).json({

                success: false,

                message: "Unable to fetch resident details."

            });

        }

    }
);

/*
=================================================
UPDATE RESIDENT
=================================================
*/

router.put(
    "/residents/:id",
    isLoggedIn,
    isAdmin,
    async (req, res) => {

        try {

            const { id } = req.params;

            const {

                firstName,
                lastName,
                username,
                phoneNumber,
                flatNumber,
                validation,
                isAdmin

            } = req.body;

            const resident = await User.findOne({

                _id: id,
                societyName: req.user.societyName

            });

            if (!resident) {

                return res.status(404).json({

                    success: false,
                    message: "Resident not found."

                });

            }

            if (firstName !== undefined)
                resident.firstName = firstName;

            if (lastName !== undefined)
                resident.lastName = lastName;

            if (username !== undefined)
                resident.username = username;

            if (phoneNumber !== undefined)
                resident.phoneNumber = phoneNumber;

            if (flatNumber !== undefined)
                resident.flatNumber = flatNumber;

            if (validation !== undefined)
                resident.validation = validation;

            if (isAdmin !== undefined)
                resident.isAdmin = isAdmin;

            await resident.save();

            return res.json({

                success: true,

                message: "Resident updated successfully.",

                resident: {

                    _id: resident._id,

                    firstName: resident.firstName,

                    lastName: resident.lastName,

                    username: resident.username,

                    phoneNumber: resident.phoneNumber,

                    flatNumber: resident.flatNumber,

                    validation: resident.validation,

                    isAdmin: resident.isAdmin

                }

            });

        } catch (err) {

            console.error(err);

            return res.status(500).json({

                success: false,

                message: "Unable to update resident."

            });

        }

    }
);

/*
=================================================
DELETE RESIDENT
=================================================
*/

router.delete(
    "/residents/:id",
    isLoggedIn,
    isAdmin,
    async (req, res) => {

        try {

            const { id } = req.params;

            const resident = await User.findOne({

                _id: id,
                societyName: req.user.societyName

            });

            if (!resident) {

                return res.status(404).json({

                    success: false,
                    message: "Resident not found."

                });

            }

            // Prevent admin from deleting themselves
            if (resident._id.toString() === req.user._id.toString()) {

                return res.status(400).json({

                    success: false,
                    message: "You cannot delete your own account."

                });

            }

            await User.findByIdAndDelete(id);

            /*
            --------------------------
            Email Notification
            --------------------------
            */

            try {

                await sendMail(

                    resident.username,

                    "Resident Account Removed",

                    `
                    <h2>Account Removed</h2>

                    <p>Your resident account has been removed from <strong>Mayon Grand Ellora</strong>.</p>

                    <p>If you believe this is a mistake, please contact the society administrator.</p>

                    <br>

                    <p><strong>Mayon Grand Ellora Team</strong></p>
                    `

                );

            } catch (err) {

                console.log("Email Error:", err.message);

            }

            /*
            --------------------------
            WhatsApp Notification
            --------------------------
            */

            try {

                await sendWhatsApp(

                    `+91${resident.phoneNumber}`,

                    "Your Mayon Grand Ellora account has been removed."

                );

                await WhatsAppLog.create({

                    residentId: resident._id,

                    mobileNumber: resident.phoneNumber,

                    message: "Resident account removed.",

                    status: "Sent"

                });

            } catch (err) {

                console.log("WhatsApp Error:", err.message);

            }

            return res.json({

                success: true,

                message: "Resident deleted successfully."

            });

        } catch (err) {

            console.error(err);

            return res.status(500).json({

                success: false,

                message: "Unable to delete resident."

            });

        }

    }
);

module.exports = router;