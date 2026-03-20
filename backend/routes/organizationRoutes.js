const express = require("express");
const Organization = require("../models/Organization");
const auth = require("../middleware/auth");
const router = express.Router();

// Get invite code for current user's organization
router.get("/invite-code", auth, async (req, res) => {
  try {
    const org = await Organization.findOne({ _id: req.user.tenantId });
    if (!org) return res.status(404).json({ message: "Organization not found" });
    res.json({ inviteCode: org.inviteCode });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;