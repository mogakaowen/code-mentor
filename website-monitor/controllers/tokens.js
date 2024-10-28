const crypto = require("crypto");

const Token = require("../models/tokens");

exports.createToken = async (userID) => {
  try {
    const newToken = new Token({
      userID,
      token: crypto.randomBytes(32).toString("hex"),
    });
    return await newToken.save();
  } catch (err) {
    res.status(500).send({ error: "Could not create token" });
  }
};
