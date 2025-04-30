const asyncWrapper = require("../middlewares/asyncWrapper");
const Order = require("../models/order.model");
const appError = require("../utils/appError");
const httpStatusText = require("../utils/httpStatusText");

const getAllOrders = asyncWrapper(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const orders = await Order.find()
    .populate("user", "-password")
    .populate("product", "-password")
    .skip(skip)
    .limit(limit);

  const totalOrders = await Order.countDocuments();

  res.status(200).json({
    status: httpStatusText.SUCESS,
    message: "Orders fetched successfully",
    data: {
      total: totalOrders,
      page,
      pages: Math.ceil(totalOrders / limit),
      count: orders.length,
      orders,
    },
  });
});
const getOrderById = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;
  const order = await Order.findById(id)
    .populate("user", "-password")
    .populate("product");
  if (!order) {
    const error = appError.create("Order not found", 404);
    return next(error);
  }
  res.status(200).json({
    status: httpStatusText.SUCESS,
    message: "Order fetched successfully",
    data: {
      order,
    },
  });
});

const updateOrderStatus = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    const error = appError.create("Order status is required", 400);
    return next(error);
  }

  const order = await Order.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  )
    .populate("user", "-password")
    .populate("product");

  if (!order) {
    const error = appError.create("Order not found", 404);
    return next(error);
  }

  res.status(200).json({
    status: httpStatusText.SUCESS,
    message: "Order status updated successfully",
    data: { order },
  });
});

module.exports = { getAllOrders, getOrderById, updateOrderStatus };
