const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  // Get the token from the Authorization header
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Extract token from 'Bearer TOKEN'

  if (!token) {
    return res.status(401).send({ error: "Access token required." });
  }

  // Verify the token
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send({ error: "Invalid access token." });
    }

    // Set req.user with the decoded token payload
    req.user = decoded;

    next(); // Call the next middleware or route handler
  });
};

module.exports = authenticate;
