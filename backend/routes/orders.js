const express  = require("express");
const supabase = require("../supabase");
const { protect, adminOnly } = require("../middleware/auth");
const router   = express.Router();

// POST /api/orders — create order
router.post("/", protect, async (req, res) => {
  try {
    const { items, shipping_address, total_price, shipping_cost } = req.body;
    if (!items?.length) return res.status(400).json({ message: "No items in order" });

    const { data, error } = await supabase
      .from("orders")
      .insert([{ user_id: req.user.id, items, shipping_address, total_price, shipping_cost, status: "pending" }])
      .select().single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /api/orders/my — current user's orders
router.get("/my", protect, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("orders").select("*").eq("user_id", req.user.id).order("created_at", { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders — admin: all orders with user info
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*, users(name, email)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/orders/:id/status — admin update status
router.put("/:id/status", protect, adminOnly, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("orders").update({ status: req.body.status }).eq("id", req.params.id).select().single();
    if (error || !data) return res.status(404).json({ message: "Order not found" });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
