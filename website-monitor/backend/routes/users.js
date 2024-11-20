const express = require("express");
const { check, body } = require("express-validator");
const {
  createUser,
  verifyUser,
  loginUser,
  logoutUser,
  forgotPassword,
  resetPassword,
  googleLogin,
} = require("../controllers/users");
const Users = require("../models/users");
const { refreshAccessToken } = require("../controllers/tokens");
const authenticate = require("../middleware/authenticate");
const router = express.Router();

router.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .normalizeEmail()
      .custom(async (value) => {
        const userDoc = await Users.findOne({ email: value });
        if (userDoc) {
          throw new Error("Email already exists, please pick a different one.");
        }
        return true;
      }),

    body("name")
      .notEmpty()
      .withMessage("Name is required.")
      .isString()
      .withMessage("Name must be a string.")
      .trim(),

    body("username")
      .optional()
      .isString()
      .withMessage("Username must be a string.")
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters long.")
      .trim(),

    body("password")
      .isLength({ min: 6 })
      .withMessage("Please enter a password with at least 6 characters.")
      .trim(),

    check("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match!");
      }
      return true;
    }),
  ],
  createUser
);

router.put("/verify/:userId/:token", verifyUser);

router.post("/google-login", googleLogin);
router.post("/login", loginUser);
router.post("/refresh", refreshAccessToken);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/logout", logoutUser);

module.exports = router;
