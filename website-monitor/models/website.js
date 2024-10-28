require("dotenv").config();

const mongoose = require("mongoose");

const websiteSchema = new mongoose.Schema({
  url: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  interval: { type: Number, default: process.env.CHECK_INTERVAL },
  lastStatus: { type: String, default: "Unknown" },
});

module.exports = mongoose.model("Website", websiteSchema);
