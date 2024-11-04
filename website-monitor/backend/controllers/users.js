require("dotenv").config();

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { validationResult } = require("express-validator");
const Users = require("../models/users");
const Token = require("../models/tokens");
const { createToken } = require("./tokens");
const { type } = require("os");

const { stopMonitoring, monitorWebsites } = require("../middleware/monitor");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

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
    const url = `http://localhost:8000/users/verify/${email}/${createdToken.token}`;
    console.log("url", url);

    // Send verification email here
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Verify your email",
      html: `<p>Click <a href="${url}">here</a> to verify your email.</p>`, // Corrected line
    };

    try {
      await transporter.sendMail(mailOptions);
      res.send({
        message: "User created successfully. Please verify your email.",
        email: createdUser.email,
        token: createdToken.token,
      });
    } catch (emailError) {
      // If sending email fails, delete the created user
      //   await Users.deleteOne({ _id: createdUser._id });
      //   await Token.deleteOne({ _id: createdToken._id });
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
  const { email, token } = req.params;
  try {
    const user = await Users.findOne({ email });

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

    // Set the refresh token as an HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    // Start monitoring for the logged-in user
    await monitorWebsites(user);

    res.send({
      message: "User logged in successfully.",
      accessToken,
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
    });

    // Clear the refresh token cookie
    res.clearCookie("refreshToken");

    res.send({ message: "User logged out successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Internal server error." });
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
    console.log("url", url);

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Reset your password",
      html: `<p>Click <a href="${url}">here</a> to reset your password. This link will only be open for one hour.</p>`,
    };

    await transporter.sendMail(mailOptions);
    res.send({ message: "Password reset email sent." });
  } catch (err) {
    console.error("Error in forgotPassword:", err);
    res.status(500).send({ error: "Could not initiate password reset." });
  }
};

exports.resetPassword = async (req, res) => {
  const { email, token } = req.params;
  const { password } = req.body;

  try {
    // Verify the JWT
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    if (decoded.type !== "reset") {
      return res.status(403).send({ error: "Invalid token type." });
    }

    const user = await Users.findOne({ _id: decoded.userID, email });

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
      return res.status(403).send({ error: "Token has expired." });
    }
    console.error("Error in resetPassword:", err);
    res.status(500).send({ error: "Could not reset password." });
  }
};
