const httpStatusText = require("../utils/httpStatusText");
const asyncWrapper = require("../middlewares/asyncWrapper");
const appError = require("../utils/appError");
const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

const login = asyncWrapper(async (req, res, next) => {
  const { email, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = appError.create(
      errors
        .array()
        .map((error) => error.msg)
        .join(", "),
      400,
      httpStatusText.FAIL
    );
    return next(error);
  }

  const user = await User.findOne({ email: email });
  if (user) {
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
      const token = await generateAccessToken({
        email: user.email,
        id: user._id,
        role: user.role,
      });

      res.cookie("JwtToken", token);
      res
        .status(200)
        .json({ status: httpStatusText.SUCESS, data: { user, token } });
    } else {
      const error = appError.create(
        "Invalid password or email",
        400,
        httpStatusText.FAIL
      );
      return next(error);
    }
  } else {
    const error = appError.create(
      "Invalid password or email",
      400,
      httpStatusText.FAIL
    );
    return next(error);
  }
});

module.exports = { login };
