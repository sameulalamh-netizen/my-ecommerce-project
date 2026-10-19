const express = require("express");
const {
  createCategory  ,
  getCategories,
  updateCategory,
  deleteCategory
} = require("../controllers/categoryController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");


const router = express.Router();

router.post(
  "/",
  protect,
  authorizeRoles("super_admin"),
  upload.single("image"),
  createCategory
);

router.get("/", getCategories);

router.patch(
    "/:categoryId",
    protect,
    authorizeRoles("super_admin"),
    upload.single("image"),
    updateCategory
);

router.delete(
    "/:categoryId",
    protect,
    authorizeRoles("super_admin"),
    deleteCategory
);

module.exports = router;