const mongoose = require('mongoose');

// Resident schema – stored in its own collection.
// Each resident belongs to a society (identified by the societyName string).
// Timestamps are managed automatically via the `timestamps` option.
// Per‑society uniqueness of `phone` and `unitNumber` is enforced in a pre‑save hook.

const residentSchema = new mongoose.Schema(
  {
    // Association to the society the resident belongs to.
    // Using a simple string matches the existing pattern in the codebase
    // where `req.user.societyName` is used for scoping.
    societyName: { type: String, required: true },

    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    category: {
      type: String,
      enum: ['Owner', 'Tenant', 'Visitor'],
      required: true,
    },
    unitNumber: { type: String, required: true },
    notes: { type: String },

    // Additional fields for future modules
    status: {
      type: String,
      enum: ['Active', 'Moved Out', 'Pending Approval'],
      default: 'Active',
    },
    isPrimaryResident: { type: Boolean, default: false },
    emergencyContactName: { type: String },
    emergencyContactPhone: { type: String },
    moveInDate: { type: Date, default: Date.now },
    moveOutDate: { type: Date },
  },
  { timestamps: true }
);

// Helper to check uniqueness of phone and unitNumber within the same society.
async function isUniqueInSociety(query) {
  const count = await mongoose.model('Resident').countDocuments(query);
  return count === 0;
}

// Pre‑save validation – runs on both create and update (when `isModified`).
residentSchema.pre('save', async function (next) {
  try {
    // When updating, exclude the current document from the uniqueness check.
    const idFilter = this.isNew ? {} : { _id: { $ne: this._id } };
    const phoneQuery = {
      ...idFilter,
      societyName: this.societyName,
      phone: this.phone,
    };
    const unitQuery = {
      ...idFilter,
      societyName: this.societyName,
      unitNumber: this.unitNumber,
    };

    const [phoneUnique, unitUnique] = await Promise.all([
      isUniqueInSociety(phoneQuery),
      isUniqueInSociety(unitQuery),
    ]);

    if (!phoneUnique) {
      const err = new Error('Phone number must be unique within the society');
      err.name = 'ValidationError';
      return next(err);
    }
    if (!unitUnique) {
      const err = new Error('Unit number must be unique within the society');
      err.name = 'ValidationError';
      return next(err);
    }
    return next();
  } catch (e) {
    return next(e);
  }
});

module.exports = mongoose.model('Resident', residentSchema);
