const jwt = require("jsonwebtoken");

const generateAccessToken = (payload) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
    expiresIn: "15m",
  });
  return token;
};
const generateRefreshToken = (payload) => {
  const token = jwt.sign(payload, process.env.JWT_REFRESH_KEY, {
    expiresIn: "7d",
  });
  console.log("from function", token);
  return token;
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
};
