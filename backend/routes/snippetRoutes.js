const express = require("express");
const Snippet = require("../models/Snippet");
const auth = require("../middleware/auth");
const router = express.Router();

// Get all snippets for tenant
router.get("/", auth, async (req, res) => {
  try {
    const snippets = await Snippet.find({ tenantId: req.user.tenantId })
      .populate("createdBy", "name email")
      .populate("projectId", "name")
      .sort({ createdAt: -1 });
    res.json(snippets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create snippet
router.post("/", auth, async (req, res) => {
  try {
    const { title, code, language, projectId } = req.body;
    if (!title || !code || !language) {
      return res.status(400).json({ message: "Title, code and language are required" });
    }
    const snippet = new Snippet({
      title,
      code,
      language,
      projectId: projectId || undefined,
      tenantId: req.user.tenantId,
      createdBy: req.user.id
    });
    await snippet.save();
    
    await snippet.populate("createdBy", "name email");
    if (projectId) {
      await snippet.populate("projectId", "name");
    }
    
    res.status(201).json(snippet);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update snippet
router.put("/:id", auth, async (req, res) => {
  try {
    const { title, code, language, projectId } = req.body;
    const snippet = await Snippet.findById(req.params.id);
    if (!snippet) {
      return res.status(404).json({ message: "Snippet not found" });
    }

    // Tenant check
    if (snippet.tenantId.toString() !== req.user.tenantId.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Role check: creator or Admin/Manager
    if (snippet.createdBy.toString() !== req.user.id.toString() && req.user.role === "Member") {
      return res.status(403).json({ message: "Access denied: Members can only update their own snippets" });
    }

    if (title) snippet.title = title;
    if (code !== undefined) snippet.code = code;
    if (language) snippet.language = language;
    snippet.projectId = projectId || undefined;

    await snippet.save();
    
    await snippet.populate("createdBy", "name email");
    if (snippet.projectId) {
      await snippet.populate("projectId", "name");
    }

    res.json(snippet);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete snippet
router.delete("/:id", auth, async (req, res) => {
  try {
    const snippet = await Snippet.findById(req.params.id);
    if (!snippet) {
      return res.status(404).json({ message: "Snippet not found" });
    }

    // Tenant check
    if (snippet.tenantId.toString() !== req.user.tenantId.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Role check: creator or Admin/Manager
    if (snippet.createdBy.toString() !== req.user.id.toString() && req.user.role === "Member") {
      return res.status(403).json({ message: "Access denied: Members can only delete their own snippets" });
    }

    await Snippet.findByIdAndDelete(req.params.id);
    res.json({ message: "Snippet deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
