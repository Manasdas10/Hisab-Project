import React, { useEffect, useRef, useState } from "react";
import { createTransaction } from "../lib/api.js";
import { showToast } from "../lib/toast.js";

function AddExpense({ onSaved, onCancel }) {

  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");
  const [category, setCategory] = useState("Food");

  const [date, setDate] = useState(
    () => new Date().toISOString().slice(0, 10)
  );

  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);

  const acRef = useRef(null);

  useEffect(() => {

    return () => {

      if (acRef.current) {
        acRef.current.abort();
      }

    };

  }, []);

  const categories = [
    "Food",
    "Travel",
    "Shopping",
    "Bills",
    "Salary",
    "Entertainment",
    "Health",
    "Education",
    "Other",
  ];

  function showMessage(msg) {

    if (typeof showToast === "function") {
      showToast(msg);
    } else {
      alert(msg);
    }

  }

  async function handleSubmit(e) {

    e.preventDefault();

    if (
      !amount ||
      isNaN(Number(amount)) ||
      Number(amount) <= 0
    ) {
      showMessage("Enter valid amount");
      return;
    }

    const payload = {
      amount: Number(amount),
      type,
      category,
      date,
      notes: notes.trim(),
    };

    setLoading(true);

    const controller = new AbortController();

    acRef.current = controller;

    try {

      const created = await createTransaction(
        payload,
        controller.signal
      );

      showMessage("Transaction Saved ✔");

      if (typeof onSaved === "function") {
        onSaved(created);
      }

    } catch (err) {

      console.log(err);

      showMessage(
        err?.message ||
        "Failed to save transaction"
      );

    } finally {

      setLoading(false);

      acRef.current = null;

    }

  }

  return (

    <div className="page-container">

      <div className="modern-form-card">

        <div className="form-top">

          <div>

            <h1>Add Transaction</h1>

            <p>
              Track your expenses and income
            </p>

          </div>

          <div className="form-icon">
            💰
          </div>

        </div>

        <form onSubmit={handleSubmit}>

          {/* TYPE */}

          <div className="type-switch">

            <button
              type="button"
              className={
                type === "expense"
                  ? "type-btn active-expense"
                  : "type-btn"
              }
              onClick={() =>
                setType("expense")
              }
            >
              Expense
            </button>

            <button
              type="button"
              className={
                type === "income"
                  ? "type-btn active-income"
                  : "type-btn"
              }
              onClick={() =>
                setType("income")
              }
            >
              Income
            </button>

          </div>

          {/* AMOUNT */}

          <div className="input-group">

            <label>Amount</label>

            <input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) =>
                setAmount(e.target.value)
              }
            />

          </div>

          {/* CATEGORY */}

          <div className="input-group">

            <label>Category</label>

            <div className="category-grid">

              {categories.map((cat) => (

                <button
                  key={cat}
                  type="button"
                  className={
                    category === cat
                      ? "category-pill active"
                      : "category-pill"
                  }
                  onClick={() =>
                    setCategory(cat)
                  }
                >
                  {cat}
                </button>

              ))}

            </div>

          </div>

          {/* DATE */}

          <div className="input-group">

            <label>Date</label>

            <input
              type="date"
              value={date}
              onChange={(e) =>
                setDate(e.target.value)
              }
            />

          </div>

          {/* NOTES */}

          <div className="input-group">

            <label>Notes</label>

            <textarea
              rows="4"
              placeholder="Optional notes..."
              value={notes}
              onChange={(e) =>
                setNotes(e.target.value)
              }
            />

          </div>

          {/* PREVIEW */}

          <div className="preview-card">

            <h3>Preview</h3>

            <div className="preview-row">
              <span>Type</span>
              <b>{type}</b>
            </div>

            <div className="preview-row">
              <span>Category</span>
              <b>{category}</b>
            </div>

            <div className="preview-row">
              <span>Amount</span>
              <b>₹{amount || 0}</b>
            </div>

          </div>

          {/* BUTTONS */}

          <div className="form-actions">

            <button
              className="save-btn"
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : "Save Transaction"}
            </button>

            <button
              type="button"
              className="cancel-btn"
              onClick={onCancel}
            >
              Cancel
            </button>

          </div>

        </form>

      </div>

    </div>

  );

}

export default AddExpense;