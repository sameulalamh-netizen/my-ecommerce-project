const express = require("express");
const upload = require("../middleware/uploadMiddleware");
const cloudinary = require("../config/cloudinary");

const router = express.Router();

router.post("/image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image is required"
      });
    }

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "multi-vendor-ecommerce"
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      uploadStream.end(req.file.buffer);
    });

    res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      imageUrl: result.secure_url,
      publicId: result.public_id
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Image upload failed",
      error: error.message
    });
  }
});

module.exports = router;