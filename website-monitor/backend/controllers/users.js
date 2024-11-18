require("dotenv").config();

const { OAuth2Client } = require("google-auth-library");
const admin = require("../utils/firebase");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { validationResult } = require("express-validator");
const Users = require("../models/users");
const Token = require("../models/tokens");
const { createToken } = require("./tokens");
const { type } = require("os");

const { stopMonitoring, monitorWebsites } = require("../middleware/monitor");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
  const { idToken } = req.body; // ID token sent from the client after Google Sign-In

  try {
    // Verify the ID token using Google Auth Library
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID, // Your Google client ID
    });

    const payload = ticket.getPayload();

    // Check if the user exists
    let user = await Users.findOne({ email: payload.email });

    if (!user) {
      // If user doesn't exist, create a new one
      user = new Users({
        email: payload.email,
        name: payload.name,
        username: payload.name, // Optionally use the name or any logic to set a username
        verified: true, // Google sign-in users are considered verified
      });
      await user.save();
    }

    // Generate access and refresh tokens
    const accessToken = jwt.sign(
      { email: user.email, id: user._id, type: "access" },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "5m" }
    );

    const refreshToken = jwt.sign(
      { email: user.email, id: user._id, type: "refresh" },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" }
    );

    user.isLoggedIn = true;
    await user.save();

    // Set the refresh token as an HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
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

exports.createUser = async (req, res) => {
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

exports.verifyUser = async (req, res) => {
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

exports.logoutUser = async (req, res) => {
  try {
    // Stop monitoring for the logged-in user
    stopMonitoring(req.user.id);

    // Find the user by ID and increment the tokenVersion
    await Users.findByIdAndUpdate(req.user.id, {
      $inc: { tokenVersion: 1 },
      isLoggedIn: false,
    });

    // Clear the refresh token cookie
    res.clearCookie("refreshToken");

    res.send({ message: "User logged out successfully." });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

exports.forgotPassword = async (req, res) => {
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

    const url = `http://localhost:8000/users/reset-password/${email}/${token}`;

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

exports.resetPassword = async (req, res) => {
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
