const express = require("express");
const router = express.Router();
const AppVersion = require("../models/AppVersion");

// Get latest version
router.get("/latest", async (req, res) => {
  try {
    const latestVersion = await AppVersion.findOne({ isActive: true }).sort({
      createdAt: -1,
    });

    if (!latestVersion) {
      return res.status(404).json({ message: "No active version found" });
    }

    res.json(latestVersion);
  } catch (error) {
    console.error("Error fetching latest version:", error);
    res
      .status(500)
      .json({ message: "Error fetching version", error: error.message });
  }
});

// Create new version (protected route - should be called by GitHub Actions)
router.post("/", async (req, res) => {
  try {
    const { version, type, releaseNotes } = req.body;

    // Validate version format (x.y.z)
    const versionRegex = /^\d+\.\d+\.\d+$/;
    if (!versionRegex.test(version)) {
      return res
        .status(400)
        .json({ message: "Invalid version format. Use x.y.z format" });
    }

    // Deactivate all previous versions
    await AppVersion.updateMany({}, { isActive: false });

    // Create new version
    const newVersion = new AppVersion({
      version,
      type,
      releaseNotes,
      isActive: true,
    });

    await newVersion.save();
    res.status(201).json(newVersion);
  } catch (error) {
    console.error("Error creating new version:", error);
    res
      .status(500)
      .json({ message: "Error creating version", error: error.message });
  }
});

module.exports = router;
