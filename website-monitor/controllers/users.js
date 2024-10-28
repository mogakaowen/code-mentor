require("dotenv").config();

const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const { validationResult } = require("express-validator");
const Users = require("../models/users");
const Token = require("../models/tokens");
const { createToken } = require("./tokens");

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
    const createdToken = await createToken(createdUser._id);
    const url = `http://localhost:8000/users/verify/${email}/${createdToken.token}`;
    console.log("url", url);

    // Send verification email here
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Verify your email",
      html: `<p>Click <a href="${url}">here</a> to verify your email.</p>`, // Corrected line
    };

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

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
    res.status(500).send({ error: "Could not verify user." });
  }
};
