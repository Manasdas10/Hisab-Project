import React, { useEffect, useState } from "react";
import "./App.css";

import { 
  LayoutDashboard, 
  PlusCircle, 
  BarChart3, 
  Target, 
  FolderOpen, 
  RefreshCw, 
  Settings as SettingsIcon, 
  LogOut 
} from "lucide-react";

import Login from "./pages/login";
import Signup from "./pages/signup";
import Dashboard from "./pages/dashboard";
import AddExpense from "./pages/addexpenses";
import Reports from "./pages/report";
import CategoriesManager from "./pages/categories";
import BudgetGoalPanel from "./pages/budgetgoal";
import ChatWidget from "./components/chatwidget";
import Recurring from "./pages/recurring";
import Settings from "./pages/settings";
import { getTransactions } from "./lib/api.js";

export default function App() {
  const [page, setPage] = useState(
    localStorage.getItem("token") ? "dashboard" : "login"
  );
  const [dark, setDark] = useState(
    localStorage.getItem("theme") === "dark"
  );
  const [balance, setBalance] = useState(1767);
  const [userName, setUserName] = useState(() => localStorage.getItem("userName") || "Student");

  const isLoggedIn = !!localStorage.getItem("token");

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      dark ? "dark" : "light"
    );
    localStorage.setItem("theme", dark ? "dark" : "light");
    
    // Theme color persistence
    const savedColor = localStorage.getItem("theme-color") || "purple";
    document.documentElement.setAttribute("data-theme-color", savedColor);
  }, [dark]);

  useEffect(() => {
    const handleThemeChange = () => {
      setDark(localStorage.getItem("theme") === "dark");
    };
    const handleStorageChange = () => {
      setUserName(localStorage.getItem("userName") || "Student");
    };
    window.addEventListener("theme-changed", handleThemeChange);
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("theme-changed", handleThemeChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      getTransactions()
        .then((data) => {
          let income = 0;
          let expense = 0;
          data.forEach((t) => {
            if (t.type === "income") {
              income += Number(t.amount || 0);
            } else {
              expense += Number(t.amount || 0);
            }
          });
          setBalance(income - expense);
        })
        .catch((err) => console.log(err));
    }
  }, [isLoggedIn, page]);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    setPage("login");
    window.location.reload();
  }

  return (
    <div className={`app-layout ${isLoggedIn ? "has-sidebar" : ""}`}>
      {isLoggedIn && (
        <aside className="sidebar">
          <div className="sidebar-brand">
            <div className="logo">👛</div>
            <div>
              <h2>Hisab Finance</h2>
              <p>Track • Analyze • Save</p>
            </div>
          </div>

          <div className="sidebar-profile">
            <div className="sidebar-avatar">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="sidebar-profile-info">
              <div className="sidebar-username-row">
                <span className="sidebar-username">{userName}</span>
                <span className="sidebar-badge">Pro</span>
              </div>
              <div className="sidebar-balance">
                Balance: ₹{balance.toLocaleString("en-IN")}
              </div>
            </div>
          </div>

          <div className="sidebar-divider"></div>

          <div className="sidebar-menu">
            <button
              className={`sidebar-btn ${page === "dashboard" ? "active" : ""}`}
              onClick={() => setPage("dashboard")}
            >
              <LayoutDashboard />
              Dashboard
            </button>

            <button
              className={`sidebar-btn ${page === "add" ? "active" : ""}`}
              onClick={() => setPage("add")}
            >
              <PlusCircle />
              Add Transaction
            </button>

            <button
              className={`sidebar-btn ${page === "reports" ? "active" : ""}`}
              onClick={() => setPage("reports")}
            >
              <BarChart3 />
              Reports
            </button>

            <button
              className={`sidebar-btn ${page === "budget" ? "active" : ""}`}
              onClick={() => setPage("budget")}
            >
              <Target />
              Budget Goal
            </button>

            <button
              className={`sidebar-btn ${page === "categories" ? "active" : ""}`}
              onClick={() => setPage("categories")}
            >
              <FolderOpen />
              Categories
            </button>

            <button
              className={`sidebar-btn ${page === "recurring" ? "active" : ""}`}
              onClick={() => setPage("recurring")}
            >
              <RefreshCw />
              Recurring
            </button>

            <button
              className={`sidebar-btn ${page === "settings" ? "active" : ""}`}
              onClick={() => setPage("settings")}
            >
              <SettingsIcon />
              Settings
            </button>

            <div className="sidebar-divider"></div>

            <button className="sidebar-btn logout" onClick={logout}>
              <LogOut />
              Logout
            </button>
          </div>

          <div className="sidebar-motivation">
            <span className="motivation-emoji">👛</span>
            <span className="motivation-highlight">Save more today,</span>
            <p>worry less tomorrow.</p>
          </div>
        </aside>
      )}

      <main className="main-content">
        {page === "login" && <Login setPage={setPage} />}
        {page === "signup" && <Signup setPage={setPage} />}
        
        {page === "dashboard" && (
          <Dashboard
            onAddExpense={() => setPage("add")}
            onViewReports={() => setPage("reports")}
            dark={dark}
            setDark={setDark}
          />
        )}
        
        {page === "add" && (
          <AddExpense
            onSaved={() => setPage("dashboard")}
            onCancel={() => setPage("dashboard")}
          />
        )}
        
        {page === "reports" && (
          <Reports onBack={() => setPage("dashboard")} />
        )}

        {page === "categories" && (
          <CategoriesManager onBack={() => setPage("dashboard")} />
        )}

        {page === "budget" && (
          <BudgetGoalPanel onBack={() => setPage("dashboard")} />
        )}

        {page === "recurring" && (
          <Recurring onBack={() => setPage("dashboard")} />
        )}

        {page === "settings" && (
          <Settings onBack={() => setPage("dashboard")} />
        )}
      </main>

      {isLoggedIn && <ChatWidget />}
    </div>
  );
}