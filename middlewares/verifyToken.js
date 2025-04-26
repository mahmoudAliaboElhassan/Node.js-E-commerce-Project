const jwt = require("jsonwebtoken");
const appError = require("../utils/appError");
const httpStatusText = require("../utils/httpStatusText");

module.exports = (req, res, next) => {
  console.log("cookies", req.cookies);
  const token = req.cookies.JwtToken;

  if (!token) {
    const error = appError.create("Access denied", 401, httpStatusText.FAIL);
    return next(error);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    console.log(decoded);
    next();
  } catch (err) {
    const error = appError.create("Invalid token", 403, httpStatusText.FAIL);
    return next(error);
  }
};
