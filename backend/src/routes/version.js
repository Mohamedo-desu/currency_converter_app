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
      // Return a more informative response when no version is found
      return res.status(404).json({
        message: "No active version found",
        error: "NO_VERSION",
        details:
          "The version database is empty or no version is marked as active",
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

    // Check if version already exists
    const existingVersion = await AppVersion.findOne({ version });
    if (existingVersion) {
      // Update existing version
      existingVersion.type = type;
      existingVersion.releaseNotes = releaseNotes;
      existingVersion.isActive = true;
      await existingVersion.save();
      return res.json(existingVersion);
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

    // Find the version to delete
    const versionToDelete = await AppVersion.findOne({ version });
    if (!versionToDelete) {
      return res.status(404).json({ message: "Version not found" });
    }

    // If this was the active version, reactivate the previous version
    if (versionToDelete.isActive) {
      const previousVersion = await AppVersion.findOne({ isActive: false })
        .sort({ createdAt: -1 })
        .limit(1);

      if (previousVersion) {
        previousVersion.isActive = true;
        await previousVersion.save();
      }
    }

    // Delete the version
    await AppVersion.deleteOne({ version });
    res.json({ message: "Version deleted successfully" });
  } catch (error) {
    console.error("Error deleting version:", error);
    res
      .status(500)
      .json({ message: "Error deleting version", error: error.message });
  }
});

module.exports = router;
