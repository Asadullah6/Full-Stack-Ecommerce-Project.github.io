const express  = require("express");
const supabase = require("../supabase");
const { protect, adminOnly } = require("../middleware/auth");
const router   = express.Router();

// GET /api/products — list with search, category, sort, pagination
router.get("/", async (req, res) => {
  try {
    const { search, category, sort, page = 1, limit = 20 } = req.query;
    let query = supabase.from("products").select("*", { count: "exact" });

    if (search)                          query = query.ilike("name", `%${search}%`);
    if (category && category !== "All") query = query.eq("category", category);

    // Sorting
    if (sort === "price-asc")  query = query.order("price", { ascending: true });
    else if (sort === "price-desc") query = query.order("price", { ascending: false });
    else if (sort === "name")  query = query.order("name",  { ascending: true });
    else                       query = query.order("created_at", { ascending: false });

    // Pagination
    const from = (page - 1) * limit;
    query = query.range(from, from + Number(limit) - 1);

    const { data, error, count } = await query;
    if (error) throw error;
    res.json({ products: data, total: count, page: Number(page), pages: Math.ceil(count / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/products/:id
router.get("/:id", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("products").select("*").eq("id", req.params.id).single();
    if (error || !data) return res.status(404).json({ message: "Product not found" });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/products — admin only
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const { data, error } = await supabase.from("products").insert([req.body]).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/products/:id — admin only
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("products").update(req.body).eq("id", req.params.id).select().single();
    if (error || !data) return res.status(404).json({ message: "Product not found" });
    res.json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/products/:id — admin only
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const { error } = await supabase.from("products").delete().eq("id", req.params.id);
    if (error) throw error;
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/products/seed/all — seed sample data (dev only)
router.post("/seed/all", async (req, res) => {
  try {
    await supabase.from("products").delete().neq("id", 0); // clear all
    const sample = [
      { name: "Wireless Earbuds Pro",     price: 79.99,  category: "Electronics", image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400", description: "Premium sound with 30hr battery life.", stock: 15, featured: true },
      { name: "Leather Crossbody Bag",    price: 129.99, category: "Fashion",     image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400", description: "Genuine leather, perfect for everyday use.", stock: 8 },
      { name: "Smart Watch Series X",     price: 249.99, category: "Electronics", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400", description: "Health tracking, GPS, and 7-day battery.", stock: 20, featured: true },
      { name: "Running Shoes Ultra",      price: 109.99, category: "Sports",      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400", description: "Lightweight cushioning for long runs.", stock: 30 },
      { name: "Minimalist Desk Lamp",     price: 54.99,  category: "Home",        image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400", description: "Adjustable brightness, USB charging port.", stock: 12 },
      { name: "Yoga Mat Premium",         price: 44.99,  category: "Sports",      image: "https://images.unsplash.com/photo-1601925228096-f0de36614618?w=400", description: "Non-slip, eco-friendly, 6mm thick.", stock: 25 },
      { name: "Ceramic Coffee Mug Set",   price: 34.99,  category: "Home",        image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400", description: "Set of 4 handmade mugs, microwave safe.", stock: 18 },
      { name: "Sunglasses Classic UV400", price: 89.99,  category: "Fashion",     image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400", description: "Polarized lenses with UV400 protection.", stock: 22 },
    ];
    const { data, error } = await supabase.from("products").insert(sample).select();
    if (error) throw error;
    res.json({ message: `Seeded ${data.length} products` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
