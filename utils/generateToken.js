// const jwt = require("jsonwebtoken");

// const generateAccessToken = async (payload) => {
//   const token = await jwt.sign(payload, process.env.JWT_SECRET_KEY, {
//     expiresIn: "5m",
//   });
//   return token;
// };
// const generateRefreshToken = async (payload) => {
//   const token = await jwt.sign(payload, process.env.JWT_SECRET_KEY, {
//     expiresIn: "10m",
//   });
//   console.log("from function", token);
//   return token;
// };

// module.exports = { generateAccessToken, generateRefreshToken };
