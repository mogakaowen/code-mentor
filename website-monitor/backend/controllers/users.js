require("dotenv").config();

const axios = require("axios");
const admin = require("../utils/firebase");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { validationResult } = require("express-validator");
const Users = require("../models/users");
const Token = require("../models/tokens");
const Website = require("../models/website");
const Notification = require("../models/notification");
const StatusLog = require("../models/status-log");
const Report = require("../models/report");
const { createToken } = require("./tokens");

const { stopMonitoring, monitorWebsites } = require("../middleware/monitor");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.USER,
    pass: process.env.PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

exports.googleLogin = async (req, res, next) => {
  const { idToken, googleToken } = req.body;
  try {
    const response = await axios.get(
      `https://oauth2.googleapis.com/tokeninfo?access_token=${googleToken}`
    );
    // If the token is valid, the response contains token details
    const tokenInfo = response.data;

    // Check token's audience to ensure it matches your project
    if (tokenInfo.aud !== process.env.GOOGLE_CLIENT_ID) {
      return res.status(401).json({ message: "Invalid token audience" });
    }

    const payload = await admin.auth().verifyIdToken(idToken); // Use Firebase Admin SDK

    // Check if the user exists
    let user = await Users.findOne({ email: payload.email });

    if (!user) {
      // If user doesn't exist, create a new one
      user = new Users({
        email: payload.email,
        name: payload.name,
        username: payload.name, // Optionally use the name or any logic to set a username
        password: `google-auth@${payload.email}`, // Set a dummy password for Google sign-in users
        verified: true, // Google sign-in users are considered verified
      });
      await user.save();
    }

    // Generate access token with 5-minute expiration
    const accessToken = jwt.sign(
      {
        email: user.email,
        id: user._id,
        type: "access",
        tokenVersion: user.tokenVersion,
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "1m",
      }
    );

    // Generate refresh token with 1-day expiration
    const refreshToken = jwt.sign(
      {
        email: user.email,
        id: user._id,
        type: "refresh",
        tokenVersion: user.tokenVersion,
      },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: "1d",
      }
    );

    user.isLoggedIn = true;
    await user.save();

    // Start monitoring for the logged-in user
    await monitorWebsites(user);

    // Set the refresh token as an HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 24 * 60 * 60 * 1000,
      path: "/", // Make the cookie available across all routes
    });
    res.send({
      message: "User logged in successfully via Google.",
      accessToken,
      user: {
        email: user.email,
        name: user.name,
        username: user.username,
      },
    });
  } catch (error) {
    console.error("Google login error:", error);
    next(error);
  }
};

exports.createUser = async (req, res, next) => {
  const { email, name, username, password } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).send({ errors: errors.array() });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new Users({
      email,
      name,
      username,
      password: hashedPassword,
    });

    const createdUser = await user.save();
    const createdToken = await createToken(createdUser._id, 3600);
    const url = `${process.env.BASE_URL}/auth/verify/${createdUser._id}/${createdToken.token}`;

    // Send verification email here
    const mailOptions = {
      from: process.env.USER,
      to: email,
      subject: "Verify your email",
      html: `<p>Click <a href="${url}">here</a> to verify your email.</p>`, // Corrected line
    };

    try {
      await transporter.sendMail(mailOptions);
      res.send({
        message: "User created successfully. Please verify your email.",
      });
    } catch (emailError) {
      // If sending email fails, delete the created user
      await Users.deleteOne({ _id: createdUser._id });
      await Token.deleteOne({ _id: createdToken._id });
      console.error("Failed to send email:", emailError);
      res
        .status(500)
        .send({ error: "Could not send verification email, signup failed." });
    }
  } catch (err) {
    res.status(500).send({ error: "Could not create user." });
  }
};

exports.verifyUser = async (req, res, next) => {
  const { userId, token } = req.params;
  try {
    const user = await Users.findOne({ _id: userId });

    if (!user) {
      return res.status(404).send({ error: "User not found." });
    }

    const userToken = await Token.findOne({ userID: user._id, token });

    if (!userToken) {
      return res.status(404).send({ error: "Verification token not found." });
    }

    user.verified = true;

    await user.save();

    // Delete the token after verification
    await Token.deleteOne({ _id: userToken._id });

    res.send({ message: "User verified successfully." });
  } catch (err) {
    next(err);
  }
};

exports.loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await Users.findOne({ email });

    if (!user) {
      return res.status(404).send({ error: "User not found." });
    }

    if (!user.verified) {
      return res.status(403).send({
        error: "User not verified. Please verify your account to login.",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(403).send({ error: "Incorrect password." });
    }

    // Generate access token with 5-minute expiration
    const accessToken = jwt.sign(
      {
        email: user.email,
        id: user._id,
        type: "access",
        tokenVersion: user.tokenVersion,
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "5m",
      }
    );

    // Generate refresh token with 1-day expiration
    const refreshToken = jwt.sign(
      {
        email: user.email,
        id: user._id,
        type: "refresh",
        tokenVersion: user.tokenVersion,
      },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: "1d",
      }
    );

    user.isLoggedIn = true;
    await user.save();

    // Start monitoring for the logged-in user
    await monitorWebsites(user);

    // Set the refresh token as an HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 24 * 60 * 60 * 1000,
      path: "/", // Make the cookie available across all routes
    });

    res.send({
      message: "User logged in successfully.",
      accessToken,
      user: {
        email: user.email,
        name: user.name,
        username: user.username,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.logoutUser = async (req, res, next) => {
  const { email } = req.body;

  try {
    // Find the user by email
    const user = await Users.findOne({ email });

    // Stop monitoring for the logged-in user
    await stopMonitoring(user._id);

    // Update the user to increment tokenVersion and set isLoggedIn to false
    await Users.findByIdAndUpdate(user._id, {
      $inc: { tokenVersion: 1 },
      isLoggedIn: false,
    });

    // Clear the refresh token cookie
    res.clearCookie("refreshToken");

    res.status(200).send({ message: "User logged out successfully." });
  } catch (err) {
    console.error("Error logging out user:", err);
    next(err);
  }
};

exports.forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await Users.findOne({ email });

    if (!user) {
      return res.status(404).send({ error: "User not found." });
    }

    // Generate a password reset token
    const token = jwt.sign(
      {
        email: user.email,
        userID: user._id,
        type: "reset",
        tokenVersion: user.tokenVersion,
      },
      process.env.SECRET_KEY,
      {
        expiresIn: "1h",
      }
    );

    const url = `${process.env.BASE_URL}/users/reset-password/${token}`;

    const mailOptions = {
      from: process.env.USER,
      to: email,
      subject: "Reset your password",
      html: `<p>Click <a href="${url}">here</a> to reset your password. This link will only be open for one hour.</p>`,
    };

    await transporter.sendMail(mailOptions);
    res.send({ message: "Password reset email sent." });
  } catch (err) {
    console.error("Error in forgotPassword:", err);
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    // Verify the JWT
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    if (decoded.type !== "reset") {
      return res.status(403).send({ error: "Invalid token type." });
    }

    const user = await Users.findOne({ _id: decoded.userID });

    if (!user) {
      return res
        .status(404)
        .send({ error: "User not found or token invalid." });
    }

    // Check if token version matches
    if (decoded.tokenVersion !== user.tokenVersion) {
      return res.status(403).send({ error: "Token is no longer valid." });
    }

    // Hash and save the new password
    user.password = await bcrypt.hash(password, 12);

    // Increment the token version after resetting password to invalidate old tokens
    user.tokenVersion += 1;
    await user.save();

    res.send({ message: "Password reset successfully." });
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      next({ status: 403, message: "Token expired." });
    }
    console.error("Error in resetPassword:", err);
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).send({ error: "Email is required." });
  }

  try {
    const user = await Users.findOne({ email });

    if (!user) {
      return res.status(404).send({ error: "User not found." });
    }

    if (!user.isLoggedIn) {
      return res.status(403).send({ error: "User not logged in." });
    }

    const userId = user._id;

    if (req.user.id !== userId.toString()) {
      return res
        .status(403)
        .send({ error: "You are not authorized to delete this user." });
    }

    // Fetch all websites associated with the user
    const websites = await Website.find({ userID: userId });
    const websiteIds = websites.map((website) => website._id);

    // Perform deletions in parallel using Promise.all
    await Promise.all([
      Users.deleteOne({ _id: userId }),
      Token.deleteMany({ userID: userId }),
      Website.deleteMany({ userID: userId }),
      Notification.deleteMany({ userId: userId }),
      StatusLog.deleteMany({
        websiteId: { $in: websiteIds },
      }),
      Report.deleteMany({
        websiteId: { $in: websiteIds },
      }),
    ]);

    res
      .status(200)
      .send({ message: "User and associated data deleted successfully." });
  } catch (err) {
    console.error("Error deleting user:", err);
    next(err);
  }
};
