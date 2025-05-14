const mongoose = require("mongoose");

const appVersionSchema = new mongoose.Schema(
  {
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
    downloadUrl: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AppVersion", appVersionSchema);
