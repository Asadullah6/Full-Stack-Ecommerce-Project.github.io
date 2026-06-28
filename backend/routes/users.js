const express  = require("express");
const bcrypt   = require("bcryptjs");
const supabase = require("../supabase");
const { protect, adminOnly } = require("../middleware/auth");
const router   = express.Router();

// GET /api/users — admin: all users
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("users").select("id, name, email, role, created_at").order("created_at", { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/users/profile — update own profile
router.put("/profile", protect, async (req, res) => {
  try {
    const updates = {};
    if (req.body.name)     updates.name  = req.body.name;
    if (req.body.email)    updates.email = req.body.email;
    if (req.body.password) updates.password = await bcrypt.hash(req.body.password, 10);

    const { data, error } = await supabase
      .from("users").update(updates).eq("id", req.user.id).select("id, name, email, role").single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/users/:id — admin delete user
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const { error } = await supabase.from("users").delete().eq("id", req.params.id);
    if (error) throw error;
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
