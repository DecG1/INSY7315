# Restaurant Management System - INSY7315

A comprehensive web-based restaurant management application built with React, Material-UI, and IndexedDB. This system provides complete inventory tracking, recipe management, order processing, sales analytics, and intelligent menu planning capabilities.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-18.3.1-61DAFB.svg)
![Material--UI](https://img.shields.io/badge/Material--UI-7.3.2-0081CB.svg)
![License](https://img.shields.io/badge/license-Private-red.svg)

## 🌟 Features

### Core Modules

#### 📊 Dashboard
- Real-time key performance indicators (KPIs)
- Daily order count and revenue tracking
- Weekly/monthly sales charts with interactive period selection
- Inventory status overview
- Expiring items alerts
- Quick navigation to critical functions

#### 📦 Inventory Management
- Add, edit, and delete inventory items
- Track quantities, units, and prices
- Expiry date management with visual indicators
- Low stock alerts
- Search and filter capabilities
- Batch operations support

#### 🛒 Order Scanner (Manual Entry)
- Category-based order entry (Food, Drinks, Desserts, Other)
- Real-time order total calculation
- Gratuity/tip calculation
- Save orders to sales database
- Beautiful UI with category-specific icons and colors
- Clear and reset functionality

#### 📖 Recipes
- Create and manage recipes with ingredients
- Multi-ingredient support
- Unit tracking (g, kg, ml, l, ea)
- Recipe descriptions and instructions
- Integration with inventory for ingredient availability

#### 💰 Ingredient Pricing
- Dynamic cost calculation for recipes
- User-adjustable markup multiplier (default 2.5x)
- Custom selling price override
- Real-time profit margin calculations
- Markup percentage display
- Ingredient cost breakdown tables
- Color-coded profit indicators (>60% green, 30-59% orange, <30% warning)

#### 🍽️ Smart Menu Builder
- **AI-powered recipe suggestions** based on current inventory
- Automatic ingredient availability checking
- Unit conversion between inventory and recipes
- Calculate maximum servings per recipe
- Color-coded status system:
  - 🟢 **Can Make**: All ingredients available
  - 🟡 **Partial**: Some ingredients missing
  - 🔴 **Cannot Make**: Not feasible with current stock
- Detailed ingredient-by-ingredient breakdown
- Filter by recipe feasibility
- Inventory optimization insights

#### 📈 Sales Analytics
- **Best-selling items** analysis (Top 10)
- **Least-selling items** tracking (Bottom 10)
- Revenue contribution percentages
- Time period filtering (All Time, 7 Days, 30 Days)
- Visual ranking with color-coded badges
- Pareto principle insights (80/20 rule)
- Strategic recommendations:
  - Stock optimization for best sellers
  - Slow-mover identification
  - Menu engineering insights

#### 🔔 Notifications
- Low stock alerts
- Expiring inventory warnings
- System notifications
- Mark as read/unread functionality
- Priority-based sorting

#### 🧮 Calculator
- Recipe cost calculator
- Quantity-based pricing
- Ingredient cost aggregation
- Multi-recipe calculations

#### 📑 Reports
- Weekly sales reports
- PDF export with professional formatting
- CSV export for data analysis
- Manual sales entry
- Revenue and cost tracking
- Interactive charts (Recharts)

#### ⚙️ Settings
- Dark/Light theme toggle
- Hints and tooltips enable/disable
- User preferences management
- Theme persistence across sessions

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/DecG1/INSY7315.git
cd INSY7315
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to:
```
http://localhost:5173
```

### Build for Production

Create an optimized production build:
```bash
npm run build
```

Preview the production build locally:
```bash
npm run preview
```

## 🏗️ Project Structure

```
INSY7315/
├── public/
│   └── logo.png                 # Application logo
├── src/
│   ├── App.jsx                  # Main application component
│   ├── AppShell.jsx             # Layout and routing
│   ├── index.jsx                # Entry point
│   ├── index.html               # HTML template
│   │
│   ├── Pages/
│   │   ├── Dashboard.jsx        # Dashboard page
│   │   ├── InventoryPage.jsx    # Inventory management
│   │   ├── ScannerPage.jsx      # Order entry
│   │   ├── RecipesPage.jsx      # Recipe management
│   │   ├── PricingPage.jsx      # Dynamic pricing calculator
│   │   ├── MenuBuilderPage.jsx  # Smart menu builder
│   │   ├── SalesAnalyticsPage.jsx # Sales performance analytics
│   │   ├── NotificationsPage.jsx # Notifications center
│   │   ├── CalculatorPage.jsx   # Recipe calculator
│   │   ├── ReportsPage.jsx      # Sales reports
│   │   ├── SettingsPage.jsx     # App settings
│   │   └── LoginPage.jsx        # Authentication
│   │
│   ├── Components/
│   │   ├── Header.jsx           # Top navigation bar
│   │   ├── Sidebar.jsx          # Side navigation menu
│   │   ├── Logo.jsx             # Restaurant logo
│   │   ├── SectionTitle.jsx     # Page section headers
│   │   ├── MetricCard.jsx       # Dashboard metric cards
│   │   ├── StatusChip.jsx       # Status indicator chips
│   │   ├── ExpiryChip.jsx       # Expiry date indicators
│   │   └── HintTooltip.jsx      # Contextual help tooltips
│   │
│   ├── Services/
│   │   ├── db.js                # Dexie/IndexedDB setup
│   │   ├── inventoryService.js  # Inventory CRUD operations
│   │   ├── recipesService.js    # Recipe CRUD operations
│   │   ├── kitchenService.js    # Kitchen operations
│   │   ├── analyticsService.js  # Analytics and reporting
│   │   └── sessionService.js    # User session management
│   │
│   ├── Context/
│   │   ├── ThemeContext.jsx     # Theme provider (dark/light mode)
│   │   └── HintsContext.jsx     # Hints/tooltips state
│   │
│   ├── Utils/
│   │   ├── theme.js             # Material-UI theme configuration
│   │   ├── config.js            # App configuration
│   │   ├── helpers.js           # Utility functions
│   │   └── units.js             # Unit conversion utilities
│   │
│   ├── package.json             # Dependencies and scripts
│   ├── vite.config.js           # Vite configuration
│   └── README.md                # This file
```

## 🛠️ Technology Stack

### Frontend Framework
- **React 18.3.1** - Component-based UI library
- **Vite 5.4.20** - Next-generation frontend build tool
- **React Router DOM 7.9.2** - Client-side routing (installed but not currently used)

### UI Components & Styling
- **Material-UI (MUI) 7.3.2** - React component library
- **Emotion** - CSS-in-JS styling
- **Lucide React** - Beautiful icon set (500+ icons)

### Data Management
- **Dexie.js 4.2.0** - IndexedDB wrapper for local data storage
- **IndexedDB** - Browser-based NoSQL database

### Charts & Visualization
- **Recharts 3.2.1** - Composable charting library

### PDF Generation
- **jsPDF 3.0.3** - PDF document generation
- **jspdf-autotable 5.0.2** - Table plugin for jsPDF

## 📊 Database Schema

The application uses IndexedDB with the following stores:

### `inventory`
```javascript
{
  id: number (auto-increment),
  name: string,
  quantity: number,
  unit: string,
  expiry: date,
  ppu: number (price per unit)
}
```

### `recipes`
```javascript
{
  id: number (auto-increment),
  name: string,
  description: string,
  ingredients: [
    {
      name: string,
      quantity: number,
      unit: string
    }
  ]
}
```

### `sales`
```javascript
{
  id: number (auto-increment),
  date: date,
  amount: number,
  cost: number,
  items: [
    {
      name: string,
      quantity: number,
      price: number
    }
  ]
}
```

### `notifications`
```javascript
{
  id: number (auto-increment),
  message: string,
  type: string,
  timestamp: date,
  read: boolean
}
```

### `sessions`
```javascript
{
  id: number,
  username: string,
  createdAt: date
}
```

## 🎨 Theming & Customization

### Theme Modes
The application supports both **Light** and **Dark** themes with smooth transitions:
- Toggle via Settings page
- Persistent across sessions (localStorage)
- Automatically adjusts all components

### Brand Colors
- **Primary Red**: `#8b0000` - Used for branding, buttons, highlights
- **Background Gradients**: Dynamic based on theme mode
- **Status Colors**:
  - Success: Green
  - Warning: Orange/Yellow
  - Error: Red
  - Info: Blue

### Custom Logo
Replace `/public/logo.png` with your restaurant's logo (recommended size: 200x200px).

## 🔐 Authentication

Currently implements a basic session-based authentication:
- Username/password login (default: admin/admin)
- Session storage in IndexedDB
- Automatic session validation on app load
- Logout functionality

**Note:** For production use, implement proper authentication with backend API.

## 📱 Responsive Design

The application is fully responsive and works on:
- 💻 Desktop (1920px+)
- 💻 Laptop (1366px - 1920px)
- 📱 Tablet (768px - 1366px)
- 📱 Mobile (320px - 768px)

## 🔧 Key Features Explained

### Unit Conversion System
The app automatically converts between compatible units:
- Weight: g ↔ kg
- Volume: ml ↔ l
- Each: ea (no conversion)

Example: If a recipe needs 500g of flour and inventory is tracked in kg, the system automatically converts and calculates availability.

### Smart Menu Builder Algorithm
1. Fetches all recipes and current inventory
2. For each recipe:
   - Matches ingredients by name (case-insensitive)
   - Converts units if needed
   - Calculates available quantity vs. required quantity
   - Determines max servings based on limiting ingredient
3. Ranks recipes by feasibility
4. Provides actionable insights

### Dynamic Pricing Calculation
1. Aggregates ingredient costs from inventory prices
2. Multiplies by user-defined markup factor
3. Computes profit margin percentage
4. Displays cost breakdown per ingredient
5. Allows custom price override

### Sales Analytics Engine
1. Aggregates all sales data by item
2. Calculates total quantity sold and revenue per item
3. Computes percentage contribution to total sales
4. Ranks items by performance
5. Applies time period filters
6. Generates insights using Pareto analysis

## 🎯 Use Cases

### Daily Operations
1. **Morning Setup**: Check Dashboard for inventory alerts and expiring items
2. **During Service**: Use Order Scanner to record sales
3. **Inventory Check**: Update stock levels in Inventory page
4. **End of Day**: Review Reports for daily performance

### Menu Planning
1. **Weekly Menu**: Use Menu Builder to see available recipes
2. **Procurement**: Check what ingredients are needed for popular items
3. **Costing**: Use Pricing Calculator to ensure profitability

### Business Intelligence
1. **Performance Review**: Check Sales Analytics for best/worst sellers
2. **Inventory Optimization**: Review slow-moving items
3. **Profit Analysis**: Use pricing tools to maximize margins

## 🐛 Troubleshooting

### Development Server Won't Start
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Build Errors
```bash
# Check for syntax errors
npm run build

# If errors persist, check console for specific file/line
```

### Database Issues
- Clear browser data for localhost to reset IndexedDB
- Check browser console for Dexie errors
- Ensure browser supports IndexedDB

### Logo Not Showing
- Verify `public/logo.png` exists
- Check browser console for 404 errors
- Clear browser cache

## 📝 Development Notes

### Adding New Features
1. Create component in appropriate directory
2. Import in `AppShell.jsx`
3. Add route in routing logic
4. Add menu item in `Sidebar.jsx`
5. Update this README

### Code Style Guidelines
- Use functional components with hooks
- Extensive JSDoc comments for functions
- Descriptive variable names
- Keep components under 500 lines
- Extract reusable logic into services

### Performance Optimization Tips
- Use `useMemo` for expensive calculations
- Implement lazy loading for large pages
- Debounce search inputs
- Optimize images (compress, correct size)
- Code-split heavy libraries

## 🔄 Future Enhancements

### Planned Features
- [ ] Backend API integration
- [ ] Real-time synchronization
- [ ] Multi-user support with roles
- [ ] Barcode scanning for inventory
- [ ] Customer loyalty program
- [ ] Table management
- [ ] Reservation system
- [ ] Supplier management
- [ ] Purchase order generation
- [ ] Advanced analytics with AI insights

### Technical Debt
- [ ] Migrate to TypeScript
- [ ] Add comprehensive unit tests
- [ ] Implement E2E testing
- [ ] Set up CI/CD pipeline
- [ ] Improve error boundaries
- [ ] Add loading states everywhere
- [ ] Implement proper form validation

## 📄 License

This project is private and proprietary. All rights reserved.

## 👥 Contributors

- **Developer**: Restaurant Management Team
- **Course**: INSY7315
- **Repository**: https://github.com/DecG1/INSY7315

## 📧 Support

For issues, questions, or feature requests:
- Create an issue in the GitHub repository
- Access code: ACCESS_GRANTED

## 🙏 Acknowledgments

- Material-UI team for the excellent component library
- Dexie.js for making IndexedDB simple
- Recharts for beautiful charts
- Lucide for the icon set
- React team for the framework

---

**Built with ❤️ for modern restaurant management**

Last Updated: October 30, 2025
