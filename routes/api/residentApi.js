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
        const { listResidents } = require("../../controllers/api/residentApiController");
        return listResidents(req, res);
    }
);

// GET resident details (API)
router.get(
    "/residents/:id",
    isLoggedIn,
    isApproved,
    async (req, res) => {
        const { getResident } = require('../../controllers/api/residentApiController');
        return getResident(req, res);
    }
);

router.post(
  '/residents',
  isLoggedIn,
  isApproved,
  async (req, res) => {
    const { createResident } = require('../../controllers/api/residentApiController');
    return createResident(req, res);
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

// Duplicate GET resident details route removed

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
    isApproved,
    isAdmin,
    async (req, res) => {
        const { deleteResident } = require("../../controllers/api/residentApiController");
        return deleteResident(req, res);
    }
);


module.exports = router;