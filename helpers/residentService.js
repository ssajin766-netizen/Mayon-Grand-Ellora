// helpers/residentService.js
// Shared business logic for creating a Resident. Used by both web and API controllers.

const Resident = require('../models/residentModel');

// Error code constants for predictable handling
const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  PHONE_EXISTS: 'PHONE_EXISTS',
  UNIT_EXISTS: 'UNIT_EXISTS',
  INVALID_CATEGORY: 'INVALID_CATEGORY',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
};

/**
 * Validate required fields and enum values.
 * Returns { isValid: boolean, errors: object, message?: string, errorCode?: string }
 */
function validatePayload(payload) {
  const errors = {};
  const required = ['firstName', 'lastName', 'phone', 'category', 'unitNumber'];
  required.forEach((field) => {
    if (!payload[field] || payload[field].toString().trim() === '') {
      errors[field] = `${field} is required`;
    }
  });

  // Category enum validation (Owner, Tenant, Visitor)
  const allowedCategories = ['Owner', 'Tenant', 'Visitor'];
  if (payload.category && !allowedCategories.includes(payload.category)) {
    errors.category = `Invalid category. Allowed: ${allowedCategories.join(', ')}`;
    return { isValid: false, errors, message: 'Invalid category', errorCode: ERROR_CODES.INVALID_CATEGORY };
  }

  if (Object.keys(errors).length > 0) {
    return { isValid: false, errors, message: 'Missing required fields', errorCode: ERROR_CODES.VALIDATION_ERROR };
  }

  return { isValid: true, errors: {} };
}

/**
 * Service function to create a Resident.
 * @param {object} user - Authenticated user (contains societyName, _id, etc.)
 * @param {object} payload - Request body payload
 * @returns {Promise<object>} - Structured result with success flag, status, message, resident, and optional errorCode.
 */
async function createResidentService(user, payload) {
  // 1. Validate payload
  const validation = validatePayload(payload);
  if (!validation.isValid) {
    return {
      success: false,
      status: 400,
      message: validation.message || 'Validation failed',
      errors: validation.errors,
      errorCode: validation.errorCode || ERROR_CODES.VALIDATION_ERROR,
    };
  }

  // 2. Per‑society uniqueness checks for phone and unitNumber
  const existing = await Resident.findOne({
    societyName: user.societyName,
    $or: [{ phone: payload.phone }, { unitNumber: payload.unitNumber }],
  }).lean();

  if (existing) {
    if (existing.phone === payload.phone) {
      return {
        success: false,
        status: 409,
        message: 'Phone number already exists in this society.',
        errorCode: ERROR_CODES.PHONE_EXISTS,
      };
    }
    if (existing.unitNumber === payload.unitNumber) {
      return {
        success: false,
        status: 409,
        message: 'Unit number already exists in this society.',
        errorCode: ERROR_CODES.UNIT_EXISTS,
      };
    }
  }

  // 3. Build the resident document (schema defaults handle status, etc.)
  // Remove empty emergency contact fields before creating the document
  const cleanedPayload = { ...payload };
  if (cleanedPayload.emergencyContactName === '') delete cleanedPayload.emergencyContactName;
  if (cleanedPayload.emergencyContactPhone === '') delete cleanedPayload.emergencyContactPhone;
  const residentData = { ...cleanedPayload, societyName: user.societyName };
  const resident = new Resident(residentData);
  try {
    await resident.save();
    // Ensure empty emergency contact fields are not present in the returned document
    if (resident.emergencyContactName === '') delete resident.emergencyContactName;
    if (resident.emergencyContactPhone === '') delete resident.emergencyContactPhone;
    return { success: true, status: 201, message: 'Resident created successfully.', resident };
  } catch (err) {
    return { success: false, status: 500, message: 'Unable to create resident.', errorCode: ERROR_CODES.UNKNOWN_ERROR };
  }
}

// ---------- Helper constants ----------
const editableFields = [
  "firstName",
  "lastName",
  "phone",
  "category",
  "unitNumber",
  "email",
  "emergencyContactName",
  "emergencyContactPhone",
  "status",
];

const immutableFields = ["_id", "societyName", "createdAt", "createdBy"]; // createdBy may not exist yet but keep safe

/**
 * Service to fetch a resident by ID, ensuring it belongs to the user's society.
 */
async function getResidentService(user, residentId) {
  // Validate ObjectId format (simple check)
  if (!residentId || !residentId.match(/^[0-9a-fA-F]{24}$/)) {
    return { success: false, status: 400, message: "Invalid resident ID", errorCode: ERROR_CODES.VALIDATION_ERROR };
  }
  const resident = await Resident.findOne({ _id: residentId, societyName: user.societyName }).lean();
  if (!resident) {
    return { success: false, status: 404, message: "Resident not found", errorCode: ERROR_CODES.UNKNOWN_ERROR };
  }
  return { success: true, status: 200, resident };
}

/**
 * Service to update a resident.
 */
async function updateResidentService(user, residentId, payload) {
  // 1. Fetch existing resident and verify ownership
  const existingResident = await Resident.findOne({ _id: residentId, societyName: user.societyName });
  if (!existingResident) {
    return { success: false, status: 404, message: "Resident not found", errorCode: ERROR_CODES.UNKNOWN_ERROR };
  }

  // 2. Validate payload (reuse validation for required fields if they are being changed)
  const validation = validatePayload(payload);
  if (!validation.isValid) {
    return { success: false, status: 400, message: validation.message || "Validation failed", errors: validation.errors, errorCode: validation.errorCode || ERROR_CODES.VALIDATION_ERROR };
  }

  // 3. Whitelist editable fields
  const updates = {};
  editableFields.forEach((field) => {
    if (field in payload) {
      updates[field] = payload[field];
    }
  });

  // 4. Uniqueness checks – ignore the current resident
  if (updates.phone) {
    const phoneExists = await Resident.findOne({ _id: { $ne: residentId }, societyName: user.societyName, phone: updates.phone });
    if (phoneExists) {
      return { success: false, status: 409, message: "Phone number already exists in this society.", errorCode: ERROR_CODES.PHONE_EXISTS };
    }
  }
  if (updates.unitNumber) {
    const unitExists = await Resident.findOne({ _id: { $ne: residentId }, societyName: user.societyName, unitNumber: updates.unitNumber });
    if (unitExists) {
      return { success: false, status: 409, message: "Unit number already exists in this society.", errorCode: ERROR_CODES.UNIT_EXISTS };
    }
  }

  // 5. Clean empty optional fields
  if (updates.emergencyContactName === "") delete updates.emergencyContactName;
  if (updates.emergencyContactPhone === "") delete updates.emergencyContactPhone;

  // 6. Apply updates
  Object.assign(existingResident, updates);
  try {
    await existingResident.save();
    return { success: true, status: 200, message: "Resident updated successfully.", resident: existingResident };
  } catch (err) {
    return { success: false, status: 500, message: "Unable to update resident.", errorCode: ERROR_CODES.UNKNOWN_ERROR };
  }
}

async function deleteResidentService(user, residentId) {
  // Validate ID format
  if (!residentId || !residentId.match(/^[0-9a-fA-F]{24}$/)) {
    return { success: false, status: 400, message: "Invalid resident ID", errorCode: ERROR_CODES.VALIDATION_ERROR };
  }
  // Find resident within same society
  const resident = await Resident.findOne({ _id: residentId, societyName: user.societyName });
  if (!resident) {
    return { success: false, status: 404, message: "Resident not found", errorCode: ERROR_CODES.UNKNOWN_ERROR };
  }
  // Prevent admin from deleting themselves (optional safety)
  if (resident._id.equals(user._id)) {
    return { success: false, status: 400, message: "You cannot delete your own account.", errorCode: ERROR_CODES.UNKNOWN_ERROR };
  }
  await Resident.deleteOne({ _id: residentId });
  return { success: true, status: 200, message: "Resident deleted successfully." };
}

module.exports = {
  createResidentService,
  getResidentService,
  updateResidentService,
  deleteResidentService,
  ERROR_CODES,
};
