const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const noteRoutes = require("./routes/noteRoutes");

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();

// CORS Configuration
const corsOptions = {
  origin: [
    process.env.FRONTEND_URL, // Your Vercel frontend URL
    "http://localhost:5173",
    "https://my-notes-go6e.vercel.app"// Local development
    // Add other domains as needed
  ],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204
};

// Middleware
app.use(cors(corsOptions)); // Enable CORS with options
app.use(express.json()); // Parse JSON request bodies

// Connect to MongoDB Atlas
mongoose
  .connect(process.env.MONGO_URI, { dbName: "my-notes-db" })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);

// Default Route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
