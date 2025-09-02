const mongoose = require("mongoose");

const pushTokenSchema = new mongoose.Schema({
  pushToken: {
    type: String,
    required: true,
    unique: true, // Ensure no duplicate tokens
  },
  deviceId: {
    type: String,
    required: true,
    index: true, // Index for faster queries
  },
  platform: {
    type: String,
    required: true,
    enum: ["ios", "android", "web"],
  },
  deviceName: {
    type: String,
    default: "Unknown",
  },
  deviceType: {
    type: String,
    default: "Unknown",
  },
  modelName: {
    type: String,
    default: "Unknown",
  },
  brand: {
    type: String,
    default: "Unknown",
  },
  manufacturer: {
    type: String,
    default: "Unknown",
  },
  osName: {
    type: String,
    default: "Unknown",
  },
  osVersion: {
    type: String,
    default: "Unknown",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastUsed: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
pushTokenSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Compound index for deviceId and platform combination
pushTokenSchema.index({ deviceId: 1, platform: 1 });

// Method to deactivate old tokens for the same device
pushTokenSchema.statics.deactivateOldTokensForDevice = async function (
  deviceId,
  platform,
  currentTokenId
) {
  try {
    await this.updateMany(
      {
        deviceId,
        platform,
        _id: { $ne: currentTokenId },
        isActive: true,
      },
      {
        $set: {
          isActive: false,
          updatedAt: new Date(),
        },
      }
    );
  } catch (error) {
    console.error("Error deactivating old tokens:", error);
  }
};

// Method to find active token for device
pushTokenSchema.statics.findActiveTokenForDevice = async function (
  deviceId,
  platform
) {
  try {
    return await this.findOne({
      deviceId,
      platform,
      isActive: true,
    }).sort({ updatedAt: -1 });
  } catch (error) {
    console.error("Error finding active token:", error);
    return null;
  }
};

// Method to cleanup old inactive tokens (older than 1 year)
pushTokenSchema.statics.cleanupOldTokens = async function () {
  try {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const result = await this.deleteMany({
      isActive: false,
      updatedAt: { $lt: oneYearAgo },
    });

    console.log(`Cleaned up ${result.deletedCount} old push tokens`);
    return result;
  } catch (error) {
    console.error("Error cleaning up old tokens:", error);
  }
};

const PushToken = mongoose.model("PushToken", pushTokenSchema);

module.exports = PushToken;
