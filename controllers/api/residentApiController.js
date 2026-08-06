// controllers/api/residentApiController.js
// API controller for Resident operations (JSON responses).

const Resident = require('../../models/residentModel');
const { fetchResidents } = require('../../helpers/residentQueryHelper');
const { createResidentService, getResidentService, updateResidentService, deleteResidentService } = require('../../helpers/residentService');

/**
 * GET /api/residents
 * Returns paginated list of residents with metadata.
 */
async function listResidents(req, res) {
  try {
    const { residents, paginationMeta } = await fetchResidents(req, Resident);
    const data = residents.map(r => ({
      _id: r._id,
      firstName: r.firstName,
      lastName: r.lastName,
      email: r.email,
      phone: r.phone,
      unitNumber: r.unitNumber,
      category: r.category,
      status: r.status,
      isPrimaryResident: r.isPrimaryResident,
      emergencyContactName: r.emergencyContactName,
      emergencyContactPhone: r.emergencyContactPhone,
      moveInDate: r.moveInDate,
      moveOutDate: r.moveOutDate,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
    return res.json({ success: true, data, ...paginationMeta });
  } catch (err) {
    console.error('Error listing residents API:', err);
    return res.status(500).json({ success: false, message: 'Unable to fetch residents.' });
  }
}

/**
 * POST /api/residents
 * Creates a new resident and returns the created object.
 */
async function createResident(req, res) {
  try {
    const result = await createResidentService(req.user, req.body);
    if (result.success) {
      return res.status(201).json({ success: true, message: result.message, data: result.resident });
    }
    // Return appropriate error status and details
    return res.status(result.status).json({ success: false, message: result.message, errors: result.errors, errorCode: result.errorCode });
  } catch (err) {
    console.error('Error creating resident API:', err);
    return res.status(500).json({ success: false, message: 'Unable to create resident.' });
  }
}

/**
 * GET /api/residents/:id
 * Returns a single resident's details.
 */
async function getResident(req, res) {
  try {
    const result = await getResidentService(req.user, req.params.id);
    if (result.success) {
      return res.json({ success: true, data: result.resident });
    }
    return res.status(result.status).json({ success: false, message: result.message, errorCode: result.errorCode });
  } catch (err) {
    console.error('Error fetching resident API:', err);
    return res.status(500).json({ success: false, message: 'Unable to fetch resident.' });
  }
}

/**
 * PUT /api/residents/:id
 * Updates a resident.
 */
async function updateResident(req, res) {
  try {
    const result = await updateResidentService(req.user, req.params.id, req.body);
    if (result.success) {
      return res.json({ success: true, message: result.message, data: result.resident });
    }
    return res.status(result.status).json({ success: false, message: result.message, errorCode: result.errorCode });
  } catch (err) {
    console.error('Error updating resident API:', err);
    return res.status(500).json({ success: false, message: 'Unable to update resident.' });
  }
}

/**
 * DELETE /api/residents/:id
 * Deletes a resident.
 */
async function deleteResident(req, res) {
  try {
    const result = await deleteResidentService(req.user, req.params.id);
    if (result.success) {
      return res.json({ success: true, message: result.message });
    }
    return res.status(result.status || 400).json({ success: false, message: result.message, errorCode: result.errorCode });
  } catch (err) {
    console.error('Error deleting resident API:', err);
    return res.status(500).json({ success: false, message: 'Unable to delete resident.' });
  }
}

module.exports = { listResidents, createResident, getResident, updateResident, deleteResident };
