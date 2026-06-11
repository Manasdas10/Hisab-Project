import React, { useEffect, useMemo, useState } from "react";
import { getTransactions } from "../lib/api.js";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  TimeScale,
  PointElement,
  LineElement,
} from "chart.js";

import { Doughnut, Line } from "react-chartjs-2";
import "chartjs-adapter-date-fns";
import { ArrowLeft, TrendingUp, TrendingDown, Wallet, Calendar, Sparkles, Download, FileSpreadsheet, Share2, Search, List, AlignLeft } from "lucide-react";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  TimeScale,
  PointElement,
  LineElement
);

const ranges = [
  { id: "all", label: "All Time" },
  { id: "7", label: "7 Days" },
  { id: "30", label: "30 Days" },
  { id: "90", label: "90 Days" },
  { id: "month", label: "This Month" },
];

function fmtCurrency(v) {
  if (typeof v !== "number") return v;
  return "₹" + v.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });
}

function isValidDate(d) {
  return d instanceof Date && !Number.isNaN(d.getTime());
}

function filterByRange(tx, rangeId) {
  if (!rangeId || rangeId === "all") return tx;

  const now = new Date();

  if (rangeId === "month") {
    return tx.filter((t) => {
      const d = new Date(t.date);
      return (
        isValidDate(d) &&
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth()
      );
    });
  }

  const days = Number(rangeId);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  return tx.filter((t) => {
    const d = new Date(t.date);
    return isValidDate(d) && d >= cutoff;
  });
}

export default function Reports({ onBack }) {
  const [tx, setTx] = useState([]);
  const [range, setRange] = useState("30");
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  async function fetchTx(signal) {
    try {
      const data = await getTransactions(signal);
      const arr = Array.isArray(data) ? data : [];

      setTx(
        arr.map((t) => ({
          _id: t._id || crypto.randomUUID(),
          type: t.type || "expense",
          amount: Number(t.amount || 0),
          category: t.category || "Uncategorized",
          notes: t.notes || "",
          date: t.date ? new Date(t.date).toISOString() : new Date().toISOString(),
        }))
      );
    } catch (err) {
      if (err.name !== "AbortError") {
        setError(err?.message || "Failed to fetch transactions");
      }
    }
  }

  useEffect(() => {
    const ac = new AbortController();
    fetchTx(ac.signal);
    return () => ac.abort();
  }, []);

  const filtered = useMemo(() => filterByRange(tx, range), [tx, range]);

  const filteredAndSearchedTx = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return filtered.filter((t) => {
      return (
        t.category.toLowerCase().includes(q) ||
        t.notes.toLowerCase().includes(q)
      );
    });
  }, [filtered, searchQuery]);
  const expenses = filtered.filter((t) => t.type === "expense");
  const incomes = filtered.filter((t) => t.type === "income");

  const catTotals = useMemo(() => {
    return expenses.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});
  }, [expenses]);

  const totalSpent = expenses.reduce((s, t) => s + t.amount, 0);
  const totalIncome = incomes.reduce((s, t) => s + t.amount, 0);
  const netBalance = totalIncome - totalSpent;

  const doughnutData = useMemo(() => {
    const entries = Object.entries(catTotals);
    return {
      labels: entries.map((e) => e[0]),
      datasets: [
        {
          data: entries.map((e) => e[1]),
          backgroundColor: [
            "#10b981", // green
            "#3b82f6", // blue
            "#f59e0b", // orange
            "#8b5cf6", // purple
            "#ec4899", // pink
            "#06b6d4", // cyan
            "#6b7280", // gray
          ],
          borderWidth: 0,
        },
      ],
    };
  }, [catTotals]);

  const spendingPatternChart = useMemo(() => {
    if (expenses.length === 0) return null;

    const daily = {};

    expenses.forEach((t) => {
      const d = new Date(t.date);
      const key = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();

      if (!daily[key]) {
        daily[key] = { total: 0, categories: {} };
      }

      daily[key].total += t.amount;
      daily[key].categories[t.category] =
        (daily[key].categories[t.category] || 0) + t.amount;
    });

    const points = Object.keys(daily)
      .map((d) => ({
        x: new Date(d),
        y: daily[d].total,
        categories: daily[d].categories,
      }))
      .sort((a, b) => a.x - b.x);

    return {
      datasets: [
        {
          label: "Daily Spending",
          data: points,
          fill: true,
          tension: 0.4,
          borderColor: "#ef4444",
          backgroundColor: "rgba(239,68,68,0.08)",
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    };
  }, [expenses]);

  const insights = useMemo(() => {
    if (expenses.length === 0) return ["No spending data recorded for this period."];

    const msgs = [];

    const topCategory = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0];
    if (topCategory) {
      msgs.push(`Your highest spending is in **${topCategory[0]}** amounting to **${fmtCurrency(topCategory[1])}**.`);
    }

    const biggest = [...expenses].sort((a, b) => b.amount - a.amount)[0];
    if (biggest) {
      msgs.push(`Your largest single transaction was **${fmtCurrency(biggest.amount)}** in **${biggest.category}**.`);
    }

    const days = Math.max(
      1,
      new Set(expenses.map((e) => new Date(e.date).toDateString())).size
    );
    msgs.push(`Your average daily expenditure is **${fmtCurrency(totalSpent / days)}**.`);

    msgs.push(
      totalIncome > totalSpent
        ? "✅ Your income exceeds your total expenses for this period. You are successfully saving!"
        : "⚠️ Your expenses are higher than your recorded income. Consider reviewing category limits."
    );

    return msgs;
  }, [expenses, incomes, catTotals, totalSpent, totalIncome]);

  // helper renderer for markdown-like text
  const renderInsightText = (text) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={index} style={{ color: "var(--heading)" }}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="dashboard-page" style={{ paddingBottom: "40px" }}>
      {/* HEADER BAR */}
      <div className="welcome-banner" style={{ background: "linear-gradient(135deg, #3B82F6 0%, #2563EB 50%, #1D4ED8 100%)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <button className="theme-toggle-btn" onClick={onBack} title="Back to Dashboard">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1>Financial Reports</h1>
            <p>Analyze and review your transaction balances</p>
          </div>
        </div>
        <div className="welcome-right" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "10px" }}>
          <div style={{ display: "flex", gap: "6px", background: "rgba(255,255,255,0.12)", padding: "4px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.15)" }}>
            {ranges.map((r) => (
              <button
                key={r.id}
                className="chart-filter-btn"
                style={{
                  background: range === r.id ? "white" : "transparent",
                  color: range === r.id ? "var(--accent)" : "white",
                  border: "none",
                }}
                onClick={() => setRange(r.id)}
              >
                {r.label}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button className="btn-secondary" style={{ background: "rgba(255, 255, 255, 0.15)", color: "white", border: "none", display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", borderRadius: "8px", fontSize: "0.8rem", cursor: "pointer" }}>
              <Download size={14} /> Export PDF
            </button>
            <button className="btn-secondary" style={{ background: "rgba(255, 255, 255, 0.15)", color: "white", border: "none", display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", borderRadius: "8px", fontSize: "0.8rem", cursor: "pointer" }}>
              <FileSpreadsheet size={14} /> Export Excel
            </button>
            <button className="btn-secondary" style={{ background: "rgba(255, 255, 255, 0.15)", color: "white", border: "none", display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", borderRadius: "8px", fontSize: "0.8rem", cursor: "pointer" }}>
              <Share2 size={14} /> Share
            </button>
          </div>
        </div>
      </div>

      {/* STATS ROW (4 CARDS) */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrap income">
            <TrendingUp size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <p>Income in Period</p>
            <h2>{fmtCurrency(totalIncome)}</h2>
            <div className="stat-change positive" style={{ marginTop: "4px" }}>
              {incomes.length} Records
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap expense">
            <TrendingDown size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <p>Expense in Period</p>
            <h2>{fmtCurrency(totalSpent)}</h2>
            <div className="stat-change negative" style={{ marginTop: "4px" }}>
              {expenses.length} Records
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap balance">
            <Wallet size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <p>Net Balance</p>
            <h2>{fmtCurrency(netBalance)}</h2>
            <div className={`stat-change ${netBalance >= 0 ? "positive" : "negative"}`} style={{ marginTop: "4px" }}>
              {netBalance >= 0 ? "Net Positive" : "Net Overspent"}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap balance" style={{ background: "rgba(108,71,255,0.1)", color: "var(--accent)" }}>
            <List size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <p>Total Transactions</p>
            <h2>{filtered.length}</h2>
            <div className="stat-change positive" style={{ marginTop: "4px" }}>
              Volume in period
            </div>
          </div>
        </div>
      </div>

      {/* CHARTS GRID */}
      <div className="charts-grid" style={{ marginTop: "24px" }}>
        
        {/* Doughnut Chart */}
        <div className="chart-card" style={{ display: "flex", flexDirection: "column" }}>
          <div className="chart-header">
            <h3>Category Breakdown</h3>
          </div>
          <div style={{ flex: 1, height: "240px", position: "relative", display: "flex", justifyContent: "center", alignItems: "center" }}>
            {Object.keys(catTotals).length === 0 ? (
              <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>No category split recorded.</div>
            ) : (
              <Doughnut
                data={doughnutData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  cutout: "65%",
                  plugins: {
                    legend: {
                      position: "bottom",
                      labels: {
                        boxWidth: 8,
                        usePointStyle: true,
                        pointStyle: "circle",
                        font: { size: 10 }
                      }
                    },
                    tooltip: {
                      callbacks: {
                        label: (ctx) => {
                          const value = ctx.parsed;
                          const percent = ((value / totalSpent) * 100).toFixed(1);
                          return ` ₹${value.toLocaleString("en-IN")} (${percent}%)`;
                        },
                      },
                    },
                  },
                }}
              />
            )}
          </div>
        </div>

        {/* Line Chart */}
        <div className="chart-card" style={{ display: "flex", flexDirection: "column" }}>
          <div className="chart-header">
            <h3>Daily Spending Trend</h3>
          </div>
          <div style={{ flex: 1, height: "240px" }}>
            {!spendingPatternChart ? (
              <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", fontSize: "0.85rem" }}>
                No daily pattern recorded.
              </div>
            ) : (
              <Line
                data={spendingPatternChart}
                options={{
                  maintainAspectRatio: false,
                  scales: {
                    x: {
                      type: "time",
                      time: { unit: "day" },
                      grid: { display: false },
                      ticks: {
                        font: { size: 9 },
                        callback: (value, index, ticks) => {
                          const d = new Date(ticks[index].value);
                          return d.toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          });
                        },
                      },
                    },
                    y: {
                      beginAtZero: true,
                      grid: { color: "rgba(0,0,0,0.04)" },
                      ticks: {
                        font: { size: 9 },
                        callback: (v) => `₹${v.toLocaleString("en-IN")}`,
                      },
                    },
                  },
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      callbacks: {
                        title: () => "",
                        label: (ctx) => {
                          const lines = [`Total Spent: ₹${ctx.raw.y.toLocaleString("en-IN")}`];
                          Object.entries(ctx.raw.categories || {}).forEach(
                            ([cat, amt]) => lines.push(` • ${cat}: ₹${amt.toLocaleString("en-IN")}`)
                          );
                          return lines;
                        },
                      },
                    },
                  },
                }}
              />
            )}
          </div>
        </div>

      </div>

      {/* REPORT INSIGHTS */}
      <div className="card" style={{ marginTop: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
          <Sparkles size={18} style={{ color: "var(--accent)" }} />
          <h3 style={{ fontSize: "1rem", fontWeight: "700" }}>Period Analysis & Insights</h3>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {insights.map((msg, i) => (
            <div key={i} className="insight-row" style={{ padding: "8px 0" }}>
              <div className="insight-icon" style={{ background: "var(--accent-light)", color: "var(--accent)", fontSize: "0.8rem" }}>
                💡
              </div>
              <div className="insight-text" style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                {renderInsightText(msg)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TRANSACTIONS TABLE */}
      <div className="card" style={{ marginTop: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
          <h3 style={{ fontSize: "1.05rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
            <AlignLeft size={18} style={{ color: "var(--accent)" }} />
            Transactions History
          </h3>
          <div className="search-box" style={{ display: "flex", alignItems: "center", background: "var(--body-bg)", border: "1px solid var(--border-color)", borderRadius: "8px", padding: "6px 12px", width: "260px" }}>
            <Search size={16} style={{ color: "var(--muted)", marginRight: "8px" }} />
            <input
              type="text"
              placeholder="Search category or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: "none", background: "transparent", fontSize: "0.85rem", width: "100%", outline: "none" }}
            />
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
                <th style={{ padding: "12px 8px", fontSize: "0.8rem", textTransform: "uppercase", color: "var(--text-secondary)" }}>Category</th>
                <th style={{ padding: "12px 8px", fontSize: "0.8rem", textTransform: "uppercase", color: "var(--text-secondary)" }}>Description (Notes)</th>
                <th style={{ padding: "12px 8px", fontSize: "0.8rem", textTransform: "uppercase", color: "var(--text-secondary)" }}>Type</th>
                <th style={{ padding: "12px 8px", fontSize: "0.8rem", textTransform: "uppercase", color: "var(--text-secondary)" }}>Amount</th>
                <th style={{ padding: "12px 8px", fontSize: "0.8rem", textTransform: "uppercase", color: "var(--text-secondary)" }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSearchedTx.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "24px", color: "var(--muted)", fontSize: "0.85rem" }}>
                    No transactions found.
                  </td>
                </tr>
              ) : (
                filteredAndSearchedTx.map((t) => (
                  <tr key={t._id} style={{ borderBottom: "1px solid var(--border-color)", fontSize: "0.85rem" }}>
                    <td style={{ padding: "12px 8px", fontWeight: "600" }}>{t.category}</td>
                    <td style={{ padding: "12px 8px", color: "var(--text-secondary)" }}>{t.notes || "—"}</td>
                    <td style={{ padding: "12px 8px" }}>
                      <span style={{
                        padding: "2px 8px",
                        borderRadius: "99px",
                        fontSize: "0.75rem",
                        fontWeight: "600",
                        background: t.type === "income" ? "var(--success-light)" : "var(--danger-light)",
                        color: t.type === "income" ? "var(--success)" : "var(--danger)"
                      }}>
                        {t.type}
                      </span>
                    </td>
                    <td style={{ padding: "12px 8px", fontWeight: "600", color: t.type === "income" ? "var(--success)" : "var(--danger)" }}>
                      {t.type === "income" ? "+" : "-"}₹{t.amount.toLocaleString("en-IN")}
                    </td>
                    <td style={{ padding: "12px 8px", color: "var(--text-secondary)" }}>
                      {new Date(t.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {error && (
        <div className="card" style={{ marginTop: "20px", background: "var(--danger-light)", borderColor: "rgba(239,68,68,0.2)", color: "var(--danger)" }}>
          {error}
        </div>
      )}
    </div>
  );
}
