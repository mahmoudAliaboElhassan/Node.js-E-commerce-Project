const jwt = require("jsonwebtoken");
const appError = require("../utils/appError");
const userRoles = require("../utils/roles");
const httpStatusText = require("../utils/httpStatusText");

module.exports = (req, res, next) => {
  console.log("cookies", req.cookies);
  const token = req.cookies.JwtAcessToken;

  if (!token) {
    const error = appError.create("Access denied", 401, httpStatusText.FAIL);
    return next(error);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    if (decoded.role !== userRoles.ADMIN) {
      const error = appError.create("Forbidden", 403, httpStatusText.FAIL);
      return next(error);
    }
    next();
  } catch (err) {
    const error = appError.create("Invalid token", 403, httpStatusText.FAIL);
    return next(error);
  }
};
