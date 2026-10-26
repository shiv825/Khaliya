# Khaliya Restaurant - Full Stack Restaurant Management System

A modern full-stack web application for **Khaliya Restaurant**, featuring a responsive customer-facing ordering & table booking portal, dining table management, real-time POS, staff shifts, kitchen order tickets (KOT), audit logs, and digital receipts.

---

## 🏗️ Project Architecture

```
Khaliya Restaurant/
├── frontend/               # React + Vite customer portal, PWA & Admin POS
│   ├── src/                # Components, pages, contexts, hooks
│   ├── public/             # Static assets, icons, manifest
│   ├── api/                # Serverless handlers (e.g. OTP)
│   ├── package.json        # Frontend dependencies
│   └── vite.config.js      # Vite build configuration
│
├── backend/                # Node.js + Express + Mongoose Backend API
│   ├── server.js           # Core REST API server, sockets & POS endpoints
│   ├── db.js               # MongoDB Mongoose schemas & Atlas connection
│   ├── templates/          # Responsive email templates (OTP, receipt, booking)
│   ├── uploads/            # Media and menu asset uploads
│   ├── .env                # Production/Development environment config
│   └── package.json        # Backend dependencies
│
├── database/               # Database Architecture, Schemas & Seed Data
│   ├── DATABASE_SCHEMA.md  # Detailed documentation for all 13 collections & SQL schema
│   ├── schema.json         # Draft-07 JSON Schema specification
│   └── seed-data/          # Active database seed backups
│       ├── menu.json       # 44 dishes, categories, pricing, images
│       ├── tables.json     # 11 dining tables & floor plan layout
│       ├── settings.json   # Store settings & operational flags
│       ├── reviews.json    # Customer feedback & ratings
│       ├── users.json      # User accounts
│       └── seed.js         # Automated MongoDB seeding script
│
└── README.md               # Project guide and setup documentation
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: MongoDB Atlas cluster or local MongoDB instance (v6.0+)
- **NPM**: v9.0.0 or higher

---

### 2. Backend Setup
1. Open a terminal in the `backend` folder:
   ```bash
   cd backend
   npm install
   ```

2. Configure environment variables in `backend/.env`:
   ```ini
   PORT=5005
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   RAZORPAY_KEY_ID=your_razorpay_key
   RAZORPAY_KEY_SECRET=your_razorpay_secret
   ```

3. (Optional) Seed the database with menu dishes and tables:
   ```bash
   # From the project root:
   node database/seed-data/seed.js
   ```

4. Start the backend server:
   ```bash
   npm run dev
   # Server runs at http://localhost:5005
   ```

---

### 3. Frontend Setup
1. Open a terminal in the `frontend` folder:
   ```bash
   cd frontend
   npm install
   ```

2. Start the Vite development server:
   ```bash
   npm run dev
   # App runs at http://localhost:5173
   ```

---

## 🗄️ Database Schemas
Detailed schema documentation is located in [`database/DATABASE_SCHEMA.md`](./database/DATABASE_SCHEMA.md) and [`database/schema.json`](./database/schema.json).

### Collections Overview:
| Collection | Description |
|---|---|
| `menu` | Food items, categories, pricing, dietary tags, images |
| `bookings` | Customer table reservations, time slots, guest count |
| `orders` | Table orders, takeaway, totals, items, status |
| `reviews` | Customer testimonials and 1-5 star ratings |
| `users` | Loyalty accounts, spice points, roles |
| `tables` | Dining floor plan, seating capacity, table-merging state |
| `settings` | Global restaurant operational status and preferences |
| `staff` | Staff members, security access PINs, roles |
| `shifts` | Register shifts, float cash, reconciliation variance |
| `printers` | ESC/POS network thermal receipt & KOT printers |
| `print_queue` | Queued tickets for kitchen order printing |
| `audit_logs` | Immutable audit trail for bill splits, voids, discounts |
| `visits` | Web analytics and traffic tracking |

---

## 📦 Building for Production
- **Frontend Build**:
  ```bash
  cd frontend
  npm run build
  ```
  The production build will be generated in `frontend/dist`.

- **Backend Production**:
  ```bash
  cd backend
  npm start
  ```
