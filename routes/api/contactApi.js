// routes/api/contactApi.js
const express = require('express');
const router = express.Router();
const { Society } = require('../../models/societyModel');
const { isLoggedIn, isAdmin, isApproved } = require('../../middleware/auth');

/**
 * GET /api/emergency-contacts
 * Returns the list of emergency contacts for the authenticated society.
 */
router.get('/emergency-contacts', isLoggedIn, isApproved, async (req, res) => {
  try {
    const society = await Society.findOne({
      societyName: req.user.societyName,
    }).select('societyName emergencyContactsArray');
    if (!society) {
      return res.status(404).json({ success: false, message: 'Society not found.' });
    }
    return res.json({
      success: true,
      societyName: society.societyName,
      isAdmin: req.user.isAdmin,
      emergencyContacts: society.emergencyContactsArray,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Unable to fetch emergency contacts.' });
  }
});

/**
 * POST /api/emergency-contacts
 * Create a new emergency contact (admin only).
 */
router.post('/emergency-contacts', isLoggedIn, isAdmin, async (req, res) => {
  try {
    const { name, phone, email, address, category, enabled } = req.body;
    if (!name || !phone || !category) {
      return res.status(400).json({ success: false, message: 'Name, phone and category are required.' });
    }
    const newContact = { name, phone, email, address, category, enabled: enabled ?? true };
    const society = await Society.findOneAndUpdate(
      { societyName: req.user.societyName },
      { $push: { emergencyContactsArray: newContact } },
      { new: true, select: 'emergencyContactsArray' }
    );
    return res.status(201).json({ success: true, emergencyContacts: society.emergencyContactsArray });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Unable to create emergency contact.' });
  }
});

/**
 * PUT /api/emergency-contacts/:id
 * Update an existing contact (admin only).
 */
router.put('/emergency-contacts/:id', isLoggedIn, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateFields = req.body;
    const society = await Society.findOneAndUpdate(
      { societyName: req.user.societyName, 'emergencyContacts._id': id },
      { $set: { 'emergencyContacts.$': { _id: id, ...updateFields } } },
      { new: true, select: 'emergencyContacts' }
    );
    if (!society) {
      return res.status(404).json({ success: false, message: 'Contact not found.' });
    }
    return res.json({ success: true, emergencyContacts: society.emergencyContacts });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Unable to update emergency contact.' });
  }
});

/**
 * DELETE /api/contacts/:id
 * Remove a contact (admin only).
 */
router.delete('/emergency-contacts/:id', isLoggedIn, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const society = await Society.findOneAndUpdate(
      { societyName: req.user.societyName },
      { $pull: { emergencyContacts: { _id: id } } },
      { new: true, select: 'emergencyContacts' }
    );
    if (!society) {
      return res.status(404).json({ success: false, message: 'Society not found.' });
    }
    return res.json({ success: true, emergencyContacts: society.emergencyContacts });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Unable to delete emergency contact.' });
  }
});

/**
 * PATCH /api/contacts/:id/enable
 * Toggle enabled flag (admin only).
 */
router.patch('/emergency-contacts/:id/enable', isLoggedIn, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { enabled } = req.body;
    const society = await Society.findOneAndUpdate(
      { societyName: req.user.societyName, 'emergencyContacts._id': id },
      { $set: { 'emergencyContacts.$.enabled': enabled } },
      { new: true, select: 'emergencyContacts' }
    );
    if (!society) {
      return res.status(404).json({ success: false, message: 'Contact not found.' });
    }
    return res.json({ success: true, emergencyContacts: society.emergencyContacts });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Unable to toggle contact status.' });
  }
});

module.exports = router;