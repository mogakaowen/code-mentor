require("dotenv").config();

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { validationResult } = require("express-validator");
const Users = require("../models/users");
const Token = require("../models/tokens");
const { createToken } = require("./tokens");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
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

    const secretKey = process.env.SECRET_KEY;

    // Generate access token with 5-minute expiration
    const accessToken = jwt.sign(
      { email: user.email, id: user._id },
      secretKey,
      {
        expiresIn: "5m",
      }
    );

    // Generate refresh token with 1-day expiration
    const refreshToken = jwt.sign(
      { email: user.email, id: user._id },
      secretKey,
      {
        expiresIn: "1d",
      }
    );

    // Optional: Store the refresh token in the database
    const tokenEntry = new Token({
      userID: user._id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 86400000), // 86400000 ms = 1 day
    });
    await tokenEntry.save();

    res.send({
      message: "User logged in successfully.",
      accessToken,
      refreshToken,
    });
  } catch (err) {
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
    const token = crypto.randomBytes(32).toString("hex");

    // Save the token with an expiration time (1 hour in this example)
    const tokenEntry = new Token({
      userID: user._id, // Assuming the user model has an _id
      token,
      expiresAt: new Date(Date.now() + 3600000), // 3600000 ms = 1 hour
    });
    await tokenEntry.save();

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
    // Find the user
    const user = await Users.findOne({ email });

    if (!user) {
      return res.status(404).send({ error: "User not found." });
    }

    // Find the token and check if it is valid (not expired)
    const tokenEntry = await Token.findOne({ userID: user._id, token });

    if (!tokenEntry) {
      return res.status(403).send({ error: "Invalid or expired token." });
    }

    // Check if the token is expired (1 hour)
    const isExpired = Date.now() - tokenEntry.createdAt > 3600000; // 3600000 ms = 1 hour
    if (isExpired) {
      return res.status(403).send({ error: "Token has expired." });
    }

    // Hash the new password and save it
    user.password = await bcrypt.hash(password, 12);
    await user.save();

    // Optionally, you might want to delete the token after successful reset
    await Token.deleteOne({ _id: tokenEntry._id });

    res.send({ message: "Password reset successfully." });
  } catch (err) {
    console.error("Error in resetPassword:", err);
    res.status(500).send({ error: "Could not reset password." });
  }
};
