const mongoose = require("mongoose");

const mobileWebViewTokenSchema = new mongoose.Schema(
    {
        tokenHash: {
            type: String,
            required: true,
            unique: true,
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        expiresAt: {
            type: Date,
            required: true,
        },

        usedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);


// ==================================================
// TTL INDEX
// Automatically deletes expired tokens
// ==================================================

mobileWebViewTokenSchema.index(
    { expiresAt: 1 },
    {
        expireAfterSeconds: 0,
    }
);


module.exports = mongoose.model(
    "MobileWebViewToken",
    mobileWebViewTokenSchema
);