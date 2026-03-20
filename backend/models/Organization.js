const mongoose = require("mongoose");

const organizationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  inviteCode: { type: String, unique: true, required: true } // <-- add this
}, { timestamps: true });

module.exports = mongoose.model("Organization", organizationSchema);