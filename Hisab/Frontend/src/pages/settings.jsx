import React, { useState, useEffect } from "react";
import { showToast } from "../lib/toast.js";
import {
  ArrowLeft,
  User,
  Sliders,
  Palette,
  Shield,
  Database,
  Check,
  Sparkles,
  Lock,
  Download,
  Upload
} from "lucide-react";

export default function Settings({ onBack }) {
  const [activeTab, setActiveTab] = useState("profile");

  // Profile fields
  const [name, setName] = useState(() => localStorage.getItem("userName") || "Student");
  const [email, setEmail] = useState("student@hisab.finance");
  const [currency, setCurrency] = useState("INR");

  // Preferences
  const [dailyReminder, setDailyReminder] = useState(true);
  const [emailReport, setEmailReport] = useState(false);
  const [defaultMethod, setDefaultMethod] = useState("Cash");

  // Theme state (read from document.documentElement or localStorage)
  const [themeColor, setThemeColor] = useState(() => localStorage.getItem("theme-color") || "purple");
  const [isDark, setIsDark] = useState(() => localStorage.getItem("theme") === "dark");

  // Security
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [twoFactor, setTwoFactor] = useState(false);

  const showMsg = (msg) => {
    if (typeof showToast === "function") {
      showToast(msg);
    } else {
      alert(msg);
    }
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!name.trim()) return showMsg("Name cannot be empty");
    localStorage.setItem("userName", name.trim());
    // Dispatch custom event to notify App.jsx and other components that username changed
    window.dispatchEvent(new Event("storage"));
    showMsg("Profile details saved successfully!");
  };

  const handleSavePreferences = (e) => {
    e.preventDefault();
    showMsg("Preferences saved successfully!");
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return showMsg("Please fill in both password fields");
    showMsg("Password updated successfully!");
    setCurrentPassword("");
    setNewPassword("");
  };

  const handleBackup = () => {
    const data = {
      userName: name,
      currency,
      themeColor,
      recurring: localStorage.getItem("recurring_transactions") || "[]",
      backupTime: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `hisab-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showMsg("Backup file downloaded!");
  };

  // Change primary color theme
  useEffect(() => {
    document.documentElement.setAttribute("data-theme-color", themeColor);
    localStorage.setItem("theme-color", themeColor);
  }, [themeColor]);

  // Sync dark mode toggle
  const toggleDarkMode = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    document.documentElement.setAttribute("data-theme", nextDark ? "dark" : "light");
    localStorage.setItem("theme", nextDark ? "dark" : "light");
    // Dispatch event so layout updates
    window.dispatchEvent(new Event("theme-changed"));
  };

  const colorThemes = [
    { id: "purple", label: "Royal Purple", color: "#6C47FF" },
    { id: "blue", label: "Ocean Blue", color: "#3b82f6" },
    { id: "green", label: "Forest Green", color: "#10b981" },
    { id: "orange", label: "Sunset Orange", color: "#f59e0b" },
    { id: "pink", label: "Vibrant Pink", color: "#ec4899" }
  ];

  return (
    <div className="dashboard-page" style={{ paddingBottom: "40px" }}>
      {/* HEADER BAR */}
      <div className="welcome-banner" style={{ background: "linear-gradient(135deg, #6C47FF 0%, #4f46e5 100%)", marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <button className="theme-toggle-btn" onClick={onBack} title="Back to Dashboard">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1>Settings Dashboard</h1>
            <p>Configure preferences, appearance themes, security profiles, and system backups</p>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "24px", alignItems: "start" }}>
        {/* LEFT TAB NAVIGATION */}
        <div className="card" style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
          <button
            onClick={() => setActiveTab("profile")}
            className="sidebar-btn"
            style={{
              background: activeTab === "profile" ? "var(--accent)" : "transparent",
              color: activeTab === "profile" ? "white" : "var(--text-secondary)",
              fontWeight: activeTab === "profile" ? "600" : "500",
              boxShadow: activeTab === "profile" ? "0 2px 8px rgba(108,71,255,0.2)" : "none"
            }}
          >
            <User size={16} /> User Profile
          </button>
          <button
            onClick={() => setActiveTab("preferences")}
            className="sidebar-btn"
            style={{
              background: activeTab === "preferences" ? "var(--accent)" : "transparent",
              color: activeTab === "preferences" ? "white" : "var(--text-secondary)",
              fontWeight: activeTab === "preferences" ? "600" : "500",
              boxShadow: activeTab === "preferences" ? "0 2px 8px rgba(108,71,255,0.2)" : "none"
            }}
          >
            <Sliders size={16} /> Preferences
          </button>
          <button
            onClick={() => setActiveTab("appearance")}
            className="sidebar-btn"
            style={{
              background: activeTab === "appearance" ? "var(--accent)" : "transparent",
              color: activeTab === "appearance" ? "white" : "var(--text-secondary)",
              fontWeight: activeTab === "appearance" ? "600" : "500",
              boxShadow: activeTab === "appearance" ? "0 2px 8px rgba(108,71,255,0.2)" : "none"
            }}
          >
            <Palette size={16} /> Appearance
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className="sidebar-btn"
            style={{
              background: activeTab === "security" ? "var(--accent)" : "transparent",
              color: activeTab === "security" ? "white" : "var(--text-secondary)",
              fontWeight: activeTab === "security" ? "600" : "500",
              boxShadow: activeTab === "security" ? "0 2px 8px rgba(108,71,255,0.2)" : "none"
            }}
          >
            <Shield size={16} /> Security Settings
          </button>
          <button
            onClick={() => setActiveTab("backups")}
            className="sidebar-btn"
            style={{
              background: activeTab === "backups" ? "var(--accent)" : "transparent",
              color: activeTab === "backups" ? "white" : "var(--text-secondary)",
              fontWeight: activeTab === "backups" ? "600" : "500",
              boxShadow: activeTab === "backups" ? "0 2px 8px rgba(108,71,255,0.2)" : "none"
            }}
          >
            <Database size={16} /> Data & Backup
          </button>
        </div>

        {/* RIGHT CONTENT WORKSPACE */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div className="card" style={{ padding: "24px" }}>
            
            {/* PROFILE PANEL */}
            {activeTab === "profile" && (
              <form onSubmit={handleSaveProfile}>
                <h3 style={{ marginBottom: "16px", fontWeight: "700" }}>Account Profile</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div className="input-group">
                    <label>Full Display Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label>Registered Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled
                    />
                    <small style={{ color: "var(--muted)", display: "block", marginTop: "4px" }}>
                      Email address cannot be changed. Contact admin for assistance.
                    </small>
                  </div>
                  <div className="input-group">
                    <label>Preferred Base Currency</label>
                    <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                      <option value="INR">Indian Rupee (₹)</option>
                      <option value="USD">US Dollar ($)</option>
                      <option value="EUR">Euro (€)</option>
                      <option value="GBP">Pound Sterling (£)</option>
                    </select>
                  </div>
                  <button className="btn-primary" type="submit" style={{ alignSelf: "flex-start", marginTop: "8px" }}>
                    Save Profile Changes
                  </button>
                </div>
              </form>
            )}

            {/* PREFERENCES PANEL */}
            {activeTab === "preferences" && (
              <form onSubmit={handleSavePreferences}>
                <h3 style={{ marginBottom: "16px", fontWeight: "700" }}>System Preferences</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <strong style={{ color: "var(--heading)", fontSize: "0.9rem" }}>Daily Expense Reminder</strong>
                      <p style={{ color: "var(--text-secondary)", fontSize: "0.78rem", margin: "2px 0 0" }}>Receive notification alerts to record your spending at the end of the day.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={dailyReminder}
                      onChange={(e) => setDailyReminder(e.target.checked)}
                      style={{ width: "20px", height: "20px", cursor: "pointer" }}
                    />
                  </div>

                  <div style={{ height: "1px", background: "var(--border-color)" }}></div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <strong style={{ color: "var(--heading)", fontSize: "0.9rem" }}>Weekly Email Statement Summaries</strong>
                      <p style={{ color: "var(--text-secondary)", fontSize: "0.78rem", margin: "2px 0 0" }}>Receive detailed charts analysis statement directly in your inbox.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={emailReport}
                      onChange={(e) => setEmailReport(e.target.checked)}
                      style={{ width: "20px", height: "20px", cursor: "pointer" }}
                    />
                  </div>

                  <div style={{ height: "1px", background: "var(--border-color)" }}></div>

                  <div className="input-group">
                    <label>Default Payment Method Pill Selection</label>
                    <select value={defaultMethod} onChange={(e) => setDefaultMethod(e.target.value)}>
                      <option value="Cash">Cash</option>
                      <option value="Card">Card</option>
                      <option value="UPI">UPI</option>
                      <option value="Net Banking">Net Banking</option>
                    </select>
                  </div>

                  <button className="btn-primary" type="submit" style={{ alignSelf: "flex-start", marginTop: "8px" }}>
                    Save Preferences
                  </button>
                </div>
              </form>
            )}

            {/* APPEARANCE COLORS */}
            {activeTab === "appearance" && (
              <div>
                <h3 style={{ marginBottom: "16px", fontWeight: "700" }}>Theme & Color Selection</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  
                  {/* Theme color pills */}
                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "500" }}>Primary Brand Accent</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                      {colorThemes.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => setThemeColor(c.id)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "8px 16px",
                            borderRadius: "20px",
                            border: `1.5px solid ${themeColor === c.id ? "var(--accent)" : "var(--border-color)"}`,
                            background: "var(--card-bg)",
                            color: "var(--text-primary)",
                            fontSize: "0.85rem",
                            cursor: "pointer",
                            transition: "all var(--transition)"
                          }}
                        >
                          <span style={{ width: "12px", height: "12px", borderRadius: "50%", background: c.color, display: "inline-block" }}></span>
                          {c.label}
                          {themeColor === c.id && <Check size={12} style={{ color: "var(--accent)" }} />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ height: "1px", background: "var(--border-color)" }}></div>

                  {/* Dark Mode Toggle */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <strong style={{ color: "var(--heading)", fontSize: "0.9rem" }}>Dark Theme Mode</strong>
                      <p style={{ color: "var(--text-secondary)", fontSize: "0.78rem", margin: "2px 0 0" }}>Switch Hisab layout between light background and dark backgrounds.</p>
                    </div>
                    <button
                      onClick={toggleDarkMode}
                      className="btn-secondary"
                      style={{
                        padding: "8px 16px",
                        fontSize: "0.85rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px"
                      }}
                    >
                      {isDark ? "🌙 Dark Mode" : "☀️ Light Mode"}
                    </button>
                  </div>

                </div>
              </div>
            )}

            {/* SECURITY PANEL */}
            {activeTab === "security" && (
              <form onSubmit={handleUpdatePassword}>
                <h3 style={{ marginBottom: "16px", fontWeight: "700" }}>Security Profiles</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div className="input-group">
                    <label>Current Account Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>
                  <div className="input-group">
                    <label>New Account Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>

                  <div style={{ height: "1px", background: "var(--border-color)" }}></div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <strong style={{ color: "var(--heading)", fontSize: "0.9rem" }}>Two-Factor Authentication (2FA)</strong>
                      <p style={{ color: "var(--text-secondary)", fontSize: "0.78rem", margin: "2px 0 0" }}>Secure withdrawals and profile locks with authenticator keys.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={twoFactor}
                      onChange={(e) => setTwoFactor(e.target.checked)}
                      style={{ width: "20px", height: "20px", cursor: "pointer" }}
                    />
                  </div>

                  <button className="btn-primary" type="submit" style={{ alignSelf: "flex-start", marginTop: "8px" }}>
                    Update Password
                  </button>
                </div>
              </form>
            )}

            {/* BACKUPS DATA */}
            {activeTab === "backups" && (
              <div>
                <h3 style={{ marginBottom: "16px", fontWeight: "700" }}>System Data & Backups</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  
                  <div style={{ display: "flex", alignItems: "center", gap: "14px", background: "var(--body-bg)", padding: "16px", borderRadius: "10px", border: "1px solid var(--border-color)" }}>
                    <Download size={24} style={{ color: "var(--accent)" }} />
                    <div style={{ flex: 1 }}>
                      <strong style={{ color: "var(--heading)", fontSize: "0.85rem", display: "block" }}>Export Account Backup</strong>
                      <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>Download a JSON file containing all subscription trackers and categories structures.</span>
                    </div>
                    <button className="btn-primary" onClick={handleBackup} style={{ fontSize: "0.8rem", padding: "6px 12px" }}>
                      Download JSON
                    </button>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "14px", background: "var(--body-bg)", padding: "16px", borderRadius: "10px", border: "1px solid var(--border-color)" }}>
                    <Upload size={24} style={{ color: "var(--muted)" }} />
                    <div style={{ flex: 1 }}>
                      <strong style={{ color: "var(--heading)", fontSize: "0.85rem", display: "block" }}>Import Account Statement</strong>
                      <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>Upload back up configurations from a previously exported backup file.</span>
                    </div>
                    <button className="btn-secondary" style={{ fontSize: "0.8rem", padding: "6px 12px", border: "1px dashed var(--border-color)", cursor: "not-allowed" }} disabled>
                      Import JSON
                    </button>
                  </div>

                </div>
              </div>
            )}

          </div>

          {/* BOTTOM UPGRADE CARD */}
          <div className="quick-tips-card" style={{ background: "linear-gradient(135deg, rgba(108,71,255,0.08) 0%, rgba(139,106,255,0.02) 100%)", border: "1px solid rgba(108,71,255,0.15)", padding: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "var(--accent-gradient)", display: "flex", alignItems: "center", justifyValue: "center", fontSize: "20px", justifyContent: "center" }}>
                👑
              </div>
              <div>
                <strong style={{ color: "var(--heading)", fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "6px" }}>
                  Currently running on Hisab Pro Plan
                </strong>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem", margin: "2px 0 0" }}>Enjoy unlimited charts breakdowns, priority support, and custom category managers.</p>
              </div>
            </div>
            <button className="btn-primary" onClick={() => showMsg("You are already on the premium plan!")} style={{ fontSize: "0.85rem", padding: "8px 16px" }}>
              Upgrade to Premium
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
