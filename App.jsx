import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from "react-router-dom";

import Dashboard from "./Dashboard.jsx";
import LoginPage from "./LoginPage.jsx";
import ReportsPage from "./ReportsPage.jsx";
import RecipesPage from "./RecipesPage.jsx";
import InventoryPage from "./InventoryPage.jsx";
import { getSession, clearSession } from "./sessionService.js";

function RequireSession({ children }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    (async () => {
      setSession(await getSession());
      setLoading(false);
    })();
  }, []);

  if (loading) return null; // or a spinner
  if (!session) return <Navigate to="/login" replace />;
  return children;
}

function Header() {
  const [session, setSession] = useState(null);
  const navigate = useNavigate();
  useEffect(() => { getSession().then(setSession); }, []);
  const doLogout = async () => {
    await clearSession();
    navigate("/login", { replace: true });
  };
  return (
    <div style={{ display:"flex", gap:12, padding:12, borderBottom:"1px solid #eee" }}>
      <Link to="/">Dashboard</Link>
      <Link to="/inventory">Inventory</Link>
      <Link to="/recipes">Recipes</Link>
      <Link to="/reports">Reports</Link>
      <div style={{ marginLeft:"auto" }}>
        {session && (
          <>
            <span style={{ marginRight: 8 }}>{session.email} ({session.role})</span>
            <button onClick={doLogout}>Logout</button>
          </>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<RequireSession><Dashboard /></RequireSession>} />
        <Route path="/inventory" element={<RequireSession><InventoryPage /></RequireSession>} />
        <Route path="/recipes" element={<RequireSession><RecipesPage /></RequireSession>} />
        <Route path="/reports" element={<RequireSession><ReportsPage /></RequireSession>} />
      </Routes>
    </Router>
  );
}
