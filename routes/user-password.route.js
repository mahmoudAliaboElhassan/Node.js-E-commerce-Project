const express = require("express");
const router = express.Router();
const userPasswordController = require("../controllers/user-password.controller");
const {
  validationSchemaForgetPassword,
  validationSchemaResetPassword,
} = require("../middlewares/validationSchema");
router
  .route("/forget")
  // .get(userPasswordController.getForgetPage)
  .post(
    validationSchemaForgetPassword(),
    userPasswordController.sendForgotPasswordLink
  );

router
  .route("/reset/:id/:token")
  // .get(userPasswordController.getPasswordResetView)
  .post(validationSchemaResetPassword(), userPasswordController.resetPassword);
module.exports = router; // Make sure you're exporting the router
