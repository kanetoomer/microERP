const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./src/config/db");

// Environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();
app.use(express.json());
app.use(cors());

// Routes
const authRoutes = require("./src/routes/authRoutes");
const dataRoutes = require("./src/routes/dataRoutes");
const reportsRoutes = require("./src/routes/reportRoutes");

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/data", dataRoutes);
app.use("/api/reports", reportsRoutes);

// Root Route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
