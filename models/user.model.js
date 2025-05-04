const mongoose = require("mongoose");
var validator = require("validator");
const userRoles = require("../utils/roles");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    min: [3, "Must be at least 3, got {VALUE}"],
    required: true,
  },
 
  email: {
    type: String,
    required: true,
    unique: true, // This field must be unique in the database
    validate: [validator.isEmail, "Invalid email"],
  },
  password: {
    type: String,
    required: true,
    min: [6, "Password must be at least 6 characters long"],
    validate: [validator.isStrongPassword, "Password is not strong enough"],
  },
  token: {
    type: String,
  },
  role: {
    type: String,
    enum: [userRoles.ADMIN, userRoles.MANAGER, userRoles.USER],
    default: userRoles.USER,
  },
  avatar: {
    type: String,
    default: "/uploads/clothes.jpg",
  },
  productsBought: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
  ],
  productsUploaded: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
  ],
});

module.exports = mongoose.model("User", userSchema);
