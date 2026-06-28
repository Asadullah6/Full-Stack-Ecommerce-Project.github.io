import { useState, useEffect, createContext, useContext } from "react";

// ─── Cart Context ────────────────────────────────────────────────────────────
const CartContext = createContext();
const useCart = () => useContext(CartContext);

function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem("cart")) || []; } catch { return []; }
  });

  useEffect(() => { localStorage.setItem("cart", JSON.stringify(cart)); }, [cart]);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i._id === product._id);
      if (existing) return prev.map(i => i._id === product._id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i._id !== id));
  const updateQty = (id, qty) => {
    if (qty < 1) return removeFromCart(id);
    setCart(prev => prev.map(i => i._id === id ? { ...i, qty } : i));
  };
  const clearCart = () => setCart([]);
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const count = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQty, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

// ─── Auth Context ─────────────────────────────────────────────────────────────
const AuthContext = createContext();
const useAuth = () => useContext(AuthContext);

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);

  const login = (userData, tok) => {
    setUser(userData); setToken(tok);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", tok);
  };
  const logout = () => {
    setUser(null); setToken(null);
    localStorage.removeItem("user"); localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAdmin: user?.role === "admin" }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── API Helper ───────────────────────────────────────────────────────────────
const API = "https://full-stack-ecommerce-project-production.up.railway.app/api";
async function apiFetch(path, opts = {}, token = null) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API}${path}`, { ...opts, headers: { ...headers, ...opts.headers } });
  if (!res.ok) throw new Error((await res.json()).message || "Request failed");
  return res.json();
}

// ─── Sample products (used as fallback if backend not connected) ──────────────
const SAMPLE_PRODUCTS = [
  { _id: "1", name: "Wireless Earbuds Pro", price: 79.99, category: "Electronics", image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400", description: "Premium sound with 30hr battery life.", stock: 15 },
  { _id: "2", name: "Leather Crossbody Bag", price: 129.99, category: "Fashion", image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400", description: "Genuine leather, perfect for everyday use.", stock: 8 },
  { _id: "3", name: "Smart Watch Series X", price: 249.99, category: "Electronics", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400", description: "Health tracking, GPS, and 7-day battery.", stock: 20 },
  { _id: "4", name: "Running Shoes Ultra", price: 109.99, category: "Sports", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400", description: "Lightweight cushioning for long runs.", stock: 30 },
  { _id: "5", name: "Minimalist Desk Lamp", price: 54.99, category: "Home", image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400", description: "Adjustable brightness, USB charging port.", stock: 12 },
  { _id: "6", name: "Yoga Mat Premium", price: 44.99, category: "Sports", image: "https://images.unsplash.com/photo-1601925228096-f0de36614618?w=400", description: "Non-slip, eco-friendly, 6mm thick.", stock: 25 },
  { _id: "7", name: "Ceramic Coffee Mug Set", price: 34.99, category: "Home", image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400", description: "Set of 4 handmade mugs, microwave safe.", stock: 18 },
  { _id: "8", name: "Sunglasses Classic UV400", price: 89.99, category: "Fashion", image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400", description: "Polarized lenses with UV400 protection.", stock: 22 },
];

// ─── Components ───────────────────────────────────────────────────────────────

function Navbar({ page, setPage, search, setSearch }) {
  const { count } = useCart();
  const { user, logout, isAdmin } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav style={{ background: "#1a1a2e", color: "#fff", padding: "0 1.5rem", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 12px rgba(0,0,0,0.3)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", gap: "1rem", height: 64 }}>
        {/* Logo */}
        <span onClick={() => setPage("home")} style={{ fontWeight: 800, fontSize: "1.3rem", cursor: "pointer", letterSpacing: "-0.5px", color: "#e94560", whiteSpace: "nowrap" }}>
            ShopNow with Asad
        </span>

        {/* Search */}
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setPage("products"); }}
          placeholder="Search products..."
          style={{ flex: 1, maxWidth: 400, padding: "0.5rem 1rem", borderRadius: 24, border: "none", background: "#16213e", color: "#fff", fontSize: "0.9rem", outline: "none" }}
        />

        {/* Desktop Nav */}
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginLeft: "auto" }}>
          {["home", "products"].map(p => (
            <button key={p} onClick={() => setPage(p)} style={{ background: page === p ? "#e94560" : "transparent", color: "#fff", border: "none", padding: "0.4rem 0.9rem", borderRadius: 20, cursor: "pointer", fontWeight: 600, textTransform: "capitalize", fontSize: "0.85rem" }}>
              {p}
            </button>
          ))}
          {isAdmin && (
            <button onClick={() => setPage("admin")} style={{ background: page === "admin" ? "#f5a623" : "transparent", color: "#fff", border: "none", padding: "0.4rem 0.9rem", borderRadius: 20, cursor: "pointer", fontWeight: 600, fontSize: "0.85rem" }}>
              Admin
            </button>
          )}
          {user ? (
            <button onClick={logout} style={{ background: "transparent", color: "#aaa", border: "1px solid #333", padding: "0.4rem 0.9rem", borderRadius: 20, cursor: "pointer", fontSize: "0.85rem" }}>
              Logout ({user.name?.split(" ")[0]})
            </button>
          ) : (
            <button onClick={() => setPage("auth")} style={{ background: "transparent", color: "#aaa", border: "1px solid #333", padding: "0.4rem 0.9rem", borderRadius: 20, cursor: "pointer", fontSize: "0.85rem" }}>
              Login
            </button>
          )}
          <button onClick={() => setPage("cart")} style={{ background: "#e94560", color: "#fff", border: "none", padding: "0.4rem 1rem", borderRadius: 20, cursor: "pointer", fontWeight: 700, position: "relative", fontSize: "0.9rem" }}>
            🛒 {count > 0 && <span style={{ background: "#f5a623", borderRadius: "50%", padding: "0 5px", fontSize: "0.7rem", marginLeft: 4 }}>{count}</span>}
          </button>
        </div>
      </div>
    </nav>
  );
}

function ProductCard({ product, setPage, setSelectedProduct }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = (e) => {
    e.stopPropagation();
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div onClick={() => { setSelectedProduct(product); setPage("product"); }} style={{
      background: "#fff", borderRadius: 16, overflow: "hidden", cursor: "pointer",
      boxShadow: "0 2px 12px rgba(0,0,0,0.08)", transition: "transform 0.2s, box-shadow 0.2s",
      border: "1px solid #f0f0f0"
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.08)"; }}
    >
      <img src={product.image} alt={product.name} style={{ width: "100%", height: 200, objectFit: "cover" }} />
      <div style={{ padding: "1rem" }}>
        <span style={{ fontSize: "0.7rem", background: "#f0f4ff", color: "#4361ee", padding: "2px 10px", borderRadius: 12, fontWeight: 600 }}>{product.category}</span>
        <h3 style={{ margin: "0.5rem 0 0.25rem", fontSize: "0.95rem", fontWeight: 700, color: "#1a1a2e" }}>{product.name}</h3>
        <p style={{ fontSize: "0.8rem", color: "#888", margin: "0 0 0.75rem", lineHeight: 1.4 }}>{product.description?.slice(0, 60)}...</p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: 800, fontSize: "1.1rem", color: "#e94560" }}>Rs.{product.price}</span>
          <button onClick={handleAdd} style={{
            background: added ? "#10b981" : "#e94560", color: "#fff", border: "none",
            padding: "0.4rem 1rem", borderRadius: 20, cursor: "pointer", fontWeight: 600, fontSize: "0.8rem",
            transition: "background 0.3s"
          }}>
            {added ? "✓ Added" : "+ Cart"}
          </button>
        </div>
        <div style={{ fontSize: "0.75rem", color: product.stock > 0 ? "#10b981" : "#e94560", marginTop: 6 }}>
          {product.stock > 0 ? `Rs.${product.stock} in stock` : "Out of stock"}
        </div>
      </div>
    </div>
  );
}

// ─── Pages ────────────────────────────────────────────────────────────────────

function HomePage({ setPage, products, setSelectedProduct }) {
  const { addToCart } = useCart();
  const featured = products.slice(0, 4);
  const categories = [...new Set(products.map(p => p.category))];

  return (
    <div>
      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        color: "#fff", padding: "5rem 2rem", textAlign: "center", position: "relative", overflow: "hidden"
      }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.1, backgroundImage: "radial-gradient(circle at 20% 50%, #e94560 0%, transparent 50%), radial-gradient(circle at 80% 20%, #4361ee 0%, transparent 50%)" }} />
        <div style={{ position: "relative", maxWidth: 700, margin: "0 auto" }}>
          <div style={{ fontSize: "0.85rem", letterSpacing: 3, color: "#e94560", fontWeight: 700, marginBottom: "1rem", textTransform: "uppercase" }}>New Arrivals 2026</div>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 900, margin: "0 0 1rem", lineHeight: 1.1 }}>
            Discover Products <br /><span style={{ color: "#e94560" }}>You'll Love</span>
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "1.1rem", marginBottom: "2rem" }}>
            Curated electronics, fashion, sports gear and home essentials — all in one place.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => setPage("products")} style={{ background: "#e94560", color: "#fff", border: "none", padding: "0.8rem 2rem", borderRadius: 30, cursor: "pointer", fontWeight: 700, fontSize: "1rem" }}>
              Shop Now →
            </button>
            <button onClick={() => setPage("cart")} style={{ background: "transparent", color: "#fff", border: "2px solid rgba(255,255,255,0.3)", padding: "0.8rem 2rem", borderRadius: 30, cursor: "pointer", fontWeight: 700, fontSize: "1rem" }}>
              View Cart
            </button>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div style={{ maxWidth: 1200, margin: "3rem auto", padding: "0 1.5rem" }}>
        <h2 style={{ fontWeight: 800, fontSize: "1.5rem", color: "#1a1a2e", marginBottom: "1.5rem" }}>Shop by Category</h2>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setPage("products")} style={{
              background: "#f0f4ff", color: "#4361ee", border: "none", padding: "0.6rem 1.5rem",
              borderRadius: 24, cursor: "pointer", fontWeight: 600, fontSize: "0.9rem"
            }}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <div style={{ maxWidth: 1200, margin: "0 auto 4rem", padding: "0 1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ fontWeight: 800, fontSize: "1.5rem", color: "#1a1a2e", margin: 0 }}>Featured Products</h2>
          <button onClick={() => setPage("products")} style={{ background: "none", color: "#e94560", border: "none", cursor: "pointer", fontWeight: 600 }}>View All →</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1.5rem" }}>
          {featured.map(p => <ProductCard key={p._id} product={p} setPage={setPage} setSelectedProduct={setSelectedProduct} />)}
        </div>
      </div>

      {/* Banner */}
      <div style={{ background: "#e94560", color: "#fff", textAlign: "center", padding: "3rem 2rem" }}>
        <h2 style={{ fontWeight: 900, fontSize: "2rem", margin: "0 0 0.5rem" }}>Free Shipping on Orders Over $100</h2>
        <p style={{ opacity: 0.9, margin: "0 0 1.5rem" }}>Use code FREESHIP at checkout</p>
        <button onClick={() => setPage("products")} style={{ background: "#fff", color: "#e94560", border: "none", padding: "0.8rem 2rem", borderRadius: 30, cursor: "pointer", fontWeight: 700 }}>
          Shop Now
        </button>
      </div>
    </div>
  );
}

function ProductsPage({ products, search, setPage, setSelectedProduct }) {
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("default");
  const categories = ["All", ...new Set(products.map(p => p.category))];

  let filtered = products.filter(p =>
    (category === "All" || p.category === category) &&
    (!search || p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()))
  );
  if (sort === "price-asc") filtered = [...filtered].sort((a, b) => a.price - b.price);
  if (sort === "price-desc") filtered = [...filtered].sort((a, b) => b.price - a.price);
  if (sort === "name") filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1.5rem" }}>
      <h1 style={{ fontWeight: 800, fontSize: "1.8rem", color: "#1a1a2e", marginBottom: "1.5rem" }}>
        {search ? `Results for "Rs.${search}"` : "All Products"}
      </h1>

      {/* Filters */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)} style={{
              background: category === cat ? "#e94560" : "#f0f4ff",
              color: category === cat ? "#fff" : "#4361ee",
              border: "none", padding: "0.4rem 1rem", borderRadius: 20, cursor: "pointer", fontWeight: 600, fontSize: "0.85rem"
            }}>
              {cat}
            </button>
          ))}
        </div>
        <select onChange={e => setSort(e.target.value)} value={sort} style={{ marginLeft: "auto", padding: "0.4rem 1rem", borderRadius: 20, border: "1px solid #e0e0e0", background: "#fff", cursor: "pointer" }}>
          <option value="default">Sort: Default</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="name">Name A-Z</option>
        </select>
      </div>

      <p style={{ color: "#888", marginBottom: "1.5rem", fontSize: "0.9rem" }}>{filtered.length} products found</p>

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem", color: "#888" }}>
          <div style={{ fontSize: "3rem" }}>🔍</div>
          <h3>No products found</h3>
          <p>Try a different search or category</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1.5rem" }}>
          {filtered.map(p => <ProductCard key={p._id} product={p} setPage={setPage} setSelectedProduct={setSelectedProduct} />)}
        </div>
      )}
    </div>
  );
}

function ProductDetailPage({ product, setPage }) {
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) return <div style={{ padding: "4rem", textAlign: "center" }}>Product not found. <button onClick={() => setPage("products")}>Back</button></div>;

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div style={{ maxWidth: 1000, margin: "2rem auto", padding: "0 1.5rem" }}>
      <button onClick={() => setPage("products")} style={{ background: "none", border: "none", color: "#4361ee", cursor: "pointer", fontWeight: 600, marginBottom: "1.5rem", fontSize: "0.9rem" }}>
        ← Back to Products
      </button>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", alignItems: "start" }}>
        <img src={product.image} alt={product.name} style={{ width: "100%", borderRadius: 20, objectFit: "cover", maxHeight: 450 }} />
        <div>
          <span style={{ fontSize: "0.75rem", background: "#f0f4ff", color: "#4361ee", padding: "3px 12px", borderRadius: 12, fontWeight: 600 }}>{product.category}</span>
          <h1 style={{ fontWeight: 900, fontSize: "1.8rem", color: "#1a1a2e", margin: "0.75rem 0 0.5rem" }}>{product.name}</h1>
          <p style={{ color: "#555", lineHeight: 1.7, marginBottom: "1.5rem" }}>{product.description}</p>
          <div style={{ fontSize: "2rem", fontWeight: 900, color: "#e94560", marginBottom: "1rem" }}>Rs.{product.price}</div>
          <div style={{ fontSize: "0.85rem", color: product.stock > 0 ? "#10b981" : "#e94560", marginBottom: "1.5rem", fontWeight: 600 }}>
            {product.stock > 0 ? `✓ In Stock (Rs.${product.stock} available)` : "✗ Out of Stock"}
          </div>

          <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "1.5rem" }}>
            <label style={{ fontWeight: 600, fontSize: "0.9rem" }}>Qty:</label>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", background: "#f5f5f5", borderRadius: 30, padding: "0.3rem 1rem" }}>
              <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem", fontWeight: 700, color: "#e94560" }}>-</button>
              <span style={{ fontWeight: 700, minWidth: 20, textAlign: "center" }}>{qty}</span>
              <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem", fontWeight: 700, color: "#e94560" }}>+</button>
            </div>
          </div>

          <button onClick={handleAdd} disabled={product.stock === 0} style={{
            background: added ? "#10b981" : "#e94560", color: "#fff", border: "none",
            padding: "0.9rem 2rem", borderRadius: 30, cursor: "pointer", fontWeight: 700,
            fontSize: "1rem", width: "100%", transition: "background 0.3s"
          }}>
            {added ? "✓ Added to Cart!" : "Add to Cart"}
          </button>

          <button onClick={() => setPage("cart")} style={{ background: "transparent", color: "#e94560", border: "2px solid #e94560", padding: "0.9rem 2rem", borderRadius: 30, cursor: "pointer", fontWeight: 700, fontSize: "1rem", width: "100%", marginTop: "0.75rem" }}>
            View Cart
          </button>
        </div>
      </div>
    </div>
  );
}

function CartPage({ setPage }) {
  const { cart, removeFromCart, updateQty, total, clearCart } = useCart();
  const { user } = useAuth();

  if (cart.length === 0) return (
    <div style={{ textAlign: "center", padding: "5rem 2rem" }}>
      <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🛒</div>
      <h2 style={{ color: "#1a1a2e", fontWeight: 800 }}>Your cart is empty</h2>
      <p style={{ color: "#888" }}>Add some products to get started!</p>
      <button onClick={() => setPage("products")} style={{ background: "#e94560", color: "#fff", border: "none", padding: "0.8rem 2rem", borderRadius: 30, cursor: "pointer", fontWeight: 700, marginTop: "1rem" }}>
        Start Shopping
      </button>
    </div>
  );

  return (
    <div style={{ maxWidth: 900, margin: "2rem auto", padding: "0 1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 style={{ fontWeight: 800, fontSize: "1.8rem", color: "#1a1a2e", margin: 0 }}>Shopping Cart</h1>
        <button onClick={clearCart} style={{ background: "none", color: "#e94560", border: "1px solid #e94560", padding: "0.4rem 1rem", borderRadius: 20, cursor: "pointer", fontWeight: 600, fontSize: "0.85rem" }}>
          Clear Cart
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "2rem" }}>
        {/* Items */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {cart.map(item => (
            <div key={item._id} style={{ display: "flex", gap: "1rem", background: "#fff", borderRadius: 16, padding: "1rem", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", alignItems: "center" }}>
              <img src={item.image} alt={item.name} style={{ width: 80, height: 80, borderRadius: 12, objectFit: "cover" }} />
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: "0 0 0.25rem", fontSize: "1rem", fontWeight: 700 }}>{item.name}</h3>
                <div style={{ color: "#888", fontSize: "0.85rem" }}>{item.category}</div>
                <div style={{ color: "#e94560", fontWeight: 800, fontSize: "1rem", marginTop: "0.25rem" }} >Rs.  {item.price}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", background: "#f5f5f5", borderRadius: 30, padding: "0.3rem 0.75rem" }}>
                <button onClick={() => updateQty(item._id, item.qty - 1)} style={{ background: "none", border: "none", cursor: "pointer", fontWeight: 700, color: "#e94560", fontSize: "1.1rem" }}>-</button>
                <span style={{ fontWeight: 700 }}>{item.qty}</span>
                <button onClick={() => updateQty(item._id, item.qty + 1)} style={{ background: "none", border: "none", cursor: "pointer", fontWeight: 700, color: "#e94560", fontSize: "1.1rem" }}>+</button>
              </div>
              <div style={{ fontWeight: 800, fontSize: "1rem", minWidth: 70, textAlign: "right" }} >Rs.  {(item.price * item.qty).toFixed(2)}</div>
              <button onClick={() => removeFromCart(item._id)} style={{ background: "none", border: "none", color: "#ccc", cursor: "pointer", fontSize: "1.2rem", padding: "0.25rem" }}>✕</button>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div style={{ background: "#fff", borderRadius: 16, padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", minWidth: 240, alignSelf: "start" }}>
          <h3 style={{ fontWeight: 800, marginBottom: "1rem" }}>Order Summary</h3>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", color: "#888", fontSize: "0.9rem" }}>
            <span>Subtotal</span><span >Rs.  {total.toFixed(2)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", color: "#888", fontSize: "0.9rem" }}>
            <span>Shipping</span><span style={{ color: "#10b981" }}>{total >= 100 ? "FREE" : "$9.99"}</span>
          </div>
          <hr style={{ borderColor: "#f0f0f0", margin: "1rem 0" }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: "1.1rem", marginBottom: "1.5rem" }}>
            <span>Total</span><span style={{ color: "#e94560" }} >Rs.  {(total >= 100 ? total : total + 9.99).toFixed(2)}</span>
          </div>
          <button onClick={() => user ? alert("Order placed! Thank you for your purchase.") : setPage("auth")} style={{
            background: "#e94560", color: "#fff", border: "none", width: "100%",
            padding: "0.9rem", borderRadius: 30, cursor: "pointer", fontWeight: 700, fontSize: "1rem"
          }}>
            {user ? "Place Order" : "Login to Checkout"}
          </button>
          <button onClick={() => setPage("products")} style={{ background: "transparent", color: "#555", border: "none", width: "100%", padding: "0.6rem", cursor: "pointer", marginTop: "0.5rem", fontSize: "0.85rem" }}>
            ← Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}

function AuthPage({ setPage }) {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError(""); setLoading(true);
    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const data = await apiFetch(endpoint, { method: "POST", body: JSON.stringify(form) });
      login(data.user, data.token);
      setPage("home");
    } catch (err) {
      // Demo mode fallback
      if (form.email && form.password) {
        const mockUser = { _id: "u1", name: form.name || form.email.split("@")[0], email: form.email, role: form.email.includes("admin") ? "admin" : "user" };
        login(mockUser, "demo-token");
        setPage("home");
      } else {
        setError("Please fill in all fields.");
      }
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ background: "#fff", padding: "2.5rem", borderRadius: 20, boxShadow: "0 8px 32px rgba(0,0,0,0.1)", maxWidth: 420, width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h2 style={{ fontWeight: 900, fontSize: "1.8rem", color: "#1a1a2e", margin: "0 0 0.5rem" }}>
            {isLogin ? "Welcome back!" : "Create Account"}
          </h2>
          <p style={{ color: "#888", margin: 0 }}>{isLogin ? "Sign in to your account" : "Join ShopNow today"}</p>
        </div>

        {error && <div style={{ background: "#fee2e2", color: "#dc2626", padding: "0.75rem 1rem", borderRadius: 10, marginBottom: "1rem", fontSize: "0.9rem" }}>{error}</div>}

        {!isLogin && (
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Full Name"
            style={{ width: "100%", padding: "0.8rem 1rem", borderRadius: 12, border: "1.5px solid #e0e0e0", marginBottom: "1rem", fontSize: "0.95rem", boxSizing: "border-box" }} />
        )}
        <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email" type="email"
          style={{ width: "100%", padding: "0.8rem 1rem", borderRadius: 12, border: "1.5px solid #e0e0e0", marginBottom: "1rem", fontSize: "0.95rem", boxSizing: "border-box" }} />
        <input value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Password" type="password"
          style={{ width: "100%", padding: "0.8rem 1rem", borderRadius: 12, border: "1.5px solid #e0e0e0", marginBottom: "1.5rem", fontSize: "0.95rem", boxSizing: "border-box" }} />

        <button onClick={handleSubmit} disabled={loading} style={{
          width: "100%", background: "#e94560", color: "#fff", border: "none",
          padding: "0.9rem", borderRadius: 30, cursor: "pointer", fontWeight: 700, fontSize: "1rem"
        }}>
          {loading ? "..." : isLogin ? "Sign In" : "Create Account"}
        </button>

        <p style={{ textAlign: "center", marginTop: "1.5rem", color: "#888", fontSize: "0.9rem" }}>
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <span onClick={() => setIsLogin(!isLogin)} style={{ color: "#e94560", cursor: "pointer", fontWeight: 600 }}>
            {isLogin ? "Sign up" : "Sign in"}
          </span>
        </p>
        <p style={{ textAlign: "center", color: "#aaa", fontSize: "0.8rem", marginTop: "0.5rem" }}>
          💡 Use any email with "admin" for admin access in demo mode
        </p>
      </div>
    </div>
  );
}

function AdminPage({ products, setProducts }) {
  const { token, isAdmin } = useAuth();
  const [form, setForm] = useState({ name: "", price: "", category: "", image: "", description: "", stock: "" });
  const [editing, setEditing] = useState(null);
  const [msg, setMsg] = useState("");

  if (!isAdmin) return (
    <div style={{ textAlign: "center", padding: "5rem 2rem" }}>
      <div style={{ fontSize: "3rem" }}>🔒</div>
      <h2>Admin Access Required</h2>
      <p style={{ color: "#888" }}>You need admin privileges to view this page.</p>
    </div>
  );

  const handleSave = () => {
    if (!form.name || !form.price) { setMsg("Name and price are required."); return; }
    const product = { ...form, price: parseFloat(form.price), stock: parseInt(form.stock) || 0, _id: editing || Date.now().toString(), image: form.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400" };
    if (editing) {
      setProducts(prev => prev.map(p => p._id === editing ? product : p));
      setMsg("Product updated!");
    } else {
      setProducts(prev => [...prev, product]);
      setMsg("Product added!");
    }
    setForm({ name: "", price: "", category: "", image: "", description: "", stock: "" });
    setEditing(null);
    setTimeout(() => setMsg(""), 3000);
  };

  const handleEdit = (p) => {
    setEditing(p._id);
    setForm({ name: p.name, price: p.price, category: p.category, image: p.image, description: p.description, stock: p.stock });
  };

  const handleDelete = (id) => {
    if (confirm("Delete this product?")) { setProducts(prev => prev.filter(p => p._id !== id)); setMsg("Deleted."); }
  };

  const inputStyle = { width: "100%", padding: "0.7rem 1rem", borderRadius: 10, border: "1.5px solid #e0e0e0", fontSize: "0.9rem", boxSizing: "border-box", marginBottom: "0.75rem" };

  return (
    <div style={{ maxWidth: 1200, margin: "2rem auto", padding: "0 1.5rem" }}>
      <h1 style={{ fontWeight: 900, fontSize: "1.8rem", color: "#1a1a2e", marginBottom: "2rem" }}>🛠 Admin Panel</h1>

      <div style={{ display: "grid", gridTemplateColumns: "350px 1fr", gap: "2rem" }}>
        {/* Form */}
        <div style={{ background: "#fff", padding: "1.5rem", borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.07)", alignSelf: "start" }}>
          <h3 style={{ fontWeight: 800, marginBottom: "1.25rem" }}>{editing ? "Edit Product" : "Add New Product"}</h3>
          {msg && <div style={{ background: "#d1fae5", color: "#065f46", padding: "0.6rem 1rem", borderRadius: 8, marginBottom: "1rem", fontSize: "0.85rem" }}>{msg}</div>}
          <input placeholder="Product Name*" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} />
          <input placeholder="Price*" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} style={inputStyle} />
          <input placeholder="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={inputStyle} />
          <input placeholder="Image URL" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} style={inputStyle} />
          <input placeholder="Stock" type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} style={inputStyle} />
          <textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3}
            style={{ ...inputStyle, resize: "vertical" }} />
          <button onClick={handleSave} style={{ width: "100%", background: "#e94560", color: "#fff", border: "none", padding: "0.8rem", borderRadius: 30, cursor: "pointer", fontWeight: 700 }}>
            {editing ? "Update Product" : "Add Product"}
          </button>
          {editing && (
            <button onClick={() => { setEditing(null); setForm({ name: "", price: "", category: "", image: "", description: "", stock: "" }); }} style={{ width: "100%", background: "transparent", color: "#888", border: "none", padding: "0.5rem", cursor: "pointer", marginTop: "0.5rem" }}>
              Cancel
            </button>
          )}
        </div>

        {/* Products Table */}
        <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.07)", overflow: "hidden" }}>
          <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f0f0f0" }}>
            <h3 style={{ margin: 0, fontWeight: 800 }}>Products ({products.length})</h3>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ background: "#f8f9fa" }}>
                  {["Image", "Name", "Price", "Category", "Stock", "Actions"].map(h => (
                    <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: 700, color: "#555", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p._id} style={{ borderTop: "1px solid #f0f0f0" }}>
                    <td style={{ padding: "0.75rem 1rem" }}><img src={p.image} alt="" style={{ width: 48, height: 48, borderRadius: 8, objectFit: "cover" }} /></td>
                    <td style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>{p.name}</td>
                    <td style={{ padding: "0.75rem 1rem", color: "#e94560", fontWeight: 700 }} >Rs.  {p.price}</td>
                    <td style={{ padding: "0.75rem 1rem" }}><span style={{ background: "#f0f4ff", color: "#4361ee", padding: "2px 8px", borderRadius: 10, fontSize: "0.75rem", fontWeight: 600 }}>{p.category}</span></td>
                    <td style={{ padding: "0.75rem 1rem" }}>{p.stock}</td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <button onClick={() => handleEdit(p)} style={{ background: "#f0f4ff", color: "#4361ee", border: "none", padding: "0.3rem 0.75rem", borderRadius: 8, cursor: "pointer", fontWeight: 600, marginRight: "0.5rem", fontSize: "0.8rem" }}>Edit</button>
                      <button onClick={() => handleDelete(p._id)} style={{ background: "#fee2e2", color: "#dc2626", border: "none", padding: "0.3rem 0.75rem", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: "0.8rem" }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function Footer({ setPage }) {
  return (
    <footer style={{ background: "#1a1a2e", color: "#94a3b8", padding: "3rem 2rem 2rem" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "2rem", marginBottom: "2rem" }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: "1.2rem", color: "#e94560", marginBottom: "0.75rem" }}>⚡ ShopNow</div>
            <p style={{ fontSize: "0.85rem", lineHeight: 1.7 }}>Your one-stop shop for electronics, fashion, sports, and home essentials.</p>
          </div>
          {[["Shop", ["Home", "Products", "Cart"]], ["Account", ["Login", "Register"]]].map(([title, links]) => (
            <div key={title}>
              <div style={{ fontWeight: 700, color: "#fff", marginBottom: "0.75rem" }}>{title}</div>
              {links.map(l => <div key={l} onClick={() => setPage(l.toLowerCase())} style={{ fontSize: "0.85rem", cursor: "pointer", marginBottom: "0.5rem" }}>{l}</div>)}
            </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "1.5rem", textAlign: "center", fontSize: "0.8rem" }}>
          © 2026 ShopNow. Built with React + Node.js + MongoDB
        </div>
      </div>
    </footer>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [products, setProducts] = useState(SAMPLE_PRODUCTS);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // Try to fetch from backend (will silently fall back to sample data)
  useEffect(() => {
    setLoading(true);
    apiFetch("/products")
      .then(data => { if (data?.length) setProducts(data); })
      .catch(() => {}) // Use sample data as fallback
      .finally(() => setLoading(false));
  }, []);

  const renderPage = () => {
    switch (page) {
      case "home": return <HomePage setPage={setPage} products={products} setSelectedProduct={setSelectedProduct} />;
      case "products": return <ProductsPage products={products} search={search} setPage={setPage} setSelectedProduct={setSelectedProduct} />;
      case "product": return <ProductDetailPage product={selectedProduct} setPage={setPage} />;
      case "cart": return <CartPage setPage={setPage} />;
      case "auth": return <AuthPage setPage={setPage} />;
      case "admin": return <AdminPage products={products} setProducts={setProducts} />;
      default: return <HomePage setPage={setPage} products={products} setSelectedProduct={setSelectedProduct} />;
    }
  };

  return (
    <AuthProvider>
      <CartProvider>
        <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", minHeight: "100vh", background: "#f8f9fa", color: "#1a1a2e" }}>
          <Navbar page={page} setPage={setPage} search={search} setSearch={setSearch} />
          <main style={{ minHeight: "calc(100vh - 64px - 200px)" }}>
            {renderPage()}
          </main>
          <Footer setPage={setPage} />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}
