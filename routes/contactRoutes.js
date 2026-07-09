const express = require("express");
const router = express.Router();

const society_collection = require("../models/societyModel");

const {
    isLoggedIn,
    isAdmin,
    isApproved
} = require("../middleware/auth");

/*
--------------------------------------------------
CONTACTS
--------------------------------------------------
*/

router.get(
    "/contacts",
    isLoggedIn,
    isApproved,
    async (req, res) => {

        try {

            const foundSociety =
                await society_collection.Society.findOne({

                    societyName: req.user.societyName

                });

            if (!foundSociety) {

                return res.status(404).send("Society not found");

            }

            res.render("contacts", {

                contact: foundSociety.emergencyContacts,

                society: foundSociety,

                isAdmin: req.user.isAdmin

            });

        }

        catch (err) {

            console.error(err);

            res.status(500).send("Server Error");

        }

    }
);

/*
--------------------------------------------------
EDIT CONTACTS PAGE
--------------------------------------------------
*/

router.get(
    "/editContacts",
    isLoggedIn,
    isAdmin,
    async (req, res) => {

        try {

            const foundSociety =
                await society_collection.Society.findOne(

                    {
                        societyName: req.user.societyName
                    },

                    {
                        emergencyContacts: 1
                    }

                );

            if (!foundSociety) {

                return res.status(404).send("Society not found");

            }

            res.render("editContacts", {

                contact: foundSociety.emergencyContacts

            });

        }

        catch (err) {

            console.error(err);

            res.status(500).send("Server Error");

        }

    }
);

/*
--------------------------------------------------
UPDATE CONTACTS
--------------------------------------------------
*/

router.post(
    "/editContacts",
    isLoggedIn,
    isAdmin,
    async (req, res) => {

        try {

            await society_collection.Society.updateOne(

                {

                    societyName: req.user.societyName

                },

                {

                    $set: {

                        emergencyContacts: {

                            plumbingService:
                                req.body.plumbingService,

                            medicineShop:
                                req.body.medicineShop,

                            ambulance:
                                req.body.ambulance,

                            doctor:
                                req.body.doctor,

                            fireStation:
                                req.body.fireStation,

                            guard:
                                req.body.guard,

                            policeStation:
                                req.body.policeStation,

                            electrician:
                                req.body.electrician,

                            hospital:
                                req.body.hospital,

                            liftService:
                                req.body.liftService,

                            waterSupply:
                                req.body.waterSupply,

                            securityOffice:
                                req.body.securityOffice,

                            generatorService:
                                req.body.generatorService,

                            gasAgency:
                                req.body.gasAgency,

                            electricityBoard:
                                req.body.electricityBoard,

                            maintenanceOffice:
                                req.body.maintenanceOffice

                        }

                    }

                }

            );

            res.redirect("/contacts");

        }

        catch (err) {

            console.error(err);

            res.status(500).send("Server Error");

        }

    }
);

module.exports = router;