const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      default: "admin@currencyapp.com",
    },
    password: {
      type: String,
      required: true,
      default: "Ug4586@#",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Admin", AdminSchema);
