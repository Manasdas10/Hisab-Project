import React, { useEffect, useState, useMemo } from "react";
import { getGoals, createGoal, updateGoal, deleteGoal } from "../lib/api";
import { 
  ArrowLeft, Target, Plus, Trash2, Calendar, TrendingUp, Sparkles, 
  Menu, MoreVertical, Edit2, Clock, Wallet, PiggyBank, PieChart, 
  ChevronDown, Check, Bell 
} from "lucide-react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title as ChartTitle,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
  Filler
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ChartTitle,
  ChartTooltip,
  ChartLegend,
  Filler
);

export default function BudgetGoalPanel({ onBack }) {
  const [goals, setGoals] = useState([]);
  const [activeGoal, setActiveGoal] = useState(null);
  
  // Create goal states
  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [milestones, setMilestones] = useState([
    { title: "25% Saved", percentage: 25 },
    { title: "50% Saved", percentage: 50 },
    { title: "75% Saved", percentage: 75 },
    { title: "100% Fully Funded", percentage: 100 }
  ]);
  
  // Edit goal states
  const [editTitle, setEditTitle] = useState("");
  const [editTargetAmount, setEditTargetAmount] = useState("");
  const [editDeadline, setEditDeadline] = useState("");

  const [addFundsId, setAddFundsId] = useState(null);
  const [amountToAdd, setAmountToAdd] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showGoalSelector, setShowGoalSelector] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);

  const userName = localStorage.getItem("userName") || "Student";

  async function fetchGoals(selectId = null) {
    try {
      const data = await getGoals();
      setGoals(data);
      if (data.length > 0) {
        if (selectId) {
          const matched = data.find(g => g._id === selectId);
          setActiveGoal(matched || data[0]);
        } else {
          setActiveGoal(prev => {
            const matched = data.find(g => g._id === prev?._id);
            return matched || data[0];
          });
        }
      } else {
        setActiveGoal(null);
      }
    } catch (err) {
      setError(err?.message || "Failed to load goals.");
    }
  }

  useEffect(() => {
    fetchGoals();
  }, []);

  async function handleCreateGoal(e) {
    e.preventDefault();
    if (!title.trim() || !targetAmount) return;

    setLoading(true);
    setError(null);

    const computedMilestones = milestones.map(m => ({
      title: m.title.trim(),
      amount: Math.round((Number(targetAmount) * m.percentage) / 100)
    }));

    try {
      const created = await createGoal({
        title: title.trim(),
        targetAmount: Number(targetAmount),
        deadline: deadline || null,
        milestones: computedMilestones
      });
      setTitle("");
      setTargetAmount("");
      setDeadline("");
      setShowCreateModal(false);
      fetchGoals(created._id);
    } catch (err) {
      setError(err?.message || "Failed to create goal.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddFunds(e) {
    e.preventDefault();
    if (!amountToAdd || isNaN(Number(amountToAdd))) return;

    try {
      await updateGoal(addFundsId, { amountToAdd: Number(amountToAdd) });
      setAddFundsId(null);
      setAmountToAdd("");
      fetchGoals(activeGoal?._id);
    } catch (err) {
      alert(err?.message || "Failed to add funds.");
    }
  }

  async function handleEditGoal(e) {
    e.preventDefault();
    if (!editTitle.trim() || !editTargetAmount) return;

    setLoading(true);
    try {
      await updateGoal(activeGoal._id, {
        title: editTitle.trim(),
        targetAmount: Number(editTargetAmount),
        deadline: editDeadline || null
      });
      setShowEditModal(false);
      fetchGoals(activeGoal._id);
    } catch (err) {
      alert(err?.message || "Failed to update goal.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteGoal(id) {
    if (!window.confirm("Are you sure you want to delete this savings goal?")) return;
    try {
      await deleteGoal(id);
      fetchGoals();
    } catch (err) {
      alert(err?.message || "Failed to delete goal.");
    }
  }

  function openEditModal(goal) {
    setEditTitle(goal.title);
    setEditTargetAmount(goal.targetAmount);
    setEditDeadline(goal.deadline ? goal.deadline.split("T")[0] : "");
    setShowEditModal(true);
  }

  function getTimeRemaining(deadlineDate) {
    if (!deadlineDate) return "No deadline set";
    const diffTime = new Date(deadlineDate) - new Date();
    if (diffTime <= 0) return "Goal ended / Expired";
    
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays >= 365) {
      const years = Math.floor(diffDays / 365);
      const remMonths = Math.floor((diffDays % 365) / 30);
      if (remMonths > 0) {
        return `${years} year${years > 1 ? "s" : ""} ${remMonths} month${remMonths > 1 ? "s" : ""} left`;
      }
      return `${years} year${years > 1 ? "s" : ""} left`;
    }
    if (diffDays >= 30) {
      const months = Math.floor(diffDays / 30);
      const remDays = diffDays % 30;
      if (remDays > 0) {
        return `${months} month${months > 1 ? "s" : ""} ${remDays} day${remDays > 1 ? "s" : ""} left`;
      }
      return `${months} month${months > 1 ? "s" : ""} left`;
    }
    return `${diffDays} day${diffDays > 1 ? "s" : ""} left`;
  }

  // Memoized Chart Config
  const chartData = useMemo(() => {
    if (!activeGoal) return null;

    const startDate = new Date(activeGoal.createdAt || Date.now() - 30 * 24 * 60 * 60 * 1000);
    let endDate = activeGoal.deadline ? new Date(activeGoal.deadline) : new Date();
    if (endDate <= startDate) {
      endDate = new Date();
    }
    
    const timelineDates = [];
    const duration = endDate.getTime() - startDate.getTime();
    const step = duration / 4;
    for (let i = 0; i <= 4; i++) {
      timelineDates.push(new Date(startDate.getTime() + step * i));
    }

    const cumulativeSaved = timelineDates.map((date) => {
      let sum = 0;
      (activeGoal.contributions || []).forEach((c) => {
        if (new Date(c.createdAt) <= date) {
          sum += c.amount;
        }
      });
      return sum;
    });

    if (cumulativeSaved[4] < activeGoal.currentAmount) {
      cumulativeSaved[4] = activeGoal.currentAmount;
    }

    const labels = timelineDates.map(d => {
      return d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
    });

    return {
      labels,
      datasets: [
        {
          label: "Saved Amount",
          data: cumulativeSaved,
          borderColor: "#10b981",
          backgroundColor: "rgba(16, 185, 129, 0.03)",
          borderWidth: 2.5,
          pointBackgroundColor: "#10b981",
          pointBorderColor: "#fff",
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.35,
          fill: true
        },
        {
          label: "Target Amount",
          data: Array(5).fill(activeGoal.targetAmount),
          borderColor: "#9ca3af",
          borderDash: [5, 5],
          pointRadius: 0,
          borderWidth: 1.5,
          tension: 0
        }
      ]
    };
  }, [activeGoal]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `₹${context.raw.toLocaleString("en-IN")}`
        }
      }
    },
    scales: {
      y: {
        grid: { color: "rgba(0,0,0,0.04)" },
        ticks: {
          callback: (value) => `₹${value}`
        }
      },
      x: {
        grid: { display: false }
      }
    }
  };

  const pct = activeGoal?.targetAmount > 0 ? Math.min(100, Math.round((activeGoal.currentAmount / activeGoal.targetAmount) * 100)) : 0;
  const remaining = activeGoal ? Math.max(0, activeGoal.targetAmount - activeGoal.currentAmount) : 0;

  let progressColor = "green";
  if (pct >= 100) progressColor = "green";
  else if (pct >= 50) progressColor = "amber";
  else progressColor = "red";

  const sortedContribs = useMemo(() => {
    if (!activeGoal?.contributions) return [];
    return [...activeGoal.contributions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [activeGoal]);

  return (
    <div className="dashboard-page" style={{ paddingBottom: "40px" }}>
      {/* WHITE PAGE HEADER */}
      <div className="goal-header-white">
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          {onBack && (
            <button className="theme-toggle-btn" style={{ background: "var(--subtle)", border: "1px solid var(--card-border)", color: "var(--text)" }} onClick={onBack} title="Back to Dashboard">
              <ArrowLeft size={18} />
            </button>
          )}
          
          {/* Goal Selector Dropdown */}
          {goals.length > 0 && (
            <div style={{ position: "relative" }}>
              <button 
                className="theme-toggle-btn"
                onClick={() => setShowGoalSelector(!showGoalSelector)}
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(16, 185, 129, 0.12)",
                  border: "none",
                  color: "#059669",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "background-color 0.2s"
                }}
                title="Select Savings Goal"
              >
                <Menu size={18} />
              </button>
              {showGoalSelector && (
                <div className="search-results-dropdown" style={{ left: 0, right: "auto", top: "calc(100% + 8px)", zIndex: 100 }}>
                  <div style={{ padding: "8px 16px", fontSize: "0.75rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Your Savings Goals</div>
                  {goals.map(g => (
                    <div 
                      key={g._id} 
                      className="search-result-item" 
                      onClick={() => {
                        setActiveGoal(g);
                        setShowGoalSelector(false);
                      }}
                      style={{ 
                        fontWeight: activeGoal?._id === g._id ? "bold" : "normal",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: "0.85rem"
                      }}
                    >
                      <span>{g.title}</span>
                      {activeGoal?._id === g._id && <Check size={14} style={{ color: "#10b981" }} />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div>
            <h1 style={{ fontSize: "1.4rem", fontWeight: 800, margin: 0, color: "var(--heading)" }}>Savings Goals</h1>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: "2px 0 0" }}>Define multi-step financial goals and track milestone completions</p>
          </div>
        </div>

        <div className="welcome-right">
          <button 
            className="btn-primary" 
            style={{ 
              width: "auto", 
              padding: "0 18px", 
              height: "38px", 
              display: "flex", 
              gap: "6px", 
              alignItems: "center",
              borderRadius: "10px",
              backgroundColor: "#2563eb",
              borderColor: "#2563eb",
              color: "white",
              fontWeight: 600
            }} 
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={16} /> New Goal
          </button>

          <button 
            className="theme-toggle-btn" 
            style={{ 
              background: "var(--subtle)", 
              border: "1px solid var(--card-border)", 
              color: "var(--text)", 
              position: "relative" 
            }}
          >
            <Bell size={16} />
            <span style={{ position: "absolute", top: "8px", right: "8px", width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444" }}></span>
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
            <div className="user-avatar" style={{ background: "#2563eb", color: "white", width: "38px", height: "38px" }}>
              {userName.charAt(0)}
            </div>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text)" }}>{userName}</span>
            <ChevronDown size={14} style={{ color: "var(--muted)" }} />
          </div>
        </div>
      </div>

      {error && (
        <div style={{ color: "var(--danger)", background: "var(--danger-light)", padding: "12px", borderRadius: "10px", margin: "16px 0" }}>
          {error}
        </div>
      )}

      {/* DASHBOARD LAYOUT */}
      {goals.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "60px 20px", marginTop: "24px" }}>
          <div className="stat-icon-wrap balance" style={{ width: "60px", height: "60px", margin: "0 auto 16px", borderRadius: "16px" }}>
            🎯
          </div>
          <h3>No active savings goals found</h3>
          <p style={{ color: "var(--text-secondary)", marginBottom: "20px" }}>
            Define targets like "Emergency Fund" or "Vacation Savings" with progressive milestones.
          </p>
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>Create Savings Goal</button>
        </div>
      ) : (
        activeGoal && (
          <div className="goal-detail-layout">
            {/* LEFT COLUMN: ACTIVE GOAL CARD & CHARTS */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              
              {/* GOAL DETAIL CARD */}
              <div className="goal-card-modern">
                <div className="goal-header">
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <div className="stat-icon-wrap" style={{ width: "38px", height: "38px", borderRadius: "10px", backgroundColor: "rgba(16, 185, 129, 0.12)", color: "#10b981" }}>
                      <Target size={18} />
                    </div>
                    <div className="goal-title-area">
                      <h3 style={{ margin: 0, fontSize: "1.05rem" }}>{activeGoal.title}</h3>
                      {activeGoal.deadline && (
                        <p style={{ display: "flex", alignItems: "center", gap: "4px", margin: "2px 0 0" }}>
                          <Calendar size={12} /> Target Date: {new Date(activeGoal.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions Dropdown */}
                  <div style={{ position: "relative" }}>
                    <button 
                      className="tx-action-btn" 
                      onClick={() => setShowActionsMenu(!showActionsMenu)}
                      title="Goal Actions"
                      style={{ width: "30px", height: "30px" }}
                    >
                      <MoreVertical size={16} />
                    </button>
                    {showActionsMenu && (
                      <div 
                        className="search-results-dropdown" 
                        style={{ 
                          position: "absolute", 
                          right: 0, 
                          top: "100%", 
                          width: "140px", 
                          zIndex: 50,
                          boxShadow: "var(--shadow-medium)"
                        }}
                      >
                        <div 
                          className="search-result-item" 
                          style={{ padding: "10px 14px", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "8px" }}
                          onClick={() => {
                            setShowActionsMenu(false);
                            openEditModal(activeGoal);
                          }}
                        >
                          <Edit2 size={13} /> Edit Goal
                        </div>
                        <div 
                          className="search-result-item" 
                          style={{ padding: "10px 14px", fontSize: "0.85rem", color: "var(--danger)", display: "flex", alignItems: "center", gap: "8px" }}
                          onClick={() => {
                            setShowActionsMenu(false);
                            handleDeleteGoal(activeGoal._id);
                          }}
                        >
                          <Trash2 size={13} /> Delete Goal
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="goal-amounts" style={{ marginTop: "16px" }}>
                  <span className="goal-spent">
                    ₹{activeGoal.currentAmount.toLocaleString("en-IN")}
                    <span className="goal-target" style={{ fontSize: "1rem", fontWeight: "normal", color: "var(--muted)" }}> / ₹{activeGoal.targetAmount.toLocaleString("en-IN")}</span>
                  </span>
                </div>

                <div className="goal-progress-track" style={{ height: "8px", margin: "12px 0 8px" }}>
                  <div className={`goal-progress-fill ${progressColor}`} style={{ width: `${pct}%` }} />
                </div>

                <div className="goal-footer" style={{ marginBottom: "16px" }}>
                  <span className="goal-remaining" style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>₹{remaining.toLocaleString("en-IN")} Remaining</span>
                  <span className="goal-pct" style={{ color: "#10b981", fontSize: "0.85rem" }}>{pct}%</span>
                </div>

                {/* Milestone Progress Cards */}
                <div style={{ marginTop: "20px", borderTop: "1px solid var(--card-border)", paddingTop: "16px" }}>
                  <h4 style={{ fontSize: "0.85rem", color: "var(--heading)", marginBottom: "12px", fontWeight: 700 }}>Milestone Progress</h4>
                  <div className="milestone-grid">
                    {activeGoal.milestones.map((milestone, idx) => {
                      const mClasses = ["m-25", "m-50", "m-75", "m-100"];
                      const mClass = mClasses[idx % 4];

                      return (
                        <div 
                          key={milestone._id} 
                          className={`milestone-card ${mClass} ${milestone.isCompleted ? "completed" : ""}`}
                          style={{
                            opacity: milestone.isCompleted ? 1 : 0.65
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span className="milestone-card-title">{milestone.title}</span>
                            {milestone.isCompleted && <Check size={14} style={{ color: "#10b981" }} />}
                          </div>
                          <span className="milestone-card-amount">₹{milestone.amount.toLocaleString("en-IN")}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Inline Add Funds */}
                <div style={{ marginTop: "16px" }}>
                  {addFundsId === activeGoal._id ? (
                    <form onSubmit={handleAddFunds} className="goal-input-row" style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                      <input
                        type="number"
                        placeholder="Amount (₹)"
                        value={amountToAdd}
                        onChange={(e) => setAmountToAdd(e.target.value)}
                        required
                        autoFocus
                        style={{
                          flex: 1,
                          padding: "10px 14px",
                          borderRadius: "10px",
                          border: "1px solid var(--card-border)",
                          background: "var(--input-bg)",
                          color: "var(--text)"
                        }}
                      />
                      <button type="submit" className="btn-primary" style={{ padding: "10px 18px", borderRadius: "10px" }}>Add</button>
                      <button type="button" className="btn-secondary" style={{ padding: "10px 18px", borderRadius: "10px" }} onClick={() => setAddFundsId(null)}>Cancel</button>
                    </form>
                  ) : (
                    <button 
                      className="view-all-btn" 
                      style={{ 
                        margin: 0, 
                        width: "100%", 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center", 
                        gap: "6px",
                        backgroundColor: "rgba(16, 185, 129, 0.12)",
                        color: "#059669",
                        border: "none",
                        padding: "12px",
                        borderRadius: "10px",
                        fontWeight: "600",
                        cursor: "pointer"
                      }} 
                      onClick={() => setAddFundsId(activeGoal._id)}
                    >
                      <Plus size={16} /> Add Savings Funds
                    </button>
                  )}
                </div>
              </div>

              {/* TWO CARDS ROW: GOAL OVERVIEW & RECENT CONTRIBUTIONS */}
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "20px" }}>
                
                {/* GOAL OVERVIEW CHART CARD */}
                <div className="chart-card" style={{ minHeight: "280px" }}>
                  <div className="chart-header">
                    <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700 }}>Goal Overview</h3>
                    
                    {/* Custom Legend */}
                    <div style={{ display: "flex", gap: "12px", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#10b981", display: "inline-block" }}></span>
                        Saved Amount
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <span style={{ width: "8px", height: "2px", borderTop: "2px dashed #9ca3af", display: "inline-block" }}></span>
                        Target Amount
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ height: "185px", marginTop: "10px" }}>
                    {chartData && (
                      <Line data={chartData} options={chartOptions} />
                    )}
                  </div>
                </div>

                {/* RECENT CONTRIBUTIONS */}
                <div className="chart-card" style={{ minHeight: "280px", display: "flex", flexDirection: "column" }}>
                  <div className="chart-header">
                    <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700 }}>Recent Contributions</h3>
                  </div>

                  <div style={{ flex: 1, marginTop: "12px", display: "flex", flexDirection: "column" }}>
                    {sortedContribs.length === 0 ? (
                      <div className="recent-contrib-empty" style={{ flex: 1 }}>
                        <div style={{ 
                          width: "50px", 
                          height: "50px", 
                          borderRadius: "50%", 
                          backgroundColor: "rgba(16, 185, 129, 0.1)", 
                          color: "#10b981",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginBottom: "12px"
                        }}>
                          <Wallet size={22} />
                        </div>
                        <h4 style={{ fontSize: "0.85rem", fontWeight: 700, margin: 0 }}>No contributions yet</h4>
                        <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", margin: "4px 0 12px", lineHeight: 1.4 }}>
                          Start adding funds to your goal and watch your progress grow.
                        </p>
                        <button 
                          className="btn-secondary" 
                          style={{ 
                            padding: "6px 14px", 
                            borderColor: "#10b981", 
                            color: "#10b981",
                            fontSize: "0.75rem",
                            borderRadius: "8px",
                            fontWeight: 600,
                            background: "transparent"
                          }}
                          onClick={() => setAddFundsId(activeGoal._id)}
                        >
                          Add Funds Now
                        </button>
                      </div>
                    ) : (
                      <div className="recent-contrib-list">
                        {sortedContribs.map((c) => (
                          <div className="contrib-item" key={c._id}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span style={{ fontSize: "14px" }}>💰</span>
                              <div style={{ display: "flex", flexDirection: "column" }}>
                                <span className="contrib-amount">+₹{c.amount.toLocaleString("en-IN")}</span>
                                <span className="contrib-date">
                                  {new Date(c.createdAt).toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                    hour: "2-digit",
                                    minute: "2-digit"
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

              </div>

            </div>

            {/* RIGHT COLUMN: STATS SIDEBAR */}
            <div>
              <div className="goal-sidebar-card">
                
                <div className="goal-stat-item">
                  <div className="goal-stat-icon-wrap green">
                    <Target size={18} />
                  </div>
                  <div className="goal-stat-info">
                    <span className="goal-stat-label">Target Amount</span>
                    <span className="goal-stat-value">₹{activeGoal.targetAmount.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                <div className="goal-stat-item">
                  <div className="goal-stat-icon-wrap blue">
                    <Wallet size={18} />
                  </div>
                  <div className="goal-stat-info">
                    <span className="goal-stat-label">Total Saved</span>
                    <span className="goal-stat-value">₹{activeGoal.currentAmount.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                <div className="goal-stat-item">
                  <div className="goal-stat-icon-wrap purple">
                    <PieChart size={18} />
                  </div>
                  <div className="goal-stat-info">
                    <span className="goal-stat-label">Progress</span>
                    <span className="goal-stat-value">{pct}%</span>
                  </div>
                </div>

                <div className="goal-stat-item">
                  <div className="goal-stat-icon-wrap blue">
                    <Calendar size={18} />
                  </div>
                  <div className="goal-stat-info">
                    <span className="goal-stat-label">Target Date</span>
                    <span className="goal-stat-value">
                      {activeGoal.deadline 
                        ? new Date(activeGoal.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
                        : "No target date"}
                    </span>
                  </div>
                </div>

                <div className="goal-stat-item">
                  <div className="goal-stat-icon-wrap blue">
                    <Clock size={18} />
                  </div>
                  <div className="goal-stat-info">
                    <span className="goal-stat-label">Time Remaining</span>
                    <span className="goal-stat-value">{getTimeRemaining(activeGoal.deadline)}</span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )
      )}

      {/* CREATE GOAL MODAL */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
              <Sparkles size={20} style={{ color: "var(--accent)" }} />
              <h2>New Savings Goal</h2>
            </div>

            <form onSubmit={handleCreateGoal}>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <label>Goal Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Vacation, Emergency Fund, Buy Laptop"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label>Target Amount (₹)</label>
                  <input
                    type="number"
                    placeholder="Total savings amount"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label>Target Deadline (Optional)</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                </div>

                <div>
                  <label>Standard Milestones</label>
                  <p style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                    Milestones will automatically compute at 25%, 50%, 75%, and 100% of your target amount.
                  </p>
                </div>
              </div>

              <br />
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button type="submit" className="btn-primary" disabled={loading || !title.trim() || !targetAmount}>
                  {loading ? "Creating..." : "Save Goal"}
                </button>
                <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT GOAL MODAL */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
              <Sparkles size={20} style={{ color: "var(--accent)" }} />
              <h2>Edit Savings Goal</h2>
            </div>

            <form onSubmit={handleEditGoal}>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <label>Goal Title</label>
                  <input
                    type="text"
                    placeholder="Goal title"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label>Target Amount (₹)</label>
                  <input
                    type="number"
                    placeholder="Total target savings"
                    value={editTargetAmount}
                    onChange={(e) => setEditTargetAmount(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label>Target Deadline (Optional)</label>
                  <input
                    type="date"
                    value={editDeadline}
                    onChange={(e) => setEditDeadline(e.target.value)}
                  />
                </div>
              </div>

              <br />
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button type="submit" className="btn-primary" disabled={loading || !editTitle.trim() || !editTargetAmount}>
                  {loading ? "Saving..." : "Save Changes"}
                </button>
                <button type="button" className="btn-secondary" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
