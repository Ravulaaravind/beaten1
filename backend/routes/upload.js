const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { uploadImage } = require("../controllers/uploadController");

// Multer config (store in /tmp for Cloudinary upload)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "/tmp"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// POST /api/upload/image
router.post("/image", upload.single("image"), uploadImage);

module.exports = router;
