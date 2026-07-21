const mongoose = require("mongoose");

const deleteAccountLogSchema = new mongoose.Schema({

    email: String,

    firstName: String,

    lastName: String,

    societyName: String,

    reason: String,

    feedback: String,

    deletedAt: {

        type: Date,

        default: Date.now

    }

});

module.exports = mongoose.model(
    "DeleteAccountLog",
    deleteAccountLogSchema
);