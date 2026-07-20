const { Notification } = require("../models/notificationModel");

async function createNotification(data) {

    try {

        console.log("==================================");
        console.log("createNotification called");
        console.log(data);

        const notification = new Notification(data);

        await notification.save();

        console.log("Notification Saved:", notification._id);
        console.log("==================================");

    } catch (err) {

        console.error("Notification Error");
        console.error(err);

    }

}

module.exports = {
    createNotification
};