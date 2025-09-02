const express = require("express");
const router = express.Router();
const admin = require("../models/Admin");

// Admin login route
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (email === admin.email && password === admin.password) {
    return res
      .status(200)
      .json({ success: true, message: "Admin logged in successfully." });
  }
  return res
    .status(401)
    .json({ success: false, message: "Invalid credentials." });
});

module.exports = router;
