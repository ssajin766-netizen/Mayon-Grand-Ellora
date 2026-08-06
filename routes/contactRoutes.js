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

// DELETE route for removing an emergency contact
router.delete('/contacts/:id', isLoggedIn, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(id)) {
      if (req.xhr || req.get('X-Requested-With') === 'XMLHttpRequest') {
        return res.status(400).json({ success: false, message: 'Invalid contact ID' });
      }
      req.flash('error', 'Invalid contact ID');
      return res.redirect('/contacts');
    }
    const result = await society_collection.Society.updateOne(
      { societyName: req.user.societyName },
      { $pull: { emergencyContacts: { _id: id } } }
    );
    if (result.nModified === 0) {
      if (req.xhr || req.get('X-Requested-With') === 'XMLHttpRequest') {
        return res.status(404).json({ success: false, message: 'Contact not found' });
      }
      req.flash('error', 'Contact not found');
      return res.redirect('/contacts');
    }
    if (req.xhr || req.get('X-Requested-With') === 'XMLHttpRequest') {
      return res.json({ success: true });
    }
    req.flash('success', 'Contact deleted');
    return res.redirect('/contacts');
  } catch (err) {
    console.error(err);
    if (req.xhr || req.get('X-Requested-With') === 'XMLHttpRequest') {
      return res.status(500).json({ success: false, message: 'Server error' });
    }
    req.flash('error', 'Server error');
    return res.redirect('/contacts');
  }
});

module.exports = router;