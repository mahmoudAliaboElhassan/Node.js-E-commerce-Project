console.log("Hello from node.js ecommerce project");
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const httpStatusText = require("./utils/httpStatusText");

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use(helmet());
app.use(cors());

const userRouter = require("./routes/user.route");
const productRouter = require("./routes/product.route");
const orderRouter = require("./routes/order.rotue");

const url = process.env.MONGO_URL;
mongoose
  .connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 20000,
  })
  .then(() => {
    console.log("connected Successfully ");
  })
  .catch((err) => {
    console.log("error in connection", err);
  });

app.get("", (req, res) => {
  res.send(
    "<h1>Welcome to the ecommerce project</h1><br><h2>API Documentation</h2><br><a href='https://app.getpostman.com/join-team?invite_code=5962b4518ca0f7614c66dd9b10c6d7428ed6a2dcf7dc165b1222831c979182f3&target_code=8d36ea9e5ca278fe46c9b1767cda657c'>Click here</a>"
  );
});
app.use("/api/users", userRouter);
app.use("/api/products", productRouter);
app.use("/api/products", productRouter);
app.use("/api/orders", orderRouter);

app.all(/.*/, (req, res, next) => {
  // every request will pass through this middleware
  res.status(404).json({
    status: httpStatusText.FAIL,
    message: "page not found",
    data: null,
    code: 404,
  });
});

app.use((err, req, res, next) => {
  if (err.statusCode) {
    res.status(err.statusCode || 500).json({
      status: err.statusText,
      data: { error: err.message },
    });
  } else {
    res.status(500).json({
      status: err.statusText,
      message: err.message,
      code: 500,
      data: null,
    });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`running on port ${process.env.PORT}`);
});

const crypto = require("crypto");
const jwtSecretKey = crypto.randomBytes(32).toString("hex");
console.log(jwtSecretKey);
// to create jwt secret key
