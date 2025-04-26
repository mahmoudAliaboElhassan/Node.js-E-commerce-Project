const { body } = require("express-validator");

const validationSchemaLogin = () => {
  return [
    body("email")
      .notEmpty()
      .withMessage("email can not be empty")
      .isEmail()
      .withMessage("email is not valid"),
    body("password").notEmpty().withMessage("password can not be empty"),
  ];
};
const validationSchemaSignup = () => {
  return [
    body("firstName")
      .notEmpty()
      .withMessage("firstName can not be empty")
      .isLength({ min: 3 })
      .withMessage("firstName must be at least 3 characters long"),
    body("lastName")
      .notEmpty()
      .withMessage("lastName can not be empty")
      .isLength({ min: 3 })
      .withMessage("lastName must be at least 3 characters long"),
    body("email")
      .notEmpty()
      .withMessage("email can not be empty")
      .isEmail()
      .withMessage("email is not valid"),
    body("password").notEmpty().withMessage("password can not be empty"),
  ];
};

module.exports = {
  validationSchemaLogin,
  validationSchemaSignup,
};
