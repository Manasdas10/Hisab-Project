import React, { useEffect, useState } from "react";
import { getCategories, createCategory, deleteCategory } from "../lib/api";
import { FolderOpen, Plus, Trash2, ArrowLeft, Info, HelpCircle } from "lucide-react";

const predefinedColors = [
  "#6c47ff", // Lavender
  "#3b82f6", // Blue
  "#10b981", // Green
  "#f59e0b", // Orange
  "#ef4444", // Red
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#8b5cf6", // Violet
  "#14b8a6", // Teal
  "#6b7280"  // Gray
];

const predefinedEmojis = ["🍕", "🚗", "🛒", "📄", "💰", "🎬", "❤️", "📚", "💵", "☕", "🎮", "💡", "✈️", "🏠", "🎁", "👚"];

export default function CategoriesManager({ onBack }) {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("👛");
  const [selectedColor, setSelectedColor] = useState("#6c47ff");
  const [type, setType] = useState("expense");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function fetchCats() {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      setError(err?.message || "Failed to load categories.");
    }
  }

  useEffect(() => {
    fetchCats();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await createCategory({
        name: name.trim(),
        icon: selectedEmoji,
        color: selectedColor,
        type,
      });
      setName("");
      fetchCats();
    } catch (err) {
      setError(err?.message || "Failed to create category.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (id.startsWith("default_")) {
      alert("System default categories cannot be deleted.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this custom category?")) return;
    try {
      await deleteCategory(id);
      fetchCats();
    } catch (err) {
      alert(err?.message || "Failed to delete category.");
    }
  }

  return (
    <div className="dashboard-page" style={{ paddingBottom: "40px" }}>
      {/* HEADER BAR */}
      <div className="welcome-banner" style={{ background: "linear-gradient(135deg, #8B6AFF 0%, #6C47FF 50%, #4F46E5 100%)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          {onBack && (
            <button className="theme-toggle-btn" onClick={onBack} title="Back to Dashboard">
              <ArrowLeft size={18} />
            </button>
          )}
          <div>
            <h1>Categories Manager</h1>
            <p>Customize colors and icons for your income and expenses</p>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: "20px", marginTop: "24px" }}>
        {/* LEFT COL: CREATE FORM */}
        <div className="card" style={{ height: "fit-content" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
            <Plus size={20} style={{ color: "var(--accent)" }} />
            <h3>Create Category</h3>
          </div>

          <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label>Category Name</label>
              <input
                type="text"
                placeholder="e.g. Coffee, Subscriptions"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label>Transaction Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="expense">Expense (Outgoing)</option>
                <option value="income">Income (Incoming)</option>
              </select>
            </div>

            <div>
              <label>Select Emoji Icon</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: "8px", margin: "8px 0" }}>
                {predefinedEmojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className={`category-emoji-picker-btn ${selectedEmoji === emoji ? "active" : ""}`}
                    onClick={() => setSelectedEmoji(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label>Select Accent Color</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", margin: "8px 0" }}>
                {predefinedColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: color,
                      border: selectedColor === color ? "3px solid #ffffff" : "2px solid rgba(255, 255, 255, 0.1)",
                      boxShadow: selectedColor === color ? `0 0 12px ${color}` : "none",
                      cursor: "pointer",
                      transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                      transform: selectedColor === color ? "scale(1.15)" : "scale(1)"
                    }}
                    onClick={() => setSelectedColor(color)}
                  />
                ))}
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading || !name.trim()}>
              {loading ? "Creating..." : "Add Category"}
            </button>
          </form>
        </div>

        {/* RIGHT COL: CATEGORIES GRID */}
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
            <FolderOpen size={20} style={{ color: "var(--accent)" }} />
            <h3>Active Categories</h3>
          </div>

          {error && (
            <div style={{ color: "var(--danger)", background: "var(--danger-light)", padding: "10px", borderRadius: "8px", marginBottom: "16px" }}>
              {error}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
            {categories.map((cat) => {
              const isDefault = String(cat._id).startsWith("default_");
              return (
                <div
                  key={cat._id}
                  className="card"
                  style={{
                    margin: 0,
                    padding: "16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    borderLeft: `5px solid ${cat.color}`,
                    background: "var(--glass)",
                  }}
                >
                  <div
                    style={{
                      width: "38px",
                      height: "38px",
                      borderRadius: "10px",
                      background: `${cat.color}15`,
                      color: cat.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.2rem",
                    }}
                  >
                    {cat.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "0.85rem", fontWeight: "700", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                      {cat.name}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "var(--muted)", textTransform: "capitalize" }}>
                      {cat.type} {isDefault && "• System"}
                    </div>
                  </div>
                  {!isDefault && (
                    <button
                      onClick={() => handleDelete(cat._id)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "var(--muted)",
                        cursor: "pointer",
                      }}
                      className="tx-action-btn delete"
                      title="Delete category"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: "24px", display: "flex", alignItems: "flex-start", gap: "8px", background: "var(--subtle)", padding: "12px", borderRadius: "10px" }}>
            <Info size={16} style={{ color: "var(--muted)", flexShrink: 0, marginTop: "2px" }} />
            <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>
              <strong>System Categories</strong> (marked as System) cannot be deleted. Custom categories can be deleted, and will automatically show up when adding or editing transactions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
