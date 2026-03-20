const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: { type: String, enum: ["Admin", "Manager", "Member"], default: "Member" },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization" }
});

module.exports = mongoose.model("User", userSchema);