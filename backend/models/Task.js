const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true 
    },

    projectId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Project",
        required: true 
    },

    tenantId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Organization",
        required: true 
    },

    status: {
        type: String,
        enum: ["Pending", "In Progress", "Completed"],
        default: "Pending"
    }
}, {
    timestamps: true // Adds createdAt and updatedAt
});

module.exports = mongoose.model("Task", taskSchema);