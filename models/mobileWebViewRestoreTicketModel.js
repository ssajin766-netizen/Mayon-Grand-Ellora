const mongoose = require("mongoose");

const mobileWebViewRestoreTicketSchema =
    new mongoose.Schema(
        {
            ticketHash: {
                type: String,
                required: true,
                unique: true,
                index: true,
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


// Automatically remove expired tickets.
mobileWebViewRestoreTicketSchema.index(
    {
        expiresAt: 1,
    },
    {
        expireAfterSeconds: 0,
    }
);


module.exports = mongoose.model(
    "MobileWebViewRestoreTicket",
    mobileWebViewRestoreTicketSchema
);