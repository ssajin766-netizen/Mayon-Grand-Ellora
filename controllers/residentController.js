// controllers/residentController.js
// Web controller for Resident operations (HTML rendering).

const Resident = require('../models/residentModel');
const { fetchResidents } = require('../helpers/residentQueryHelper');
const { createResidentService, getResidentService, updateResidentService, deleteResidentService } = require('../helpers/residentService');

/**
 * Render the residents list page.
 * Uses the shared fetchResidents helper for filtering, pagination, and sorting.
 * Passes pagination metadata and original query parameters to the view.
 */
async function listResidents(req, res) {
  try {
    const { residents, paginationMeta } = await fetchResidents(req, Resident);

    // Render the EJS view. The view will consume `residents` and `pagination`.
    res.render('residents', {
      residents,
      pagination: paginationMeta,
      // Preserve original query values for UI controls.
      search: req.query.search || '',
      category: req.query.category || '',
      // Status filter is API‑only; we don't expose it in the UI.
      isAdmin: req.user.isAdmin,
    });
  } catch (err) {
    console.error('Error listing residents:', err);
    // Flash an error message and render an empty list.
    req.flash('error', 'Unable to load residents list.');
    res.render('residents', {
      residents: [],
      pagination: { page: 1, pageSize: 20, total: 0, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
      search: '',
      category: '',
      isAdmin: req.user.isAdmin,
    });
  }
}

/**
 * Handle creation of a new resident (web flow).
 */
async function createResident(req, res) {
  try {
    const result = await createResidentService(req.user, req.body);
    if (result.success) {
      req.flash('success', result.message);
      return res.redirect('/residents');
    }
    req.flash('error', result.message);
    return res.redirect('back');
  } catch (err) {
    console.error('Error creating resident:', err);
    req.flash('error', 'Unable to create resident.');
    return res.redirect('back');
  }
}

/**
 * Render resident detail view.
 */
async function viewResident(req, res) {
  try {
    const result = await getResidentService(req.user, req.params.id);
    if (result.success) {
      return res.render('residentDetails', { resident: result.resident, isAdmin: req.user.isAdmin });
    }
    req.flash('error', result.message || 'Resident not found');
    return res.redirect('/residents');
  } catch (err) {
    console.error('Error viewing resident:', err);
    req.flash('error', 'Unable to view resident.');
    return res.redirect('/residents');
  }
}

/**
 * Handle updating an existing resident (web flow).
 */
async function updateResident(req, res) {
  try {
    const result = await updateResidentService(req.user, req.params.id, req.body);
    if (result.success) {
      req.flash('success', result.message);
      return res.redirect('/residents');
    }
    req.flash('error', result.message);
    return res.redirect('back');
  } catch (err) {
    console.error('Error updating resident:', err);
    req.flash('error', 'Unable to update resident.');
    return res.redirect('back');
  }
}

async function deleteResident(req, res) {
  try {
    const result = await deleteResidentService(req.user, req.params.id);
    if (result.success) {
      req.flash('success', result.message);
      return res.redirect('/residents');
    }
    req.flash('error', result.message);
    return res.redirect('back');
  } catch (err) {
    console.error('Error deleting resident:', err);
    req.flash('error', 'Unable to delete resident.');
    return res.redirect('back');
  }
}

module.exports = { listResidents, createResident, viewResident, updateResident, deleteResident };

