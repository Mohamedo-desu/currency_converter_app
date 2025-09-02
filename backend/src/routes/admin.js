const express = require("express");
const router = express.Router();
const Admin = require("../models/Admin");

// Admin login route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (admin && admin.password === password) {
      return res
        .status(200)
        .json({ success: true, message: "Admin logged in successfully." });
    }
    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials." });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
});

module.exports = router;
