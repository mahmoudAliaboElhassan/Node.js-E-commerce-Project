const { body } = require("express-validator");

const validationSchemaLogin = () => {
  return [
    body("email")
      .notEmpty()
      .withMessage("email can not be empty")
      .isEmail()
      .withMessage("email is not valid"),
    body("password")
      .notEmpty()
      .withMessage("password can not be empty")
      .isLength({ min: 8 })
      .withMessage("New password must be at least 8 characters long")
      .matches(/[0-9]/)
      .withMessage("New password must contain at least one number")
      .matches(/[a-zA-Z]/)
      .withMessage("New password must contain at least one letter"),
    ,
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
    body("password")
      .notEmpty()
      .withMessage("password can not be empty")
      .isLength({ min: 8 })
      .withMessage("New password must be at least 8 characters long")
      .matches(/[0-9]/)
      .withMessage("New password must contain at least one number")
      .matches(/[a-zA-Z]/)
      .withMessage("New password must contain at least one letter"),
    ,
  ];
};
const validationSchemaChangePassword = () => {
  return [
    body("password").notEmpty().withMessage("password can not be empty"),
    body("newPassword")
      .notEmpty()
      .withMessage("new password can not be empty")
      .isLength({ min: 8 })
      .withMessage("New password must be at least 8 characters long")
      .matches(/[0-9]/)
      .withMessage("New password must contain at least one number")
      .matches(/[a-zA-Z]/)
      .withMessage("New password must contain at least one letter"),
  ];
};

const validationSchemaCreateProduct = () => [
  body("title")
    .notEmpty()
    .withMessage("Title cannot be empty")
    .isLength({ min: 3 })
    .withMessage("Title must be at least 3 characters long"),

  body("description")
    .notEmpty()
    .withMessage("Description cannot be empty")
    .isLength({ min: 10 })
    .withMessage("Description must be at least 10 characters long"),

  body("price")
    .notEmpty()
    .withMessage("Price is required")
    .isFloat({ min: 1 })
    .withMessage("Price must be a positive number"),

  body("quantity")
    .notEmpty()
    .withMessage("Quantity is required")
    .isInt({ min: 1 })
    .withMessage("Quantity must be a positive integer"),

  body("productImgs")
    .optional()
    .isArray()
    .withMessage("productImgs must be an array of strings")
    .custom((arr) => arr.every((img) => typeof img === "string"))
    .withMessage("All productImgs must be strings"),

  body("productCover")
    .optional()
    .isArray()
    .withMessage("productCover must be an array of strings")
    .custom((arr) => arr.every((img) => typeof img === "string"))
    .withMessage("All productCover items must be strings"),
];
const validationSchemaBuyProduct = () => [
  body("price")
    .notEmpty()
    .withMessage("Price is required")
    .isFloat({ min: 1 })
    .withMessage("Price must be a positive number"),

  body("quantity")
    .notEmpty()
    .withMessage("Quantity is required")
    .isInt({ min: 1 })
    .withMessage("Quantity must be a positive integer"),
];
const validationSchemaForgetPassword = () => {
  return [
    body("email")
      .notEmpty()
      .withMessage("email can not be empty")
      .isEmail()
      .withMessage("email is not valid"),
  ];
};
const validationSchemaResetPassword = () => {
  return [
    body("password")
      .notEmpty()
      .withMessage("new password can not be empty")
      .isLength({ min: 8 })
      .withMessage("New password must be at least 8 characters long")
      .matches(/[0-9]/)
      .withMessage("New password must contain at least one number")
      .matches(/[a-zA-Z]/)
      .withMessage("New password must contain at least one letter"),
  ];
};
module.exports = {
  validationSchemaLogin,
  validationSchemaSignup,
  validationSchemaChangePassword,
  validationSchemaCreateProduct,
  validationSchemaBuyProduct,
  validationSchemaForgetPassword,
  validationSchemaResetPassword,
};
