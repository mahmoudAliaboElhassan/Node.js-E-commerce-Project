const httpStatusText = require("../utils/httpStatusText");
const asyncWrapper = require("../middlewares/asyncWrapper");
const appError = require("../utils/appError");
const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const { generateAccessToken } = require("../utils/generateToken");

const signup = asyncWrapper(async (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;
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
    const error = appError.create(
      "this email exists before",
      400,
      httpStatusText.FAIL
    );
    return next(error);
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const newUser = new User({
    firstName,
    lastName,
    email,
    password: hashedPassword,
  });
  await newUser.save();
  res.status(201).json({
    status: httpStatusText.SUCESS,
    data: { user: newUser },
  });
  return { message: "user created successfully" };
});
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

const change_password = asyncWrapper(async (req, res, next) => {
  const token = req.cookies.JwtToken;
  const { id } = req.params;
  const { password, newPassword } = req.body;
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
  const user = await User.findOne({ _id: id });
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  console.log("decoded", decoded);
  console.log("decoded.id", decoded.id);
  console.log("user", user);
  console.log("user.id", user?._id.toString());
  if (!user) {
    const error = appError.create(
      "This user is not exists",
      404,
      httpStatusText.FAIL
    );
    return next(error);
  }

  if (decoded.id != user._id) {
    const error = appError.create(
      "user himself only can change email",
      403,
      httpStatusText.FAIL
    );
    return next(error);
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    const error = appError.create(
      "password does not match",
      400,
      httpStatusText.FAIL
    );
    return next(error);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update the password
  await User.findByIdAndUpdate(id, { password: hashedPassword });
  res.json({
    staus: httpStatusText.SUCESS,
    data: {
      message: "user password updated successfully",
    },
  });
});
module.exports = { login, signup, change_password };
