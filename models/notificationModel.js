const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({

    user: {

        type: mongoose.Schema.Types.ObjectId,

        ref: "user",

        required: true

    },

    title: {

        type: String,

        required: true

    },

    message: {

        type: String,

        required: true

    },

    type: {

        type: String,

        enum: [

            "success",

            "error",

            "warning",

            "info"

        ],

        default: "info"

    },

    icon: {

        type: String,

        default: "fa-bell"

    },

    link: {

        type: String,

        default: "#"

    },

    isRead: {

        type: Boolean,

        default: false

    }

},
{
    timestamps:true
});

exports.Notification =
    mongoose.model(
        "notification",
        notificationSchema
    );