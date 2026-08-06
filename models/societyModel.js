const mongoose = require('mongoose');

const societySchema = mongoose.Schema(
    {
        societyName: {
            type: String,
            unique: true,
            required: true
        },
        societyAddress: {
            address: {
                type: String,
                required: true
            },
            city: {
                type: String,
                required: true
            },
            district: {
                type: String,
                required: true
            },
            postalCode: {
                type: Number,
                required: true
            }
        },
        admin: {
            type: String,
            required: true
        },
        noticeboard: Array,
        // Emergency contacts stored as an array of objects for flexible CRUD operations
        emergencyContacts: [{
            type: new mongoose.Schema({
                name: { type: String, required: true },
                phone: { type: String, required: true },
                email: { type: String },
                address: { type: String },
                category: { type: String, required: true },
                enabled: { type: Boolean, default: true }
            }, { _id: true })
        }],
        maintenanceBill: {
            societyCharges: {
                type: Number,
                default: 186
            },
            repairsAndMaintenance: {
                type: Number,
                default: 1415
            },
            sinkingFund: {
                type: Number,
                default: 240
            },
            waterCharges: {
                type: Number,
                default: 150
            },
            insuranceCharges: {
                type: Number,
                default: 30
            },
            parkingCharges: {
                type: Number,
                default: 150
            },
        }
    },
    {
		timestamps: true,
	}
)

exports.Society = mongoose.model("society", societySchema);