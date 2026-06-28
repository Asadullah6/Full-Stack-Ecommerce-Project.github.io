# ShopNow — Full-Stack eCommerce App
> Intern Project | React + Node.js + Express + **Supabase (PostgreSQL)**

## 🗂 Project Structure
```
ecommerce/
├── frontend/
│   ├── src/App.jsx          ← All React pages + Cart/Auth contexts
│   ├── src/main.jsx
│   ├── index.html
│   └── package.json
│
└── backend/
    ├── supabase.js          ← Supabase client (singleton)
    ├── supabase-schema.sql  ← Run this in Supabase SQL Editor first!
    ├── server.js
    ├── middleware/auth.js   ← JWT protect + adminOnly
    ├── routes/
    │   ├── auth.js          ← register, login, me
    │   ├── products.js      ← CRUD + seed
    │   ├── orders.js        ← place order, my orders, admin orders
    │   └── users.js         ← profile update, admin user list
    ├── .env.example
    └── package.json
```

---

## ⚡ Supabase Setup (do this first — 5 mins)

1. Go to https://supabase.com → "New Project"
2. Choose a name, password, region → Create
3. Go to **SQL Editor** → **New Query**
4. Paste the contents of `backend/supabase-schema.sql` → Run ▶
5. Go to **Settings → API** and copy:
   - `Project URL` → `SUPABASE_URL`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

---

## 🚀 Run Locally

### Backend
```bash
cd backend
cp .env.example .env      # paste your Supabase URL + key
npm install
npm run dev               # http://localhost:5000
```

### Seed Products (optional)
```bash
curl -X POST http://localhost:5000/api/products/seed/all
```

### Frontend
```bash
cd frontend
npm install
npm run dev               # http://localhost:3000
```

---

## 📡 API Endpoints

| Method | Endpoint                    | Access    | Description          |
|--------|-----------------------------|-----------|----------------------|
| POST   | /api/auth/register          | Public    | Register user        |
| POST   | /api/auth/login             | Public    | Login → JWT token    |
| GET    | /api/auth/me                | Protected | Current user info    |
| GET    | /api/products               | Public    | List + search/filter |
| GET    | /api/products/:id           | Public    | Single product       |
| POST   | /api/products               | Admin     | Create product       |
| PUT    | /api/products/:id           | Admin     | Update product       |
| DELETE | /api/products/:id           | Admin     | Delete product       |
| POST   | /api/products/seed/all      | Public    | Seed 8 sample items  |
| POST   | /api/orders                 | Protected | Place order          |
| GET    | /api/orders/my              | Protected | My order history     |
| GET    | /api/orders                 | Admin     | All orders           |
| PUT    | /api/orders/:id/status      | Admin     | Update order status  |
| GET    | /api/users                  | Admin     | All users            |
| PUT    | /api/users/profile          | Protected | Update profile       |

---

## 🛠 Tech Stack
| Layer        | Tech                               |
|--------------|------------------------------------|
| Frontend     | React 18 + Vite                    |
| Backend      | Node.js + Express.js               |
| Database     | **Supabase (PostgreSQL)**          |
| Auth         | JWT + bcryptjs                     |
| Deployment   | Render (backend) + Vercel (frontend)|

## 🔐 Admin Access
- Demo mode: login with any email containing "admin"
- Production: in Supabase Table Editor, set `role = 'admin'` for your user row

## ☁️ Deploy
- **Backend → Render:** set env vars `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`, `CLIENT_URL`
- **Frontend → Vercel:** just push to GitHub, import in Vercel
- **Database → Supabase:** already hosted, nothing to deploy!

---
*GitHub repo: `ecommerce-fullstack-design`*
