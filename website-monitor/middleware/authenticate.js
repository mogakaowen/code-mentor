const jwt = require("jsonwebtoken");
const Users = require("../models/users");

const authenticate = async (req, res, next) => {
  // Get the token from the Authorization header
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Extract token from 'Bearer TOKEN'

  if (!token) {
    return res.status(401).send({ error: "Access token required." });
  }

  // Verify the token
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(403).send({ error: "Invalid access token." });
    }

    // Fetch the user from the database to check the tokenVersion
    const user = await Users.findById(decoded.id);

    if (!user) {
      return res.status(404).send({ error: "User not found." });
    }

    // Check if tokenVersion from the token matches the one in the database
    if (decoded.tokenVersion !== user.tokenVersion) {
      return res
        .status(403)
        .send({ error: "Token version mismatch. Please log in again." });
    }

    // Set req.user with the decoded token payload
    req.user = decoded;

    next(); // Call the next middleware or route handler
  });
};

module.exports = authenticate;
