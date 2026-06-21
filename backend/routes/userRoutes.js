const express = require("express");
const bcrypt = require("bcrypt");
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

// Add a user directly to the tenant (Admin only)
router.post("/", auth, roleCheck("Admin"), async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (role !== "Manager" && role !== "Member") {
      return res.status(400).json({ message: "Role must be either Manager or Member" });
    }

    if (!req.user?.tenantId) {
      return res.status(400).json({ message: "Tenant ID is missing from token" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      tenantId: req.user.tenantId
    });

    res.json({
      message: "User added successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (err) {
    console.error("❌ ADD USER ERROR:", err);
    res.status(500).json({ message: "Failed to add user", error: err.message });
  }
});

module.exports = router;

