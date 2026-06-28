const jwt      = require("jsonwebtoken");
const supabase = require("../supabase");

// Protect route — verify JWT, attach user from Supabase
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) return res.status(401).json({ message: "Not authorized, no token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "shopnow_secret");
    const { data, error } = await supabase
      .from("users")
      .select("id, name, email, role")
      .eq("id", decoded.id)
      .single();

    if (error || !data) return res.status(401).json({ message: "User not found" });
    req.user = data;
    next();
  } catch {
    res.status(401).json({ message: "Token invalid or expired" });
  }
};

// Admin-only guard
const adminOnly = (req, res, next) => {
  if (req.user?.role === "admin") return next();
  res.status(403).json({ message: "Admin access required" });
};

module.exports = { protect, adminOnly };
