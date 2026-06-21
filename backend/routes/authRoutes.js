const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { nanoid } = require("nanoid"); // <-- import

const User = require("../models/User");
const Organization = require("../models/Organization");

const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, inviteCode } = req.body; // accept inviteCode

    let tenantId;
    let role = "Member"; // default role

    // If an invite code is provided, try to find the organization
    if (inviteCode) {
      const org = await Organization.findOne({ inviteCode });
      if (!org) {
        return res.status(400).json({ message: "Invalid invite code" });
      }
      tenantId = org._id;
      // User becomes a member (or you could set role to "Member")
      role = "Member";
    } else {
      // No invite code: create a new organization (first user becomes admin)
      const inviteCode = nanoid(10); // generate a 10-character code
      const org = await Organization.create({ name: name + "_org", inviteCode });
      tenantId = org._id;
      role = "Admin";
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role,
      tenantId: tenantId
    });

    res.json({ message: "User registered" });
  } catch (err) {
    res.status(500).json({ message: err.message, error: err.message });
  }
});

// LOGIN (unchanged)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      {
        userId: user._id,
        tenantId: user.tenantId,
        role: user.role
      },
      "SECRET_KEY",
      { expiresIn: "1d" }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message, error: err.message });
  }
});

module.exports = router;