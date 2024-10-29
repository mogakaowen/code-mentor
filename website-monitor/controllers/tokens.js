require("dotenv").config();

const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const Token = require("../models/tokens");
const Users = require("../models/users");

exports.createToken = async (userID, expiresInSeconds) => {
  try {
    const newToken = new Token({
      userID,
      token: crypto.randomBytes(32).toString("hex"),
      expiresAt: new Date(Date.now() + expiresInSeconds * 1000),
    });
    return await newToken.save();
  } catch (err) {
    res.status(500).send({ error: "Could not create token" });
  }
};

exports.refreshAccessToken = async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).send({ error: "Refresh token is required." });
  }

  try {
    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    if (decoded.type !== "refresh") {
      return res.status(403).send({ error: "Invalid refresh token." });
    }

    // Find the user by ID and check the token version
    const user = await Users.findById(decoded.id);

    if (!user || user.tokenVersion !== decoded.tokenVersion) {
      return res.status(403).send({ error: "Token is no longer valid." });
    }

    // Generate a new access token
    const accessToken = jwt.sign(
      {
        email: decoded.email,
        id: decoded.id,
        type: "access",
        tokenVersion: decoded.tokenVersion,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "5m" }
    );

    res.send({ accessToken });
  } catch (err) {
    return res.status(403).send({ error: "Invalid refresh token." });
  }
};
