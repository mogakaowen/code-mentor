const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const Token = require("../models/tokens");

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
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).send({ error: "Refresh token is required." });
  }

  try {
    // Verify the refresh token
    const secretKey = process.env.SECRET_KEY;
    const decoded = jwt.verify(refreshToken, secretKey);

    // Check if the token exists in the database
    const tokenEntry = await Token.findOne({
      userID: decoded.id,
      token: refreshToken,
    });

    if (!tokenEntry) {
      return res.status(403).send({ error: "Invalid refresh token." });
    }

    // Generate a new access token
    const accessToken = jwt.sign(
      { email: decoded.email, id: decoded.id },
      secretKey,
      {
        expiresIn: "5m",
      }
    );

    res.send({ accessToken });
  } catch (err) {
    return res.status(403).send({ error: "Invalid refresh token." });
  }
};
