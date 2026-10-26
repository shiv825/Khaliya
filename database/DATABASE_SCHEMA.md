# Khaliya Restaurant - Database Architecture & Schema Specification

## 1. Database Overview
- **Database Engine**: MongoDB (MongoDB Atlas Cloud Cluster)
- **Object Data Modeling (ODM)**: Mongoose (Node.js)
- **Primary Database Name**: `khaliya`
- **Connection Variable**: `MONGODB_URI` (defined in `backend/.env`)
- **Default Connection Pattern**: `mongodb+srv://<username>:<password>@<cluster>.mongodb.net/khaliya?retryWrites=true&w=majority`

---

## 2. Collections & Schema Definitions

### 2.1. `menu` Collection
Stores all restaurant dishes, pricing, dietary tags, categories, and high-resolution image links.
```javascript
{
  id: mongoose.Schema.Types.Mixed,       // Unique item identifier (Number or String)
  category: String,                      // Category: "Starters", "Main Course", "Breads", "Desserts", "Beverages"
  name: mongoose.Schema.Types.Mixed,     // Dish Name: String or Localized Object { en: String, hi: String }
  description: mongoose.Schema.Types.Mixed, // Description: String or Localized Object
  price: String,                         // Price string (e.g., "350" or "₹350")
  tags: [String],                        // Dietary tags: ["Veg", "Non-Veg", "Spicy", "Chef's Special"]
  image: String                          // Cloudinary CDN URL or local static asset path
}
```

### 2.2. `bookings` Collection
Stores guest table reservations and online dining inquiries.
```javascript
{
  id: Number,                            // Timestamp ID or sequential booking ID
  timestamp: String,                     // ISO 8601 creation timestamp
  status: String,                        // "Pending", "Confirmed", "Seated", "Cancelled", "Completed"
  source: String,                        // "Website", "Walk-in", "Phone"
  specialRequests: String,               // Guest notes, dietary allergies, celebration requests
  date: String,                          // Reservation date (YYYY-MM-DD)
  time: String,                          // Reservation time slot (e.g., "19:30")
  name: String,                          // Guest Full Name
  email: String,                         // Guest Email address
  phone: String,                         // Guest Phone Number
  guests: Number,                        // Number of covers / guests
  tableType: String                      // Preferred seating: "Standard", "Romantic", "Window", "Family Lounge"
}
```

### 2.3. `orders` Collection
Tracks dining hall table orders, takeaway, online deliveries, and POS transactions.
```javascript
{
  id: String,                            // Unique Order ID (e.g., "ORD-1718000000000")
  timestamp: String,                     // Order placement timestamp
  status: String,                        // "Pending", "Preparing", "Served", "Billed", "Completed", "Cancelled"
  items: [                               // Array of order items
    {
      id: mongoose.Schema.Types.Mixed,
      name: String,
      price: Number,
      quantity: Number,
      notes: String
    }
  ],
  total: Number,                         // Final bill total amount in INR
  name: String,                          // Customer name
  phone: String,                         // Customer phone number
  tableNumber: String,                   // Table number (e.g., "T-01" or "Takeaway")
  source: String,                        // "Dine-In", "Takeaway", "Online"
  pointsUsed: Number,                    // Loyalty points redeemed
  pointsEarned: Number,                  // Loyalty points awarded
  email: String                          // Customer email for digital bill receipt
}
```

### 2.4. `reviews` Collection
Guest feedback and customer reviews.
```javascript
{
  id: Number,                            // Unique review ID
  date: String,                          // Review submission date (YYYY-MM-DD)
  name: String,                          // Reviewer name
  rating: Number,                        // 1 to 5 Star Rating
  comment: String                        // Testimonial feedback text
}
```

### 2.5. `users` Collection
Customer loyalty accounts and staff/admin credentials.
```javascript
{
  id: String,                            // User identifier or Phone/Email hash
  email: String,                         // Unique user email
  name: String,                          // User display name
  joinedAt: String,                      // Registration timestamp
  spicePoints: Number,                   // Reward / Loyalty points balance
  role: String,                          // "customer", "staff", "manager", "admin"
  currentSessionId: String               // Active JWT or session tracker
}
```

### 2.6. `tables` Collection
Dining room layout, capacity, live occupancy status, and table-merging state.
```javascript
{
  id: String,                            // Table ID (e.g., "T1", "T2", "ROOF-01")
  name: String,                          // Friendly display name (e.g., "Table 1")
  capacity: Number,                      // Standard seat count
  tableType: String,                     // "Standard", "Booth", "Window", "VIP", "Terrace"
  section: String,                       // "Ground Floor", "First Floor", "Terrace Garden"
  status: String,                        // "Available", "Occupied", "Reserved", "Billed", "Cleaning"
  session: mongoose.Schema.Types.Mixed,  // Active order session, start time, seated guests
  mergedTables: [String],                // Sub-table IDs merged into this master table
  mergedInto: String,                    // Parent table ID if this table is merged
  effectiveCapacity: Number              // Total seat count when merged
}
```

### 2.7. `settings` Collection
Global operational flags and restaurant metadata.
```javascript
{
  isOpen: Boolean,                       // Store open/closed status for accepting orders
  deliveryEnabled: Boolean,              // Enable/disable delivery checkout
  taxRate: Number,                       // GST percentage
  restaurantName: String,                // "Khaliya Restaurant"
  address: String,                       // Physical location
  phone: String                          // Official contact number
}
```

### 2.8. `staff` Collection
Staff directory, POS access PINs, roles, and attendance status.
```javascript
{
  id: String,                            // Staff identifier
  name: String,                          // Staff member full name
  role: String,                          // "Captain", "Waiter", "Chef", "Cashier", "Manager"
  pin: String,                           // Encrypted or 4-digit quick POS access PIN
  phone: String,                         // Contact phone number
  status: String,                        // "Active", "On Break", "Off Duty"
  shift: String                          // "Morning", "Evening", "Night"
}
```

### 2.9. `shifts` Collection
Cash register and POS shift management, float tracking, and variance reconciliation.
```javascript
{
  id: String,                            // Shift identifier
  staffId: String,                       // Opening staff ID
  staffName: String,                     // Opening cashier / manager name
  shiftName: String,                     // "Morning Shift", "Dinner Shift"
  openedAt: String,                      // Shift start ISO timestamp
  closedAt: String,                      // Shift end ISO timestamp
  openingFloat: Number,                  // Starting cash drawer balance
  status: String,                        // "Open", "Closed"
  cashSales: Number,                     // Total cash recorded during shift
  expectedCash: Number,                  // openingFloat + cashSales
  actualCash: Number,                    // Physical cash counted at drawer closing
  variance: Number,                      // actualCash - expectedCash (surplus / deficit)
  notes: String                          // Cashier closing reconciliation remarks
}
```

### 2.10. `printers` Collection
Network thermal receipt and KOT (Kitchen Order Ticket) printer devices.
```javascript
{
  id: String,                            // Printer identifier (e.g., "PRN-KITCHEN")
  name: String,                          // "Kitchen KOT 1", "Bar Counter", "Main Cashier"
  type: String,                          // "Network", "USB", "Bluetooth"
  ip: String,                            // Local network IP address (e.g., "192.168.1.200")
  port: Number,                          // Typically 9100 for RAW thermal ESC/POS
  paperWidth: Number,                    // 80 (80mm) or 58 (58mm)
  status: String                         // "Online", "Offline", "Error"
}
```

### 2.11. `print_queue` Collection
Queued print jobs for POS tickets and kitchen KOT slips.
```javascript
{
  id: String,                            // Job UUID
  orderId: String,                       // Associated order ID
  invoiceNo: String,                     // Tax Invoice Number
  ticketType: String,                    // "KOT", "BOT", "CUSTOMER_BILL", "RECEIPT"
  payload: mongoose.Schema.Types.Mixed,  // Rendered line items, modifiers, totals
  status: String,                        // "Pending", "Printed", "Failed"
  createdAt: String                      // Creation timestamp
}
```

### 2.12. `audit_logs` Collection
Immutable record of sensitive operations (discounts, table cancellations, bill splits, refunds).
```javascript
{
  id: String,                            // Log entry ID
  timestamp: String,                     // ISO 8601 timestamp
  staffName: String,                     // Acting staff member
  action: String,                        // "SPLIT_BILL", "DISCOUNT_APPLIED", "VOID_ITEM"
  details: String,                       // Detailed event description
  reason: String,                        // Justification provided by staff
  splits: mongoose.Schema.Types.Mixed    // Split proportions or payment details
}
```

### 2.13. `visits` Collection
Page view tracking and traffic analytics.
```javascript
{
  id: Number,                            // Unique sequential ID
  date: String,                          // ISO timestamp of visit
  source: String                         // Traffic referrer / device category
}
```

---

## 3. Relational Equivalent (SQL Schema Reference)
For developers migrating to PostgreSQL or MySQL, the corresponding relational tables can be created as follows:

```sql
-- Menu
CREATE TABLE menu (
    id VARCHAR(64) PRIMARY KEY,
    category VARCHAR(64) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    tags JSON,
    image VARCHAR(1024)
);

-- Tables
CREATE TABLE dining_tables (
    id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    capacity INT NOT NULL,
    table_type VARCHAR(64) DEFAULT 'Standard',
    section VARCHAR(64),
    status VARCHAR(32) DEFAULT 'Available',
    session_data JSON,
    merged_tables JSON,
    merged_into VARCHAR(32),
    effective_capacity INT
);

-- Orders
CREATE TABLE orders (
    id VARCHAR(64) PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(32) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    customer_name VARCHAR(255),
    customer_phone VARCHAR(32),
    customer_email VARCHAR(255),
    table_number VARCHAR(32),
    source VARCHAR(32),
    points_used INT DEFAULT 0,
    points_earned INT DEFAULT 0,
    items JSON NOT NULL
);

-- Bookings
CREATE TABLE bookings (
    id BIGINT PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(32) DEFAULT 'Pending',
    source VARCHAR(32) DEFAULT 'Website',
    special_requests TEXT,
    reservation_date DATE NOT NULL,
    reservation_time VARCHAR(16) NOT NULL,
    guest_name VARCHAR(255) NOT NULL,
    guest_email VARCHAR(255),
    guest_phone VARCHAR(32) NOT NULL,
    guests_count INT NOT NULL,
    table_type VARCHAR(64)
);

-- Users
CREATE TABLE users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    name VARCHAR(255),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    spice_points INT DEFAULT 0,
    role VARCHAR(32) DEFAULT 'customer',
    current_session_id VARCHAR(255)
);
```

---

## 4. Seeding & Restoring Data
Seed data is preserved inside the `/database/seed-data/` folder:
- `menu.json` (44 active menu items)
- `tables.json` (11 dining tables & floor plan)
- `settings.json` (global restaurant settings)
- `reviews.json` (customer reviews)
- `users.json` (user accounts)

To restore or seed any MongoDB instance:
```bash
# From project root:
node database/seed-data/seed.js

# Or with custom MongoDB connection URI:
node database/seed-data/seed.js "mongodb+srv://user:pass@cluster.mongodb.net/khaliya"
```
