const asyncWrapper = require("../middlewares/asyncWrapper");
const User = require("../models/user.model");
const appError = require("../utils/appError");
const httpStatusText = require("../utils/httpStatusText");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const { validationResult } = require("express-validator");

const sendForgotPasswordLink = asyncWrapper(async (req, res, next) => {
  const { email } = req.body;
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
  const user = await User.findOne({ email: email });
  if (!user) {
    const error = appError.create("User not Fount", 404, httpStatusText.FAIL);
    return next(error);
  }
  console.log("user", user);
  const secret = process.env.JWT_SECRET_KEY + user.password;
  const token = jwt.sign({ email: user.email, id: user._id }, secret, {
    expiresIn: "10m",
  });
  const link = `${process.env.BASE_URL}/api/user-password/reset/${user._id}/${token}`;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      // sender
      user: process.env.USER_EMAIL,
      // app password for gmail
      pass: process.env.USER_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.USER_EMAIL,
    to: user.email,
    subject: "Reset Password",
    html: `<div style="color:"red";>
    <h4>click on the link below to reset your password</h4>
    <p>${link}</p>
    <a 
  style="text-decoration: none; background-color: green; padding: 10px 8px; color: white; border-radius: 8px; font-size: 18px; display: flex; justify-content: center; align-items: center; width: fit-content; margin: auto;" 
  href=${link}>
  Click here
</a>

    </div>  
 `,
  };
  transporter.sendMail(mailOptions, (err, success) => {
    if (err) {
      console.log("error", err);
    } else {
      console.log("Email sent: ", success.response);
    }
  });
  res.json({
    status: httpStatusText.SUCESS,
    data: {
      message: "link sent to your email",
    },
  });
});

// front
// const getPasswordResetView = asyncWrapper(async (req, res, next) => {
//   const { id, token } = req.params;
//   const user = await User.findById(id);
//   if (!user) {
//     const error = appError.create("User not Fount", 404, httpStatusText.FAIL);
//     return next(error);
//   }
//   console.log("user", user);
//   console.log("token", token);

//   const secret = process.env.JWT_SECRET_KEY + user.password;
//   // to check if is it is valid user not entered by url by human not server
//   // i mean token

//   jwt.verify(token, secret);

//   res.render("reset-password", { email: user.email });
// });

const resetPassword = asyncWrapper(async (req, res, next) => {
  const { id, token } = req.params;
  const { password } = req.body;

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

  const user = await User.findById(id);
  if (!user) {
    const error = appError.create("User not Fount", 404, httpStatusText.FAIL);
    return next(error);
  }
  console.log("user", user);
  console.log("token", token);

  const secret = process.env.JWT_SECRET_KEY + user.password;

  // link will be expired after change password
  // to  make it for one time as it verify by token and (signature or secret)
  // will not be valid
  jwt.verify(token, secret);

  const hashedPassword = await bcrypt.hash(password, 10);

  // Update the password
  await User.findByIdAndUpdate(user.id, { password: hashedPassword });
  return res.json({
    staus: httpStatusText.SUCESS,
    data: {
      message: "user password updated successfully",
    },
  });

  // res.render("reset-password", { email: user.email });
});

module.exports = {
  //   getForgetPage,
  sendForgotPasswordLink,
  //   getPasswordResetView,
  resetPassword,
};
