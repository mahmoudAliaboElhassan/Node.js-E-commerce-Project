const express = require("express");
const router = express.Router();
const {
  validationSchemaLogin,
  validationSchemaSignup,
  validationSchemaChangePassword,
} = require("../middlewares/validationSchema");

const usersController = require("../controllers/user.controller");
const verifyToken = require("../middlewares/verifyToken");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../utils/cloud");
const multer = require("multer");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "products",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

const upload = multer({ storage });

router
  .route("/signup")
  .post(
    upload.single("avatar"),
    validationSchemaSignup(),
    usersController.signup
  );
router.route("/login").post(validationSchemaLogin(), usersController.login);
router.route("/logout").post(verifyToken, usersController.logout);
router
  .route("/change-password/:id")
  .post(
    verifyToken,
    validationSchemaChangePassword(),
    usersController.change_password
  );

module.exports = router;
