const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  websiteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Website",
    required: true,
  },
  status: {
    type: String,
    enum: ["up", "down"],
    required: true,
  },
  availability: {
    type: Number,
    default: 100, // Assuming initially 100% available
  },
  outages: {
    type: Number,
    default: 0,
  },
  downtime: {
    type: Number,
    default: 0, // in seconds
  },
  uptime: {
    type: Number,
    default: 0, // in seconds
  },
  responseTime: {
    type: Number,
    default: 0, // in milliseconds
  },
  history: [
    {
      timestamp: {
        type: Date,
        default: Date.now,
      },
      status: {
        type: String,
        enum: ["up", "down"],
      },
      responseTime: Number, // Log each polling request's response time
    },
  ],
});

module.exports = mongoose.model("Report", reportSchema);
