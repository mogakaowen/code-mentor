const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Tokens", tokenSchema);
