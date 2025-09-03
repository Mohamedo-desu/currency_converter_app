const express = require("express");
const router = express.Router();
const Feedback = require("../models/Feedback");

// Submit feedback
router.post("/", async (req, res) => {
  try {
    const feedback = new Feedback(req.body);
    await feedback.save();
    res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
      feedback,
    });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    res.status(400).json({
      success: false,
      message: "Error submitting feedback",
      error: error.message,
    });
  }
});

// Get all feedbacks grouped by device (for admin purposes)
router.get("/all", async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // Get total count of unique devices with feedbacks
    const totalDevices = await Feedback.distinct("deviceId").then(
      (devices) => devices.length
    );

    // Aggregate feedbacks by device to return only device summaries with pagination
    const deviceSummaries = await Feedback.aggregate([
      {
        $group: {
          _id: "$deviceId",
          totalFeedbacks: { $sum: 1 },
          deviceInfo: { $first: "$deviceInfo" },
          lastFeedback: { $max: "$timestamp" },
          userName: { $first: "$name" },
        },
      },
      {
        $sort: { lastFeedback: -1 },
      },
      {
        $skip: skip,
      },
      {
        $limit: parseInt(limit),
      },
      {
        $project: {
          deviceId: "$_id",
          deviceName: {
            $cond: {
              if: {
                $and: [
                  { $ne: ["$deviceInfo", null] },
                  { $ne: ["$deviceInfo.deviceName", null] },
                ],
              },
              then: "$deviceInfo.deviceName",
              else: { $substr: ["$_id", 0, 8] },
            },
          },
          totalFeedbacks: 1,
          userName: 1,
          _id: 0,
        },
      },
    ]);

    res.json({
      success: true,
      devices: deviceSummaries,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(totalDevices / limit),
        totalDevices: totalDevices,
        hasMore: page * limit < totalDevices,
      },
    });
  } catch (error) {
    console.error("Error fetching device summaries:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching device summaries",
      error: error.message,
    });
  }
});

// Get feedbacks for a specific device
router.get("/device/:deviceId", async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { page = 1, limit = 50, type } = req.query;

    if (!deviceId) {
      return res.status(400).json({
        success: false,
        message: "Device ID is required",
      });
    }

    const skip = (page - 1) * limit;
    let query = { deviceId };

    // Add type filter if provided
    if (type) {
      query.type = type;
    }

    const feedbacks = await Feedback.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Feedback.countDocuments(query);

    res.json({
      success: true,
      feedbacks: feedbacks.map((feedback) => ({
        id: feedback._id,
        deviceId: feedback.deviceId,
        deviceInfo: feedback.deviceInfo,
        type: feedback.type,
        name: feedback.name,
        email: feedback.email,
        text: feedback.text,
        timestamp: feedback.timestamp,
        platform: feedback.platform,
        version: feedback.version,
        createdAt: feedback.createdAt,
      })),
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        totalFeedbacks: total,
      },
    });
  } catch (error) {
    console.error("Error fetching device feedbacks:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching feedbacks",
    });
  }
});

module.exports = router;
