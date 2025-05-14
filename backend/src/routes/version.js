const express = require("express");
const router = express.Router();
const AppVersion = require("../models/AppVersion");

// Get latest version
router.get("/latest", async (req, res) => {
  try {
    const { major } = req.query;
    let query = {};

    // If major version is specified, filter by major version
    if (major) {
      // Use a more precise query to match the major version
      const majorPattern = new RegExp(`^${major}\\.`);
      query.version = { $regex: majorPattern };
    }

    const latestVersion = await AppVersion.findOne(query)
      .sort({ createdAt: -1 })
      .limit(1);

    if (!latestVersion) {
      return res.status(404).json({
        message: "No version found",
        error: "NO_VERSION",
        details: "No version found for the specified criteria",
      });
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

    // Extract major version and construct x.0.0 version
    const majorVersion = version.split(".")[0];
    const baseVersion = `${majorVersion}.0.0`;

    // Find the x.0.0 version
    const baseVersionDoc = await AppVersion.findOne({ version: baseVersion });

    // Check if version already exists
    const existingVersion = await AppVersion.findOne({ version });
    if (existingVersion) {
      // Update existing version
      existingVersion.type = type;
      existingVersion.releaseNotes = releaseNotes;
      if (baseVersionDoc?.downloadUrl) {
        existingVersion.downloadUrl = baseVersionDoc.downloadUrl;
      }
      await existingVersion.save();
      return res.json(existingVersion);
    }

    // Create new version
    const newVersion = new AppVersion({
      version,
      type,
      releaseNotes,
      downloadUrl:
        baseVersionDoc?.downloadUrl || "https://drive.google.com/placeholder", // Temporary placeholder
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

// Delete version (protected route - should be called by GitHub Actions)
router.delete("/:version", async (req, res) => {
  try {
    const { version } = req.params;

    // Validate version format (x.y.z)
    const versionRegex = /^\d+\.\d+\.\d+$/;
    if (!versionRegex.test(version)) {
      return res
        .status(400)
        .json({ message: "Invalid version format. Use x.y.z format" });
    }

    // Find and delete the version
    const result = await AppVersion.deleteOne({ version });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Version not found" });
    }

    res.json({ message: "Version deleted successfully" });
  } catch (error) {
    console.error("Error deleting version:", error);
    res
      .status(500)
      .json({ message: "Error deleting version", error: error.message });
  }
});

module.exports = router;
