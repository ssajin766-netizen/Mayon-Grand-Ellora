const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ==========================================
// Create Upload Folder
// ==========================================

const uploadPath = path.join(
    __dirname,
    "../public/uploads/profiles"
);

if (!fs.existsSync(uploadPath)) {

    fs.mkdirSync(uploadPath, {

        recursive: true

    });

}

// ==========================================
// Storage
// ==========================================

const storage = multer.diskStorage({

    destination: function (req, file, cb) {

        cb(null, uploadPath);

    },

    filename: function (req, file, cb) {

        const uniqueName =

            Date.now() +

            "-" +

            Math.round(Math.random() * 1e9) +

            path.extname(file.originalname);

        cb(null, uniqueName);

    }

});

// ==========================================
// File Filter
// ==========================================

function fileFilter(req, file, cb) {

    const allowed = [

        "image/jpeg",

        "image/jpg",

        "image/png",

        "image/webp"

    ];

    if (allowed.includes(file.mimetype)) {

        cb(null, true);

    }

    else {

        cb(

            new Error(

                "Only JPG, PNG and WEBP images are allowed."

            )

        );

    }

}

// ==========================================
// Upload
// ==========================================

const upload = multer({

    storage,

    fileFilter,

    limits: {

        fileSize: 5 * 1024 * 1024

    }

});

module.exports = upload;