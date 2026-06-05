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

      setTransactions(
        data.map((t) => ({
          ...t,
          amount: Number(t.amount),
          category: normalizeCategory(
            t.category
          ),
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

      <div className="stats-grid">

        <div className="stat-card income">

          <h3>Total Income</h3>

          <h1>
            ₹{summary.income}
          </h1>

        </div>

        <div className="stat-card expense">

          <h3>Total Expense</h3>

          <h1>
            ₹{summary.expense}
          </h1>

        </div>

        <div className="stat-card balance">

          <h3>Balance</h3>

          <h1>
            ₹{summary.balance}
          </h1>

        </div>

      </div>

      {/* ACTION BUTTONS */}

      <div
        style={{
          display: "flex",
          gap: 12,
          marginTop: 24,
          marginBottom: 24,
        }}
      >

        <button
          className="primary-btn"
          onClick={onAddExpense}
        >
          + Add Transaction
        </button>

        <button
          className="primary-btn"
          onClick={onViewReports}
        >
          View Reports
        </button>

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

        <div className="card">

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
        className="dashboard-grid"
        style={{
          marginTop: 30,
        }}
      >

        <div className="card">

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

        <div className="card">

          <h2>Income vs Expense</h2>

          <br />

          <Bar data={monthlyChart} />

        </div>

      </div>

      {/* TRANSACTIONS */}

      <div
        className="card"
        style={{
          marginTop: 30,
        }}
      >

        <h2>Transactions</h2>

        <br />

        {Object.keys(grouped).length === 0 ? (

          <p className="empty-text">
            No transactions added yet
          </p>

        ) : (

          Object.keys(grouped).map(
            (cat) => (

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

                  grouped[cat].map(
                    (t) => (

                      <div
                        key={t._id}
                        className="transaction-item"
                      >

                        <div
                          className="transaction-left"
                        >

                          <div
                            className="transaction-category"
                          >
                            {t.type}
                          </div>

                          <div
                            className="transaction-date"
                          >
                            {new Date(
                              t.date
                            ).toLocaleDateString()}
                          </div>

                        </div>

                        <div
                          className="transaction-amount"
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
                              setEditing({
                                ...t,
                              })
                            }
                          >
                            Edit
                          </button>

                          <button
                            style={{
                              background:
                                "#ef4444",
                              color: "white",
                            }}
                            onClick={() =>
                              removeTx(
                                t._id
                              )
                            }
                          >
                            Delete
                          </button>

                        </div>

                      </div>

                    )
                  )}

              </div>

            )
          )

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
              value={editing.category}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  category:
                    e.target.value,
                })
              }
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