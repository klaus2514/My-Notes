const express = require("express");
const router = express.Router();
const Note = require("../models/Note");
const authMiddleware = require("../middleware/authMiddleware");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer Storage for Cloudinary
const storage = multer.memoryStorage(); // Store the file in memory
const upload = multer({ storage });

// Create a new note with an image
router.post("/", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const { title, content } = req.body;
    let imageUrl = "";

    // If an image is uploaded, upload it to Cloudinary
    if (req.file) {
      // Convert the file buffer to a base64 string
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      const dataURI = "data:" + req.file.mimetype + ";base64," + b64;

      // Upload the image to Cloudinary
      const cloudinaryResponse = await cloudinary.uploader.upload(dataURI, {
        folder: "notes", // Optional: Save images in a specific folder on Cloudinary
      });

      // Get the Cloudinary URL
      imageUrl = cloudinaryResponse.secure_url;

      // Log the Cloudinary response and URL
      console.log("Cloudinary Response:", cloudinaryResponse);
      console.log("Image URL:", imageUrl);
    }

    // Create the new note
    const newNote = new Note({
      title,
      content,
      image: imageUrl,
      user: req.user.id,
    });

    // Save the note to the database
    await newNote.save();

    // Log the saved note
    console.log("Saved Note:", newNote);

    // Return the created note
    res.status(201).json(newNote);
  } catch (error) {
    console.error("❌ Error creating note:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get all notes
router.get("/", authMiddleware, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Update a note
router.put("/:id", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }

    let imageUrl = "";
    if (req.file) {
      // Convert the file buffer to a base64 string
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      const dataURI = "data:" + req.file.mimetype + ";base64," + b64;

      // Upload the image to Cloudinary
      const cloudinaryResponse = await cloudinary.uploader.upload(dataURI, {
        folder: "notes", // Optional: Save images in a specific folder on Cloudinary
      });

      // Get the Cloudinary URL
      imageUrl = cloudinaryResponse.secure_url;

      // Log the Cloudinary response and URL
      console.log("Cloudinary Response:", cloudinaryResponse);
      console.log("Image URL:", imageUrl);
    }

    // Update the note in the database
    const updatedNote = await Note.findByIdAndUpdate(
      req.params.id,
      {
        title,
        content,
        image: imageUrl || null,
      },
      { new: true }
    );

    if (!updatedNote) {
      return res.status(404).json({ error: "Note not found" });
    }

    res.json(updatedNote);
  } catch (error) {
    console.error("❌ Error updating note:", error);
    res.status(500).json({ error: "Error updating note", details: error.message });
  }
});

// Delete a note
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await Note.findByIdAndDelete(req.params.id);
    res.json({ message: "Note deleted" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting note" });
  }
});
// Toggle favorite status of a note
router.put("/:id/favorite", authMiddleware, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    // Toggle the favorite status
    note.isFavorite = !note.isFavorite;
    await note.save();

    res.json(note);
  } catch (error) {
    console.error("❌ Error toggling favorite status:", error);
    res.status(500).json({ error: "Server error" });
  }
});
module.exports = router;