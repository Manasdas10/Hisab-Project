import React, { useEffect, useState } from "react";
import "./App.css";

import Login from "./pages/login";
import Signup from "./pages/signup";
import Dashboard from "./pages/dashboard";
import AddExpense from "./pages/addexpenses";
import Reports from "./pages/report";

export default function App() {
  const [page, setPage] = useState(
  localStorage.getItem("token")
    ? "dashboard"
    : "login"
);
const [dark, setDark] = useState(
  localStorage.getItem("theme") === "dark"
);
  useEffect(() => {
  document.documentElement.setAttribute(
    "data-theme",
    dark ? "dark" : "light"
  );

  localStorage.setItem(
    "theme",
    dark ? "dark" : "light"
  );
}, [dark]);

const isLoggedIn = !!localStorage.getItem("token");
 function logout() {
  localStorage.removeItem("token");
  setPage("login");
  window.location.reload();
}

  return (
  <div className="app-layout">

    {isLoggedIn && (
      <aside className="sidebar">

        <div className="sidebar-brand">
          <div className="logo">💰</div>

          <div>
            <h2>Hisab</h2>
            <p>Finance Tracker</p>
          </div>
        </div>

        <div className="sidebar-menu">

          <button
            className={`sidebar-btn ${page === "dashboard" ? "active" : ""}`}
            onClick={() => setPage("dashboard")}
          >
            📊 Dashboard
          </button>

          <button
            className={`sidebar-btn ${page === "add" ? "active" : ""}`}
            onClick={() => setPage("add")}
          >
            ➕ Add Transaction
          </button>

          <button
            className={`sidebar-btn ${page === "reports" ? "active" : ""}`}
            onClick={() => setPage("reports")}
          >
            📈 Reports
          </button>

          <button
            className="sidebar-btn"
            onClick={() => setDark(!dark)}
          >
            {dark ? "☀ Light" : "🌙 Dark"}
          </button>

          <button
            className="sidebar-btn logout"
            onClick={logout}
          >
            🚪 Logout
          </button>

        </div>

      </aside>
    )}

    <main className="main-content">

      {page === "login" && (
        <Login setPage={setPage} />
      )}

      {page === "signup" && (
        <Signup setPage={setPage} />
      )}

      {page === "dashboard" && (
        <Dashboard
          onAddExpense={() => setPage("add")}
          onViewReports={() => setPage("reports")}
        />
      )}

      {page === "add" && (
        <AddExpense
          onSaved={() => setPage("dashboard")}
          onCancel={() => setPage("dashboard")}
        />
      )}

      {page === "reports" && (
        <Reports
          onBack={() => setPage("dashboard")}
        />
      )}

    </main>

  </div>
);
}