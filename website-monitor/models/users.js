const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UsersSchema = new Schema({
  name: { type: String, required: true },
  username: { type: String },
  email: { type: String, required: true },
  password: { type: String, required: true },
  verified: { type: Boolean, default: false },
});

module.exports = mongoose.model("Users", UsersSchema);
