const express = require("express");
const multer = require("multer");
const path = require("path");
const { request, response } = require("express");
const Router = express.Router;

function filename(request, file, callback) {
    callback(null, file.originalname);
}

const storage = multer.diskStorage({ destination: "api/uploads/", filename: filename });

function fileFilter(request, file, callback) {
    if(file.mimetype !== "image/png") {
        request.fileValidationError = "Wrong file type";
        callback(null, false, new Error("Wrong file type"));
    } else {
        callback(null, true);
    }
}

const upload = multer({ fileFilter: fileFilter, storage: storage });

const router = Router();
router.post("/upload", upload.single("photo"), (request, response) => {
    if(request.fileValidationError) {
        response.status(400).json({ error: request.fileValidationError });
    } else {
        response.status(201).json({ success: true });
    }
});

const photoPath = path.resolve(__dirname, "../../client/photo-viewer.html");

router.get("/photo-viewer", (request, response) => {
    response.sendFile(photoPath);
});

module.exports = router;