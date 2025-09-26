import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

// Import your pages
import Dashboard from "./Dashboard.jsx";
import LoginPage from "./LoginPage.jsx";
import ReportsPage from "./ReportsPage.jsx";
import RecipesPage from "./RecipesPage.jsx";
import InventoryPage from "./InventoryPage.jsx";

export default function App() {
  return (
    <Router>
      <div style={{ padding: 20, fontFamily: "system-ui" }}>
        <h2>INSY7315 App Navigation</h2>
        <nav style={{ marginBottom: 20 }}>
          <Link to="/">Dashboard</Link> |{" "}
          <Link to="/login">Login</Link> |{" "}
          <Link to="/reports">Reports</Link> |{" "}
          <Link to="/recipes">Recipes</Link> |{" "}
          <Link to="/inventory">Inventory</Link>
        </nav>

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/recipes" element={<RecipesPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
        </Routes>
      </div>
    </Router>
  );
}
