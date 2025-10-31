Restaurant Management System – INSY7315

A **comprehensive web-based restaurant management system** built using **React**, **Material-UI**, and **IndexedDB**.
This platform streamlines operations by providing powerful tools for **inventory tracking**, **recipe management**, **order processing**, **sales analytics**, and **intelligent menu planning**.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-18.3.1-61DAFB.svg)
![Material--UI](https://img.shields.io/badge/Material--UI-7.3.2-0081CB.svg)
![License](https://img.shields.io/badge/license-Private-red.svg)

---

## 🌟 Features Overview

### Core Modules

#### 📊 Dashboard

* Real-time KPIs and performance insights
* Daily order and revenue tracking
* Weekly/monthly interactive sales charts
* Inventory status and expiry alerts
* Quick-access navigation to critical features

#### 📦 Inventory Management

* CRUD operations for inventory items
* Quantity, unit, and price tracking
* Expiry and low-stock alerts with visual cues
* Search, filter, and batch operation support

#### 🛒 Order Scanner (Manual Entry)

* Category-based input (Food, Drinks, Desserts, Other)
* Real-time total and gratuity calculations
* Save orders directly to sales database
* Clean, category-specific UI design

#### 📖 Recipe Management

* Multi-ingredient recipes with detailed instructions
* Unit support (g, kg, ml, l, ea)
* Integration with inventory for availability checks

#### 💰 Ingredient Pricing

* Dynamic cost and profit calculations
* Custom markup multipliers (default 2.5×)
* Profit margin display and color-coded indicators
* Ingredient-level cost breakdowns

#### 🍽️ Smart Menu Builder

* **AI-powered recipe suggestions** using current inventory
* Automatic feasibility and serving calculations
* Unit conversion support
* Color-coded status:

  * 🟢 **Can Make** – All ingredients available
  * 🟡 **Partial** – Some ingredients missing
  * 🔴 **Cannot Make** – Insufficient stock
* Actionable insights for inventory optimization

#### 📈 Sales Analytics

* **Top 10** and **Bottom 10** item performance
* Revenue contribution breakdowns
* Time filters (All Time, 7 Days, 30 Days)
* Pareto analysis (80/20 rule) and strategic insights

#### 🔔 Notifications Center

* Low-stock and expiry alerts
* Read/unread tracking with priority sorting

#### 🧮 Recipe Calculator

* Cost per quantity and multi-recipe aggregation

#### 📑 Reports

* Weekly sales summaries
* PDF and CSV export options
* Interactive charts (Recharts)
* Manual sales entry and revenue tracking

#### ⚙️ Settings

* Light/Dark theme toggle
* Persistent user preferences
* Hints and tooltip customization

---

## 🚀 Getting Started

### Prerequisites

* Node.js ≥ 16
* npm or yarn
* Modern browser (Chrome, Firefox, Safari, Edge)

### Installation

```bash
git clone https://github.com/DecG1/INSY7315.git
cd INSY7315
npm install
npm run dev
```

Open your browser:

```
http://localhost:5173
```

### Production Build

```bash
npm run build
npm run preview
```

---

## 🏗️ Project Structure

```
INSY7315/
├── public/
│   └── logo.png
├── src/
│   ├── App.jsx
│   ├── AppShell.jsx
│   ├── index.jsx
│   ├── Pages/
│   │   ├── Dashboard.jsx
│   │   ├── InventoryPage.jsx
│   │   ├── ScannerPage.jsx
│   │   ├── RecipesPage.jsx
│   │   ├── PricingPage.jsx
│   │   ├── MenuBuilderPage.jsx
│   │   ├── SalesAnalyticsPage.jsx
│   │   ├── NotificationsPage.jsx
│   │   ├── CalculatorPage.jsx
│   │   ├── ReportsPage.jsx
│   │   ├── SettingsPage.jsx
│   │   └── LoginPage.jsx
│   ├── Components/
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Logo.jsx
│   │   ├── MetricCard.jsx
│   │   ├── StatusChip.jsx
│   │   ├── ExpiryChip.jsx
│   │   └── HintTooltip.jsx
│   ├── Services/
│   │   ├── db.js
│   │   ├── inventoryService.js
│   │   ├── recipesService.js
│   │   ├── kitchenService.js
│   │   ├── analyticsService.js
│   │   └── sessionService.js
│   ├── Context/
│   │   ├── ThemeContext.jsx
│   │   └── HintsContext.jsx
│   ├── Utils/
│   │   ├── theme.js
│   │   ├── config.js
│   │   ├── helpers.js
│   │   └── units.js
│   ├── package.json
│   ├── vite.config.js
│   └── README.md
```

---

## 🛠️ Technology Stack

**Frontend Framework**

* React 18.3.1
* Vite 5.4.20
* React Router DOM 7.9.2

**UI & Styling**

* Material-UI (MUI) 7.3.2
* Emotion (CSS-in-JS)
* Lucide React Icons

**Data & Storage**

* Dexie.js 4.2.0
* IndexedDB

**Visualization**

* Recharts 3.2.1

**PDF Generation**

* jsPDF 3.0.3
* jspdf-autotable 5.0.2

---

## 📊 Database Schema

### `inventory`

```js
{
  id, name, quantity, unit, expiry, ppu
}
```

### `recipes`

```js
{
  id, name, description, ingredients: [{ name, quantity, unit }]
}
```

### `sales`

```js
{
  id, date, amount, cost, items: [{ name, quantity, price }]
}
```

### `notifications`

```js
{
  id, message, type, timestamp, read
}
```

### `sessions`

```js
{
  id, username, createdAt
}
```

---

## 🎨 Theming & Customization

* Light and Dark modes (persistent)
* Customizable brand colors

  * **Primary Red:** `#8b0000`
  * **Status Colors:**

    * ✅ Success – Green
    * ⚠️ Warning – Orange
    * ❌ Error – Red
    * ℹ️ Info – Blue
* Replace `/public/logo.png` (recommended size: 200×200)

---

## 🔐 Authentication

* Simple session-based login (default: `admin/admin`)
* IndexedDB session storage
* Auto-validation and logout

> ⚠️ For production, integrate a backend authentication API.

---

## 📱 Responsive Design

Optimized layouts for:

* 🖥️ Desktop
* 💻 Laptop
* 📱 Tablet
* 📱 Mobile

---

## 🔧 Feature Insights

### Unit Conversion

Seamless conversions between:

* g ↔ kg
* ml ↔ l
* ea (non-convertible)

### Smart Menu Builder Algorithm

1. Fetch all recipes and inventory.
2. Match ingredients (case-insensitive).
3. Convert units and check availability.
4. Determine max servings.
5. Rank by feasibility and insights.

### Dynamic Pricing Engine

* Calculates ingredient costs
* Applies markup multiplier
* Displays profit margins and overrides

### Sales Analytics Engine

* Aggregates item-level data
* Computes revenue and ranking
* Applies time filters and Pareto analysis

---

## 🎯 Example Use Cases

### Daily Operations

* Morning: Review inventory alerts
* During Service: Record orders
* Evening: Generate reports

### Menu Planning

* Build feasible menus via Smart Builder
* Plan procurement and pricing

### Business Intelligence

* Track best/worst sellers
* Optimize inventory and pricing

---

## 🐛 Troubleshooting

**Dev Server Issues**

```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

**Build Errors**

```bash
npm run build
```

**Database Issues**

* Clear browser storage (IndexedDB)
* Check Dexie logs in console

**Logo Missing**

* Verify `/public/logo.png` path
* Clear cache or check 404s

---

## 📝 Development Notes

### Adding New Features

1. Create a new component
2. Register in `AppShell.jsx`
3. Add route and sidebar link

### Code Guidelines

* Functional components + Hooks
* JSDoc documentation
* Reusable services and utilities

### Performance Tips

* Use `useMemo` and lazy loading
* Debounce inputs
* Optimize assets

---

## 🔄 Future Enhancements

### Planned Features

* [ ] Backend integration
* [ ] Real-time sync
* [ ] Multi-user roles
* [ ] Barcode inventory
* [ ] Loyalty system
* [ ] Reservations & table management
* [ ] Supplier & purchase order tools
* [ ] Advanced analytics (AI insights)

### Technical Debt

* [ ] Migrate to TypeScript
* [ ] Add unit/E2E tests
* [ ] Setup CI/CD
* [ ] Improve error handling
* [ ] Implement full form validation

---

## 📄 License

**Private and Proprietary** — All rights reserved.

---

## 👥 Contributors

* **Developer:** Restaurant Management Team
* **Course:** INSY7315
* **Repository:** [GitHub – DecG1/INSY7315](https://github.com/DecG1/INSY7315)

---

## 📧 Support

For issues, suggestions, or requests:

* Open a GitHub issue
* Access code: `ACCESS_GRANTED`

---

## 🙏 Acknowledgments

* Material-UI team for elegant components
* Dexie.js for simple IndexedDB integration
* Recharts for visual analytics
* Lucide Icons for crisp visuals
* React team for an exceptional framework
---

*Last Updated: October 30, 2025*
