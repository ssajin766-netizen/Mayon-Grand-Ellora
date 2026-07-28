const express = require("express");
const router = express.Router();

const { Society } = require("../../models/societyModel");

const {
    isLoggedIn,
    isAdmin,
    isApproved
} = require("../../middleware/auth");

/*
=================================================
GET EMERGENCY CONTACTS
=================================================
*/

router.get(
    "/contacts",
    isLoggedIn,
    isApproved,
    async (req, res) => {

        try {

            const society = await Society.findOne({

                societyName: req.user.societyName

            }).select(

                "societyName emergencyContacts"

            );

            if (!society) {

                return res.status(404).json({

                    success: false,

                    message: "Society not found."

                });

            }

            return res.json({

                success: true,

                societyName: society.societyName,

                isAdmin: req.user.isAdmin,

                emergencyContacts: society.emergencyContacts

            });

        }

        catch (err) {

            console.error(err);

            return res.status(500).json({

                success: false,

                message: "Unable to fetch emergency contacts."

            });

        }

    }
);

/*
=================================================
UPDATE EMERGENCY CONTACTS
=================================================
*/

router.put(
    "/contacts",
    isLoggedIn,
    isAdmin,
    async (req, res) => {

        try {

            const society = await Society.findOne({

                societyName: req.user.societyName

            });

            if (!society) {

                return res.status(404).json({

                    success: false,

                    message: "Society not found."

                });

            }

            society.emergencyContacts = {

                plumbingService: req.body.plumbingService,

                medicineShop: req.body.medicineShop,

                ambulance: req.body.ambulance,

                doctor: req.body.doctor,

                fireStation: req.body.fireStation,

                guard: req.body.guard,

                policeStation: req.body.policeStation,

                electrician: req.body.electrician,

                hospital: req.body.hospital,

                liftService: req.body.liftService,

                waterSupply: req.body.waterSupply,

                securityOffice: req.body.securityOffice,

                generatorService: req.body.generatorService,

                gasAgency: req.body.gasAgency,

                electricityBoard: req.body.electricityBoard,

                maintenanceOffice: req.body.maintenanceOffice

            };

            await society.save();

            return res.json({

                success: true,

                message: "Emergency contacts updated successfully.",

                emergencyContacts: society.emergencyContacts

            });

        }

        catch (err) {

            console.error(err);

            return res.status(500).json({

                success: false,

                message: "Unable to update emergency contacts."

            });

        }

    }
);

module.exports = router;