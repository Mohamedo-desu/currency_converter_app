const mongoose = require("mongoose");

const conversionSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: true,
      index: true, // Index for faster queries by device
    },
    deviceInfo: {
      deviceName: { type: String, default: "Unknown" },
      deviceType: { type: String, default: "Unknown" },
      modelName: { type: String, default: "Unknown" },
      brand: { type: String, default: "Unknown" },
      manufacturer: { type: String, default: "Unknown" },
      osName: { type: String, default: "Unknown" },
      osVersion: { type: String, default: "Unknown" },
    },
    fromCurrency: {
      type: String,
      required: true,
      maxlength: 3, // Currency codes are 3 characters
    },
    toCurrency: {
      type: String,
      required: true,
      maxlength: 3, // Currency codes are 3 characters
    },
    fromFlag: {
      type: String,
      default: "",
    },
    toFlag: {
      type: String,
      default: "",
    },
    originalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    convertedAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    exchangeRate: {
      type: Number,
      required: true,
      min: 0,
    },
    fromRate: {
      type: Number,
      required: true,
      min: 0,
    },
    toRate: {
      type: Number,
      required: true,
      min: 0,
    },
    formattedAmount: {
      type: String,
      required: true,
    },
    formattedConverted: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true, // Index for faster queries by date
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
    collection: "conversions", // Explicit collection name
  }
);

// Compound index for efficient queries by device and date
conversionSchema.index({ deviceId: 1, timestamp: -1 });

// Index for currency pair analysis
conversionSchema.index({ fromCurrency: 1, toCurrency: 1 });

module.exports = mongoose.model("conversion", conversionSchema);
