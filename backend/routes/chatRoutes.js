const express = require("express");
const Message = require("../models/Message");
const auth = require("../middleware/auth");
const router = express.Router();

// Get chat history for the tenant
router.get("/history", auth, async (req, res) => {
  try {
    if (!req.user?.tenantId) {
      return res.status(400).json({ message: "Tenant ID is missing from token" });
    }

    const messages = await Message.find({ tenantId: req.user.tenantId })
      .populate("senderId", "name")
      .sort({ createdAt: 1 }) // Chronological order
      .limit(50); // Get last 50 messages
      
    res.json(messages);
  } catch (err) {
    console.error("❌ GET CHAT HISTORY ERROR:", err);
    res.status(500).json({ message: "Failed to fetch chat history", error: err.message });
  }
});

module.exports = router;
