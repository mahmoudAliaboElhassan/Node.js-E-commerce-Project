const express = require("express");
const router = express.Router();
const { validationSchemaLogin } = require("../middlewares/validationSchema");

const usersController = require("../controllers/user.controller");

router.route("/login").post(validationSchemaLogin(), usersController.login);

module.exports = router;
