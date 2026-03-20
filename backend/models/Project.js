const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
    name: String,
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization" }
});

module.exports = mongoose.model("Project", projectSchema);