const express = require("express");
const router = express.Router();
// const {
//   validationSchemaLogin,
//   validationSchemaSignup,
//   validationSchemaChangePassword,
// } = require("../middlewares/validationSchema");

const orderController = require("../controllers/order.controller");
const verifyAdmin = require("../middlewares/verifyAdmin");

router.route("/").get(verifyAdmin, orderController.getAllOrders);
router
  .route("/:id")
  .get(verifyAdmin, orderController.getOrderById)
  .put(verifyAdmin, orderController.updateOrderStatus);

module.exports = router;
