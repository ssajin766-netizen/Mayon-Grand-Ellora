const {
    Notification
} = require("../models/notificationModel");

async function createNotification({

    user,

    title,

    message,

    type = "info",

    icon = "fa-bell",

    link = "#"

}){

    try{

        await Notification.create({

            user,

            title,

            message,

            type,

            icon,

            link

        });

    }

    catch(err){

        console.log(err);

    }

}

module.exports = {

    createNotification

};