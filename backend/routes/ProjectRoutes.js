
const express = require("express");
const Project = require("../models/Project");
const auth = require("../middleware/auth");
const roleCheck = require("../middleware/role"); // ✅ ADD ROLECHECK
const router = express.Router();

// Get all projects for tenant
router.get("/", auth, async (req, res) => {
  try {
    const projects = await Project.find({ tenantId: req.user.tenantId });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create project (restricted to Admin and Manager)
router.post("/", auth, roleCheck("Admin", "Manager"), async (req, res) => {
  try {
    const { name, description } = req.body;
    const project = new Project({
      name,
      description,
      tenantId: req.user.tenantId
    });
    await project.save();
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;