const mongoose = require("mongoose");

const appVersionSchema = new mongoose.Schema({
  version: {
    type: String,
    required: true,
    unique: true,
  },
  type: {
    type: String,
    enum: ["major", "minor", "patch"],
    required: true,
  },
  releaseNotes: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("AppVersion", appVersionSchema);
