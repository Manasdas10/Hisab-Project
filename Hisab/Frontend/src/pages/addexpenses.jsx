import React, { useEffect, useRef, useState, useMemo } from "react";
import { createTransaction, getCategories, getTransactions, createCategory } from "../lib/api.js";
import { showToast } from "../lib/toast.js";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";
import { Plus, HelpCircle, Wallet, ArrowUpRight, ArrowDownRight, Tag, Calendar, CreditCard, AlignLeft } from "lucide-react";

ChartJS.register(ArcElement, Tooltip, Legend);

function AddExpense({ onSaved, onCancel }) {
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);

  // Quick category creation states
  const [showQuickAddCat, setShowQuickAddCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("🏷️");
  const [newCatColor, setNewCatColor] = useState("#6C47FF");

  const acRef = useRef(null);

  async function loadCats() {
    try {
      const data = await getCategories();
      setCategories(data);
      if (data.length > 0 && !category) {
        setCategory(data[0].name);
      }
    } catch (err) {
      console.log(err);
    }
  }

  async function loadTransactions() {
    try {
      const data = await getTransactions();
      setTransactions(data.map(t => ({ ...t, amount: Number(t.amount) })));
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    loadCats();
    loadTransactions();

    return () => {
      if (acRef.current) {
        acRef.current.abort();
      }
    };
  }, []);

  function showMessage(msg) {
    if (typeof showToast === "function") {
      showToast(msg);
    } else {
      alert(msg);
    }
  }

  async function handleCreateCategory(e) {
    e.preventDefault();
    if (!newCatName.trim()) {
      showMessage("Enter category name");
      return;
    }
    try {
      const created = await createCategory({
        name: newCatName.trim(),
        icon: newCatIcon,
        color: newCatColor
      });
      showMessage(`Category "${created.name}" created!`);
      setNewCatName("");
      setShowQuickAddCat(false);
      await loadCats();
      setCategory(created.name);
    } catch (err) {
      showMessage(err?.message || "Failed to create category");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      showMessage("Enter a valid amount");
      return;
    }

    if (!category) {
      showMessage("Please select a category");
      return;
    }

    // Combine payment method into notes so we don't break database schema
    const combinedNotes = paymentMethod ? `[${paymentMethod}] ${notes}`.trim() : notes.trim();

    const payload = {
      amount: Number(amount),
      type,
      category,
      date,
      notes: combinedNotes,
    };

    setLoading(true);
    const controller = new AbortController();
    acRef.current = controller;

    try {
      const created = await createTransaction(payload, controller.signal);
      showMessage("Transaction Saved ✔");
      if (typeof onSaved === "function") {
        onSaved(created);
      }
    } catch (err) {
      console.log(err);
      showMessage(err?.message || "Failed to save transaction");
    } finally {
      setLoading(false);
      acRef.current = null;
    }
  }

  // Monthly summary calculation
  const monthSummary = useMemo(() => {
    let income = 0;
    let expense = 0;
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    transactions.forEach((t) => {
      const d = new Date(t.date);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        if (t.type === "income") {
          income += t.amount;
        } else {
          expense += t.amount;
        }
      }
    });

    return {
      income,
      expense,
      balance: income - expense
    };
  }, [transactions]);

  // Donut breakdown for expenses this month
  const categoryBreakdown = useMemo(() => {
    const totals = {};
    let totalExpense = 0;
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    transactions.forEach((t) => {
      const d = new Date(t.date);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear && t.type === "expense") {
        totals[t.category] = (totals[t.category] || 0) + t.amount;
        totalExpense += t.amount;
      }
    });

    const labels = Object.keys(totals);
    const data = Object.values(totals);

    return {
      totalExpense,
      labels,
      chartData: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: [
              "#6C47FF", "#10b981", "#ef4444", "#f59e0b", "#3b82f6", "#ec4899", "#8b5cf6"
            ],
            borderWidth: 0,
          }
        ]
      }
    };
  }, [transactions]);

  return (
    <div className="dashboard-page" style={{ paddingBottom: "40px" }}>
      <div className="welcome-banner" style={{ background: "linear-gradient(135deg, #6C47FF 0%, #8B6AFF 100%)", marginBottom: "24px" }}>
        <div>
          <h1>Add Transaction</h1>
          <p>Record your income or expenses to update your balance sheets</p>
        </div>
      </div>

      <div className="add-expense-layout">
        {/* LEFT COLUMN: FORM */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          
          {/* Step 1: Type selection */}
          <div className="step-card">
            <div className="step-header">
              <span className="step-number">1</span>
              <h3 className="step-title">Transaction Type</h3>
            </div>
            <div className="type-switch" style={{ width: "100%", margin: 0 }}>
              <button
                type="button"
                className={type === "expense" ? "type-btn active-expense" : "type-btn"}
                style={{ flex: 1 }}
                onClick={() => setType("expense")}
              >
                Expense
              </button>
              <button
                type="button"
                className={type === "income" ? "type-btn active-income" : "type-btn"}
                style={{ flex: 1 }}
                onClick={() => setType("income")}
              >
                Income
              </button>
            </div>
          </div>

          {/* Step 2: Amount input */}
          <div className="step-card">
            <div className="step-header">
              <span className="step-number">2</span>
              <h3 className="step-title">Amount (₹)</h3>
            </div>
            <div className="input-group" style={{ margin: 0 }}>
              <input
                type="number"
                placeholder="Enter amount (e.g. 500)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{ fontSize: "1.2rem", fontWeight: "600", padding: "12px" }}
                required
              />
            </div>
          </div>

          {/* Step 3: Category grid */}
          <div className="step-card">
            <div className="step-header" style={{ justifyContent: "space-between", width: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span className="step-number">3</span>
                <h3 className="step-title">Select Category</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowQuickAddCat(!showQuickAddCat)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--accent)",
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px"
                }}
              >
                <Plus size={14} /> Add Custom
              </button>
            </div>

            {showQuickAddCat && (
              <div style={{
                background: "var(--body-bg)",
                border: "1px dashed var(--border-color)",
                padding: "16px",
                borderRadius: "10px",
                marginBottom: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "10px"
              }}>
                <h4 style={{ margin: 0, fontSize: "0.85rem", color: "var(--heading)" }}>Quick Add Category</h4>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    placeholder="Name (e.g. Rent)"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    style={{ flex: 1, padding: "8px" }}
                  />
                  <input
                    type="text"
                    placeholder="Emoji (🏠)"
                    value={newCatIcon}
                    onChange={(e) => setNewCatIcon(e.target.value)}
                    style={{ width: "60px", textAlign: "center", padding: "8px" }}
                  />
                  <input
                    type="color"
                    value={newCatColor}
                    onChange={(e) => setNewCatColor(e.target.value)}
                    style={{ width: "40px", height: "38px", padding: 0, border: "none", background: "none", cursor: "pointer" }}
                  />
                  <button
                    type="button"
                    onClick={handleCreateCategory}
                    className="btn-primary"
                    style={{ padding: "8px 16px" }}
                  >
                    Add
                  </button>
                </div>
              </div>
            )}

            <div className="category-grid" style={{ maxHeight: "180px", overflowY: "auto", padding: "4px" }}>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  type="button"
                  className={category === cat.name ? "category-pill active" : "category-pill"}
                  onClick={() => setCategory(cat.name)}
                >
                  <span style={{ fontSize: "1.1rem" }}>{cat.icon || "🏷️"}</span> {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Step 4: Date Selection */}
          <div className="step-card">
            <div className="step-header">
              <span className="step-number">4</span>
              <h3 className="step-title">Select Date</h3>
            </div>
            <div className="input-group" style={{ margin: 0 }}>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Step 5: Payment Method */}
          <div className="step-card">
            <div className="step-header">
              <span className="step-number">5</span>
              <h3 className="step-title">Payment Method</h3>
            </div>
            <div className="payment-method-grid">
              {["Cash", "Card", "UPI", "Net Banking"].map((method) => (
                <div
                  key={method}
                  className={`payment-method-pill ${paymentMethod === method ? "active" : ""}`}
                  onClick={() => setPaymentMethod(method)}
                >
                  {method}
                </div>
              ))}
            </div>
          </div>

          {/* Step 6: Notes */}
          <div className="step-card">
            <div className="step-header">
              <span className="step-number">6</span>
              <h3 className="step-title">Optional Notes</h3>
            </div>
            <div className="input-group" style={{ margin: 0 }}>
              <textarea
                rows="3"
                placeholder="Write transaction details here..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
            <button
              className="btn-primary"
              type="submit"
              disabled={loading}
              style={{ flex: 1, padding: "14px", fontSize: "0.95rem" }}
            >
              {loading ? "Saving..." : "Save Transaction"}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={onCancel}
              style={{ flex: 1, padding: "14px", fontSize: "0.95rem" }}
            >
              Cancel
            </button>
          </div>
        </form>

        {/* RIGHT COLUMN: INSIGHTS PANEL */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Quick Tips */}
          <div className="quick-tips-card">
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--accent)", fontWeight: "700" }}>
              <HelpCircle size={18} />
              <span>Smart Money Tips</span>
            </div>
            <ul className="quick-tips-list">
              <li>Aim to save at least 20% of your total monthly income using the 50/30/20 rule.</li>
              <li>Always enter notes for large transactions to track them easier during audits.</li>
              <li>Review category donut split to see where you are spending the most.</li>
            </ul>
          </div>

          {/* This Month Summary Card */}
          <div className="streak-card" style={{ padding: "20px" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "0.95rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
              <Wallet size={16} style={{ color: "var(--accent)" }} />
              This Month Summary
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Total Income:</span>
                <span style={{ fontSize: "0.95rem", fontWeight: "600", color: "#10b981", display: "flex", alignItems: "center" }}>
                  <ArrowUpRight size={14} /> ₹{monthSummary.income.toLocaleString("en-IN")}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Total Expense:</span>
                <span style={{ fontSize: "0.95rem", fontWeight: "600", color: "#ef4444", display: "flex", alignItems: "center" }}>
                  <ArrowDownRight size={14} /> ₹{monthSummary.expense.toLocaleString("en-IN")}
                </span>
              </div>
              <div style={{ height: "1px", background: "var(--border-color)", margin: "4px 0" }}></div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--heading)" }}>Net Balance:</span>
                <span style={{ fontSize: "1.05rem", fontWeight: "700", color: monthSummary.balance >= 0 ? "var(--accent)" : "#ef4444" }}>
                  ₹{monthSummary.balance.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          {/* Category Split Donut Chart */}
          <div className="chart-card">
            <h3 style={{ margin: "0 0 16px 0", fontSize: "0.95rem", fontWeight: "700" }}>Monthly Expense Breakdown</h3>
            <div className="summary-donut-wrap">
              {categoryBreakdown.labels.length === 0 ? (
                <div style={{ fontSize: "0.85rem", color: "var(--muted)", textAlign: "center" }}>
                  No expense records found for this month yet.
                </div>
              ) : (
                <Doughnut
                  data={categoryBreakdown.chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: "70%",
                    plugins: {
                      legend: {
                        position: "bottom",
                        labels: {
                          boxWidth: 6,
                          usePointStyle: true,
                          pointStyle: "circle",
                          font: { size: 9 }
                        }
                      }
                    }
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddExpense;