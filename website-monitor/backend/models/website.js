require("dotenv").config();

const mongoose = require("mongoose");

const websiteSchema = new mongoose.Schema({
  url: { type: String, required: true, unique: true },
  interval: { type: Number, default: process.env.CHECK_INTERVAL },
  status: {
    type: String,
    enum: ["up", "down", "unknown"],
    default: "unknown",
  },
  lastChecked: {
    type: Date,
    default: null,
  },
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
});

module.exports = mongoose.model("Website", websiteSchema);
