const express = require("express");
const Conversion = require("../models/Conversion");
const router = express.Router();

// Create multiple conversion entries at once (batch)
router.post("/track/batch", async (req, res) => {
  try {
    const { conversions } = req.body;

    if (
      !conversions ||
      !Array.isArray(conversions) ||
      conversions.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Conversions array is required and must not be empty",
      });
    }

    // Validate each conversion
    const validatedConversions = [];
    const errors = [];

    for (let i = 0; i < conversions.length; i++) {
      const conversion = conversions[i];
      const {
        deviceId,
        deviceInfo,
        fromCurrency,
        toCurrency,
        fromFlag,
        toFlag,
        originalAmount,
        convertedAmount,
        exchangeRate,
        fromRate,
        toRate,
        formattedAmount,
        formattedConverted,
        timestamp,
      } = conversion;

      // Validate required fields
      if (
        !deviceId ||
        !fromCurrency ||
        !toCurrency ||
        originalAmount === undefined ||
        convertedAmount === undefined
      ) {
        errors.push(`Conversion ${i}: Missing required fields`);
        continue;
      }

      // Validate currency codes
      if (fromCurrency.length !== 3 || toCurrency.length !== 3) {
        errors.push(
          `Conversion ${i}: Currency codes must be exactly 3 characters`
        );
        continue;
      }

      // Validate amounts
      if (originalAmount <= 0 || convertedAmount <= 0) {
        errors.push(`Conversion ${i}: Amounts must be positive numbers`);
        continue;
      }

      validatedConversions.push({
        deviceId,
        deviceInfo: deviceInfo || {},
        fromCurrency: fromCurrency.toUpperCase(),
        toCurrency: toCurrency.toUpperCase(),
        fromFlag: fromFlag || "",
        toFlag: toFlag || "",
        originalAmount,
        convertedAmount,
        exchangeRate,
        fromRate,
        toRate,
        formattedAmount,
        formattedConverted,
        timestamp: timestamp ? new Date(timestamp) : new Date(),
      });
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors,
        validCount: validatedConversions.length,
        totalCount: conversions.length,
      });
    }

    // Insert all valid conversions
    const savedConversions = await Conversion.insertMany(validatedConversions);

    res.status(201).json({
      success: true,
      message: "Conversions tracked successfully",
      savedCount: savedConversions.length,
      totalCount: conversions.length,
      conversionIds: savedConversions.map((c) => c._id),
    });
  } catch (error) {
    console.error("Error tracking batch conversions:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while tracking conversions",
    });
  }
});

// Create a new conversion entry
router.post("/track", async (req, res) => {
  try {
    const {
      deviceId,
      deviceInfo,
      fromCurrency,
      toCurrency,
      fromFlag,
      toFlag,
      originalAmount,
      convertedAmount,
      exchangeRate,
      fromRate,
      toRate,
      formattedAmount,
      formattedConverted,
      timestamp,
    } = req.body;

    // Validate required fields
    if (
      !deviceId ||
      !fromCurrency ||
      !toCurrency ||
      originalAmount === undefined ||
      convertedAmount === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: deviceId, fromCurrency, toCurrency, originalAmount, or convertedAmount",
      });
    }

    // Validate currency codes (should be 3 characters)
    if (fromCurrency.length !== 3 || toCurrency.length !== 3) {
      return res.status(400).json({
        success: false,
        message: "Currency codes must be exactly 3 characters",
      });
    }

    // Validate amounts are positive numbers
    if (originalAmount <= 0 || convertedAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amounts must be positive numbers",
      });
    }

    // Create new conversion entry
    const newConversion = new Conversion({
      deviceId,
      deviceInfo: deviceInfo || {},
      fromCurrency: fromCurrency.toUpperCase(),
      toCurrency: toCurrency.toUpperCase(),
      fromFlag: fromFlag || "",
      toFlag: toFlag || "",
      originalAmount,
      convertedAmount,
      exchangeRate,
      fromRate,
      toRate,
      formattedAmount,
      formattedConverted,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
    });

    const savedConversion = await newConversion.save();

    res.status(201).json({
      success: true,
      message: "Conversion tracked successfully",
      conversionId: savedConversion._id,
    });
  } catch (error) {
    console.error("Error tracking conversion:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while tracking conversion",
    });
  }
});

// Get conversion history for a specific device (Admin only)
router.get("/device/:deviceId", async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { page = 1, limit = 50, fromCurrency, toCurrency } = req.query;

    if (!deviceId) {
      return res.status(400).json({
        success: false,
        message: "Device ID is required",
      });
    }

    const skip = (page - 1) * limit;
    let query = { deviceId };

    // Add currency filters if provided
    if (fromCurrency) {
      query.fromCurrency = fromCurrency.toUpperCase();
    }
    if (toCurrency) {
      query.toCurrency = toCurrency.toUpperCase();
    }

    const conversions = await Conversion.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Conversion.countDocuments(query);

    res.json({
      success: true,
      conversions: conversions.map((conversion) => ({
        id: conversion._id,
        deviceId: conversion.deviceId,
        deviceInfo: conversion.deviceInfo,
        fromCurrency: conversion.fromCurrency,
        toCurrency: conversion.toCurrency,
        fromFlag: conversion.fromFlag,
        toFlag: conversion.toFlag,
        originalAmount: conversion.originalAmount,
        convertedAmount: conversion.convertedAmount,
        exchangeRate: conversion.exchangeRate,
        formattedAmount: conversion.formattedAmount,
        formattedConverted: conversion.formattedConverted,
        timestamp: conversion.timestamp,
        createdAt: conversion.createdAt,
      })),
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        totalConversions: total,
      },
    });
  } catch (error) {
    console.error("Error fetching device conversions:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching conversions",
    });
  }
});

// Get conversion statistics (Admin only)
router.get("/stats", async (req, res) => {
  try {
    const { deviceId, days = 30 } = req.query;
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - parseInt(days));

    let matchQuery = { timestamp: { $gte: dateLimit } };
    if (deviceId) {
      matchQuery.deviceId = deviceId;
    }

    const stats = await Conversion.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalConversions: { $sum: 1 },
          uniqueDevices: { $addToSet: "$deviceId" },
          totalAmount: { $sum: "$originalAmount" },
          avgAmount: { $avg: "$originalAmount" },
          popularFromCurrency: { $push: "$fromCurrency" },
          popularToCurrency: { $push: "$toCurrency" },
        },
      },
      {
        $project: {
          totalConversions: 1,
          uniqueDeviceCount: { $size: "$uniqueDevices" },
          totalAmount: { $round: ["$totalAmount", 2] },
          avgAmount: { $round: ["$avgAmount", 2] },
          popularFromCurrency: 1,
          popularToCurrency: 1,
        },
      },
    ]);

    // Get most popular currency pairs
    const popularPairs = await Conversion.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: { from: "$fromCurrency", to: "$toCurrency" },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    res.json({
      success: true,
      stats: stats[0] || {
        totalConversions: 0,
        uniqueDeviceCount: 0,
        totalAmount: 0,
        avgAmount: 0,
      },
      popularPairs,
      period: `Last ${days} days`,
    });
  } catch (error) {
    console.error("Error fetching conversion stats:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching stats",
    });
  }
});

// Get all conversions grouped by device (Admin only)
router.get("/all", async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // Get total count of unique devices
    const totalDevices = await Conversion.distinct("deviceId").then(
      (devices) => devices.length
    );

    // Aggregate conversions by device to return only device summaries with pagination
    const deviceSummaries = await Conversion.aggregate([
      {
        $group: {
          _id: "$deviceId",
          totalConversions: { $sum: 1 },
          deviceInfo: { $first: "$deviceInfo" },
          lastConversion: { $max: "$timestamp" },
        },
      },
      {
        $sort: { lastConversion: -1 },
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
          totalConversions: 1,
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
      message: "Internal server error while fetching device summaries",
    });
  }
});

// Delete old conversion records (Admin cleanup)
router.post("/cleanup", async (req, res) => {
  try {
    const { days = 365 } = req.body; // Default: keep records for 1 year
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await Conversion.deleteMany({
      timestamp: { $lt: cutoffDate },
    });

    res.json({
      success: true,
      message: `Cleanup completed successfully. Deleted records older than ${days} days.`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error during conversion cleanup:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during cleanup",
    });
  }
});

module.exports = router;
