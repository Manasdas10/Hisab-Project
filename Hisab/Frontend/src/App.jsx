import React, { useEffect, useState } from "react";
import "./App.css";

import Login from "./pages/login";
import Signup from "./pages/signup";
import Dashboard from "./pages/dashboard";
import AddExpense from "./pages/addexpenses";
import Reports from "./pages/report";

export default function App() {
  const [page, setPage] = useState(
    localStorage.getItem("token") ? "dashboard" : "login"
  );

  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      dark ? "dark" : "light"
    );
  }, [dark]);

  function logout() {
    localStorage.removeItem("token");
    setPage("login");
  }

  return (
    <div className="app-wrapper">

      <header className="header">

        <div className="brand">
          <div className="logo">💰</div>

          <div>
            <h1>HISAB FINANCE</h1>
            <p>Personal finance & budgeting</p>
          </div>
        </div>

        {localStorage.getItem("token") && (
          <div className="header-actions">

            <button
              className={`pill ${page === "dashboard" ? "active" : ""}`}
              onClick={() => setPage("dashboard")}
            >
              Dashboard
            </button>

            <button
              className={`pill ${page === "add" ? "active" : ""}`}
              onClick={() => setPage("add")}
            >
              Add
            </button>

            <button
              className={`pill ${page === "reports" ? "active" : ""}`}
              onClick={() => setPage("reports")}
            >
              Reports
            </button>

            <button
              className="pill"
              onClick={() => setDark(!dark)}
            >
              {dark ? "☀ Light" : "🌙 Dark"}
            </button>

            <button
              className="pill"
              onClick={logout}
            >
              Logout
            </button>

          </div>
        )}
      </header>

      {page === "login" && (
        <Login setPage={setPage} />
      )}

      {page === "signup" && (
        <Signup setPage={setPage} />
      )}

      {page === "dashboard" && (
        <Dashboard />
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
    </div>
  );
}