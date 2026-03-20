const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/ProjectRoutes"); // ✅ ADD THIS

const taskRoutes = require("./routes/taskRoutes");

const organizationRoutes = require("./routes/organizationRoutes")

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));
app.use("/api/organizations", organizationRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes); // ✅ ADD THIS
app.use("/api/tasks", taskRoutes);
app.get("/", (req, res) => {
    res.send("Server running");
});

app.listen(5000, () => console.log("Server running on port 5000"));