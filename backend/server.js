const express = require("express");
const cors    = require("cors");
require("dotenv").config();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000", credentials: true }));
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth",     require("./routes/auth"));
app.use("/api/products", require("./routes/products"));
app.use("/api/orders",   require("./routes/orders"));
app.use("/api/users",    require("./routes/users"));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/", (req, res) =>
  res.json({ message: "ShopNow API running 🚀 (Supabase)", version: "2.0.0" })
);

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || "Internal Server Error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server on http://localhost:${PORT}`));
