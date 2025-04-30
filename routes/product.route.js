const express = require("express");
const router = express.Router();
const {
  validationSchemaCreateProduct,
  validationSchemaBuyProduct,
} = require("../middlewares/validationSchema");

const productController = require("../controllers/product.controller");
const verifyAdmin = require("../middlewares/verifyAdmin");
const verifyToken = require("../middlewares/verifyToken");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../utils/cloud");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "products",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    public_id: (req, file) => `${Date.now()}-${file.originalname}`,
  },
});

const upload = multer({ storage });
router
  .route("/")
  .get(productController.getAllProducts)
  .post(
    verifyAdmin,
    upload.fields([
      { name: "productCover", maxCount: 1 },
      { name: "productImgs", maxCount: 5 },
    ]),
    validationSchemaCreateProduct(),
    productController.createProduct
  );

router
  .route("/:id")
  .get(productController.getProductById)
  .put(
    verifyAdmin,
    upload.fields([
      { name: "productCover", maxCount: 1 },
      { name: "productImgs", maxCount: 5 },
    ]),
    validationSchemaCreateProduct(),
    productController.updateProduct
  )
  .delete(verifyAdmin, productController.deleteProduct);

router
  .route("/buy/:id")
  .post(
    verifyToken,
    validationSchemaBuyProduct(),
    productController.buyProduct
  );
module.exports = router;
