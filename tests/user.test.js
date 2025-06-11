const request = require("supertest");
const app = require("../index");
const User = require("../models/user.model");
const path = require("path");
const bcrypt = require("bcrypt");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/generateToken");

// ─────────────────────────────────────────────
// MOCK MIDDLEWARES
// ─────────────────────────────────────────────
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
describe("User Routes", () => {
  let testUser;
  const testAvatarPath = path.resolve(__dirname, "./assets/avatar.jpg");

  const strongPassword = "Str0ngP@ssw0rd!";

  beforeEach(async () => {
    await User.deleteMany({ email: /^test/ });
    testUser = await new User({
      name: "Test User",
      email: "testuser123@example.com",
      password: strongPassword, // pre-hashed not needed since hash happens in signup
      role: "USER",
      avatar: "/uploads/avatar.jpg",
    }).save();
  });

  afterEach(async () => {
    await User.deleteMany({ email: /^test/ });
  });

  // ──────────── SIGNUP TESTS ────────────
  it("POST /signup - 201 for valid registration", async () => {
    const uniqueEmail = `user${Date.now()}@example.com`;
    const userData = {
      name: "New Test",
      email: uniqueEmail,
      password: strongPassword,
      role: "USER",
    };

    const res = await request(app)
      .post("/api/users/signup")
      .field("name", userData.name)
      .field("email", userData.email)
      .field("password", userData.password)
      .field("role", userData.role)
      .attach("avatar", testAvatarPath);

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe("success");
    expect(res.body.data.user.email).toBe(userData.email);
  });

  it("POST /signup - 400 for existing email", async () => {
    const res = await request(app).post("/api/users/signup").send({
      name: "Test User",
      email: testUser.email,
      password: strongPassword,
      role: "USER",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe("fail");
  });

  it("POST /signup - 500 for invalid signup data because of error in schema", async () => {
    const res = await request(app)
      .post("/api/users/signup")
      .send({ name: "", email: "bademail", password: "weak", role: "INVALID" });

    expect(res.statusCode).toBe(500);
    expect(res.body.status).toBe("error");
  });

  // ──────────── LOGIN TESTS ────────────
  it("POST /login - 200 for valid login", async () => {
    const loginEmail = "loginuser@example.com";
    const plain = strongPassword;
    const hashed = await bcrypt.hash(plain, 10);

    const loginUser = new User({
      name: "Login User",
      email: loginEmail,
      password: hashed,
      role: "USER",
    });
    await loginUser.save();

    const res = await request(app).post("/api/users/login").send({
      email: loginEmail,
      password: plain,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data.user.email).toBe(loginEmail);
    expect(res.body.data.accessToken).toBeDefined();

    await User.findByIdAndDelete(loginUser._id);
  });

  it("POST /login - 400 for invalid email", async () => {
    const res = await request(app)
      .post("/api/users/login")
      .send({ email: "notfound@example.com", password: strongPassword });

    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe("fail");
  });

  it("POST /login - 400 for wrong password", async () => {
    const loginEmail = testUser.email;
    const res = await request(app)
      .post("/api/users/login")
      .send({ email: loginEmail, password: "WrongP@ssw0rd!" });

    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe("fail");
  });

  // ──────────── LOGOUT TEST ────────────
  it("POST /logout - 200 and clears cookie", async () => {
    const token = generateAccessToken({
      email: testUser.email,
      id: testUser._id,
      role: testUser.role,
    });

    const res = await request(app)
      .post("/api/users/logout")
      .set("Cookie", [`JwtAcessToken=${token}`]);

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("success");
  });

  // ──────────── CHANGE PASSWORD TESTS ────────────
  it("200 for valid password change", async () => {
    const strongPassword = "Str0ng$Pass123";
    const newStrongPassword = "An0ther$trong1";
    const uniqueEmail = `changepass${Date.now()}@example.com`;

    // Create a user
    const user = new User({
      name: "ChangePass",
      email: uniqueEmail,
      password: await bcrypt.hash(strongPassword, 10),
      role: "USER",
    });
    await user.save();

    const token = generateAccessToken({
      email: user.email,
      id: user._id,
      role: user.role,
    });

    const res = await request(app)
      .post(`/api/users/change-password/${user._id}`)
      .set("Cookie", [`JwtAcessToken=${token}`])
      .send({
        password: strongPassword,
        newPassword: newStrongPassword,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data.message).toBe("User password updated successfully");

    // Clean up
    await User.findByIdAndDelete(user._id);
  });

  it("POST /change-password/:id - 404 for non-existing user", async () => {
    const fakeId = "60d21b4667d0d8992e610c85";
    const token = generateAccessToken({
      email: "test@example.com",
      id: fakeId,
      role: "USER",
    });

    const res = await request(app)
      .post(`/api/users/change-password/${fakeId}`)
      .set("Cookie", [`JwtAcessToken=${token}`])
      .send({ password: strongPassword, newPassword: "NewPass!2" });

    expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe("fail");
  });

  it("POST /change-password/:id - 400 when old password wrong", async () => {
    const WrongPasswordUserEmail = `wrongold${Date.now()}@example.com`;
    const user = new User({
      name: "WrongOld",
      email: WrongPasswordUserEmail,
      password: await bcrypt.hash(strongPassword, 10),
      role: "USER",
    });
    await user.save();

    const token = generateAccessToken({
      email: user.email,
      id: user._id,
      role: user.role,
    });

    const res = await request(app)
      .post(`/api/users/change-password/${user._id}`)
      .set("Cookie", [`JwtAcessToken=${token}`])
      .send({ password: "BadP@ss1!", newPassword: "Yetan0ther$1" });

    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe("fail");

    await User.findByIdAndDelete(user._id);
  });

  // ──────────── REFRESH TOKEN TESTS ────────────
  it("POST /refresh-token - 200 with valid refresh", async () => {
    const refresh = generateRefreshToken({
      email: testUser.email,
      id: testUser._id,
      role: testUser.role,
    });

    const res = await request(app)
      .post("/api/users/refresh-token")
      .set("Cookie", [`refreshToken=${refresh}`]);

    expect(res.statusCode).toBe(200);
    expect(res.body.newAccessToken).toBeDefined();
  });

  it("POST /refresh-token - 401 without refresh", async () => {
    const res = await request(app).post("/api/users/refresh-token");
    expect(res.statusCode).toBe(401);
  });

  it("POST /refresh-token - 403 with invalid refresh", async () => {
    const res = await request(app)
      .post("/api/users/refresh-token")
      .set("Cookie", [`refreshToken=invalid.token.here`]);

    expect(res.statusCode).toBe(403);
  });
});
