import React, { useEffect, useState, useMemo } from "react";
import { createTransaction } from "../lib/api.js";
import { showToast } from "../lib/toast.js";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Play,
  Pause,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  CreditCard,
  DollarSign
} from "lucide-react";

export default function Recurring({ onBack }) {
  const [items, setItems] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [item, setItem] = useState("");
  const [type, setType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState("Monthly");
  const [nextDue, setNextDue] = useState(() => {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    return nextMonth.toISOString().slice(0, 10);
  });

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("recurring_transactions");
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse recurring items", e);
      }
    } else {
      // Seed default items for first time
      const defaults = [
        {
          id: "rec_1",
          item: "Netflix Premium Subscription",
          type: "expense",
          amount: 649,
          frequency: "Monthly",
          nextDue: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          status: "Active"
        },
        {
          id: "rec_2",
          item: "Office Gym Membership",
          type: "expense",
          amount: 1500,
          frequency: "Monthly",
          nextDue: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          status: "Active"
        },
        {
          id: "rec_3",
          item: "Monthly Freelance Rent Rentier",
          type: "income",
          amount: 12000,
          frequency: "Monthly",
          nextDue: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          status: "Active"
        }
      ];
      setItems(defaults);
      localStorage.setItem("recurring_transactions", JSON.stringify(defaults));
    }
  }, []);

  // Save to localStorage whenever items change
  const saveItems = (newItems) => {
    setItems(newItems);
    localStorage.setItem("recurring_transactions", JSON.stringify(newItems));
  };

  const showMsg = (msg) => {
    if (typeof showToast === "function") {
      showToast(msg);
    } else {
      alert(msg);
    }
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!item.trim() || !amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      showMsg("Please enter valid item name and amount");
      return;
    }

    const newItem = {
      id: "rec_" + Date.now(),
      item: item.trim(),
      type,
      amount: Number(amount),
      frequency,
      nextDue,
      status: "Active"
    };

    saveItems([...items, newItem]);
    showMsg(`Added recurring payment: ${newItem.item}`);
    setItem("");
    setAmount("");
    setShowAddForm(false);
  };

  const handleDeleteItem = (id) => {
    if (!window.confirm("Delete this recurring tracker?")) return;
    const filtered = items.filter(x => x.id !== id);
    saveItems(filtered);
    showMsg("Tracker deleted");
  };

  const toggleStatus = (id) => {
    const updated = items.map(x => {
      if (x.id === id) {
        const nextStatus = x.status === "Active" ? "Paused" : "Active";
        showMsg(`Subscription ${nextStatus === "Active" ? "activated" : "paused"}`);
        return { ...x, status: nextStatus };
      }
      return x;
    });
    saveItems(updated);
  };

  // Process manual pay now to record transaction in real backend database
  const handlePayNow = async (recItem) => {
    try {
      const payload = {
        amount: recItem.amount,
        type: recItem.type,
        category: recItem.type === "income" ? "Salary" : "Subscriptions",
        date: new Date().toISOString().slice(0, 10),
        notes: `[Recurring Auto-Pay] ${recItem.item} (${recItem.frequency})`,
      };

      await createTransaction(payload);
      showMsg(`Payment of ₹${recItem.amount} processed and logged!`);

      // Update next due date by frequency
      const nextDueObj = new Date(recItem.nextDue);
      if (recItem.frequency === "Monthly") {
        nextDueObj.setMonth(nextDueObj.getMonth() + 1);
      } else if (recItem.frequency === "Weekly") {
        nextDueObj.setDate(nextDueObj.getDate() + 7);
      } else if (recItem.frequency === "Yearly") {
        nextDueObj.setFullYear(nextDueObj.getFullYear() + 1);
      }

      const updated = items.map(x => {
        if (x.id === recItem.id) {
          return { ...x, nextDue: nextDueObj.toISOString().slice(0, 10) };
        }
        return x;
      });
      saveItems(updated);
    } catch (err) {
      showMsg(err?.message || "Failed to process auto-pay transaction");
    }
  };

  // Stats Calculations
  const stats = useMemo(() => {
    let active = 0;
    let monthlyTotal = 0;
    let nextDueCount = 0;
    let thisMonthCount = 0;
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    items.forEach(x => {
      if (x.status === "Active") {
        active++;
        if (x.type === "expense") {
          monthlyTotal += x.amount;
        }
        const due = new Date(x.nextDue);
        if (due.getMonth() === currentMonth && due.getFullYear() === currentYear) {
          thisMonthCount++;
        }
        // Is due in next 7 days
        const diffTime = due - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays <= 7) {
          nextDueCount++;
        }
      }
    });

    return { active, monthlyTotal, nextDueCount, thisMonthCount };
  }, [items]);

  return (
    <div className="dashboard-page" style={{ paddingBottom: "40px" }}>
      {/* HEADER BAR */}
      <div className="welcome-banner" style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <button className="theme-toggle-btn" onClick={onBack} title="Back to Dashboard">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1>Recurring Payments</h1>
            <p>Monitor your active subscriptions, monthly logs, and auto-renewals</p>
          </div>
        </div>
        <div className="welcome-right">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-primary"
            style={{ display: "flex", alignItems: "center", gap: "6px", background: "white", color: "#059669" }}
          >
            <Plus size={16} /> Add Tracker
          </button>
        </div>
      </div>

      {/* METRIC ROW */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrap income" style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}>
            <CheckCircle2 size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <p>Total Active</p>
            <h2>{stats.active}</h2>
            <div className="stat-change positive" style={{ marginTop: "4px" }}>
              Monitoring bills
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap expense" style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }}>
            <CreditCard size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <p>Monthly Commitment</p>
            <h2>₹{stats.monthlyTotal.toLocaleString("en-IN")}</h2>
            <div className="stat-change negative" style={{ marginTop: "4px" }}>
              Total monthly billing
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap balance" style={{ background: "rgba(245, 158, 11, 0.1)", color: "#f59e0b" }}>
            <Clock size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <p>Due in 7 Days</p>
            <h2>{stats.nextDueCount}</h2>
            <div className="stat-change negative" style={{ color: "#f59e0b", marginTop: "4px" }}>
              Requires attention
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap balance" style={{ background: "rgba(108,71,255,0.1)", color: "var(--accent)" }}>
            <Calendar size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <p>Due This Month</p>
            <h2>{stats.thisMonthCount}</h2>
            <div className="stat-change positive" style={{ marginTop: "4px" }}>
              Active renewals
            </div>
          </div>
        </div>
      </div>

      {/* ADD TRACKER FORM BLOCK */}
      {showAddForm && (
        <div className="card" style={{ marginBottom: "24px", maxWidth: "600px", border: "1px solid var(--border-color)" }}>
          <h3 style={{ marginBottom: "16px", fontWeight: "700" }}>Add New Recurring Tracker</h3>
          <form onSubmit={handleAddItem} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div className="input-group">
              <label>Bill/Subscription Name</label>
              <input
                type="text"
                placeholder="e.g. Broadband, Rent, Netflix"
                value={item}
                onChange={(e) => setItem(e.target.value)}
                required
              />
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="input-group">
                <label>Flow Type</label>
                <select value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <div className="input-group">
                <label>Amount (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 999"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="input-group">
                <label>Frequency</label>
                <select value={frequency} onChange={(e) => setFrequency(e.target.value)}>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Yearly">Yearly</option>
                </select>
              </div>
              <div className="input-group">
                <label>Next Due Date</label>
                <input
                  type="date"
                  value={nextDue}
                  onChange={(e) => setNextDue(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
              <button className="btn-primary" type="submit" style={{ flex: 1 }}>Save Tracker</button>
              <button className="btn-secondary" type="button" onClick={() => setShowAddForm(false)} style={{ flex: 1 }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* ALERT BANNER */}
      <div className="quick-tips-card" style={{ display: "flex", alignItems: "center", gap: "12px", background: "rgba(16, 185, 129, 0.05)", border: "1px solid rgba(16, 185, 129, 0.15)", padding: "16px", marginBottom: "24px" }}>
        <AlertCircle size={20} style={{ color: "#10b981", flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <strong style={{ color: "var(--heading)", fontSize: "0.85rem", display: "block" }}>Never miss a payment!</strong>
          <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Process subscription payments instantly. They will automatically sync with your main balance account ledger.</span>
        </div>
        <button className="btn-primary" onClick={() => setShowAddForm(true)} style={{ fontSize: "0.75rem", padding: "6px 12px", background: "#10b981" }}>Add Tracker Now</button>
      </div>

      {/* DETAILS TABLE */}
      <div className="card">
        <h3 style={{ marginBottom: "16px", fontWeight: "700" }}>Active Recurring Lists</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-color)", fontSize: "0.8rem", textTransform: "uppercase", color: "var(--text-secondary)" }}>
                <th style={{ padding: "12px 8px" }}>Item</th>
                <th style={{ padding: "12px 8px" }}>Type</th>
                <th style={{ padding: "12px 8px" }}>Amount</th>
                <th style={{ padding: "12px 8px" }}>Frequency</th>
                <th style={{ padding: "12px 8px" }}>Next Due</th>
                <th style={{ padding: "12px 8px" }}>Status</th>
                <th style={{ padding: "12px 8px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "30px", color: "var(--muted)", fontSize: "0.85rem" }}>
                    No recurring payments found. Click "Add Tracker" to define one.
                  </td>
                </tr>
              ) : (
                items.map((x) => (
                  <tr key={x.id} style={{ borderBottom: "1px solid var(--border-color)", fontSize: "0.85rem" }}>
                    <td style={{ padding: "12px 8px", fontWeight: "600" }}>{x.item}</td>
                    <td style={{ padding: "12px 8px" }}>
                      <span style={{
                        padding: "2px 8px",
                        borderRadius: "99px",
                        fontSize: "0.75rem",
                        fontWeight: "600",
                        background: x.type === "income" ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                        color: x.type === "income" ? "#10b981" : "#ef4444"
                      }}>
                        {x.type}
                      </span>
                    </td>
                    <td style={{ padding: "12px 8px", fontWeight: "600" }}>₹{x.amount.toLocaleString("en-IN")}</td>
                    <td style={{ padding: "12px 8px", color: "var(--text-secondary)" }}>{x.frequency}</td>
                    <td style={{ padding: "12px 8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--text-secondary)" }}>
                        <Calendar size={14} />
                        {new Date(x.nextDue).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })}
                      </div>
                    </td>
                    <td style={{ padding: "12px 8px" }}>
                      <span style={{
                        padding: "2px 8px",
                        borderRadius: "99px",
                        fontSize: "0.75rem",
                        fontWeight: "600",
                        background: x.status === "Active" ? "rgba(16, 185, 129, 0.1)" : "rgba(107, 114, 128, 0.15)",
                        color: x.status === "Active" ? "#10b981" : "#6b7280"
                      }}>
                        {x.status}
                      </span>
                    </td>
                    <td style={{ padding: "12px 8px", textAlign: "right" }}>
                      <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                        {x.status === "Active" && (
                          <button
                            onClick={() => handlePayNow(x)}
                            className="btn-primary"
                            style={{
                              fontSize: "0.75rem",
                              padding: "4px 8px",
                              background: "#6C47FF",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px"
                            }}
                            title="Process this payment now in transaction list"
                          >
                            Pay Now
                          </button>
                        )}
                        <button
                          onClick={() => toggleStatus(x.id)}
                          className="tx-action-btn"
                          title={x.status === "Active" ? "Pause renewal" : "Resume renewal"}
                          style={{ border: "1px solid var(--border-color)", padding: "4px 6px", borderRadius: "6px" }}
                        >
                          {x.status === "Active" ? <Pause size={12} /> : <Play size={12} />}
                        </button>
                        <button
                          onClick={() => handleDeleteItem(x.id)}
                          className="tx-action-btn delete"
                          title="Delete tracker"
                          style={{ border: "1px solid rgba(239, 68, 68, 0.2)", padding: "4px 6px", borderRadius: "6px" }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
