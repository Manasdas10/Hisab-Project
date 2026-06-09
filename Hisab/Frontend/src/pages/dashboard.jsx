import React, { useEffect, useState, useMemo } from "react";
import GoalCard from "../components/goalcard.jsx";

import {
  getTransactions,
  deleteTransaction,
  updateTransaction,
} from "../lib/api.js";

import {
  Doughnut,
  Bar,
} from "react-chartjs-2";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";

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

export default function Dashboard({
  onAddExpense,
  onViewReports,
}) {

  const [transactions, setTransactions] = useState([]);

  const [editing, setEditing] = useState(null);

  const [openCategory, setOpenCategory] =
    useState(null);

  async function fetchTransactions() {

    try {

      const data = await getTransactions();

      console.log(data);

      setTransactions(
        data.map((t) => ({
          ...t,
          amount: Number(t.amount),
          category: normalizeCategory(
            t.category
          ),
          notes: t.notes || "",
        }))
      );

    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    fetchTransactions();
  }, []);

  async function removeTx(id) {

    if (!window.confirm("Delete transaction?"))
      return;

    await deleteTransaction(id);

    fetchTransactions();
  }

  async function saveEdit() {

    await updateTransaction(
      editing._id,
      editing
    );

    setEditing(null);

    fetchTransactions();
  }

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

  const grouped = useMemo(() => {

    const map = {};

    transactions.forEach((t) => {

      if (!map[t.category]) {
        map[t.category] = [];
      }

      map[t.category].push(t);

    });

    return map;

  }, [transactions]);

  const categoryChart = useMemo(() => {

    const totals = {};

    transactions.forEach((t) => {

      if (t.type === "expense") {

        totals[t.category] =
          (totals[t.category] || 0) +
          t.amount;

      }

    });

    return {

      labels: Object.keys(totals),

      datasets: [
        {
          data: Object.values(totals),

          backgroundColor: [
            "#22c55e",
            "#3b82f6",
            "#ef4444",
            "#f59e0b",
            "#8b5cf6",
          ],
        },
      ],
    };

  }, [transactions]);

  const monthlyChart = {

    labels: ["This Month"],

    datasets: [

      {
        label: "Income",

        data: [summary.income],

        backgroundColor: "#22c55e",
      },

      {
        label: "Expense",

        data: [summary.expense],

        backgroundColor: "#ef4444",
      },

    ],
  };

  return (
    

    <div className="dashboard-page">

      {/* TOP SUMMARY */}

      <div className="welcome-card">
        <h1>Welcome Back 👋</h1>
        <p>
          Track expenses, manage budgets and improve savings.
        </p>
      </div>

      <div className="stats-grid">
        <div className="stat-card income-card">
          <div className="stat-icon">💰</div>

          <div>
            <p>Total Income</p>
            <h2>₹{summary.income}</h2>
          </div>

        </div>

        <div className="stat-card expense-card">

          <div className="stat-icon">💸</div>
          
          <div>
            <p>Total Expense</p>
            <h2>₹{summary.expense}</h2>
          </div>

        </div>

        <div className="stat-card balance-card">

          <div className="stat-icon">⚖️</div>

          <div>
            <p>Balance</p>
            <h2>₹{summary.balance}</h2>
          </div>

        </div>

      </div>

      {/* ACTION BUTTONS */}

      <div
        style={{
          marginTop: 24,
          marginBottom: 24,
        }}
      >
        <div className="action-grid">

          <div
            className="action-card"
            onClick={onAddExpense}
          >
            <div className="action-icon">➕</div>

            <h3>Add Transaction</h3>

            <p>
              Record income and expenses
            </p>
          </div>

          <div
            className="action-card"
            onClick={onViewReports}
          >
            <div className="action-icon">📈</div>

            <h3>Reports</h3>

          <p>
            Analyze your spending
          </p>
        </div>

      </div>
    </div>

      {/* GOAL + BUDGET */}

      <div className="dashboard-grid">

        <GoalCard
          title="Monthly Expense Goal"
          target={
            Number(
              localStorage.getItem(
                "hisab_monthly_goal"
              )
            ) || 0
          }
          saved={summary.expense}
        />

        <div className="card budget-card">

          <h2>Budget Insights</h2>

          <br />

          <p>
            Remaining Balance:
            <b>
              ₹{summary.balance}
            </b>
          </p>

          <br />

          <p>
            Total Transactions:
            <b>
              {transactions.length}
            </b>
          </p>

          <br />

          <p>
            Financial Status:
            <b>
              {summary.balance > 0
                ? " ✅ Healthy"
                : " ⚠ Overspending"}
            </b>
          </p>

        </div>

      </div>

      {/* CHARTS */}

      <div
        className="charts-grid"
        style={{
          marginTop: 20,
        }}
      >

        <div className="card chart-card">

          <h2>Category Split</h2>

          <br />

          {transactions.length === 0 ? (

            <p className="empty-text">
              No expense data
            </p>

          ) : (

            <Doughnut
              data={categoryChart}
            />

          )}

        </div>

        <div className="card chart-card">

          <h2>Income vs Expense</h2>

          <br />

          <Bar data={monthlyChart} />

        </div>

      </div>

      {/* TRANSACTIONS */}

      <div
        className="card transaction-card"
          style={{ marginTop: 20 }}
      >
        <div className="section-header">

          <h2>Recent Transactions</h2>

        <span className="tx-count">
          {transactions.length} Records
        </span>

      </div>

      <br />

        {Object.keys(grouped).length === 0 ? (
          <p className="empty-text">
            No transactions added yet
          </p>
        ) : (
          Object.keys(grouped).map((cat) => (
        <div
          key={cat}
          className="transaction-group"
        >
          <div
            className="transaction-group-title"
            onClick={() =>
              setOpenCategory(
                openCategory === cat
                  ? null
                  : cat
              )
            }
          >
            {cat}

            <span>
              {openCategory === cat
                ? " ▲"
                : " ▼"}
            </span>
          </div>

          {openCategory === cat &&
            grouped[cat].map((t) => (
              <div
                key={t._id}
                className="transaction-item"
              >
                <div className="transaction-left">
                  <div className="transaction-category">
                    <span>
                      {t.category === "Food" && "🍔 "}
                      {t.category === "Travel" && "✈️ "}
                      {t.category === "Shopping" && "🛒 "}
                      {t.category === "Bills" && "📄 "}
                      {t.category === "Health" && "❤️ "}
                      {t.category === "Education" && "📚 "}
                      {t.category}
                    </span>
                  </div>

                  <div className="transaction-date">
                    {new Date(
                      t.date
                    ).toLocaleDateString()}

                    {t.notes && (
                      <span className="note-icon">
                        📝
                        <div className="note-tooltip">
                          {t.notes}
                        </div>
                      </span>
                    )}
                  </div>
                </div>

              <div className="transaction-amount">
                <div
                  className={`amount-pill ${t.type}`}
                >
                  ₹{t.amount}
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 10,
                  }}
                >
                  <button
                    className="primary-btn"
                    onClick={() =>
                      setEditing({ ...t })
                    }
                  >
                    ✏️ Edit
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() =>
                      removeTx(t._id)
                    }
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>
    ))
  )}
</div>

      {/* EDIT MODAL */}

      {editing && (

        <div className="modal-overlay">

          <div className="modal-card">

            <h2>Edit Transaction</h2>

            <br />

            <input
              type="number"
              value={editing.amount}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  amount: Number(
                    e.target.value
                  ),
                })
              }
            />

            <br />
            <br />

            <select
              value={editing.type}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  type:
                    e.target.value,
                })
              }
            >
              <option value="income">
                Income
              </option>

              <option value="expense">
                Expense
              </option>
            </select>

            <br />
            <br />

            <input
              type="text"
              value={editing.category}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  category: e.target.value,
                })
              }
              placeholder="Category"
              />

            <br />
            <br />

            <textarea
              rows="3"
              value={editing.notes || ""}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  notes:e.target.value,
                })
              }
              placeholder="Notes"
            />

            <br />
            <br />

            <input
              type="date"
              value={
                editing.date?.split(
                  "T"
                )[0]
              }
              onChange={(e) =>
                setEditing({
                  ...editing,
                  date:
                    e.target.value,
                })
              }
            />

            <br />
            <br />

            <div
              style={{
                display: "flex",
                gap: 10,
              }}
            >

              <button
                className="primary-btn"
                onClick={saveEdit}
              >
                Save
              </button>

              <button
                onClick={() =>
                  setEditing(null)
                }
              >
                Cancel
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );    
}