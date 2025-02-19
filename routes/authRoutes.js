const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
require("dotenv").config(); // Load environment variables

// Load JWT Secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET;

// Ensure JWT_SECRET is set
if (!JWT_SECRET) {
  console.error("JWT_SECRET is not defined. Please check your environment variables.");
  process.exit(1); // Stop server if JWT_SECRET is missing
}

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
router.post(
  "/signup",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Enter a valid email"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  async (req, res) => {
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if (user) {
        return res.status(400).json({ msg: "User already exists" });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create new user
      user = new User({
        name,
        email,
        password: hashedPassword,
      });

      await user.save();

      // Generate JWT token
      const payload = { user: { id: user.id } };

      try {
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "15d" });
        res.json({ token });
      } catch (jwtError) {
        console.error("JWT signing error:", jwtError);
        res.status(500).json({ msg: "Error generating token" });
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Enter a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if (!user) {
        return res.status(400).json({ msg: "Invalid credentials" });
      }

      // Compare password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: "Invalid credentials" });
      }

      // Generate JWT token
      const payload = { user: { id: user.id } };

      try {
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
        res.json({ token });
      } catch (jwtError) {
        console.error("JWT signing error:", jwtError);
        res.status(500).json({ msg: "Error generating token" });
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

// @route   POST /api/auth/refresh-token
// @desc    Refresh an expired token
// @access  Public
router.post("/refresh-token", async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(401).json({ msg: "No token provided" });
  }

  try {
    // Verify the expired token (ignore expiration)
    const decoded = jwt.verify(token, JWT_SECRET, { ignoreExpiration: true });

    // Check if the user still exists
    const user = await User.findById(decoded.user.id);
    if (!user) {
      return res.status(401).json({ msg: "User not found" });
    }

    // Generate a new token
    const payload = { user: { id: user.id } };
    const newToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

    // Send the new token back to the client
    res.json({ token: newToken });
  } catch (err) {
    console.error("❌ Token Refresh Error:", err.message);
    return res.status(401).json({ msg: "Invalid or expired token" });
  }
});

module.exports = router;