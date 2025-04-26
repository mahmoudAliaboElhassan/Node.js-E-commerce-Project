const express = require("express");
const router = express.Router();
const {
  validationSchemaLogin,
  validationSchemaSignup,
} = require("../middlewares/validationSchema");

const usersController = require("../controllers/user.controller");
const verifyToken = require("../middlewares/verifyToken");

router.route("/signup").post(validationSchemaSignup(), usersController.signup);
router.route("/login").post(validationSchemaLogin(), usersController.login);
router
  .route("/change-password/:id")
  .post(verifyToken, usersController.change_password);

module.exports = router;
