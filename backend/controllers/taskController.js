const Task = require("../models/Task");
const mongoose = require("mongoose");

// Create Task
exports.createTask = async (req, res) => {
  try {
    const { title, projectId } = req.body;
    
    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const task = await Task.create({
      title,
      projectId,
      tenantId: req.user.tenantId,
      status: "Pending"
    });

    res.status(201).json(task);
  } catch (error) {
    console.error("Create task error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get All Tasks
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ tenantId: req.user.tenantId })
      .populate('projectId', 'name')
      .sort({ createdAt: -1 });
    
    res.json(tasks);
  } catch (error) {
    console.error("Get tasks error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get Tasks by Project
exports.getTasksByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const tasks = await Task.find({
      projectId,
      tenantId: req.user.tenantId
    }).populate('projectId', 'name');

    res.json(tasks);
  } catch (error) {
    console.error("Get tasks by project error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update Task
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const task = await Task.findOneAndUpdate(
      { _id: id, tenantId: req.user.tenantId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);
  } catch (error) {
    console.error("Update task error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete Task
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const task = await Task.findOneAndDelete({ 
      _id: id, 
      tenantId: req.user.tenantId 
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({ message: "Server error" });
  }
};