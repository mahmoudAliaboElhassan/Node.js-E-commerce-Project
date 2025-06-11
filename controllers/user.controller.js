const httpStatusText = require("../utils/httpStatusText");
const asyncWrapper = require("../middlewares/asyncWrapper");
const appError = require("../utils/appError");
const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/generateToken");

const signup = asyncWrapper(async (req, res, next) => {
  const { name, email, password, role } = req.body;
  const avatar = req.file?.path || "/uploads/clothes.jpg";
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
    name,
    email,
    password: hashedPassword,
    role,
    avatar,
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
      const accessToken = await generateAccessToken({
        email: user.email,
        id: user._id,
        role: user.role,
      });
      const refreshToken = await generateRefreshToken({
        email: user.email,
        id: user._id,
        role: user.role,
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
      });
      res.cookie("JwtAcessToken", accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
      });
      res
        .status(200)
        .json({ status: httpStatusText.SUCESS, data: { user, accessToken } });
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
  const token = req.cookies.JwtAcessToken;
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
  return res.status(200).json({
    staus: httpStatusText.SUCESS,
    data: {
      message: "user password updated successfully",
    },
  });
});

const logout = asyncWrapper(async (req, res, next) => {
  res.clearCookie("JwtAcessToken");
  res.status(200).json({
    status: httpStatusText.SUCESS,
    data: { message: "user logged out successfully" },
  });
  return { message: "user logged out successfully" };
});

const refreshToken = asyncWrapper(async (req, res, err) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res
        .status(401)
        .json({ message: "No refresh token provided, please login" });
    }

    jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY, (err, decoded) => {
      if (err) {
        return res
          .status(403)
          .json({ message: "Refresh token expired, please login again" });
      }
      console.log("decoded from refresh", decoded);
      const newAccessToken = generateAccessToken({
        email: decoded.email,
        id: decoded._id,
        role: decoded.role,
      });
      res.cookie("JwtAcessToken", newAccessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
      });
      res.json({ newAccessToken });
    });
  } catch (error) {
    res.status(500).json({ message: "Error refreshing token", error });
  }
});
module.exports = { login, signup, change_password, logout, refreshToken };
