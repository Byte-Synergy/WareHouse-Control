# Frontend Improvements

This document describes the frontend enhancements made to WareHouse Control and how to extend the app further.

## What Was Done

### 1. Design system (CSS)

- **Design tokens** in `style.css`: CSS variables for colors, spacing, typography, shadows, and radii (`:root`).
- **Typography**: Inter font (Google Fonts), consistent font sizes and weights.
- **Semantic colors**: Primary (indigo), success, warning, danger, info with light backgrounds for alerts.
- **Components**: Reusable card, button, form, table, and modal styles.

### 2. Hash-based routing

- **Routes**: `#/` (Dashboard), `#/products` (商品管理), `#/alerts` (低在庫), `#/history` (取引履歴).
- **Implementation**: `currentPage` is derived from `window.location.hash` in `app.js`; nav links use `<a href="#/...">` so the back button and bookmarks work.
- **No existing behavior removed**: Product CRUD, stock in/out, CSV export, low-stock filter, and modals work as before.

### 3. New pages

- **Dashboard (`#/`)**: Summary cards (total products, low-stock count, in-stock count) and links to 商品管理 and 低在庫.
- **Alerts (`#/alerts`)**: List of low-stock products with “在庫操作” and “編集” opening the same modals as on the products page.
- **Transaction history (`#/history`)**: Table of all stock in/out from `GET /api/stock/history`, with formatted dates and type (入庫/出庫).

### 4. Responsive layout

- **Breakpoints**: 768px and 480px.
- **Nav**: Stacks and wraps on small screens; nav links remain usable.
- **Tables**: Horizontal scroll on narrow viewports; reduced padding and font size.
- **Forms**: Single-column layout on mobile; full-width action buttons.
- **Dashboard**: Cards stack vertically on small screens.

## How to Add a New Page

1. **Route**
   - In `app.js` `getCurrentPageFromHash()`, add a key to the `routes` object (e.g. `reports: 'reports'`).
   - In `index.html`, add a nav link: `<a href="#/reports" :class="['nav-link', currentPage === 'reports' ? 'active' : '']">レポート</a>`.

2. **View**
   - In `index.html` inside `.container`, add a block:  
     `<div v-if="currentPage === 'reports'">...</div>`.

3. **Data/methods (if needed)**
   - In `app.js` `data()`, add any new state (e.g. `reportData: []`).
   - Add a method (e.g. `loadReports()`) and call it in a `watch` on `currentPage` when `currentPage === 'reports'`, or in a button handler.

4. **Styling**
   - Use existing classes (`.card`, `.table-container`, `.btn`, etc.) or add new ones in `style.css` using the design tokens (`var(--color-primary)`, `var(--space-4)`, etc.).

## File structure (client)

```
client/
  index.html   # Single HTML: login, shell, nav, all page views, modals
  app.js       # Vue app: data, computed, methods, routing, API calls
  style.css    # Design tokens + component styles + responsive
```

## Preserved functionality

- Login / logout and session check
- Product list, add, edit, delete
- Stock in/out modal and validation
- Low-stock filter and banner on 商品管理
- CSV export
- Success/error alerts (3s auto-dismiss)
- Loading states for products and history

All of the above behave the same; they are now organized by page and routing.
