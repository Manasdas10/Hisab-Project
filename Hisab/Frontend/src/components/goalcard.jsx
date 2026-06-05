import React, { useEffect, useState } from "react";

export default function GoalCard({ title, target, saved }) {
  const [value, setValue] = useState(target || "");

  useEffect(() => {
    setValue(target || "");
  }, [target]);

  function saveGoal() {
    if (!value) return;
    localStorage.setItem("hisab_monthly_goal", Number(value));
    window.location.reload();
  }

  const pct =
    target > 0 ? Math.min(100, Math.round((saved / target) * 100)) : 0;

  return (
    <div className="card" style={{ minWidth: 230 }}>
      <div style={{ fontWeight: 700 }}>{title}</div>

      <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
        Target
      </div>

      <input
        type="number"
        placeholder="Set goal amount"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        style={{
          width: "100%",
          marginTop: 6,
          padding: "6px 8px",
          borderRadius: 8,
          border: "1px solid #e5e7eb",
        }}
      />

      <button
        className="pill"
        style={{ marginTop: 8, width: "100%" }}
        onClick={saveGoal}
      >
        Save Goal
      </button>

      <div style={{ fontWeight: 800, marginTop: 8 }}>
        ₹{saved}
      </div>

      <div
        style={{
          height: 10,
          background: "#e5e7eb",
          borderRadius: 8,
          marginTop: 8,
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: "linear-gradient(90deg,#22c55e,#16a34a)",
            borderRadius: 8,
          }}
        />
      </div>

      <div style={{ fontSize: 12, marginTop: 6, color: "#6b7280" }}>
        {pct}% used
      </div>
    </div>
  );
}
