const mongoose = require("mongoose");
const orderStatus = require("../utils/orderStatus");

const orderSchema = new mongoose.Schema({
  quantity: {
    type: Number,
    min: [1, "Must be at least 1, got {VALUE}"],
    required: true,
  },
  totalPrice: {
    type: Number,
    min: [1, "Must be at least 10, got {VALUE}"],
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: [1, "Price must be a positive number"],
  },
  status: {
    type: String,
    enum: [orderStatus.PENDING, orderStatus.SHIPPED, orderStatus.DELIVERED],
    default: orderStatus.PENDING,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
});

module.exports = mongoose.model("Order", orderSchema);
