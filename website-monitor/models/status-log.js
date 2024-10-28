const mongoose = require("mongoose");

const statusLogSchema = new mongoose.Schema({
  websiteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Website",
    required: true,
  },
  statusCode: { type: Number, required: true },
  checkedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("StatusLog", statusLogSchema);
