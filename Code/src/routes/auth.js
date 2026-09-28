const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../../server.js/user");
const { protect } = require("../auth");

const router = express.Router();

function accountServiceReady(res) {
  if (mongoose.connection.readyState === 1) return true;
  res.status(503).json({ message: "Accounts are temporarily unavailable because the database is not connected." });
  return false;
}

function createToken(user) {
  return jwt.sign(
    { email: user.email, name: user.name, role: user.role },
    process.env.JWT_ACCESS_SECRET,
    { subject: user.id, expiresIn: "7d" }
  );
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

router.post("/register", async (req, res) => {
  if (!accountServiceReady(res)) return;
  if (!process.env.JWT_ACCESS_SECRET) {
    return res.status(503).json({ message: "Account authentication is not configured on this server." });
  }

  const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
  const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const password = typeof req.body.password === "string" ? req.body.password : "";

  if (name.length < 2) return res.status(400).json({ message: "Enter a name with at least 2 characters." });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: "Enter a valid email address." });
  if (password.length < 8) return res.status(400).json({ message: "Use a password with at least 8 characters." });

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ message: "An account with that email already exists. Sign in instead." });

    const user = await User.create({ name, email, password, role: "student" });
    return res.status(201).json({ token: createToken(user), user: publicUser(user) });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "An account with that email already exists. Sign in instead." });
    console.error("Account registration failed:", error.message);
    return res.status(500).json({ message: "Could not create your account. Please try again." });
  }
});

router.post("/login", async (req, res) => {
  if (!accountServiceReady(res)) return;
  if (!process.env.JWT_ACCESS_SECRET) {
    return res.status(503).json({ message: "Account authentication is not configured on this server." });
  }

  const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const password = typeof req.body.password === "string" ? req.body.password : "";
  if (!email || !password) return res.status(400).json({ message: "Enter your email address and password." });

  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Email or password is incorrect." });
    }
    return res.json({ token: createToken(user), user: publicUser(user) });
  } catch (error) {
    console.error("Account sign-in failed:", error.message);
    return res.status(500).json({ message: "Could not sign in. Please try again." });
  }
});

router.get("/me", protect, async (req, res) => {
  if (!accountServiceReady(res)) return;
  try {
    const user = await User.findById(req.user.sub);
    if (!user) return res.status(401).json({ message: "This account no longer exists. Please sign in again." });
    return res.json({ user: publicUser(user) });
  } catch (error) {
    console.error("Account lookup failed:", error.message);
    return res.status(500).json({ message: "Could not load your account." });
  }
});

module.exports = router;
