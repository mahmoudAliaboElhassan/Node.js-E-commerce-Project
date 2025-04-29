const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const Product = require("../models/porduct.model");
const User = require("../models/user.model");
const httpStatusText = require("../utils/httpStatusText");
const asyncWrapper = require("../middlewares/asyncWrapper");
const appError = require("../utils/appError");

const getAllProducts = asyncWrapper(async (req, res, next) => {
  let {
    search = "",
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    order = "desc",
    priceMin,
    priceMax,
    seller,
  } = req.query;

  page = parseInt(page);
  limit = parseInt(limit);

  const filter = {};

  // Search by title or description
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  // Filter by price range
  if (priceMin || priceMax) {
    filter.price = {};
    if (priceMin) filter.price.$gte = Number(priceMin);
    if (priceMax) filter.price.$lte = Number(priceMax);
  }

  // Filter by seller
  if (seller) {
    filter.seller = seller;
  }

  const totalProducts = await Product.countDocuments(filter);

  const products = await Product.find(filter)
    .populate("seller", "-password") // populate seller without password
    .populate("buyers", "-password") // populate buyers without password
    .sort({ [sortBy]: order === "asc" ? 1 : -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  res.status(200).json({
    status: httpStatusText.SUCESS,
    data: {
      total: totalProducts,
      page,
      pages: Math.ceil(totalProducts / limit),
      count: products.length,
      products,
    },
  });
});

const getProductById = asyncWrapper(async (req, res, next) => {
  const productId = req.params.id;
  const product = await Product.findById(productId)
    .populate("seller", "-password") // populate seller without password
    .populate("buyers", "-password"); // populate buyers without password
  if (!product) {
    const error = appError.create(
      "Product not found",
      404,
      httpStatusText.FAIL
    );
    return next(error);
  }
  res.status(200).json({
    status: httpStatusText.SUCESS,
    data: { product },
  });
  return { message: "product found successfully" };
});

const createProduct = asyncWrapper(async (req, res, next) => {
  const { title, description, price, quantity, seller } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = appError.create(
      errors
        .array()
        .map((error) => error.msg)
        .join(", "),
      400,
      httpStatusText.FAIL
    );
    return next(error);
  }
  const productCover =
    req.files["productCover"]?.[0]?.path || "/uploads/clothes.jpg";
  const productImgs = req.files["productImgs"]?.map((file) => file.path) || [
    "/uploads/clothes.jpg",
  ];
  const newProduct = new Product({
    title,
    description,
    price,
    quantity,
    seller,
    productCover,
    productImgs,
  });
  await newProduct.save();
  res.status(201).json({
    status: httpStatusText.SUCESS,
    data: { product: newProduct },
  });
  return { message: "product created successfully" };
});

const updateProduct = asyncWrapper(async (req, res, next) => {
  const productId = req.params.id;
  console.log("productId", productId);
  const product = await Product.findById(productId);
  if (!product) {
    const error = appError.create(
      "Product not found",
      404,
      httpStatusText.FAIL
    );
    return next(error);
  }

  const { title, description, price, quantity, seller } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = appError.create(
      errors
        .array()
        .map((error) => error.msg)
        .join(", "),
      400,
      httpStatusText.FAIL
    );
    return next(error);
  }
  const productCover =
    req.files["productCover"]?.[0]?.path || "/uploads/clothes.jpg";
  const productImgs = req.files["productImgs"]?.map((file) => file.path) || [
    "/uploads/clothes.jpg",
  ];
  const updatedProduct = await Product.findByIdAndUpdate(
    productId,
    {
      title,
      description,
      price,
      quantity,
      seller,
      productCover,
      productImgs,
    },
    { new: true }
  );
  res.status(200).json({
    status: httpStatusText.SUCESS,
    data: { product },
  });
  return {
    message: "product updated successfully",
    productAfterUpdate: updatedProduct,
  };
});
const deleteProduct = asyncWrapper(async (req, res, next) => {
  const productId = req.params.id;
  console.log("productId", productId);
  const product = await Product.findById(productId);
  if (!product) {
    const error = appError.create(
      "Product not found",
      404,
      httpStatusText.FAIL
    );
    return next(error);
  }

  const deletedProduct = await Product.findByIdAndDelete(productId);
  res.status(200).json({
    status: httpStatusText.SUCESS,
    data: { product },
  });
  return {
    message: "product deleted successfully",
    deletedProduct,
  };
});

const buyProduct = asyncWrapper(async (req, res, next) => {
  const token = req.cookies.JwtToken;
  console.log("token", token);

  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

  const userId = decoded.id;
  const productId = req.params.id;
  const { price } = req.body;

  const product = await Product.findById(productId);
  if (!product) {
    return next(appError.create("Product not found", 404, httpStatusText.FAIL));
  }

  if (product.seller.toString() === userId) {
    return next(
      appError.create(
        "You cannot buy your own product",
        400,
        httpStatusText.FAIL
      )
    );
  }

  // Check price match
  if (price !== product.price) {
    return next(
      appError.create("Incorrect price provided", 400, httpStatusText.FAIL)
    );
  }

  if (product.quantity < 1) {
    return next(
      appError.create("Product is out of stock", 400, httpStatusText.FAIL)
    );
  }

  if (product.buyers.includes(userId)) {
    return next(
      appError.create(
        "You have already bought this product",
        400,
        httpStatusText.FAIL
      )
    );
  }

  // Update product
  product.buyers.push(userId);
  product.quantity -= 1;

  // Update user
  const user = await User.findById(userId);
  user.productsBought.push(productId);

  // Save changes
  await product.save();
  await user.save();

  res.status(200).json({
    status: httpStatusText.SUCESS,
    data: {
      message: "Product purchased successfully",
      productId,
      buyerId: userId,
    },
  });
});

module.exports = {
  getAllProducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  buyProduct,
};
