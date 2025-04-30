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

app.get("/hello", (req, res) => {
  res.send("home page");
});
app.use("/api/users", userRouter);
app.use("/api/products", productRouter);

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
