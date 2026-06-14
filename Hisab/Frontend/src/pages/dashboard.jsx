import React, { useEffect, useState, useMemo } from "react";
import GoalCard from "../components/goalcard.jsx";

import {
  getTransactions,
  deleteTransaction,
  updateTransaction,
  getCategories,
} from "../lib/api.js";

import { Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";

import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Search,
  Sun,
  Moon,
  PlusCircle,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Trash2,
  Edit,
  Sparkles
} from "lucide-react";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

function normalizeCategory(cat) {
  if (!cat) return "Other";
  return cat.trim();
}

// Predefined fallback icons
const defaultStyle = { icon: "💵", bg: "rgba(107, 114, 128, 0.15)", color: "#6b7280" };

export default function Dashboard({
  onAddExpense,
  onViewReports,
  dark,
  setDark,
}) {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editing, setEditing] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const userName = localStorage.getItem("userName") || "Student";

  async function fetchCategories() {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.log(err);
    }
  }

  async function fetchTransactions() {
    try {
      const data = await getTransactions();
      setTransactions(
        data.map((t) => ({
          ...t,
          amount: Number(t.amount),
          category: normalizeCategory(t.category),
          notes: t.notes || "",
        }))
      );
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTransactions();
    fetchCategories();
  }, []);

  async function removeTx(id) {
    if (!window.confirm("Delete transaction?")) return;
    await deleteTransaction(id);
    fetchTransactions();
  }

  async function saveEdit() {
    await updateTransaction(editing._id, editing);
    setEditing(null);
    fetchTransactions();
  }

  // Style map from fetched categories
  const categoryStyleMap = useMemo(() => {
    const map = {};
    categories.forEach((cat) => {
      map[cat.name.toLowerCase()] = {
        icon: cat.icon,
        bg: `${cat.color}15`,
        color: cat.color,
      };
    });
    return map;
  }, [categories]);

  const summary = useMemo(() => {
    let income = 0;
    let expense = 0;
    transactions.forEach((t) => {
      if (t.type === "income") {
        income += t.amount;
      } else {
        expense += t.amount;
      }
    });
    return {
      income,
      expense,
      balance: income - expense,
    };
  }, [transactions]);

  // Compute category split data and chart legend values
  const categorySplitData = useMemo(() => {
    const totals = {};
    let totalExpense = 0;
    transactions.forEach((t) => {
      if (t.type === "expense") {
        const amt = Number(t.amount || 0);
        totals[t.category] = (totals[t.category] || 0) + amt;
        totalExpense += amt;
      }
    });

    const entries = Object.entries(totals).map(([cat, val]) => {
      const pct = totalExpense > 0 ? Math.round((val / totalExpense) * 100) : 0;
      const match = categories.find((c) => c.name.toLowerCase() === cat.toLowerCase());
      return {
        category: cat,
        amount: val,
        percentage: pct,
        color: match ? match.color : "#6b7280",
      };
    });

    return {
      entries,
      totalExpense,
      chartData: {
        labels: entries.map((e) => e.category),
        datasets: [
          {
            data: entries.map((e) => e.amount),
            backgroundColor: entries.map((e) => e.color),
            borderWidth: 0,
          },
        ],
      },
    };
  }, [transactions, categories]);

  const monthlyChart = {
    labels: ["This Month"],
    datasets: [
      {
        label: "Income",
        data: [summary.income],
        backgroundColor: "#10b981",
        borderRadius: 8,
      },
      {
        label: "Expense",
        data: [summary.expense],
        backgroundColor: "#ef4444",
        borderRadius: 8,
      },
    ],
  };

  const filteredTx = useMemo(() => {
    const sorted = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
    if (!searchQuery) return sorted.slice(0, 5);
    const q = searchQuery.toLowerCase();
    return sorted.filter(
      (t) =>
        t.category.toLowerCase().includes(q) ||
        t.notes.toLowerCase().includes(q)
    );
  }, [transactions, searchQuery]);

  // Find highest category spent for insights
  const topSpentCategory = useMemo(() => {
    if (categorySplitData.entries.length === 0) return null;
    return [...categorySplitData.entries].sort((a, b) => b.amount - a.amount)[0];
  }, [categorySplitData]);

  return (
    <div className="dashboard-page">
      {/* TOP WELCOME BANNER */}
      <div className="welcome-banner">
        <div>
          <h1>Welcome back, {userName}! 👋</h1>
          <p>Here's your financial overview</p>
        </div>
        <div className="welcome-right">
          <div className="search-bar">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="theme-toggle-btn" onClick={() => setDark(!dark)}>
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <div className="user-avatar" title={userName}>
            {userName.charAt(0)}
          </div>
        </div>
      </div>

      {/* THREE STATS ROW */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrap income">
            <TrendingUp size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <p>Total Income</p>
            <h2>₹{summary.income.toLocaleString("en-IN")}</h2>
            <div className="stat-change positive">
              <ArrowUpRight size={12} /> +12.5% from last month
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap expense">
            <TrendingDown size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <p>Total Expense</p>
            <h2>₹{summary.expense.toLocaleString("en-IN")}</h2>
            <div className="stat-change negative">
              <ArrowDownRight size={12} /> +8.3% from last month
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap balance">
            <Wallet size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <p>Balance</p>
            <h2>₹{summary.balance.toLocaleString("en-IN")}</h2>
            <div className={`stat-change ${summary.balance >= 0 ? "neutral" : "negative"}`}>
              <ArrowUpRight size={12} /> {summary.balance >= 0 ? "+4.2%" : "-2.5%"} from last month
            </div>
          </div>
        </div>
      </div>

      {/* MIDDLE ROW (ACTIONS + GOAL) */}
      <div className="dashboard-grid">
        <div className="action-grid">
          <div className="action-card action-purple" onClick={onAddExpense}>
            <div className="action-icon-wrap">
              <PlusCircle size={22} />
            </div>
            <div>
              <h3>Add Transaction</h3>
              <p>Record income or expense</p>
            </div>
          </div>

          <div className="action-card action-blue" onClick={onViewReports}>
            <div className="action-icon-wrap">
              <BarChart3 size={22} />
            </div>
            <div>
              <h3>View Reports</h3>
              <p>Analyze your finances</p>
            </div>
          </div>
        </div>

        <GoalCard
          title="Monthly Expense Goal"
          target={Number(localStorage.getItem("hisab_monthly_goal")) || 0}
          saved={summary.expense}
        />
      </div>

      {/* BOTTOM LAYOUT GRID */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1.3fr", gap: "16px", marginTop: "20px" }}>
        
        {/* COLUMN 1: Category Split & Bar Chart */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="chart-card">
            <div className="chart-header">
              <h3>Expense by Category</h3>
              <button className="chart-filter-btn">This Month</button>
            </div>
            <div style={{ height: "150px", position: "relative", display: "flex", justifyContent: "center" }}>
              {categorySplitData.entries.length === 0 ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", fontSize: "0.85rem" }}>
                  No expense data recorded
                </div>
              ) : (
                <Doughnut
                  data={categorySplitData.chartData}
                  options={{
                    plugins: { legend: { display: false } },
                    cutout: "70%",
                    maintainAspectRatio: false,
                  }}
                />
              )}
            </div>
            {categorySplitData.entries.length > 0 && (
              <div className="category-legend">
                {categorySplitData.entries.slice(0, 3).map((entry, idx) => (
                  <div className="legend-row" key={idx}>
                    <div className="legend-left">
                      <div className="legend-dot" style={{ backgroundColor: entry.color }}></div>
                      <span className="legend-name">{entry.category}</span>
                    </div>
                    <div className="legend-right">
                      <span className="legend-amount">₹{entry.amount.toLocaleString("en-IN")}</span>
                      <span className="legend-pct">{entry.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="chart-card" style={{ minHeight: "260px" }}>
            <div className="chart-header">
              <h3>Monthly Overview</h3>
            </div>
            <div style={{ height: "180px" }}>
              <Bar
                data={monthlyChart}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    y: { grid: { color: "rgba(0,0,0,0.04)" } },
                    x: { grid: { display: false } },
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* COLUMN 2: Budget Insights & Streak */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="budget-insights-card" style={{ flex: 1 }}>
            <div className="insight-header">
              <Sparkles size={18} style={{ color: "var(--accent)" }} />
              <h3>Budget Insights</h3>
            </div>
            
            <div className="insight-row">
              <div
                className="insight-icon"
                style={{
                  background: summary.balance >= 0 ? "var(--success-light)" : "var(--danger-light)",
                  color: summary.balance >= 0 ? "var(--success)" : "var(--danger)",
                }}
              >
                ✓
              </div>
              <div className="insight-text">
                {summary.balance >= 0 ? (
                  <span>You are doing great! 🎉 You are within your monthly budget limit.</span>
                ) : (
                  <span>You are currently overspending. Try to defer non-essential purchases.</span>
                )}
              </div>
            </div>

            {topSpentCategory && (
              <div className="insight-row">
                <div className="insight-icon" style={{ background: "rgba(245, 158, 11, 0.15)", color: "var(--warning)" }}>
                  ⚠️
                </div>
                <div className="insight-text">
                  <span>
                    Your top spending is in <strong>{topSpentCategory.category}</strong>: ₹
                    {topSpentCategory.amount.toLocaleString("en-IN")} ({topSpentCategory.percentage}%).
                  </span>
                </div>
              </div>
            )}

            <div className="insight-row">
              <div className="insight-icon" style={{ background: "var(--info-light)", color: "var(--info)" }}>
                🎯
              </div>
              <div className="insight-text">
                <span>
                  Save <strong>₹{summary.balance > 0 ? summary.balance.toLocaleString("en-IN") : "0"}</strong> more to reach your goal this month.
                </span>
              </div>
            </div>

            <button className="insight-link" onClick={onViewReports}>
              View Detailed Insights
            </button>
          </div>

          <div className="streak-card">
            <div className="streak-header">
              <span style={{ fontSize: "20px" }}>🔥</span>
              <div>
                <span className="streak-count">14 Days</span>
                <p className="streak-label">Spending Streak — active tracker</p>
              </div>
            </div>
            <div className="streak-week">
              <div className="streak-day active">
                <span className="streak-day-label">M</span>
                <span>✓</span>
              </div>
              <div className="streak-day active">
                <span className="streak-day-label">T</span>
                <span>✓</span>
              </div>
              <div className="streak-day active">
                <span className="streak-day-label">W</span>
                <span>✓</span>
              </div>
              <div className="streak-day active">
                <span className="streak-day-label">T</span>
                <span>✓</span>
              </div>
              <div className="streak-day today">
                <span className="streak-day-label">F</span>
                <span>★</span>
              </div>
              <div className="streak-day inactive">
                <span className="streak-day-label">S</span>
                <span>•</span>
              </div>
              <div className="streak-day inactive">
                <span className="streak-day-label">S</span>
                <span>•</span>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMN 3: Recent Transactions list */}
        <div className="transaction-card" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <div className="section-header">
            <h2>Recent Transactions</h2>
            <span className="tx-count">{transactions.length} Records</span>
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
            {filteredTx.length === 0 ? (
              <div style={{ padding: "40px 0", textAlign: "center", color: "var(--muted)", fontSize: "0.85rem" }}>
                No matching transactions found.
              </div>
            ) : (
              filteredTx.map((t) => {
                const style = categoryStyleMap[t.category.toLowerCase()] || defaultStyle;
                return (
                  <div className="transaction-item" key={t._id}>
                    <div className="transaction-left">
                      <div className="tx-cat-icon" style={{ backgroundColor: style.bg, color: style.color }}>
                        {style.icon}
                      </div>
                      <div>
                        <div className="transaction-category">{t.category}</div>
                        <div className="transaction-date">
                          {new Date(t.date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                          {t.notes && (
                            <span className="note-icon">
                              📝
                              <span className="note-tooltip">{t.notes}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="transaction-amount">
                      <div className={`amount-pill ${t.type}`}>
                        {t.type === "expense" ? "-" : "+"}₹{t.amount.toLocaleString("en-IN")}
                      </div>
                      <div className="tx-actions">
                        <button className="tx-action-btn" onClick={() => setEditing({ ...t })} title="Edit">
                          <Edit size={14} />
                        </button>
                        <button className="tx-action-btn delete" onClick={() => removeTx(t._id)} title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <button className="view-all-btn" onClick={onViewReports}>
            View All Transactions
          </button>
        </div>

      </div>

      {/* EDIT MODAL */}
      {editing && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h2>Edit Transaction</h2>
            <br />
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label>Amount (₹)</label>
                <input
                  type="number"
                  value={editing.amount}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      amount: Number(e.target.value),
                    })
                  }
                />
              </div>

              <div>
                <label>Type</label>
                <select
                  value={editing.type}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      type: e.target.value,
                    })
                  }
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>

              <div>
                <label>Category</label>
                <select
                  value={editing.category}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      category: e.target.value,
                    })
                  }
                >
                  {categories.map((c) => (
                    <option key={c._id} value={c.name}>
                      {c.icon} {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Notes</label>
                <textarea
                  rows="2"
                  value={editing.notes || ""}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      notes: e.target.value,
                    })
                  }
                  placeholder="Notes"
                />
              </div>

              <div>
                <label>Date</label>
                <input
                  type="date"
                  value={editing.date?.split("T")[0]}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      date: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <br />
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="btn-primary" onClick={saveEdit}>
                Save Changes
              </button>
              <button className="btn-secondary" onClick={() => setEditing(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}