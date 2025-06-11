const request = require("supertest");
const app = require("../index");
const Product = require("../models/porduct.model");
const User = require("../models/user.model");
const path = require("path");
const jwt = require("jsonwebtoken");
const { generateAccessToken } = require("../utils/generateToken");

// ─────────────────────────────────────────────
// MOCK MIDDLEWARES
// ─────────────────────────────────────────────
jest.mock("../middlewares/verifyAdmin.js", () => (req, res, next) => next());
jest.mock("../middlewares/verifyToken.js", () => (req, res, next) => next());
jest.mock("../middlewares/validationSchema.js", () => ({
  validationSchemaCreateProduct: () => (req, res, next) => next(),
  validationSchemaBuyProduct: () => (req, res, next) => next(),
  validationSchemaSignup: () => (req, res, next) => next(),
  validationSchemaLogin: () => (req, res, next) => next(),
  validationSchemaChangePassword: () => (req, res, next) => next(),
  validationSchemaForgetPassword: () => (req, res, next) => next(),
  validationSchemaResetPassword: () => (req, res, next) => next(),
}));

// ─────────────────────────────────────────────
// TEST SUITE
// ─────────────────────────────────────────────
describe("Product Routes", () => {
  let testProduct, testUser;

  const testFilePath = path.resolve(__dirname, "./assets/img1.jpg");
  const testFileCover = path.resolve(__dirname, "./assets/cover.jpg");

  const createAdminUser = async () => {
    let admin = await User.findOne({ role: "ADMIN" });
    if (!admin) {
      admin = new User({
        firstName: "Admin",
        lastName: "User",
        email: "admin@example.com",
        password: "hashe12354JKL*dpassword",
        role: "ADMIN",
      });
      await admin.save();
    }
    return admin;
  };

  const createTestProduct = async (sellerId) => {
    return await new Product({
      title: "Test Product",
      description: "Test Description",
      price: 990.99,
      quantity: 10,
      seller: sellerId,
      productCover: "/uploads/test.jpg",
      productImgs: ["/uploads/test.jpg"],
    }).save();
  };

  beforeEach(async () => {
    await Product.deleteMany({ title: /^Test/ });
    await User.deleteMany({ email: /^test/ });

    testUser = await createAdminUser();
    testProduct = await createTestProduct(testUser._id);
  });

  afterEach(async () => {
    await Product.deleteMany({ title: /^Test/ });
    await User.deleteMany({ email: /^test/ });
  });

  // ──────────── GET PRODUCTS ────────────
  it("GET /products - should return all products", async () => {
    const res = await request(app).get("/api/products");

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("success");
    expect(Array.isArray(res.body.data.products)).toBe(true);
    expect(res.body.data.total).toBeDefined();
    expect(res.body.data.count).toBeDefined();
  });

  it("GET /products/:id - should return 200 if product exists", async () => {
    const res = await request(app).get(`/api/products/${testProduct._id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.product).toBeDefined();
  });
  // it("POST /products/:id/buy - should return 200 for valid purchase", async () => {
  //   const user = new User({
  //     name: "Test Buyer",
  //     email: "testbuyer@example.com",
  //     password: "hashe123fJH(dpassword",
  //     role: "USER",
  //   });
  //   await user.save();
  //   const accessToken = generateAccessToken({
  //     email: user.email,
  //     id: user._id,
  //     role: user.role,
  //   });
  //   const res = await request(app)
  //     .post(`/api/products/${testProduct._id}/buy`)
  //     .set("Cookie", [`JwtAcessToken=${accessToken}`])
  //     .send({ price: testProduct.price * 2, quantity: 2 });

  //   expect(res.statusCode).toBe(200);
  //   expect(res.body.data.message).toBe("Product purchased successfully");

  //   await User.findByIdAndDelete(buyer._id);
  //   jwt.verify.mockRestore();
  // });

  it("GET /products/:id - should return 404 if product not found", async () => {
    const nonExistentId = "60d21b4667d0d8992e610c85";
    const res = await request(app).get(`/api/products/${nonExistentId}`);
    expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe("fail");
  });

  // ──────────── CREATE PRODUCT ────────────
  it("POST /products - should return 201 for valid product creation", async () => {
    const res = await request(app)
      .post("/api/products")
      .field("title", "test_product")
      .field("description", "this is a test image")
      .field("price", "120")
      .field("quantity", "25")
      .field("seller", testUser._id.toString())
      .attach("productImgs", testFilePath)
      .attach("productCover", testFileCover);

    expect(res.statusCode).toBe(201);
    expect(res.body.data.product).toBeDefined();
  });

  it("POST /products - should return 500 for invalid quantity", async () => {
    const res = await request(app)
      .post("/api/products")
      .field("title", "test_product")
      .field("description", "this is a test image")
      .field("price", "120")
      .field("quantity", "-25")
      .field("seller", testUser._id.toString())
      .attach("productImgs", testFilePath)
      .attach("productCover", testFileCover);

    expect(res.statusCode).toBe(500);
    expect(res.body.status).toBe("error");
  });

  // ──────────── UPDATE PRODUCT ────────────
  it("PUT /products/:id - should return 200 for valid update", async () => {
    const res = await request(app)
      .put(`/api/products/${testProduct._id}`)
      .field("price", "200");

    expect(res.statusCode).toBe(200);
    expect(res.body.data.product).toBeDefined();
  });

  it("PUT /products/:id - should return 404 if product not found", async () => {
    const res = await request(app)
      .post("/api/products/60d21b4667d0d8992e610c85")
      .field("quantity", "22");

    expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe("fail");
  });

  // ──────────── DELETE PRODUCT ────────────
  it("DELETE /products/:id - should return 200 if product deleted", async () => {
    const res = await request(app).delete(`/api/products/${testProduct._id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("success");
  });

  it("DELETE /products/:id - should return 404 if product not found", async () => {
    const res = await request(app).delete(
      "/api/products/60d21b4667d0d8992e610c85"
    );
    expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe("fail");
  });

  // ──────────── BUY PRODUCT ────────────

  it("POST /products/:id/buy - should return 404 if product does not exist", async () => {
    const res = await request(app)
      .post(`/api/products/60d21b4667d0d8992e610c85/buy`)
      .send({ price: 100, quantity: 1 });

    expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe("fail");
  });
});
