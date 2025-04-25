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

module.exports = {
  validationSchemaLogin,
};
