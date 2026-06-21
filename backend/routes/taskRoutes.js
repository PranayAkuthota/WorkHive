const express = require("express");
const Task = require("../models/Task");
const auth = require("../middleware/auth");
const router = express.Router();
const mongoose = require("mongoose");

// Create Task
router.post("/", auth, async (req, res) => {
  try {
    console.log("========== CREATE TASK ==========");
    console.log("Request body:", req.body);
    console.log("User from auth:", req.user);
    console.log("TenantId:", req.user?.tenantId);

    const { title, projectId } = req.body;
    
    // Validation
    if (!title) {
      console.log("Validation failed: Missing title");
      return res.status(400).json({ message: "Title is required" });
    }

    if (!projectId) {
      console.log("Validation failed: Missing projectId");
      return res.status(400).json({ message: "Project ID is required" });
    }

    if (!req.user?.tenantId) {
      console.log("Validation failed: Missing tenantId");
      return res.status(400).json({ message: "Tenant ID is missing from token" });
    }

    // Validate projectId format
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      console.log("Validation failed: Invalid projectId format");
      return res.status(400).json({ message: "Invalid Project ID format" });
    }

    // Create task
    const task = new Task({
      title: title,
      projectId: projectId,
      tenantId: req.user.tenantId,
      status: "Pending"
    });

    console.log("Task object created:", task);

    await task.save();
    
    console.log("Task saved successfully:", task);
    console.log("=================================");
    
    res.status(201).json(task);
  } catch (error) {
    console.error("❌ CREATE TASK ERROR:", error);
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.log("=================================");
    
    res.status(500).json({ 
      message: "Failed to create task", 
      error: error.message 
    });
  }
});

/// Get All Tasks (with project name populated)
router.get("/", auth, async (req, res) => {
    try {
      console.log("========== GET ALL TASKS ==========");
      console.log("User:", req.user);
      console.log("TenantId:", req.user?.tenantId);
  
      if (!req.user?.tenantId) {
        return res.status(400).json({ message: "Tenant ID is missing from token" });
      }
  
      // 👇 ADD .populate() here
      const tasks = await Task.find({ tenantId: req.user.tenantId })
        .populate('projectId', 'name')   // This replaces projectId with the project object containing name
        .sort({ createdAt: -1 });
      
      console.log(`Found ${tasks.length} tasks`);
      console.log("====================================");
      
      res.json(tasks);
    } catch (error) {
      console.error("❌ GET TASKS ERROR:", error);
      res.status(500).json({ 
        message: "Failed to fetch tasks", 
        error: error.message 
      });
    }
  });

// Get Tasks by Project
router.get("/project/:projectId", auth, async (req, res) => {
  try {
    console.log("========== GET TASKS BY PROJECT ==========");
    console.log("ProjectId:", req.params.projectId);
    console.log("TenantId:", req.user?.tenantId);

    const { projectId } = req.params;
    
    // Validate projectId
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: "Invalid Project ID format" });
    }

    if (!req.user?.tenantId) {
      return res.status(400).json({ message: "Tenant ID is missing from token" });
    }

    const tasks = await Task.find({
      projectId: projectId,
      tenantId: req.user.tenantId
    }).sort({ createdAt: -1 });

    console.log(`Found ${tasks.length} tasks for project ${projectId}`);
    console.log("===========================================");
    
    res.json(tasks);
  } catch (error) {
    console.error("❌ GET TASKS BY PROJECT ERROR:", error);
    res.status(500).json({ 
      message: "Failed to fetch tasks", 
      error: error.message 
    });
  }
});

// Get Single Task by ID
router.get("/:id", auth, async (req, res) => {
  try {
    console.log("========== GET SINGLE TASK ==========");
    console.log("TaskId:", req.params.id);
    console.log("TenantId:", req.user?.tenantId);

    const { id } = req.params;

    // Validate task ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Task ID format" });
    }

    if (!req.user?.tenantId) {
      return res.status(400).json({ message: "Tenant ID is missing from token" });
    }

    const task = await Task.findOne({ 
      _id: id, 
      tenantId: req.user.tenantId 
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    console.log("Task found:", task);
    console.log("======================================");
    
    res.json(task);
  } catch (error) {
    console.error("❌ GET SINGLE TASK ERROR:", error);
    res.status(500).json({ 
      message: "Failed to fetch task", 
      error: error.message 
    });
  }
});

// Update Task
router.put("/:id", auth, async (req, res) => {
  try {
    console.log("========== UPDATE TASK ==========");
    console.log("TaskId:", req.params.id);
    console.log("Update data:", req.body);
    console.log("TenantId:", req.user?.tenantId);

    const { id } = req.params;
    
    // Validate task ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Task ID format" });
    }

    if (!req.user?.tenantId) {
      return res.status(400).json({ message: "Tenant ID is missing from token" });
    }

    const { status, title, projectId } = req.body;
    const updateData = {};
    if (status !== undefined) updateData.status = status;
    if (title !== undefined) updateData.title = title;
    if (projectId !== undefined) updateData.projectId = projectId;

    const task = await Task.findOneAndUpdate(
      { _id: id, tenantId: req.user.tenantId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    console.log("Task updated:", task);
    console.log("================================");
    
    res.json(task);
  } catch (error) {
    console.error("❌ UPDATE TASK ERROR:", error);
    res.status(500).json({ 
      message: "Failed to update task", 
      error: error.message 
    });
  }
});

// Delete Task
router.delete("/:id", auth, async (req, res) => {
  try {
    console.log("========== DELETE TASK ==========");
    console.log("TaskId:", req.params.id);
    console.log("TenantId:", req.user?.tenantId);

    const { id } = req.params;

    // Validate task ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log("Invalid ID format:", id);
      return res.status(400).json({ message: "Invalid Task ID format" });
    }

    if (!req.user?.tenantId) {
      return res.status(400).json({ message: "Tenant ID is missing from token" });
    }

    const task = await Task.findOneAndDelete({ 
      _id: id, 
      tenantId: req.user.tenantId 
    });

    if (!task) {
      console.log("Task not found with ID:", id);
      return res.status(404).json({ message: "Task not found" });
    }

    console.log("Task deleted successfully:", id);
    console.log("================================");
    
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("❌ DELETE TASK ERROR:", error);
    res.status(500).json({ 
      message: "Failed to delete task", 
      error: error.message 
    });
  }
});

module.exports = router;