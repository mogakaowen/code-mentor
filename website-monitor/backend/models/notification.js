const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  email: { type: Boolean, default: false },
  phone: { type: Boolean, default: false },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
});

module.exports = mongoose.model("Notification", notificationSchema);
