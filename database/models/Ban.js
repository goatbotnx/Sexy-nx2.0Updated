const mongoose = require("mongoose");

const banSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  reason: { type: String, default: "No reason provided" },
  bannedBy: { type: String, required: true },
  time: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Ban", banSchema);
