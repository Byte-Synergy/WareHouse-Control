MVP Software Requirements Specification (SRS)

## Inventory Management System for Small Businesses

### 1. Overview

**Project Name**: WareHouse Control  
**Description**: A simple web-based inventory management system for small retail/warehouse businesses  
**Target Users**: Small business owners, shop managers (1-5 users)  
**Tech Stack**:

- **Backend**: Express.js (Node.js)
- **Frontend**: Vue.js (client-side)
- **Database**: SQLite (simplest file-based DB)
- **Authentication**: Simple session-based login

### 2. Core MVP Features

#### 2.1 User Authentication

- **Admin login/logout**
- One default admin account (can be configured)
- Session-based authentication
- Simple password protection

#### 2.2 Product Management

- **Add new products**: Name, SKU, description, category, current stock, minimum stock level
- **Edit existing products**
- **Delete products** (with confirmation)
- **View all products** in a simple table

#### 2.3 Stock Transactions

- **Stock In**: Add stock with quantity, date, reference note
- **Stock Out**: Remove stock with quantity, date, reason
- **Transaction history** for each product

#### 2.4 Automatic Stock Tracking

- Real-time stock level calculation
- Stock updates automatically after each transaction
- Current stock visible in product list

#### 2.5 Stock Alerts

- Visual indicator for low stock items
- Filter to show only low-stock items
- Alert based on minimum stock level per product

#### 2.6 Data Export

- **Export to CSV** button
- Export current product list with stock levels
- Simple CSV format compatible with Excel

### 3. Technical Architecture

#### 3.1 File Structure

```
inventory-mvp/
├── server/
│   ├── server.js          # Express server
│   ├── database.js        # SQLite setup
│   ├── auth.js           # Authentication
│   └── routes/           # API endpoints
├── client/
│   ├── index.html        # Single HTML file
│   ├── app.js            # Vue.js application
│   └── style.css         # Basic styling
└── README.md
```

#### 3.2 Simplified API Endpoints

```
POST   /api/login
POST   /api/logout
GET    /api/products
POST   /api/products
PUT    /api/products/:id
DELETE /api/products/:id
POST   /api/stock/in
POST   /api/stock/out
GET    /api/alerts
GET    /api/export
```

#### 3.3 Database Schema (SQLite)

```sql
-- Products table
CREATE TABLE products (
    id INTEGER PRIMARY KEY,
    sku TEXT UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    current_stock INTEGER DEFAULT 0,
    min_stock INTEGER DEFAULT 5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table
CREATE TABLE transactions (
    id INTEGER PRIMARY KEY,
    product_id INTEGER,
    type TEXT CHECK(type IN ('in', 'out')),
    quantity INTEGER,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Users table (single admin for MVP)
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    username TEXT UNIQUE,
    password_hash TEXT
);
```

### 4. User Interface Requirements

#### 4.1 Pages/Screens

1. **Login Page** (Single form)
2. **Dashboard** (After login)
   - Product list table
   - Quick add stock form
   - Low stock alerts section
3. **Product Management Page**
   - Add/edit product form
   - Product list with edit/delete buttons
4. **Transaction History** (Optional for MVP - can be combined)

#### 4.2 Key UI Components

- Simple navigation bar
- Responsive table for product listing
- Modal forms for add/edit operations
- Clear visual indicators for low stock
- Export button prominently placed

### 5. Non-Functional Requirements

#### 5.1 Performance

- Page load < 3 seconds
- Support up to 500 products
- Handle 5 concurrent users

#### 5.2 Security

- Password hashing (bcrypt)
- Session management
- SQL injection prevention
- XSS protection

#### 5.3 Usability

- No training required for basic users
- Japanese language interface
- Simple, intuitive navigation
- Mobile-responsive design

### 6. Implementation Priority

#### Phase 1 (Week 1-2): Core Foundation

- Set up Express + Vue.js
- Create login system
- Implement basic product CRUD
- Simple stock tracking

#### Phase 2 (Week 3): Essential Features

- Stock in/out transactions
- Automatic stock calculation
- Low stock alerts
- Basic CSV export

#### Phase 3 (Week 4): Polish

- UI improvements
- Error handling
- Data validation
- Documentation

### 7. Limitations (MVP Scope)

#### NOT Included in MVP:

1. Multiple user roles
2. Advanced reporting
3. Barcode scanning
4. Email notifications
5. Multi-location support
6. Purchase order management
7. Supplier management
8. Advanced search/filtering
9. Data import
10. Backup/restore

### 8. Success Criteria

#### MVP Completion When:

- [ ] Admin can log in
- [ ] Products can be added/edited/deleted
- [ ] Stock in/out transactions work
- [ ] Stock levels update automatically
- [ ] Low stock items are visible
- [ ] CSV export works
- [ ] System handles 100+ products
- [ ] Basic error handling implemented

### 9. Deployment Instructions

#### Local Development:

```bash
# 1. Install dependencies
npm install express sqlite3 bcryptjs cors

# 2. Run server
node server.js

# 3. Access at http://localhost:3000
```

#### Production Deployment:

1. Use simple hosting (Heroku, Railway, or VPS)
2. Add environment variables
3. Regular database backups
4. Basic monitoring

---

**Total Estimated Development Time**: 4-6 weeks for a single developer  
**Complexity Level**: Low to Medium  
**Maintenance**: Minimal (SQLite file backups recommended)

This MVP focuses on the absolute essentials with the simplest possible implementation using Express + Vue.js + SQLite. The system can be enhanced later based on user feedback.
