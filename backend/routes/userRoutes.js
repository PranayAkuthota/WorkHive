const express = require("express");
const User = require("../models/User");
const auth = require("../middleware/auth");
const roleCheck = require("../middleware/role");
const router = express.Router();

// Get all users (Managers and Members) for the tenant
router.get("/", auth, roleCheck("Admin"), async (req, res) => {
  try {
    if (!req.user?.tenantId) {
      return res.status(400).json({ message: "Tenant ID is missing from token" });
    }

    const users = await User.find({ 
      tenantId: req.user.tenantId,
      _id: { $ne: req.user.id } // Exclude current user from the list
    }).select("-password"); // Exclude hashed passwords for safety
    
    res.json(users);
  } catch (err) {
    console.error("❌ GET USERS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch workspace users", error: err.message });
  }
});

// Remove a user from the tenant
router.delete("/:id", auth, roleCheck("Admin"), async (req, res) => {
  try {
    if (!req.user?.tenantId) {
      return res.status(400).json({ message: "Tenant ID is missing from token" });
    }

    const userIdToRemove = req.params.id;

    // Retrieve target user to make sure they are in the same tenant and not an Admin
    const targetUser = await User.findOne({ _id: userIdToRemove, tenantId: req.user.tenantId });
    
    if (!targetUser) {
      return res.status(404).json({ message: "User not found inside your organization" });
    }

    if (targetUser.role === "Admin") {
      return res.status(403).json({ message: "Access denied: Cannot remove an organization Administrator" });
    }

    await User.findByIdAndDelete(userIdToRemove);
    res.json({ message: "User removed successfully from organization" });
  } catch (err) {
    console.error("❌ REMOVE USER ERROR:", err);
    res.status(500).json({ message: "Failed to remove user", error: err.message });
  }
});

module.exports = router;
