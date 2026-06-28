const express  = require("express");
const bcrypt   = require("bcryptjs");
const jwt      = require("jsonwebtoken");
const supabase = require("../supabase");
const { protect } = require("../middleware/auth");
const router   = express.Router();

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || "shopnow_secret", { expiresIn: "30d" });

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    // Check duplicate
    const { data: existing } = await supabase
      .from("users").select("id").eq("email", email).single();
    if (existing) return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const { data, error } = await supabase
      .from("users")
      .insert([{ name, email, password: hashedPassword, role: "user" }])
      .select("id, name, email, role")
      .single();

    if (error) throw error;
    res.status(201).json({ token: generateToken(data.id), user: data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const { data: user, error } = await supabase
      .from("users").select("*").eq("email", email).single();

    if (error || !user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ message: "Invalid email or password" });

    const { password: _, ...safeUser } = user;
    res.json({ token: generateToken(user.id), user: safeUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me
router.get("/me", protect, (req, res) => res.json(req.user));

module.exports = router;
