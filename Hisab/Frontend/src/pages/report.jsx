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
  { id: "all", label: "All" },
  { id: "7", label: "7d" },
  { id: "30", label: "30d" },
  { id: "90", label: "90d" },
  { id: "month", label: "This month" },
];

function fmtCurrency(v) {
  if (typeof v !== "number") return v;
  return v.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
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
  const expenses = filtered.filter((t) => t.type === "expense");
  const incomes = filtered.filter((t) => t.type === "income");

  const catTotals = useMemo(() => {
    return expenses.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});
  }, [expenses]);

  const totalSpent = expenses.reduce((s, t) => s + t.amount, 0);

  const doughnutData = useMemo(() => {
    const entries = Object.entries(catTotals);
    return {
      labels: entries.map((e) => e[0]),
      datasets: [
        {
          data: entries.map((e) => e[1]),
          backgroundColor: [
            "#16a34a",
            "#059669",
            "#84cc16",
            "#f59e0b",
            "#ef4444",
            "#6366f1",
            "#7c3aed",
          ],
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
          backgroundColor: "rgba(239,68,68,0.15)",
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    };
  }, [expenses]);

  const insights = useMemo(() => {
    if (expenses.length === 0) return ["No spending data for this period."];

    const msgs = [];

    const topCategory = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0];
    if (topCategory)
      msgs.push(`Highest spending: "${topCategory[0]}" → ${fmtCurrency(topCategory[1])}`);

    const biggest = [...expenses].sort((a, b) => b.amount - a.amount)[0];
    if (biggest)
      msgs.push(`Largest single expense: ${fmtCurrency(biggest.amount)} in "${biggest.category}"`);

    const days = Math.max(
      1,
      new Set(expenses.map((e) => new Date(e.date).toDateString())).size
    );

    msgs.push(`Average daily spending: ${fmtCurrency(totalSpent / days)}`);

    const totalIncome = incomes.reduce((s, t) => s + t.amount, 0);
    msgs.push(
      totalIncome > totalSpent
        ? "Income is higher than expenses — you are saving!"
        : "Expenses exceed income — review spending."
    );

    return msgs;
  }, [expenses, incomes, catTotals, totalSpent]);

  return (
    <div className="page-container" style={{ paddingTop: 18 }}>
      <div className="card" style={{ maxWidth: 980, width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            <button className="small-btn" onClick={onBack}>Back</button>
            <h2>Reports</h2>
            <strong>Spent: {fmtCurrency(totalSpent)}</strong>
            <div style={{ color: "#6b7280" }}>Transactions: {filtered.length}</div>
          </div>

          <div>
            <div style={{ marginBottom: 6 }}>Range</div>
            <div style={{ display: "flex", gap: 6 }}>
              {ranges.map((r) => (
                <button
                  key={r.id}
                  className={`small-btn ${range === r.id ? "active" : ""}`}
                  onClick={() => setRange(r.id)}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          <h3>Category Split</h3>
          {Object.keys(catTotals).length === 0 ? (
            <div>No data</div>
          ) : (
            <div style={{ height: 220 }}>
              <Doughnut
                data={doughnutData}
                options={{
                  plugins: {
                    tooltip: {
                      callbacks: {
                        label: (ctx) => {
                          const value = ctx.parsed;
                          const percent = ((value / totalSpent) * 100).toFixed(1);
                          return `${ctx.label}: ₹${value} (${percent}%)`;
                        },
                      },
                    },
                  },
                }}
              />
            </div>
          )}
        </div>

        <div style={{ marginTop: 30 }}>
          <h3>Daily Spending Pattern</h3>
          {spendingPatternChart && (
            <div style={{ height: 260 }}>
              <Line
                data={spendingPatternChart}
                options={{
                  maintainAspectRatio: false,
                  scales: {
                    x: {
                      type: "time",
                      time: { unit: "day" },
                      ticks: {
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
                      ticks: { callback: (v) => `₹${v}` },
                    },
                  },
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      callbacks: {
                        title: () => "",
                        label: (ctx) => {
                          const lines = [`Total: ₹${ctx.raw.y}`];
                          Object.entries(ctx.raw.categories || {}).forEach(
                            ([cat, amt]) => lines.push(`${cat}: ₹${amt}`)
                          );
                          return lines;
                        },
                      },
                    },
                  },
                }}
              />
            </div>
          )}
        </div>

        <div style={{ marginTop: 30 }}>
          <h3>Spending Insights</h3>
          <ul style={{ marginTop: 10 }}>
            {insights.map((msg, i) => (
              <li key={i}>{msg}</li>
            ))}
          </ul>
        </div>

        {error && <div style={{ color: "red", marginTop: 20 }}>{error}</div>}
      </div>
    </div>
  );
}
