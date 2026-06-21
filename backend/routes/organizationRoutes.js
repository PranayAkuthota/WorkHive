const express = require("express");
const Organization = require("../models/Organization");
const auth = require("../middleware/auth");
const router = express.Router();

// Get all organizations list (public endpoint)
router.get("/list", async (req, res) => {
  try {
    const orgs = await Organization.find({}).select("name inviteCode");
    res.json(orgs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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